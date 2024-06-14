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
import { IDatasetFileMeta } from '@domain/dataset-file';
import { DataField } from '@domain/dataset/data-field';
import { IStreamReady } from '@domain/istream-ready';
import { describe, expect, it } from '@jest/globals';
import { TownDatasetFile } from '../town-dataset-file';

describe('TownDatasetFile', () => {
  it.concurrent('should create an instance', async () => {
    const fileMeta: IDatasetFileMeta = {
      type: 'town',
      fileArea: 'all',
      path: 'dummy',
      filename: 'mt_town_all.csv',
    };

    const istreamReady: IStreamReady = {
      name: 'mt_town_all.csv',
      crc32: 123456,
      contentLength: 123456,
      lastModified: 123456,
      getStream: function (): Promise<NodeJS.ReadableStream> {
        throw new Error('Function not implemented.');
      }
    }
    const instance = TownDatasetFile.create(fileMeta, istreamReady);
    expect(instance).not.toBeNull();
    expect(instance.filename).toBe('mt_town_all.csv');
    expect(instance.type).toBe('town');
    expect(instance.fields).toEqual([
      DataField.LG_CODE,
      DataField.MACHIAZA_ID,
      DataField.MACHIAZA_TYPE,
      DataField.PREF,
      DataField.PREF_KANA,
      DataField.PREF_ROMA,
      DataField.COUNTY,
      DataField.COUNTY_KANA,
      DataField.COUNTY_ROMA,
      DataField.CITY,
      DataField.CITY_KANA,
      DataField.CITY_ROMA,
      DataField.WARD,
      DataField.WARD_KANA,
      DataField.WARD_ROMA,
      DataField.OAZA_CHO,
      DataField.OAZA_CHO_KANA,
      DataField.OAZA_CHO_ROMA,
      DataField.CHOME,
      DataField.CHOME_KANA,
      DataField.CHOME_NUMBER,
      DataField.KOAZA,
      DataField.KOAZA_KANA,
      DataField.KOAZA_ROMA,
      DataField.MACHIAZA_DIST,
      DataField.RSDT_ADDR_FLG,
      DataField.RSDT_ADDR_MTD_CODE,
      DataField.OAZA_CHO_AKA_FLG,
      DataField.KOAZA_AKA_CODE,
      DataField.OAZA_CHO_GSI_UNCMN,
      DataField.KOAZA_GSI_UNCMN,
      DataField.STATUS_FLG,
      DataField.WAKE_NUM_FLG,
      DataField.EFCT_DATE,
      DataField.ABLT_DATE,
      DataField.SRC_CODE,
      DataField.POST_CODE,
      DataField.REMARKS,
    ]);
  });

  it.concurrent('should return expected values from a given row', async () => {
    const fileMeta: IDatasetFileMeta = {
      type: 'town',
      fileArea: 'all',
      path: 'dummy',
      filename: 'mt_town_all.csv',
    };
    const istreamReady: IStreamReady = {
      name: 'mt_town_all.csv',
      crc32: 123456,
      contentLength: 123456,
      lastModified: 123456,
      getStream: function (): Promise<NodeJS.ReadableStream> {
        throw new Error('Function not implemented.');
      }
    }
    const instance = TownDatasetFile.create(fileMeta, istreamReady);
    const reuslt = instance.parseFields({
      [DataField.LG_CODE.csv]: '11011',
      [DataField.MACHIAZA_ID.csv]: '1001',
      [DataField.MACHIAZA_TYPE.csv]: '2',
      [DataField.PREF.csv]: '北海道',
      [DataField.PREF_KANA.csv]: 'ホッカイドウ',
      [DataField.PREF_ROMA.csv]: 'Hokkaido',
      [DataField.COUNTY.csv]: '',
      [DataField.COUNTY_KANA.csv]: '',
      [DataField.COUNTY_ROMA.csv]: '',
      [DataField.CITY.csv]: '札幌市',
      [DataField.CITY_KANA.csv]: 'サッポロシ',
      [DataField.CITY_ROMA.csv]: 'Sapporo-shi',
      [DataField.WARD.csv]: '中央区',
      [DataField.WARD_KANA.csv]: 'チュウオウク',
      [DataField.WARD_ROMA.csv]: 'Chuo-ku',
      [DataField.OAZA_CHO.csv]: '旭ケ丘',
      [DataField.OAZA_CHO_KANA.csv]: 'アサヒガオカ',
      [DataField.OAZA_CHO_ROMA.csv]: 'Asahigaoka',
      [DataField.CHOME.csv]: '一丁目',
      [DataField.CHOME_KANA.csv]: '１チョウメ',
      [DataField.CHOME_NUMBER.csv]: '1',
      [DataField.KOAZA.csv]: '',
      [DataField.KOAZA_KANA.csv]: '',
      [DataField.KOAZA_ROMA.csv]: '',
      [DataField.MACHIAZA_DIST.csv]: '',
      [DataField.RSDT_ADDR_FLG.csv]: '1',
      [DataField.RSDT_ADDR_MTD_CODE.csv]: '1',
      [DataField.OAZA_CHO_AKA_FLG.csv]: '0',
      [DataField.KOAZA_AKA_CODE.csv]: '0',
      [DataField.OAZA_CHO_GSI_UNCMN.csv]: '0',
      [DataField.KOAZA_GSI_UNCMN.csv]: '0',
      [DataField.STATUS_FLG.csv]: '0',
      [DataField.WAKE_NUM_FLG.csv]: '0',
      [DataField.EFCT_DATE.csv]: '1947-04-17',
      [DataField.ABLT_DATE.csv]: '',
      [DataField.SRC_CODE.csv]: '0',
      [DataField.POST_CODE.csv]: '',
      [DataField.REMARKS.csv]: '',
    });

    expect(reuslt).toMatchObject({
      [DataField.LG_CODE.dbColumn]: '11011',
      [DataField.MACHIAZA_ID.dbColumn]: '1001',
      [DataField.MACHIAZA_TYPE.dbColumn]: '2',
      [DataField.PREF.dbColumn]: '北海道',
      [DataField.PREF_KANA.dbColumn]: 'ホッカイドウ',
      [DataField.PREF_ROMA.dbColumn]: 'Hokkaido',
      [DataField.COUNTY.dbColumn]: '',
      [DataField.COUNTY_KANA.dbColumn]: '',
      [DataField.COUNTY_ROMA.dbColumn]: '',
      [DataField.CITY.dbColumn]: '札幌市',
      [DataField.CITY_KANA.dbColumn]: 'サッポロシ',
      [DataField.CITY_ROMA.dbColumn]: 'Sapporo-shi',
      [DataField.WARD.dbColumn]: '中央区',
      [DataField.WARD_KANA.dbColumn]: 'チュウオウク',
      [DataField.WARD_ROMA.dbColumn]: 'Chuo-ku',
      [DataField.OAZA_CHO.dbColumn]: '旭ケ丘',
      [DataField.OAZA_CHO_KANA.dbColumn]: 'アサヒガオカ',
      [DataField.OAZA_CHO_ROMA.dbColumn]: 'Asahigaoka',
      [DataField.CHOME.dbColumn]: '一丁目',
      [DataField.CHOME_KANA.dbColumn]: '１チョウメ',
      [DataField.CHOME_NUMBER.dbColumn]: '1',
      [DataField.KOAZA.dbColumn]: '',
      [DataField.KOAZA_KANA.dbColumn]: '',
      [DataField.KOAZA_ROMA.dbColumn]: '',
      [DataField.MACHIAZA_DIST.dbColumn]: '',
      [DataField.RSDT_ADDR_FLG.dbColumn]: '1',
      [DataField.RSDT_ADDR_MTD_CODE.dbColumn]: '1',
      [DataField.OAZA_CHO_AKA_FLG.dbColumn]: '0',
      [DataField.KOAZA_GSI_UNCMN.dbColumn]: '0',
      [DataField.OAZA_CHO_GSI_UNCMN.dbColumn]: '0',
      [DataField.KOAZA_GSI_UNCMN.dbColumn]: '0',
      [DataField.STATUS_FLG.dbColumn]: '0',
      [DataField.WAKE_NUM_FLG.dbColumn]: '0',
      [DataField.EFCT_DATE.dbColumn]: '1947-04-17',
      [DataField.ABLT_DATE.dbColumn]: '',
      [DataField.SRC_CODE.dbColumn]: '0',
      [DataField.POST_CODE.dbColumn]: '',
      [DataField.REMARKS.dbColumn]: '',
    });
  });
})