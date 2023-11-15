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
import { AbrgError, AbrgErrorLevel } from '@abrg-error/abrg-error';
import { AbrgMessage } from '@abrg-message/abrg-message';
import { CKANPackageShow } from '@domain/ckan-package-show';
import { CKANResponse } from '@domain/ckan-response';
import { DatasetMetadata } from '@domain/dataset-metadata';
import { getRequest } from '@domain/http/get-request';
import { headRequest } from '@domain/http/head-request';
import { getValueWithKey } from '@domain/key-store/get-value-with-key';
import { saveKeyAndValue } from '@domain/key-store/save-key-and-value';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import EventEmitter from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import { Client } from 'undici';
import { verifyPartialDownloadedFile } from './verify-partial-downloaded-file';

export interface CkanDownloaderParams {
  userAgent: string;
  datasetUrl: string;
  ds: DataSource;
  ckanId: string;
  dstDir: string;
}

export enum CkanDownloaderEvent {
  START = 'start',
  DATA = 'data',
  END = 'end',
}

export class CkanDownloader extends EventEmitter {
  private readonly userAgent: string;
  private readonly datasetUrl: string;
  private readonly ds: DataSource;
  private readonly ckanId: string;
  private readonly dstDir: string;
  private cacheMetadata: DatasetMetadata | null = null;

  constructor({
    userAgent,
    datasetUrl,
    ds,
    ckanId,
    dstDir,
  }: CkanDownloaderParams) {
    super();
    this.userAgent = userAgent;
    this.datasetUrl = datasetUrl;
    this.ds = ds;
    this.ckanId = ckanId;
    this.dstDir = dstDir;
  }

  async getDatasetMetadata(): Promise<DatasetMetadata> {
    if (this.cacheMetadata) {
      return this.cacheMetadata;
    }

    // ABRのデータセットから情報を取得
    const abrResponse = await getRequest({
      url: this.datasetUrl,
      userAgent: this.userAgent,
    });

    if (abrResponse.statusCode !== StatusCodes.OK) {
      throw new AbrgError({
        messageId: AbrgMessage.DATA_DOWNLOAD_ERROR,
        level: AbrgErrorLevel.ERROR,
      });
    }

    // APIレスポンスのパース
    const metaWrapper =
      (await abrResponse.body.json()) as CKANResponse<CKANPackageShow>;
    if (metaWrapper.success === false) {
      throw new AbrgError({
        messageId: AbrgMessage.CANNOT_FIND_THE_SPECIFIED_RESOURCE,
        level: AbrgErrorLevel.ERROR,
      });
    }

    // CSVファイルのURLを特定
    const meta = metaWrapper.result;
    const csvResource = meta.resources.find(x =>
      x.format.toLowerCase().startsWith('csv')
    );

    if (!csvResource) {
      throw new AbrgError({
        messageId:
          AbrgMessage.DOWNLOADED_DATA_DOES_NOT_CONTAIN_THE_RESOURCE_CSV,
        level: AbrgErrorLevel.ERROR,
      });
    }

    const csvMeta = await (async () => {
      const csvMetaStr = await getValueWithKey({
        ds: this.ds,
        key: this.ckanId,
      });
      if (!csvMetaStr) {
        return null;
      }
      return DatasetMetadata.from(csvMetaStr);
    })();

    // APIレスポンスには etag や ファイルサイズが含まれていないので、
    // csvファイルに対して HEADリクエストを送る
    const csvResponse = await headRequest({
      url: csvResource.url,
      userAgent: this.userAgent,
      headers: {
        'If-None-Match': csvMeta?.etag,
      },
    });

    switch (csvResponse.statusCode) {
      case StatusCodes.OK: {
        const newCsvMeta = new DatasetMetadata({
          contentLength: parseInt(
            csvResponse.headers['content-length'] as string
          ),
          etag: csvResponse.headers['etag'] as string,
          fileUrl: csvResource.url,
          lastModified: csvResponse.headers['last-modified'] as string,
        });
        this.cacheMetadata = newCsvMeta;
        return newCsvMeta;
      }

      case StatusCodes.NOT_MODIFIED:
        this.cacheMetadata = csvMeta;
        return csvMeta!;

      default:
        throw new AbrgError({
          messageId:
            AbrgMessage.DOWNLOADED_DATA_DOES_NOT_CONTAIN_THE_RESOURCE_CSV,
          level: AbrgErrorLevel.ERROR,
        });
    }
  }

  async updateCheck(): Promise<boolean> {
    const csvMetaStr = await getValueWithKey({
      ds: this.ds,
      key: this.ckanId,
    });
    if (!csvMetaStr) {
      return true;
    }
    const localCsvMeta = DatasetMetadata.from(csvMetaStr);

    const apiCsvMeta = await this.getDatasetMetadata();

    return !localCsvMeta.equal(apiCsvMeta);
  }

  private getDownloadFilePath(): string {
    return path.join(this.dstDir, `${this.ckanId}.zip`);
  }

  /**
   *
   * @param param download parameters
   * @returns The file hash of downloaded file.
   */
  async download(): Promise<string | null> {
    const downloadFilePath = this.getDownloadFilePath();
    const metadata = await this.getDatasetMetadata();
    const requestUrl = new URL(metadata.fileUrl);
    const client = new Client(requestUrl.origin);
    const [startAt, fd] = await (async (dst: string) => {
      if (!metadata || !metadata.etag || !fs.existsSync(dst)) {
        return [0, await fs.promises.open(downloadFilePath, 'w')];
      }
      const isValid = await verifyPartialDownloadedFile({
        userAgent: this.userAgent,
        targetFile: downloadFilePath,
        metadata,
      });
      if (!isValid) {
        return [0, await fs.promises.open(downloadFilePath, 'w')];
      }

      const stat = fs.statSync(dst);
      return [stat.size, await fs.promises.open(downloadFilePath, 'a+')];
    })(downloadFilePath);

    if (startAt === metadata?.contentLength) {
      client.close();
      return downloadFilePath;
    }

    const downloaderEmit = (eventName: string, ...args: unknown[]) => {
      this.emit(eventName, ...args);
    };

    let fsPointer = startAt;
    const fsWritable = new Writable({
      write(chunk: Buffer, encoding, callback) {
        fd.write(chunk, 0, chunk.byteLength, fsPointer);
        fsPointer += chunk.byteLength;
        downloaderEmit(CkanDownloaderEvent.DATA, chunk.byteLength);
        callback();
      },
    });

    const abortController = new AbortController();
    try {
      await client.stream(
        {
          path: requestUrl.pathname,
          method: 'GET',
          headers: {
            'user-agent': this.userAgent,
            'If-Range': metadata.etag,
            Range: `bytes=${startAt}-`,
          },
          signal: abortController.signal,
        },
        ({ statusCode, headers }) => {
          switch (statusCode) {
            case StatusCodes.OK: {
              fsPointer = 0;
              const newCsvMeta = new DatasetMetadata({
                fileUrl: metadata.fileUrl,
                etag: headers['etag'] as string,
                contentLength: parseInt(headers['content-length'] as string),
                lastModified: headers['last-modified'] as string,
              });
              saveKeyAndValue({
                ds: this.ds,
                key: this.ckanId,
                value: newCsvMeta.toString(),
              });

              downloaderEmit(CkanDownloaderEvent.START, {
                position: 0,
                length: metadata.contentLength,
              });
              break;
            }

            case StatusCodes.PARTIAL_CONTENT: {
              fsPointer = startAt;
              const contentLength = parseInt(
                (headers['content-range'] as string).split('/')[1]
              );

              const newCsvMeta = new DatasetMetadata({
                fileUrl: metadata.fileUrl,
                etag: headers['etag'] as string,
                contentLength,
                lastModified: headers['last-modified'] as string,
              });

              saveKeyAndValue({
                ds: this.ds,
                key: this.ckanId,
                value: newCsvMeta.toString(),
              });

              downloaderEmit(CkanDownloaderEvent.START, {
                position: startAt,
                length: metadata.contentLength,
              });
              break;
            }

            case StatusCodes.NOT_MODIFIED: {
              fsPointer = metadata.contentLength;

              downloaderEmit(CkanDownloaderEvent.START, {
                position: metadata.contentLength,
                length: metadata.contentLength,
              });
              abortController.abort(statusCode);
              break;
            }

            default: {
              throw new AbrgError({
                messageId: AbrgMessage.DOWNLOAD_ERROR,
                level: AbrgErrorLevel.ERROR,
              });
            }
          }

          return fsWritable;
        }
      );
      return downloadFilePath;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return downloadFilePath;
      }
      throw err;
    } finally {
      fd.close();
      client.close();
      this.emit(CkanDownloaderEvent.END);
    }
  }
}
