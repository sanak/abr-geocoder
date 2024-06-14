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
import { DatasetFileParams, IDatasetFileMeta } from '@domain/dataset-file';
import { DataField } from '@domain/dataset/data-field';
import { IStreamReady } from '@domain/istream-ready';
import { DataWithDateFile } from './dataset-file';

export class CityDatasetFile
  extends DataWithDateFile
  implements IDatasetFileMeta
{
  get fields(): DataField[] {
    return [
      DataField.LG_CODE,
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
      DataField.EFCT_DATE,
      DataField.ABLT_DATE,
      DataField.REMARKS,
    ];
  }

  constructor(params: DatasetFileParams) {
    super(params);
    Object.freeze(this);
  }

  static create(
    params: IDatasetFileMeta,
    csvFile: IStreamReady
  ): CityDatasetFile {
    const sql = `INSERT OR REPLACE INTO "city"
      (
        ${DataField.LG_CODE.dbColumn},
        ${DataField.PREF.dbColumn},
        ${DataField.PREF_KANA.dbColumn},
        ${DataField.PREF_ROMA.dbColumn},
        ${DataField.COUNTY.dbColumn},
        ${DataField.COUNTY_KANA.dbColumn},
        ${DataField.COUNTY_ROMA.dbColumn},
        ${DataField.CITY.dbColumn},
        ${DataField.CITY_KANA.dbColumn},
        ${DataField.CITY_ROMA.dbColumn},
        ${DataField.WARD.dbColumn},
        ${DataField.WARD_KANA.dbColumn},
        ${DataField.WARD_ROMA.dbColumn},
        ${DataField.EFCT_DATE.dbColumn},
        ${DataField.ABLT_DATE.dbColumn},
        ${DataField.REMARKS.dbColumn}
      )
      VALUES
      (
        @${DataField.LG_CODE.dbColumn},
        @${DataField.PREF.dbColumn},
        @${DataField.PREF_KANA.dbColumn},
        @${DataField.PREF_ROMA.dbColumn},
        @${DataField.COUNTY.dbColumn},
        @${DataField.COUNTY_KANA.dbColumn},
        @${DataField.COUNTY_ROMA.dbColumn},
        @${DataField.CITY.dbColumn},
        @${DataField.CITY_KANA.dbColumn},
        @${DataField.CITY_ROMA.dbColumn},
        @${DataField.WARD.dbColumn},
        @${DataField.WARD_KANA.dbColumn},
        @${DataField.WARD_ROMA.dbColumn},
        @${DataField.EFCT_DATE.dbColumn},
        @${DataField.ABLT_DATE.dbColumn},
        @${DataField.REMARKS.dbColumn}
      )
      `;
    return new CityDatasetFile({
      ...params,
      sql,
      csvFile,
    });
  }
}
