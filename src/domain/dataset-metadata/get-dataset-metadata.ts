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
import { DatasetMetadata } from '@domain/dataset-metadata/dataset-metadata';
import { DataField } from '@domain/dataset/data-field';
import { Database } from 'better-sqlite3';

/**
 * メタデータを取得します。
 * @param param.db アドレスデータDB
 * @param param.dataset_id データセット管理ID
 * @returns メタデータ情報
 */
export const getDatasetMetadata = async ({
  db,
  dataset_id: dataset_id,
}: {
  /** アドレスDB */
  db: Database;
  /** データセット管理ID */
  dataset_id: string;
}): Promise<DatasetMetadata | undefined> => {
  const result = db
    .prepare(
      `select * from dataset_metadata where ${DataField.DATASET_ID.dbColumn} = @dataset_id limit 1`
    )
    .get({
      /** データセット管理ID  */
      dataset_id: dataset_id,
    }) as
    | {
        /** データセット管理ID */
        dataset_id: string;
        /** 最終更新日時 */
        last_modified: string;
        /** データサイズ */
        content_length: number;
        /** エンティティタグ */
        etag: string;
        /** ファイルURL */
        file_url: string;
      }
    | undefined;
  if (!result) {
    return;
  }

  return new DatasetMetadata({
    dataset_id: result.dataset_id,
    lastModified: result.last_modified,
    contentLength: result.content_length,
    etag: result.etag,
    fileUrl: result.file_url,
  });
};
