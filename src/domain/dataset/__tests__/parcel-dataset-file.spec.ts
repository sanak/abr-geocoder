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
import { ParcelDatasetFile } from '../parcel-dataset-file';
import { DataField } from '@domain/dataset/data-field';
import { IStreamReady } from '@domain/istream-ready';
import { describe, expect, it } from '@jest/globals';

describe('ParcelDatasetFile', () => {
  it.concurrent('should create an instance', async () => {
    const fileMeta: IDatasetFileMeta = {
      type: 'parcel',
      fileArea: 'city011011',
      path: 'dummy',
      filename: 'mt_parcel_city011011.csv',
    };

    const istreamReady: IStreamReady = {
      name: 'mt_parcel_city011011.csv',
      crc32: 123456,
      contentLength: 123456,
      lastModified: 123456,
      getStream: function (): Promise<NodeJS.ReadableStream> {
        throw new Error('Function not implemented.');
      }
    }
    const instance = ParcelDatasetFile.create(fileMeta, istreamReady);
    expect(instance).not.toBeNull();
    expect(instance.filename).toBe('mt_parcel_city011011.csv');
    expect(instance.type).toBe('parcel');
    expect(instance.fields).toEqual([
      DataField.LG_CODE,
      DataField.MACHIAZA_ID,
      DataField.PRC_ID,
      DataField.CITY,
      DataField.WARD,
      DataField.OAZA_CHO,
      DataField.CHOME,
      DataField.KOAZA,
      DataField.PRC_NUM1,
      DataField.PRC_NUM2,
      DataField.PRC_NUM3,
      DataField.RSDT_ADDR_FLG,
      DataField.PRC_REC_FLG,
      DataField.PRC_AREA_CODE,
      DataField.EFCT_DATE,
      DataField.ABLT_DATE,
      DataField.SRC_CODE,
      DataField.REMARKS,
      DataField.REAL_PROP_NUM,
    ]);
  });

  it.concurrent('should return expected values from a given row', async () => {
    const fileMeta: IDatasetFileMeta = {
      type: 'parcel',
      fileArea: 'city011011',
      path: 'dummy',
      filename: 'mt_parcel_city011011.csv',
    };

    const istreamReady: IStreamReady = {
      name: 'mt_parcel_city011011.csv',
      crc32: 123456,
      contentLength: 123456,
      lastModified: 123456,
      getStream: function (): Promise<NodeJS.ReadableStream> {
        throw new Error('Function not implemented.');
      }
    }

    const instance = ParcelDatasetFile.create(fileMeta, istreamReady);
    const reuslt = instance.parseFields({
      [DataField.LG_CODE.csv]: '011011',
      [DataField.MACHIAZA_ID.csv]: '0001001',
      [DataField.PRC_ID.csv]: '000010000100001',
      [DataField.CITY.csv]: '札幌市',
      [DataField.WARD.csv]: '中央区',
      [DataField.OAZA_CHO.csv]: '旭ケ丘',
      [DataField.CHOME.csv]: '一丁目',
      [DataField.KOAZA.csv]: '',
      [DataField.PRC_NUM1.csv]: '00001',
      [DataField.PRC_NUM2.csv]: '00001',
      [DataField.PRC_NUM3.csv]: '00001',
      [DataField.RSDT_ADDR_FLG.csv]: '1',
      [DataField.PRC_REC_FLG.csv]: '0',
      [DataField.PRC_AREA_CODE.csv]: '0',
      [DataField.EFCT_DATE.csv]: '1947-04-17 18:00:00+09',
      [DataField.ABLT_DATE.csv]: '',
      [DataField.SRC_CODE.csv]: '0',
      [DataField.REMARKS.csv]: 'テスト備考',
      [DataField.REAL_PROP_NUM.csv]: '1234567890123',
    });

    expect(reuslt).toMatchObject({
      [DataField.LG_CODE.dbColumn]: '011011',
      [DataField.MACHIAZA_ID.dbColumn]: '0001001',
      [DataField.PRC_ID.dbColumn]: '000010000100001',
      [DataField.CITY.dbColumn]: '札幌市',
      [DataField.WARD.dbColumn]: '中央区',
      [DataField.OAZA_CHO.dbColumn]: '旭ケ丘',
      [DataField.CHOME.dbColumn]: '一丁目',
      [DataField.KOAZA.dbColumn]: '',
      [DataField.PRC_NUM1.dbColumn]: '00001',
      [DataField.PRC_NUM2.dbColumn]: '00001',
      [DataField.PRC_NUM3.dbColumn]: '00001',
      [DataField.RSDT_ADDR_FLG.dbColumn]: '1',
      [DataField.PRC_REC_FLG.dbColumn]: '0',
      [DataField.PRC_AREA_CODE.dbColumn]: '0',
      [DataField.EFCT_DATE.dbColumn]: '1947-04-17 18:00:00+09',
      [DataField.ABLT_DATE.dbColumn]: '',
      [DataField.SRC_CODE.dbColumn]: '0',
      [DataField.REMARKS.dbColumn]: 'テスト備考',
      [DataField.REAL_PROP_NUM.dbColumn]: '1234567890123',
    });
  });
})