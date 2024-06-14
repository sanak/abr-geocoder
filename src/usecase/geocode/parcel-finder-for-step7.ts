/*!
 * MIT License
 *
 * Copyright (c) 2023 デジタル庁
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { DataField } from '@domain/dataset/data-field';
import { MatchLevel } from '@domain/match-level';
import { Query } from '@domain/query';
import { RegExpEx } from '@domain/reg-exp-ex';
import { DASH } from '@settings/constant-values';
import { Database, Statement } from 'better-sqlite3';

export type ParcelList = {
  lg_code: string;
  town_id: string;
  prc_id: string;
  prc_num1: string;
  prc_num2: string;
  prc_num3: string;
  lat: number;
  lon: number;
};

/**
 * 与えられた情報をもとに、Databaseを探索して可能性のある結果を返す
 * オリジナルコードの getNormalizedCity() 関連を１つにまとめたクラス。
 * 実質的にジオコーディングしている部分
 */
export class ParcelFinderForStep7 {
  private readonly getParcelListStatement: Statement;

  constructor(db: Database) {
    this.getParcelListStatement = db.prepare(`
      select
        parcel.${DataField.LG_CODE.dbColumn},
        parcel.${DataField.MACHIAZA_ID.dbColumn} as "town_id",
        parcel.${DataField.PRC_ID.dbColumn},
        LTRIM(parcel.${DataField.PRC_NUM1.dbColumn},'0') as "prc_num1",
        LTRIM(parcel.${DataField.PRC_NUM2.dbColumn},'0') as "prc_num2",
        LTRIM(parcel.${DataField.PRC_NUM3.dbColumn},'0') as "prc_num3",
        parcel.${DataField.REP_LAT.dbColumn} as "lat",
        parcel.${DataField.REP_LON.dbColumn} as "lon"
      from parcel
      where
        parcel.${DataField.LG_CODE.dbColumn} = @lg_code AND
        parcel.${DataField.MACHIAZA_ID.dbColumn} = @town_id
    `);
  }

  async find(query: Query): Promise<Query> {
    const parcelMap = new Map<string, ParcelList>();
    (
      await this.getParcelList({
        lg_code: query.lg_code!,
        town_id: query.town_id!,
      })
    ).forEach((parcel: ParcelList) => {
      const key = this.formatResidentialSection({
        prc_num1: parcel.prc_num1,
        prc_num2: parcel.prc_num2,
        prc_num3: parcel.prc_num3,
      });
      parcelMap.set(key, parcel);
    });

    // 該当するデータがない場合は終了
    if (parcelMap.size === 0) {
      return query;
    }

    // 地番の取得
    const match = query.tempAddress.match(
      RegExpEx.create(
        `^([1-9][0-9]*)(?:${DASH}([1-9][0-9]*))?(?:${DASH}([1-9][0-9]*))?`
      )
    );
    if (!match) {
      return query;
    }
    const tempAddress = query.tempAddress;
    query = query.copy({
      tempAddress: query.tempAddress.substring(match[0].length),
    });

    const prc_num1: string | undefined = match[1];
    const prc_num2: string | undefined = match[2];
    const prc_num3: string | undefined = match[3];

    // 〇〇県 市〇〇 1-1-1（地番が 1-1-1 のパターン）
    const pattern1 = this.formatResidentialSection({
      prc_num1,
      prc_num2,
      prc_num3,
    });

    if (parcelMap.has(pattern1)) {
      const parcel: ParcelList = parcelMap.get(pattern1)!;
      return query.copy({
        lg_code: parcel.lg_code,
        town_id: parcel.town_id,
        prc_id: parcel.prc_id,
        prc_num1: prc_num1,
        prc_num2: `${prc_num2 ?? ''}`,
        prc_num3: `${prc_num3 ?? ''}`,
        lat: parcel.lat || query.lat,
        lon: parcel.lon || query.lon,
        // 地番までの判別ができた
        match_level: MatchLevel.PARCEL,
      });
    }

    // 〇〇県 市〇〇 1-1 （地番が 1-1 のパターン）
    const pattern2 = this.formatResidentialSection({
      prc_num1,
      prc_num2,
    });

    if (parcelMap.has(pattern2)) {
      const parcel: ParcelList = parcelMap.get(pattern2)!;
      return query.copy({
        lg_code: parcel.lg_code,
        town_id: parcel.town_id,
        prc_id: parcel.prc_id,
        prc_num1: prc_num1,
        prc_num2: prc_num2,
        prc_num3: '',
        lat: parcel.lat || query.lat,
        lon: parcel.lon || query.lon,
        tempAddress: (prc_num3 ? `${DASH}${prc_num3}` : '') + query.tempAddress,
        // 地番までの判別ができた
        match_level: MatchLevel.PARCEL,
      });
    }

    // 〇〇県 市〇〇 1 （地番が 1 のパターン）
    if (parcelMap.has(prc_num1)) {
      const parcel: ParcelList = parcelMap.get(prc_num1)!;
      const otherWithUnmatchedAddrs = [
        prc_num2 ? `${DASH}${prc_num2}` : '',
        prc_num3 ? `${DASH}${prc_num3}` : '',
        query.tempAddress,
      ].join('');
      return query.copy({
        lg_code: parcel.lg_code,
        town_id: parcel.town_id,
        prc_id: parcel.prc_id,
        prc_num1: prc_num1,
        prc_num2: '',
        prc_num3: '',
        lat: parcel.lat || query.lat,
        lon: parcel.lon || query.lon,
        tempAddress: otherWithUnmatchedAddrs,
        // 地番までの判別ができた
        match_level: MatchLevel.PARCEL,
      });
    }
    // 地番マッチしなかった場合
    query = query.copy({
      tempAddress: tempAddress,
    });
    return query;
  }

  private async getParcelList({
    lg_code,
    town_id,
  }: {
    lg_code: string;
    town_id: string;
  }): Promise<ParcelList[]> {
    const results = this.getParcelListStatement.all({
      lg_code,
      town_id,
    }) as ParcelList[];

    results.sort((a, b) => {
      return (
        this.formatResidentialSection(b).length -
        this.formatResidentialSection(a).length
      );
    });
    return Promise.resolve(results);
  }

  private formatResidentialSection({
    prc_num1,
    prc_num2,
    prc_num3,
  }: {
    prc_num1?: string;
    prc_num2?: string;
    prc_num3?: string;
  }) {
    return [prc_num1, prc_num2, prc_num3].filter(x => !!x).join(DASH);
  }
}
