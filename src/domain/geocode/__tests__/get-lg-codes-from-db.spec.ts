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
import { describe, expect, it, jest } from '@jest/globals';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import { getLgCodesFromDB } from "../get-lg-codes-from-db";
import { CliDefaultValues } from '@settings/cli-default-values';

jest.mock<BetterSqlite3.Database>('better-sqlite3');
jest.mock('string-hash')

const MockedDB = Database as unknown as jest.Mock;

/**
 * {@link getLgCodesFromDB} のテストを実施します。
 */
describe('getLgCodesFromDB Test', () => {

  it('全国地方公共団体コードの一覧が正常に取得できることの確認', async () => {
    // モック定義
    MockedDB.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            all: (): { lg_code: string }[] | undefined => {
              return [
                { lg_code: '011011' },
                { lg_code: '011029' }
              ]
            },
          };
        },
      };
    });
    const mockedDB = new Database('<no sql file>');
    // テスト実施
    const actual = await getLgCodesFromDB({ db: mockedDB });
    //結果
    expect(actual?.length).toEqual(2);
    expect(actual![0]).toEqual('011011');
    expect(actual![1]).toEqual('011029');
  });

  it('全国地方公共団体コードの一覧が正常に取得できることの確認(都道府県コード指定)', async () => {
    // モック定義
    MockedDB.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            all: (): { lg_code: string }[] | undefined => {
              return [
                { lg_code: '221007' },
                { lg_code: '221015' }
              ]
            },
          };
        },
      };
    });
    const mockedDB = new Database('<no sql file>');
    // テスト実施
    const actual = await getLgCodesFromDB({ db: mockedDB, prefCode: '22' });
    //結果
    expect(actual.length).toEqual(2);
    expect(actual![0]).toEqual('221007');
    expect(actual![1]).toEqual('221015');
  });

  it('全国地方公共団体コードの一覧が正常に取得できることの確認(全国地方公共団体コードがない)', async () => {
    // モック定義
    MockedDB.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            all: (): { lg_code: string }[] | undefined => {
              return undefined
            },
          };
        },
      };
    });
    const mockedDB = new Database('<no sql file>');
    // テスト実施
    const actual = await getLgCodesFromDB({ db: mockedDB, prefCode: CliDefaultValues.PREF_CODE });
    //結果
    expect(actual.length).toEqual(0);
  });
});