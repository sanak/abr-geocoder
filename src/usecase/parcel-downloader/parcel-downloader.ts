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
import { AbrgError, AbrgErrorLevel } from '@domain/abrg-error/abrg-error';
import { AbrgMessage } from '@domain/abrg-message/abrg-message';
import { CKANPackageShow } from '@domain/ckan-package-show';
import { CKANResponse } from '@domain/ckan-response';
import { getRequest } from '@domain/http/get-request';
import { headRequest } from '@domain/http/head-request';
import { verifyPartialDownloadedFile } from '@usecase/ckan-downloader/verify-partial-downloaded-file';
import EventEmitter from 'events';
import { StatusCodes } from 'http-status-codes';
import { Writable } from 'stream';
import { Client, Dispatcher, errors } from 'undici';
import fs from 'node:fs';
import { DownloadParcelInfo } from '@controller/download/process/download-parcel-info';
import { Database } from 'better-sqlite3';
import { getDatasetMetadata } from '@domain/dataset-metadata/get-dataset-metadata';
import { DatasetMetadata } from '@domain/dataset-metadata/dataset-metadata';
import { saveDatasetMetadata } from '@domain/dataset-metadata/save-dataset-metadata';

/**
 * 地番ダウンローダーパラメータインターフェース
 */
export interface ParcelDownloaderParams {
  /** ユーザーエージェント */
  userAgent: string;
  /** 地番ダウンロード情報 */
  downloadParcelInfo: DownloadParcelInfo;
  /** 全国地方公共団体コード */
  lgCode: string;
  /** アドレスデータDB */
  db: Database;
}

/**
 * 地番情報ダウンロードイベントの列挙を表現します。
 */
export enum ParcelDownloaderEvent {
  /** 開始 */
  START = 'start',
  /** データ */
  DATA = 'data',
  /** 終了 */
  END = 'end',
}

/**
 * 地番ダウンローダー
 */
export class ParcelDownloder extends EventEmitter {
  /** ユーザーエージェント */
  private readonly userAgent: string;
  /** 地番ダウンロード情報 */
  private readonly downloadParcelInfo: DownloadParcelInfo;
  /** 全国地方公共団体コード */
  private readonly lgCode: string;
  /** アドレスデータDB */
  private readonly db: Database;

  /**
   * {@link ParcelDownloder}のインスタンスを生成します。
   * @param userAgent ユーザーエージェント
   * @param downloadParcelInfo 地番ダウンロード情報
   * @param lgCode 全国地方公共団体コード
   * @param db アドレスデータDB
   */
  constructor({
    userAgent,
    downloadParcelInfo,
    lgCode,
    db,
  }: ParcelDownloaderParams) {
    super();
    this.userAgent = userAgent;
    this.downloadParcelInfo = downloadParcelInfo;
    this.lgCode = lgCode;
    this.db = db;
  }

  /**
   * 地番マスター・地番マスター位置参照拡張のデータをダウンロードします。
   *
   * ※後続処理で実行されるHTTPリクエストで'UND_ERR_CONNECT_TIMEOUT'を発生させないため逐次実行となっている。
   * @returns 地番ダウンロード情報
   */
  public async downloadParcelAndPos(): Promise<DownloadParcelInfo> {
    // 地番マスターのダウンロード
    await this.download({
      downloadUrl: this.downloadParcelInfo.parcelDatasetUrl,
      downloadFilePath: this.downloadParcelInfo.parcelFilePath,
      dataset_id: this.downloadParcelInfo.parcelId,
    });
    // 地番マスター位置参照拡張ダウンロード
    await this.download({
      downloadUrl: this.downloadParcelInfo.parcelPosDatasetUrl,
      downloadFilePath: this.downloadParcelInfo.parcelPosFilePath,
      dataset_id: this.downloadParcelInfo.parcelPosId,
    });

    return this.downloadParcelInfo;
  }

  /**
   * 地番マスター・地番マスター位置参照拡張のデータの更新を確認します。
   * @returns 更新有無
   */
  public async updateCheckParcelAndPos(): Promise<boolean> {
    return (
      (await this.updateCheck({
        dataset_id: this.downloadParcelInfo.parcelId,
        datasetUrl: this.downloadParcelInfo.parcelDatasetUrl,
      })) ||
      (await this.updateCheck({
        dataset_id: this.downloadParcelInfo.parcelPosId,
        datasetUrl: this.downloadParcelInfo.parcelPosDatasetUrl,
      }))
    );
  }

  /**
   * 地番メタデータを取得します。
   * @param param.targetUrl メタデータ取得対象URL
   * @param param.dataset_id データセット管理ID
   * @returns 地番メタデータ
   */
  private async getParcelMetadata({
    targetUrl,
    dataset_id,
  }: {
    /** メタデータ取得対象URL */
    targetUrl: string;
    /** データセット管理ID */
    dataset_id: string;
  }): Promise<DatasetMetadata | undefined> {
    const abrResponse = await getRequest({
      url: targetUrl,
      userAgent: this.userAgent,
    });

    if (abrResponse.statusCode !== StatusCodes.OK) {
      return undefined;
    }

    const metaWrapper =
      (await abrResponse.body.json()) as CKANResponse<CKANPackageShow>;
    if (metaWrapper.success === false) {
      return undefined;
    }

    const csvResource = metaWrapper.result.resources.find(x =>
      x.format.toLowerCase().startsWith('csv')
    );

    if (!csvResource) {
      return undefined;
    }

    const currentDatasetMetadata = await getDatasetMetadata({
      db: this.db,
      dataset_id: dataset_id,
    });
    let csvResponse: Dispatcher.ResponseData | undefined = undefined;
    try {
      csvResponse = await headRequest({
        url: csvResource.url,
        userAgent: this.userAgent,
        headers: {
          'If-None-Match': currentDatasetMetadata?.etag,
        },
      });
    } catch (error: unknown) {
      // アクセス過多によるタイムアウトエラー回避のため、最大3回リトライを行う。
      if (error instanceof errors.ConnectTimeoutError) {
        let tryCount = 0;
        while (tryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒待つ
          try {
            csvResponse = await headRequest({
              url: csvResource.url,
              userAgent: this.userAgent,
              headers: {
                'If-None-Match': currentDatasetMetadata?.etag,
              },
            });
            break;
          } catch (error: unknown) {
            if (error instanceof errors.ConnectTimeoutError) {
              tryCount++;
            } else {
              throw new AbrgError({
                messageId: AbrgMessage.DATA_DOWNLOAD_ERROR,
                level: AbrgErrorLevel.ERROR,
              });
            }
          }
        }
      } else {
        throw new AbrgError({
          messageId: AbrgMessage.DATA_DOWNLOAD_ERROR,
          level: AbrgErrorLevel.ERROR,
        });
      }
    }

    if (!csvResponse) {
      return undefined;
    }

    switch (csvResponse.statusCode) {
      case StatusCodes.OK: {
        const newDatasetMetadata = new DatasetMetadata({
          dataset_id: dataset_id,
          contentLength: parseInt(
            csvResponse.headers['content-length'] as string
          ),
          etag: csvResponse.headers['etag'] as string,
          fileUrl: csvResource.url,
          lastModified: csvResponse.headers['last-modified'] as string,
        });
        return newDatasetMetadata;
      }

      case StatusCodes.NOT_MODIFIED:
        return currentDatasetMetadata;

      default:
        return undefined;
    }
  }

  /**
   * 空のデータセットメタデータを保存します。
   * @param param.dataset_id データセット管理ID
   */
  private async saveEmptyDatasetMetadata({
    dataset_id,
  }: {
    /** データセット管理ID */
    dataset_id: string;
  }): Promise<void> {
    await saveDatasetMetadata({
      db: this.db,
      datasetMetadata: new DatasetMetadata({
        dataset_id,
        contentLength: 0,
        etag: '',
        fileUrl: '',
        lastModified: '',
      }),
    });
  }

  /**
   * ダウンロードを実施します。
   * @param param.downloadUrl ダウンロードURL
   * @param param.downloadFilePath ダウンロード先ファイルパス
   * @param param.dataset_id データセット管理ID
   */
  private async download({
    downloadUrl,
    downloadFilePath,
    dataset_id,
  }: {
    downloadUrl: string;
    downloadFilePath: string;
    dataset_id: string;
  }): Promise<void> {
    const metadata = await this.getParcelMetadata({
      targetUrl: downloadUrl,
      dataset_id,
    });
    if (!metadata) {
      await this.saveEmptyDatasetMetadata({ dataset_id });
      return;
    }
    if (
      metadata.equal(
        await getDatasetMetadata({
          db: this.db,
          dataset_id,
        })
      )
    ) {
      return;
    }
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
      await fd.close();
      client.close();
      return;
    }

    const downloaderEmit = (eventName: string, ...args: unknown[]) => {
      this.emit(eventName, ...args);
    };

    let fsPointer = startAt;
    const fsWritable = new Writable({
      write(chunk: Buffer, encoding, callback) {
        fd.write(chunk, 0, chunk.byteLength, fsPointer);
        fsPointer += chunk.byteLength;
        downloaderEmit(ParcelDownloaderEvent.DATA, chunk.byteLength);
        callback();
      },
    });

    const abortController = new AbortController();
    let tryCount = 0;
    // アクセス過多によるタイムアウトエラー回避のため、最大3回リトライを行う。
    while (tryCount < 4) {
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
          ({ statusCode }) => {
            switch (statusCode) {
              case StatusCodes.OK: {
                fsPointer = 0;
                downloaderEmit(ParcelDownloaderEvent.START, {
                  position: 0,
                  length: metadata.contentLength,
                });
                break;
              }

              case StatusCodes.PARTIAL_CONTENT: {
                fsPointer = startAt;
                downloaderEmit(ParcelDownloaderEvent.START, {
                  position: startAt,
                  length: metadata.contentLength,
                });
                break;
              }

              case StatusCodes.NOT_MODIFIED: {
                fsPointer = metadata.contentLength;
                downloaderEmit(ParcelDownloaderEvent.START, {
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
        break;
      } catch (err) {
        if (err instanceof errors.ConnectTimeoutError && tryCount < 3) {
          tryCount++;
        } else {
          fd.close();
          client.close();
          this.emit(ParcelDownloaderEvent.END);
          if (err instanceof Error && err.name === 'AbortError') {
            return;
          } else {
            throw new AbrgError({
              messageId: AbrgMessage.DATA_DOWNLOAD_ERROR,
              level: AbrgErrorLevel.ERROR,
            });
          }
        }
      }
    }

    try {
      await saveDatasetMetadata({
        db: this.db,
        datasetMetadata: metadata,
      });
    } finally {
      fd.close();
      client.close();
      this.emit(ParcelDownloaderEvent.END);
    }
  }

  /**
   * 指定されたデータセットの更新を確認します。
   * @param param.dataset_id データセット管理ID
   * @param param.datasetUrl データセットURL
   * @returns 更新有無
   */
  private async updateCheck({
    dataset_id,
    datasetUrl,
  }: {
    /** データセット管理ID */
    dataset_id: string;
    /** データセットURL */
    datasetUrl: string;
  }): Promise<boolean> {
    const currentDatasetMatadata = await getDatasetMetadata({
      db: this.db,
      dataset_id,
    });

    if (!currentDatasetMatadata) {
      return true;
    }

    const newDatasetMetadata = await this.getParcelMetadata({
      targetUrl: datasetUrl,
      dataset_id,
    });

    if (!newDatasetMetadata && currentDatasetMatadata.isUndifined()) {
      return false;
    }

    return !currentDatasetMatadata.equal(newDatasetMetadata);
  }
}
