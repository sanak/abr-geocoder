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
import { IStreamReady } from '@domain/istream-ready';
import { DataField } from './data-field';
import { DataWithDateFile } from './dataset-file';
import { Town } from '@entity/town';

export class TownDatasetFile
  extends DataWithDateFile
  implements IDatasetFileMeta
{
  get fields(): DataField[] {
    return [
      DataField.LG_CODE,
      DataField.TOWN_ID,
      DataField.TOWN_CODE,
      DataField.PREF_NAME,
      DataField.PREF_NAME_KANA,
      DataField.PREF_NAME_ROMA,
      DataField.COUNTY_NAME,
      DataField.COUNTY_NAME_KANA,
      DataField.COUNTY_NAME_ROMA,
      DataField.CITY_NAME,
      DataField.CITY_NAME_KANA,
      DataField.CITY_NAME_ROMA,
      DataField.OD_CITY_NAME,
      DataField.OD_CITY_NAME_KANA,
      DataField.OD_CITY_NAME_ROMA,
      DataField.OAZA_TOWN_NAME,
      DataField.OAZA_TOWN_NAME_KANA,
      DataField.OAZA_TOWN_NAME_ROMA,
      DataField.CHOME_NAME,
      DataField.CHOME_NAME_KANA,
      DataField.CHOME_NAME_NUMBER,
      DataField.KOAZA_NAME,
      DataField.KOAZA_NAME_KANA,
      DataField.KOAZA_NAME_ROMA,
      DataField.RSDT_ADDR_FLG,
      DataField.RSDT_ADDR_MTD_CODE,
      DataField.OAZA_TOWN_ALT_NAME_FLG,
      DataField.KOAZA_FRN_LTRS_FLG,
      DataField.OAZA_FRN_LTRS_FLG,
      DataField.KOAZA_FRN_LTRS_FLG,
      DataField.STATUS_FLG,
      DataField.WAKE_NUM_FLG,
      DataField.EFCT_DATE,
      DataField.ABLT_DATE,
      DataField.SRC_CODE,
      DataField.POST_CODE,
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
  ): TownDatasetFile {
    const sql = `INSERT OR REPLACE INTO "town"
      (
        ${DataField.LG_CODE.dbColumn},
        ${DataField.TOWN_ID.dbColumn},
        ${DataField.TOWN_CODE.dbColumn},
        ${DataField.PREF_NAME.dbColumn},
        ${DataField.PREF_NAME_KANA.dbColumn},
        ${DataField.PREF_NAME_ROMA.dbColumn},
        ${DataField.COUNTY_NAME.dbColumn},
        ${DataField.COUNTY_NAME_KANA.dbColumn},
        ${DataField.COUNTY_NAME_ROMA.dbColumn},
        ${DataField.CITY_NAME.dbColumn},
        ${DataField.CITY_NAME_KANA.dbColumn},
        ${DataField.CITY_NAME_ROMA.dbColumn},
        ${DataField.OD_CITY_NAME.dbColumn},
        ${DataField.OD_CITY_NAME_KANA.dbColumn},
        ${DataField.OD_CITY_NAME_ROMA.dbColumn},
        ${DataField.OAZA_TOWN_NAME.dbColumn},
        ${DataField.OAZA_TOWN_NAME_KANA.dbColumn},
        ${DataField.OAZA_TOWN_NAME_ROMA.dbColumn},
        ${DataField.CHOME_NAME.dbColumn},
        ${DataField.CHOME_NAME_KANA.dbColumn},
        ${DataField.CHOME_NAME_NUMBER.dbColumn},
        ${DataField.KOAZA_NAME.dbColumn},
        ${DataField.KOAZA_NAME_KANA.dbColumn},
        ${DataField.KOAZA_NAME_ROMA.dbColumn},
        ${DataField.RSDT_ADDR_FLG.dbColumn},
        ${DataField.RSDT_ADDR_MTD_CODE.dbColumn},
        ${DataField.OAZA_TOWN_ALT_NAME_FLG.dbColumn},
        ${DataField.KOAZA_FRN_LTRS_FLG.dbColumn},
        ${DataField.OAZA_FRN_LTRS_FLG.dbColumn},
        ${DataField.KOAZA_FRN_LTRS_FLG.dbColumn},
        ${DataField.STATUS_FLG.dbColumn},
        ${DataField.WAKE_NUM_FLG.dbColumn},
        ${DataField.EFCT_DATE.dbColumn},
        ${DataField.ABLT_DATE.dbColumn},
        ${DataField.SRC_CODE.dbColumn},
        ${DataField.POST_CODE.dbColumn},
        ${DataField.REMARKS.dbColumn}
      )
      VALUES
      (
        @${DataField.LG_CODE.dbColumn},
        @${DataField.TOWN_ID.dbColumn},
        @${DataField.TOWN_CODE.dbColumn},
        @${DataField.PREF_NAME.dbColumn},
        @${DataField.PREF_NAME_KANA.dbColumn},
        @${DataField.PREF_NAME_ROMA.dbColumn},
        @${DataField.COUNTY_NAME.dbColumn},
        @${DataField.COUNTY_NAME_KANA.dbColumn},
        @${DataField.COUNTY_NAME_ROMA.dbColumn},
        @${DataField.CITY_NAME.dbColumn},
        @${DataField.CITY_NAME_KANA.dbColumn},
        @${DataField.CITY_NAME_ROMA.dbColumn},
        @${DataField.OD_CITY_NAME.dbColumn},
        @${DataField.OD_CITY_NAME_KANA.dbColumn},
        @${DataField.OD_CITY_NAME_ROMA.dbColumn},
        @${DataField.OAZA_TOWN_NAME.dbColumn},
        @${DataField.OAZA_TOWN_NAME_KANA.dbColumn},
        @${DataField.OAZA_TOWN_NAME_ROMA.dbColumn},
        @${DataField.CHOME_NAME.dbColumn},
        @${DataField.CHOME_NAME_KANA.dbColumn},
        @${DataField.CHOME_NAME_NUMBER.dbColumn},
        @${DataField.KOAZA_NAME.dbColumn},
        @${DataField.KOAZA_NAME_KANA.dbColumn},
        @${DataField.KOAZA_NAME_ROMA.dbColumn},
        @${DataField.RSDT_ADDR_FLG.dbColumn},
        @${DataField.RSDT_ADDR_MTD_CODE.dbColumn},
        @${DataField.OAZA_TOWN_ALT_NAME_FLG.dbColumn},
        @${DataField.KOAZA_FRN_LTRS_FLG.dbColumn},
        @${DataField.OAZA_FRN_LTRS_FLG.dbColumn},
        @${DataField.KOAZA_FRN_LTRS_FLG.dbColumn},
        @${DataField.STATUS_FLG.dbColumn},
        @${DataField.WAKE_NUM_FLG.dbColumn},
        @${DataField.EFCT_DATE.dbColumn},
        @${DataField.ABLT_DATE.dbColumn},
        @${DataField.SRC_CODE.dbColumn},
        @${DataField.POST_CODE.dbColumn},
        @${DataField.REMARKS.dbColumn}
      )
      `;
    return new TownDatasetFile({
      ...params,
      sql,
      csvFile,
      entityClass: Town,
    });
  }
}
