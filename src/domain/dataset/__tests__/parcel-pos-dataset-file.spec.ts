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
import { ParcelPosDatasetFile } from '../parcel-pos-dataset-file';
describe('ParcelPosDatasetFile', () => {
  it.concurrent('地番位置情報 should create an instance', async () => {
    const fileMeta: IDatasetFileMeta = {
      type: 'parcel_pos',
      fileArea: 'city991011',
      path: 'dummy',
      filename: 'mt_parcel_pos_city991011.csv',
    };

    const istreamReady: IStreamReady = {
      name: 'mt_parcel_pos_city991011.csv',
      crc32: 123456,
      contentLength: 123456,
      lastModified: 123456,
      getStream: function (): Promise<NodeJS.ReadableStream> {
        throw new Error('Function not implemented.');
      }
    }
    const instance = ParcelPosDatasetFile.create(fileMeta, istreamReady);
    expect(instance).not.toBeNull();
    expect(instance.filename).toBe('mt_parcel_pos_city991011.csv');
    expect(instance.type).toBe('parcel_pos');
    expect(instance.fields).toEqual([
      DataField.LG_CODE,
      DataField.MACHIAZA_ID,
      DataField.PRC_ID,
      DataField.REP_LON,
      DataField.REP_LAT,
    ]);
  });

  it.concurrent('地番位置情報 should return expected values from a given row', async () => {
    const fileMeta: IDatasetFileMeta = {
      type: 'parcel_pos',
      fileArea: 'city991011',
      path: 'dummy',
      filename: 'mt_parcel_pos_city991011.csv',
    };
    const istreamReady: IStreamReady = {
      name: 'mt_parcel_pos_city991011.csv',
      crc32: 123456,
      contentLength: 123456,
      lastModified: 123456,
      getStream: function (): Promise<NodeJS.ReadableStream> {
        throw new Error('Function not implemented.');
      }
    }
    const instance = ParcelPosDatasetFile.create(fileMeta, istreamReady);
    const reuslt = instance.parseFields({
      [DataField.LG_CODE.csv]: '011011',
      [DataField.MACHIAZA_ID.csv]: '0001001',
      [DataField.PRC_ID.csv]: '000010000100030',
      [DataField.REP_LAT.csv]: '26.199562',
      [DataField.REP_LON.csv]: '127.691306',
    });

    expect(reuslt).toMatchObject({
      [DataField.LG_CODE.dbColumn]: '011011',
      [DataField.MACHIAZA_ID.dbColumn]: '0001001',
      [DataField.PRC_ID.dbColumn]: '000010000100030',
      [DataField.REP_LAT.dbColumn]: '26.199562',
      [DataField.REP_LON.dbColumn]: '127.691306',
    });
  });
})