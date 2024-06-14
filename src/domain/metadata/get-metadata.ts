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
 * メタデータを取得します。
 * @param param0 メタデータ取得情報
 * @returns メタデータ情報
 */
export const getMetadata = ({
  db,
  ckanId,
}: {
  db: Database;
  ckanId: string;
}): Metadata | undefined => {
  const result = db
    .prepare('select * from metadata where ckan_id = @ckanId limit 1')
    .get({
      ckanId,
    }) as
    | {
        ckan_id: string;
        format_version: string;
        last_modified: string;
        content_length: number;
        etag: string;
        file_url: string;
      }
    | undefined;
  if (!result) {
    return;
  }
  return new Metadata({
    ckanId: result.ckan_id,
    formatVersion: result.format_version,
    lastModified: result.last_modified,
    contentLength: result.content_length,
    etag: result.etag,
    fileUrl: result.file_url,
  });
};
