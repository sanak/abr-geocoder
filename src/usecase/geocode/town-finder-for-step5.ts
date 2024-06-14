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
import { isKanjiNumberFollewedByCho } from '@domain/is-kanji-number-follewed-by-cho';
import { RegExpEx } from '@domain/reg-exp-ex';
import { DASH, DASH_SYMBOLS } from '@settings/constant-values';
import { Database, Statement } from 'better-sqlite3';
import { PrefectureName } from '@domain/prefecture-name';
import { ITown } from '@domain/town';
import { toRegexPattern } from '@domain/geocode/to-regex-pattern';

export type TownRow = {
  lg_code: string;
  town_id: string;
  name: string;
  koaza: string;
  lat: number;
  lon: number;
  rsdt_addr_flg: string;
};

export type TownPattern = {
  town: ITown;
  pattern: string;
};

export type FindParameters = {
  address: string;
  prefecture: PrefectureName;
  city: string;
};

/**
 * 与えられた情報をもとに、Databaseを探索して可能性のある結果を返す
 * オリジナルコードの getNormalizedCity() 関連を１つにまとめたクラス。
 * 実質的にジオコーディングしている部分
 */
export class TownFinderForStep5 {
  private readonly getTownStatement: Statement;
  private readonly wildcardHelper: (address: string) => string;
  constructor({
    db,
    wildcardHelper,
  }: {
    db: Database;
    wildcardHelper: (address: string) => string;
  }) {
    this.wildcardHelper = wildcardHelper;

    // getTownList() で使用するSQLをstatementにしておく
    // "name"の文字数が長い順にソートする
    // 町字IDの一番小さいレコードの緯度、経度を採用するために町字IDを昇順でソートする
    this.getTownStatement = db.prepare(`
      select
        "${DataField.LG_CODE.dbColumn}",
        "${DataField.MACHIAZA_ID.dbColumn}" as "town_id",
        "${DataField.OAZA_CHO.dbColumn}" as "name",
        "${DataField.REP_LAT.dbColumn}" as "lat",
        "${DataField.REP_LON.dbColumn}" as "lon"
      from
        "town"
      where
        "${DataField.PREF.dbColumn}" = @prefecture AND
        (
          "${DataField.COUNTY.dbColumn}" ||
          "${DataField.CITY.dbColumn}" ||
          "${DataField.WARD.dbColumn}"
        ) = @city AND
        "${DataField.OAZA_CHO.dbColumn}" <> ''
        order by length("name") desc,
        "${DataField.MACHIAZA_ID.dbColumn}" asc;
    `);
  }

  async find({
    address,
    prefecture,
    city,
  }: FindParameters): Promise<ITown | null> {
    /*
     * オリジナルコード
     * https://github.com/digital-go-jp/abr-geocoder/blob/a42a079c2e2b9535e5cdd30d009454cddbbca90c/src/engine/normalize.ts#L133-L164
     */
    address = address.trim().replace(RegExpEx.create('^大字'), '');
    const isKyotoCity = city.startsWith('京都市');

    // 都道府県名と市町村名から、その地域に所属する町（小区分）のリストをDatabaseから取得する
    const towns = await this.getTownList({
      prefecture,
      city,
    });

    // データベースから取得したリストから、マッチしそうな正規表現パターンを作成する
    const searchPatterns = this.createSearchPatterns({
      towns,
      isKyotoCity,
    });
    const townPatterns = this.toTownPatterns(searchPatterns);

    const regexPrefixes = ['^'];
    if (isKyotoCity) {
      // 京都は通り名削除のために後方一致を使う
      regexPrefixes.push('.*');
    }

    // 作成した正規表現パターンに基づき、マッチするか全部試す
    for (const regexPrefix of regexPrefixes) {
      for (const { town, pattern } of townPatterns) {
        const modifiedPattern = this.wildcardHelper(pattern);
        if (modifiedPattern === undefined) {
          continue;
        }
        const regex = RegExpEx.create(`${regexPrefix}${modifiedPattern}`);
        const match = address.match(regex);
        if (!match) {
          continue;
        }

        // 条件に一致する大字・町名が見つかったケース
        return {
          lg_code: town.lg_code,
          lat: town.lat,
          lon: town.lon,
          rsdt_addr_flg: town.rsdt_addr_flg,
          originalName: town.originalName,
          town_id: town.town_id.substring(0, 4) + '000',
          koaza: town.koaza,
          name: town.name,
          tempAddress: address.substring(match[0].length),
        };
      }
    }

    // 条件に一致する大字・町名が見つからない場合、nullを返す
    return null;
  }

  /**
   * オリジナルコード
   * https://github.com/digital-go-jp/abr-geocoder/blob/a42a079c2e2b9535e5cdd30d009454cddbbca90c/src/engine/lib/cacheRegexes.ts#L206-L318
   */
  private createSearchPatterns({
    towns,
    isKyotoCity,
  }: {
    towns: TownRow[];
    isKyotoCity: boolean;
  }): ITown[] {
    const townSet = new Set(towns.map(town => town.name));

    // 町丁目に「○○町」が含まれるケースへの対応
    // 通常は「○○町」のうち「町」の省略を許容し同義語として扱うが、まれに自治体内に「○○町」と「○○」が共存しているケースがある。
    // この場合は町の省略は許容せず、入力された住所は書き分けられているものとして正規化を行う。
    // 更に、「愛知県名古屋市瑞穂区十六町1丁目」漢数字を含むケースだと丁目や番地・号の正規化が不可能になる。このようなケースも除外。
    const results: ITown[] = [];

    // 京都は通り名削除の処理があるため、意図しないマッチになるケースがある。これを除く
    if (isKyotoCity) {
      towns.forEach(town => {
        results.push({
          ...town,
          originalName: '',
        });
      });

      return results;
    }

    towns.forEach(town => {
      results.push({
        ...town,
        originalName: '',
      });

      if (!town.name.includes('町')) {
        return;
      }

      // 冒頭の「町」が付く地名（町田市など）は明らかに省略するべきないので、除外
      const townAddr = town.name.replace(RegExpEx.create('(?!^町)町', 'g'), '');

      if (townSet.has(townAddr)) {
        return;
      }

      // 大字は省略されるため、大字〇〇と〇〇町がコンフリクトする。このケースを除外
      if (townSet.has(`大字${townAddr}`)) {
        return;
      }

      if (isKanjiNumberFollewedByCho(town.name)) {
        return;
      }

      // エイリアスとして「〇〇町」の"町"なしパターンを登録
      results.push({
        name: townAddr,
        originalName: town.name,
        lg_code: town.lg_code,
        town_id: town.town_id,
        koaza: town.koaza,
        lat: town.lat,
        lon: town.lon,
        rsdt_addr_flg: town.rsdt_addr_flg,
      });
    });

    return results;
  }

  private toTownPatterns(searchPatterns: ITown[]): TownPattern[] {
    // 少ない文字数の地名に対してミスマッチしないように文字の長さ順にソート
    searchPatterns.sort((townA: ITown, townB: ITown) => {
      let aLen = townA.name.length;
      let bLen = townB.name.length;

      // 大字で始まる場合、優先度を低く設定する。
      // 大字XX と XXYY が存在するケースもあるので、 XXYY を先にマッチしたい
      if (townA.name.startsWith('大字')) aLen -= 2;
      if (townB.name.startsWith('大字')) bLen -= 2;

      return bLen - aLen;
    });

    const patterns = searchPatterns.map(town => {
      const pattern = toRegexPattern(
        town.name
          // 横棒を含む場合（流通センター、など）に対応
          .replace(RegExpEx.create(`[${DASH_SYMBOLS}]`, 'g'), `[${DASH}]`)
          .replace(RegExpEx.create('大?字', 'g'), '(大?字)?')
      );

      return {
        town,
        pattern,
      };
    });

    return patterns;
  }

  /**
   * SQLを実行する
   *
   * better-sqlite3自体はasyncではないが、将来的にTypeORMに変更したいので
   * asyncで関数を作っておく
   */
  private async getTownList({
    prefecture,
    city,
  }: {
    prefecture: PrefectureName;
    city: string;
  }): Promise<TownRow[]> {
    const results = this.getTownStatement.all({
      prefecture,
      city,
    }) as TownRow[];

    return Promise.resolve(results);
  }
}
