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
 * データセットメタデータ情報を保存します。
 * @param param0 メタデータ保存処理情報
 */
export const saveDatasetMetadata = async ({
  db,
  datasetMetadata,
}: {
  /** アドレスDB */
  db: Database;
  /** データセットメタデータ情報 */
  datasetMetadata: DatasetMetadata;
}) => {
  db.prepare(
    `insert or replace into dataset_metadata (
      ${DataField.DATASET_ID.dbColumn},
      ${DataField.LAST_MODIFY.dbColumn},
      ${DataField.CONTENT_LENGTH.dbColumn},
      ${DataField.ETAG.dbColumn},
      ${DataField.FILE_URL.dbColumn}
    ) values (
      @dataset_id,
      @lastModified,
      @contentLength,
      @etag,
      @fileUrl
    )`
  ).run({
    dataset_id: datasetMetadata.dataset_id,
    lastModified: datasetMetadata.lastModified,
    contentLength: datasetMetadata.contentLength,
    etag: datasetMetadata.etag,
    fileUrl: datasetMetadata.fileUrl,
  });
};
