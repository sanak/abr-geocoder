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
import { Metadata } from '@domain/metadata/metadata';
import { Database } from 'better-sqlite3';

/**
 * メタデータ情報を保存します。
 * @param param.db アドレスDB
 * @param param.metadata メタデータ
 */
export const saveMetadata = ({
  db,
  metadata,
}: {
  /** アドレスDB */
  db: Database;
  /** メタデータ */
  metadata: Metadata;
}) => {
  db.prepare(
    `insert or replace into metadata (
      ckan_id, format_version, last_modified, content_length, etag, file_url
    ) values (
      @ckanId, @formatVersion, @lastModified, @contentLength, @etag, @fileUrl
    )`
  ).run({
    ckanId: metadata.ckanId,
    formatVersion: metadata.formatVersion,
    lastModified: metadata.lastModified,
    contentLength: metadata.contentLength,
    etag: metadata.etag,
    fileUrl: metadata.fileUrl,
  });
};
