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

import { getMetadata } from '@domain/metadata/get-metadata';
import { DBFormatCheckResult } from '@domain/db-format-check-result';
import { Database } from 'better-sqlite3';
import { getPackageInfo } from './get-package-info';

/**
 * バージョンチェックを行います。
 * @param db アドレスデータDB
 * @param ckanId CKAN ID
 * @returns チェック結果
 */
export const dbFormatCheck = async (
  db: Database,
  ckanId: string
): Promise<DBFormatCheckResult> => {
  let formatVersion: string | undefined;
  try {
    formatVersion = getMetadata({
      db,
      ckanId,
    })?.formatVersion;
  } catch (error) {
    return DBFormatCheckResult.MISMATCHED;
  }

  if (!formatVersion) {
    return DBFormatCheckResult.UNDEFINED;
  }

  const currentVersion: string = (await getPackageInfo()).version;

  if (formatVersion === currentVersion) {
    return DBFormatCheckResult.MATCHED;
  }

  return DBFormatCheckResult.MISMATCHED;
};
