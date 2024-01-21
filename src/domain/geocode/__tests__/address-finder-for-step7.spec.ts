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
import { AddressFinderForStep7 } from '@domain/geocode/address-finder-for-step7';
import { MatchLevel } from '@domain/match-level';
import { PrefectureName } from '@domain/prefecture-name';
import { Query } from '@domain/query';
import { describe, expect, it, jest } from '@jest/globals';
import { DASH } from '@settings/constant-values';
import { DataSource } from 'typeorm';
import dummyBlockList from './dummyBlockList.json';
import dummyRsdtList from './dummyRsdtList.json';

jest.mock<DataSource>('typeorm');

const MockedDS = DataSource as unknown as jest.Mock;

MockedDS.mockImplementation(() => {
  return {
    query: (sql: string, params: string[]) => {
      // ダミーデータは紀尾井町のデータだけなので、それ以外は空リストを返す
      // パラメータ配列内で@prefectureは2番目に来る([@town, @prefecture, @city])
      if (params[1] !== PrefectureName.TOKYO) {
        return Promise.resolve([]);
      }

      // sqlに合わせてデータを返す
      if (/unit\s+test:\s+getBlockListSql/i.test(sql)) {
        return Promise.resolve(dummyBlockList);
      }
      if (/unit\s+test:\s+getRsdtListSql/i.test(sql)) {
        return Promise.resolve(dummyRsdtList);
      }
      throw new Error('Unexpected sql was given');
    },
    options: {
      type: 'better-sqlite3',
    },
  }
});

// TODO: カバレッジ100%になるテストケースを考える
describe('AddressFinderForStep7', () => {
  const mockedDS = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
  });
  const addressFinder = new AddressFinderForStep7(mockedDS);
  
  it.concurrent('番地情報を返すケース(1)', async () => {
    const inputAddress = `東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.TOKYO,
      city: '千代田区',
      town: '紀尾井町',
      tempAddress: `1${DASH}3 東京ガーデンテラス紀尾井町 19階、20階`,
    });

    const result = await addressFinder.find(query);
    expect(result).toEqual(Query.create(inputAddress).copy({
      prefecture: PrefectureName.TOKYO,
      city: '千代田区',
      town: '紀尾井町',
      tempAddress: ' 東京ガーデンテラス紀尾井町 19階、20階',
      lg_code: '131016',
      town_id: '0056000',
      block_id: '001',
      block: '1',
      lat: null,
      lon: null,
      addr1: '3',
      addr1_id: '003',
      addr2: '',
      addr2_id: '',
      match_level: MatchLevel.RESIDENTIAL_DETAIL,
    }))
  });

  it.concurrent('番地情報を返さない場合はQueryを変更しない', async () => {
    const inputAddress = `広島市佐伯区海老園二丁目5番28号`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.HIROSHIMA,
      city: '広島市',
      town: '佐伯区海老園',
      tempAddress: '二丁目5番28号',
      match_level: MatchLevel.TOWN_LOCAL,
    });

    const result = await addressFinder.find(query);
    expect(result).toEqual(query);
  })

  it.concurrent('番地を含まないケース', async () => {
    const inputAddress = `広島市佐伯区海老園`;
    const query = Query.create(inputAddress).copy({
      prefecture: PrefectureName.HIROSHIMA,
      city: '広島市',
      town: '佐伯区海老園',
      tempAddress: '',
      match_level: MatchLevel.TOWN_LOCAL,
    });

    const result = await addressFinder.find(query);
    expect(result).toEqual(query);
  })
});
