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
import { CliDefaultValues } from '@settings/cli-default-values';
import { Database } from 'better-sqlite3';

/**
 * 全国地方公共団体コードの一覧を取得します。
 * @param param.db 取得対象DB情報
 * @param param.prefCode 都道府県コード
 * @returns 全国地方公共団体コード一覧
 */
export const getLgCodesFromDB = async ({
  db,
  prefCode = CliDefaultValues.PREF_CODE,
}: {
  /** アドレスデータDB */
  db: Database;
  /** 都道府県コード */
  prefCode?: string;
}): Promise<string[]> => {
  let result: { lg_code: string }[] | undefined = undefined;
  if (prefCode === CliDefaultValues.PREF_CODE) {
    result = db
      .prepare(
        `select ${DataField.LG_CODE.dbColumn} from city order by ${DataField.LG_CODE.dbColumn} asc`
      )
      .all() as { lg_code: string }[] | undefined;
  } else {
    const zeroFillPrefCode = ('0' + prefCode).slice(-2);
    result = db
      .prepare(
        `select ${DataField.LG_CODE.dbColumn} from city
         where substr(${DataField.LG_CODE.dbColumn}, 1, 2) = '${zeroFillPrefCode}'
         order by ${DataField.LG_CODE.dbColumn} asc`
      )
      .all() as { lg_code: string }[] | undefined;
  }

  if (!result) {
    return [];
  }

  return result.map(element => {
    return element.lg_code;
  });
};
