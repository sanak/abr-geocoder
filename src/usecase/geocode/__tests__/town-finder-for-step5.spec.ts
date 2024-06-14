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
import { TownFinderForStep5, TownRow } from '@usecase/geocode/town-finder-for-step5';
import { PrefectureName } from '@domain/prefecture-name';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DASH } from '@settings/constant-values';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';

jest.mock<BetterSqlite3.Database>('better-sqlite3');

const MockedDB = Database as unknown as jest.Mock;
const tokyoTowns: TownRow[] = [
  {
    lg_code: '131016',
    town_id: '0002001',
    name: '霞が関',
    koaza: '',
    lat: 35.634002,
    lon: 139.745217,
    rsdt_addr_flg: '1',
  },
  {
    lg_code: '132098',
    town_id: '0006002',
    name: '森野',
    koaza: '',
    lat: 35.548247,
    lon: 139.440264,
    rsdt_addr_flg: '1',
  },
  {
    lg_code: '131016',
    town_id: '0053001',
    name: '麹町',
    koaza: '',
    lat: 35.684447,
    lon: 139.742919,
    rsdt_addr_flg: '0',
  },
  {
    lg_code: '011045',
    town_id: '0052101',
    name: '南郷通',
    koaza: '一丁目北',
    lat: 43.046881,
    lon: 141.39899,
    rsdt_addr_flg: '1',
  },
];

const kyotoTowns: TownRow[] = [
  {
    lg_code: '261041',
    town_id: '0000004',
    name: '四町目',
    koaza: '',
    lat: 35.016866,
    lon: 135.764047,
    rsdt_addr_flg: '1',
  },
  {
    lg_code: '261041',
    town_id: '0005000',
    name: '五町目',
    koaza: '',
    lat: 35.015582,
    lon: 135.763968,
    rsdt_addr_flg: '1',
  },
  {
    lg_code: '261041',
    town_id: '0000006',
    name: '六町目',
    koaza: '',
    lat: 35.014288,
    lon: 135.763985,
    rsdt_addr_flg: '1',
  },
];

MockedDB.mockImplementation(() => {
  return {
    prepare: (sql: string) => {
      return {
        all: (params: { prefecture: PrefectureName; city: string }) => {
          switch (params.prefecture) {
            case PrefectureName.TOKYO:
              return tokyoTowns;

            case PrefectureName.KYOTO:
              return kyotoTowns;

            case PrefectureName.SHIZUOKA:
              return [];

            default:
              throw new Error(`Unexpected prefecture : ${params.prefecture}`);
          }
        },
      };
    },
  };
});

const wildcardHelper = (address: string) => {
  return address;
};
describe('TownFinderForStep5', () => {
  const mockedDB = new Database('<no sql file>');

  const instance = new TownFinderForStep5({
    db: mockedDB,
    wildcardHelper,
  });

  beforeEach(() => {
    MockedDB.mockClear();
  });

  it.concurrent('大字・町名まで特定できるケース', async () => {
    const result = await instance.find({
      address: '霞が関4${DASH}1${DASH}2',
      prefecture: PrefectureName.TOKYO,
      city: '千代田区',
    });
    expect(result).toEqual({
      lg_code: '131016',
      town_id: '0002000',
      name: '霞が関',
      koaza: '',
      lat: 35.634002,
      lon: 139.745217,
      rsdt_addr_flg: '1',
      originalName: '',
      tempAddress: '4${DASH}1${DASH}2',
    });
  });

  it.concurrent('住所が住居表示非実施のケース', async () => {
    const result = await instance.find({
      address: '麹町1丁目',
      prefecture: PrefectureName.TOKYO,
      city: '千代田区',
    });
    expect(result).toEqual({
      lg_code: '131016',
      town_id: '0053000',
      name: '麹町',
      koaza: '',
      lat: 35.684447,
      lon: 139.742919,
      rsdt_addr_flg: '0',
      originalName: '',
      tempAddress: '1丁目',
    });
  });

  it.concurrent('京都の住所ケース', async () => {
    const result = await instance.find({
      address: '中京区柳馬場通夷川上ル五町目242',
      prefecture: PrefectureName.KYOTO,
      city: '京都市',
    });
    expect(result).toEqual({
      lg_code: '261041',
      lat: 35.015582,
      lon: 135.763968,
      rsdt_addr_flg: '1',
      originalName: '',
      town_id: '0005000',
      koaza: '',
      name: '五町目',
      tempAddress: '242',
    });
  });

  it.concurrent('見つからないケース', async () => {
    const result = await instance.find({
      address: `御幸町16${DASH}1`,
      prefecture: PrefectureName.SHIZUOKA,
      city: '沼津市',
    });

    expect(result).toEqual(null);
  });

  it.concurrent('「町」を含む地名', async () => {
    const result = await instance.find({
      address: `森野2${DASH}2${DASH}22`,
      prefecture: PrefectureName.TOKYO,
      city: '町田市',
    });

    expect(result).toEqual({
      lg_code: '132098',
      town_id: '0006000',
      name: `森野`,
      koaza: '',
      lat: 35.548247,
      lon: 139.440264,
      rsdt_addr_flg: '1',
      originalName: '',
      tempAddress: `2${DASH}2${DASH}22`,
    });
  });

  it.concurrent('小字住所のケース', async () => {
    const result = await instance.find({
      address: `南郷通`,
      prefecture: PrefectureName.TOKYO,
      city: '白石区',
    });

    expect(result).toEqual({
      lg_code: '011045',
      town_id: '0052000',
      name: `南郷通`,
      koaza: '一丁目北',
      lat: 43.046881,
      lon: 141.39899,
      rsdt_addr_flg: '1',
      originalName: '',
      tempAddress: ``,
    });
  });
});
