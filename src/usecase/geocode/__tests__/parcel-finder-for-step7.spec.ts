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
import { ParcelFinderForStep7 } from '@usecase/geocode/parcel-finder-for-step7';
import { MatchLevel } from '@domain/match-level';
import { PrefectureName } from '@domain/prefecture-name';
import { Query } from '@domain/query';
import { describe, expect, it, jest } from '@jest/globals';
import { DASH } from '@settings/constant-values';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import dummyParcelList from './dummyParcelList.json';

jest.mock<BetterSqlite3.Database>('better-sqlite3');

const MockedDB = Database as unknown as jest.Mock;

MockedDB.mockImplementation(() => {
  return {
    prepare: (sql: string) => {
      return {
        all: (params: {
          lg_code: string;
          town_id: string;
        }) => {
          // ダミーデータはlg_code:322016のみ、それ以外は空リストを返す
          if (params.lg_code !== '322016') {
            return [];
          }
          return dummyParcelList;
        }
      }
    },
  };
});

// TODO: カバレッジ100%になるテストケースを考える
describe('ParcelFinderForStep7', () => {
  const mockedDB = new Database('<no sql file>');
  const parcelFinder = new ParcelFinderForStep7(mockedDB);

  it.concurrent('地番情報を返すケース(1)', async () => {
    const inputAddress = `島根県松江市青葉台101-1-1`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      lg_code: '322016',
      town_id: '0002000',
      tempAddress: `101${DASH}1${DASH}1`,
    });

    const result = await parcelFinder.find(query);
    expect(result).toEqual(Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      tempAddress: '',
      lg_code: '322016',
      town_id: '0002000',
      lat: 35.123456,
      lon: 133.123456,
      prc_id: '001010000100001',
      prc_num1: '101',
      prc_num2: '1',
      prc_num3: '1',
      match_level: MatchLevel.PARCEL,
    }))
  });

  it.concurrent('地番情報を返すケース(2)', async () => {
    const inputAddress = `島根県松江市青葉台121-2`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      lg_code: '322016',
      town_id: '0002000',
      tempAddress: `121${DASH}2`,
    });

    const result = await parcelFinder.find(query);
    expect(result).toEqual(Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      tempAddress: '',
      lg_code: '322016',
      town_id: '0002000',
      lat: 35.44712148,
      lon: 133.105246137,
      prc_num1: '121',
      prc_num2: '2',
      prc_num3: '',
      prc_id: '001210000200000',
      match_level: MatchLevel.PARCEL,
    }))
  });

  it.concurrent('地番情報を返すケース(3)', async () => {
    const inputAddress = `島根県松江市青葉台103`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      lg_code: '322016',
      town_id: '0002000',
      tempAddress: '103',
    });

    const result = await parcelFinder.find(query);
    expect(result).toEqual(Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      tempAddress: '',
      lg_code: '322016',
      town_id: '0002000',
      lat: null,
      lon: null,
      prc_num1: '103',
      prc_num2: '',
      prc_num3: '',
      prc_id: '001030000000000',
      match_level: MatchLevel.PARCEL,
    }))
  });

  // 103-1 103のデータしかない
  it.concurrent('地番情報を返すケース(4)', async () => {
    const inputAddress = `島根県松江市青葉台103-1`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      lg_code: '322016',
      town_id: '0002000',
      tempAddress: `103${DASH}1`,
    });

    const result = await parcelFinder.find(query);
    expect(result).toEqual(Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      tempAddress: '@1',
      lg_code: '322016',
      town_id: '0002000',
      lat: null,
      lon: null,
      prc_num1: '103',
      prc_num2: '',
      prc_num3: '',
      prc_id: '001030000000000',
      match_level: MatchLevel.PARCEL,
    }))
  });
  // 103-1-1 103のデータしかない
  it.concurrent('地番情報を返すケース(5)', async () => {
    const inputAddress = `島根県松江市青葉台103-1`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      lg_code: '322016',
      town_id: '0002000',
      tempAddress: `103${DASH}1${DASH}1`,
    });

    const result = await parcelFinder.find(query);
    expect(result).toEqual(Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      tempAddress: '@1@1',
      lg_code: '322016',
      town_id: '0002000',
      lat: null,
      lon: null,
      prc_num1: '103',
      prc_num2: '',
      prc_num3: '',
      prc_id: '001030000000000',
      match_level: MatchLevel.PARCEL,
    }))
  });
  it.concurrent('地番情報を返さない場合はQueryを変更しない', async () => {
    const inputAddress = `島根県松江市青葉台3-1-1`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      lg_code: '322016',
      town_id: '0002000',
      tempAddress: '3-1-1',
      match_level: MatchLevel.TOWN_LOCAL,
    });

    const result = await parcelFinder.find(query);
    expect(result).toEqual(query);
  })

  it.concurrent('地番を含まないケース', async () => {
    const inputAddress = `島根県松江市青葉台`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.SHIMANE,
      city: '松江市',
      town: '青葉台',
      lg_code: '322016',
      town_id: '0002000',
      tempAddress: '',
      match_level: MatchLevel.TOWN_LOCAL,
    });

    const result = await parcelFinder.find(query);
    expect(result).toEqual(query);
  })
});
