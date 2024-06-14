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

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ParcelDownloder } from '@usecase/parcel-downloader/parcel-downloader';
import { DownloadParcelInfo } from '@controller/download/process/download-parcel-info';
import { getRequest } from '@domain/http/get-request';
import { headRequest } from '@domain/http/head-request';
import fs from 'node:fs'
import { verifyPartialDownloadedFile } from '@usecase/ckan-downloader/verify-partial-downloaded-file';
import { Client, errors } from 'undici';
import { default as Database } from 'better-sqlite3';
import { getDatasetMetadata } from '@domain/dataset-metadata/get-dataset-metadata';
import { saveDatasetMetadata } from '@domain/dataset-metadata/save-dataset-metadata';
import { DatasetMetadata } from '@domain/dataset-metadata/dataset-metadata';

jest.mock('@controller/download/process/download-parcel-info')
jest.mock('@domain/http/get-request');
jest.mock('@domain/http/head-request');
jest.mock('node:fs');
jest.mock('@usecase/ckan-downloader/verify-partial-downloaded-file');
jest.mock<Client>('undici');
jest.mock('@domain/dataset-metadata/get-dataset-metadata')
jest.mock('@domain/dataset-metadata/save-dataset-metadata')

const MockedDB = Database as unknown as jest.Mock;

describe('ParcelDownloaderTest', () => {
  let parcelDownloader: ParcelDownloder;

  beforeEach(() => {
    parcelDownloader = new ParcelDownloder({
      userAgent: 'curl/7.81.0',
      downloadParcelInfo: new DownloadParcelInfo({
        lgCode: '011002',
        downloadDir: 'downloadDir',
        datasetPackageShowUrl: 'https://dataset/package_show?='
      }),
      lgCode: '011002',
      db: new Database('dummy'), // mock this according to your Database implementation
    })
  })

  it('地番メタデータが正常に取得できることを確認(地番メタデータが更新されていた場合)', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    (getRequest as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: [{
                description: 'ccc',
                last_modified: '2023-12-26',
                id: 'aaa',
                url: 'https://aaa.com',
                format: 'csv'
              }]
            },
          }
        }
      }
    }));
    (getDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({
      dataset_id: 'ba-o1-011002_g2-000010',
      lastModified: '2023-12-26',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com',
    }));
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 200,
      headers: {
        'content-length': '2047',
        etag: 'aaa',
        'last-modified': '2024-01-24',
      }
    }));

    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({targetUrl: mockTargetUrl, dataset_id: mockId});
    // 結果
    expect(actual?.contentLength).toBe(2047);
    expect(actual?.etag).toBe("aaa");
    expect(actual?.fileUrl).toBe("https://aaa.com");
    expect(actual?.lastModified).toBe("2024-01-24");
    expect(actual?.dataset_id).toBe(mockId);
  });

  it('地番メタデータが正常に取得できることを確認(地番メタデータが更新されていない場合)', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    (getRequest as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: [{
                description: 'ccc',
                last_modified: '2023-12-26',
                id: 'aaa',
                url: 'https://aaa.com',
                format: 'csv'
              }]
            },
          }
        }
      }
    }));
    (getDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({
      dataset_id: 'ba-o1-011002_g2-000010',
      lastModified: '2023-12-27',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com',
    }));
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 304,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({targetUrl: mockTargetUrl, dataset_id: mockId});
    // 結果
    expect(actual?.contentLength).toBe(1024);
    expect(actual?.etag).toBe("aaa");
    expect(actual?.fileUrl).toBe("https://aaa.com");
    expect(actual?.lastModified).toBe("2023-12-27");
    expect(actual?.dataset_id).toBe(mockId);
  });

  it('地番メタデータ取得処理でCKANレスポンスが200/304以外の時undefindが返却されることを確認', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    // モック定義
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 400,
    },
    ));
    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({
      targetUrl: mockTargetUrl,
      dataset_id: mockId
    })
    // 結果
    expect(actual).toBe(undefined)
  });

  it('地番メタデータ取得処理でCKANレスポンスが成功ステータス以外の時undefindが返却されることを確認', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: false,
          }
        }
      }
    },
    ));
    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({targetUrl: mockTargetUrl, dataset_id: mockId})
    // 結果
    expect(actual).toBe(undefined)
  });

  it('地番メタデータ取得処理でCKANレスポンス内にCSVリソースの定義がない時undefinedが返却されることを確認', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: []
            },
          }
        }
      }
    },
    ));
    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({
      targetUrl: mockTargetUrl,
      dataset_id: mockId
    })
    // 結果
    expect(actual).toBe(undefined)
  });

  it('地番メタデータ取得処理のCSVファイル存在確認で200/304以外が返却された時undefinedが返却されることを確認', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    // モック定義
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: [{
                description: 'ccc',
                last_modified: '2023-12-26',
                id: 'aaa',
                url: 'https://aaa.com',
                format: 'csv'
              }]
            },
          }
        }
      }
    },
    ));
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 400,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({
      targetUrl: mockTargetUrl,
      dataset_id: mockId
    })
    // 結果
    expect(actual).toBe(undefined)
  });

  it('地番メタデータ取得処理でHEADリクエストでタイムアウト発生時リトライされることを確認(リトライで成功)', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    // モック定義
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: [{
                description: 'ccc',
                last_modified: '2023-12-26',
                id: 'aaa',
                url: 'https://aaa.com',
                format: 'csv'
              }]
            },
          }
        }
      }
    },
    ));
    (headRequest as jest.Mock).mockImplementationOnce(() => {
      throw new errors.ConnectTimeoutError()
    }).mockImplementationOnce(() => {
      throw new errors.ConnectTimeoutError()
    }).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 304,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({targetUrl: mockTargetUrl, dataset_id: mockId})
    // 結果
    expect(actual?.contentLength).toBe(1024);
    expect(actual?.etag).toBe("aaa");
    expect(actual?.fileUrl).toBe("https://aaa.com");
    expect(actual?.lastModified).toBe("2023-12-27");
    expect(actual?.dataset_id).toBe(mockId);
  }, 20000);

  it('地番メタデータ取得処理でHEADリクエストでタイムアウト発生時リトライされることを確認(リトライしてもタイムアウト)', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    // モック定義
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: [{
                description: 'ccc',
                last_modified: '2023-12-26',
                id: 'aaa',
                url: 'https://aaa.com',
                format: 'csv'
              }]
            },
          }
        }
      }
    },
    ));
    (headRequest as jest.Mock).mockImplementationOnce(() => {
      throw new errors.ConnectTimeoutError()
    }).mockImplementationOnce(() => {
      throw new errors.ConnectTimeoutError()
    }).mockImplementationOnce(() => {
      throw new errors.ConnectTimeoutError()
    }).mockImplementationOnce(() => {
      throw new errors.ConnectTimeoutError()
    });
    // テスト実施
    const actual = await parcelDownloader["getParcelMetadata"]({targetUrl: mockTargetUrl, dataset_id: mockId})
    // 結果
    expect(actual).toBe(undefined)
  }, 20000);

  it('地番メタデータ取得処理でHEADリクエストでタイムアウト発生時リトライされることを確認(初回時ConnectTimeoutError以外が発生)', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    // モック定義
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: [{
                description: 'ccc',
                last_modified: '2023-12-26',
                id: 'aaa',
                url: 'https://aaa.com',
                format: 'csv'
              }]
            },
          }
        }
      }
    },
    ));
    (headRequest as jest.Mock).mockImplementationOnce(() => {
      throw new errors.NotSupportedError()
    });

    // テスト実施・結果
    await expect(parcelDownloader["getParcelMetadata"]({targetUrl: mockTargetUrl, dataset_id: mockId})).rejects.toThrowError(new Error("Failed to download the dataset"));
  }, 20000);

  it('地番メタデータ取得処理でHEADリクエストでタイムアウト発生時リトライされることを確認(初回以降にConnectTimeoutError以外が発生)', async () => {
    // モック定義
    const mockTargetUrl = 'https://aaa.com';
    const mockId = 'ba-o1-011002_g2-000010';
    // モック定義
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 200,
      body: {
        json: () => {
          return {
            success: true,
            result: {
              id: 'aaa',
              title: 'bbb',
              resources: [{
                description: 'ccc',
                last_modified: '2023-12-26',
                id: 'aaa',
                url: 'https://aaa.com',
                format: 'csv'
              }]
            },
          }
        }
      }
    },
    ));
    (headRequest as jest.Mock).mockImplementationOnce(() => {
      throw new errors.ConnectTimeoutError()
    }).mockImplementationOnce(() => {
      throw new errors.NotSupportedError()
    });

    // テスト実施・結果
    await expect(parcelDownloader["getParcelMetadata"]({targetUrl: mockTargetUrl, dataset_id: mockId})).rejects.toThrowError(new Error("Failed to download the dataset"));
  }, 20000);

  it('地番マスター・地番マスター位置参照拡張のデータダウンロードが正常に実施できることを確認', async () => {
    // モック定義
    const mockDownload = jest.spyOn(ParcelDownloder.prototype as any, 'download').mockImplementation((_: any, __: any) => { })
    // テスト実施
    const actual = await parcelDownloader.downloadParcelAndPos();
    // 結果
    expect(actual).toBe(parcelDownloader['downloadParcelInfo']);
    // モック初期化
    mockDownload.mockRestore();
  });

  it('空のデータセットメタデータ登録が正常に呼び出されていることを確認', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施
    await parcelDownloader["saveEmptyDatasetMetadata"]({dataset_id: mockId})
    // 結果
    const acutual = mockSaveDatasetMetadata.mock.calls[0][0] as {
      db: any,
      datasetMetadata: DatasetMetadata;
    }
    expect(mockSaveDatasetMetadata.mock.calls.length).toEqual(1);
    expect(acutual.datasetMetadata.dataset_id).toEqual(mockId);
    expect(acutual.datasetMetadata.etag).toEqual('');
    expect(acutual.datasetMetadata.contentLength).toEqual(0);
    expect(acutual.datasetMetadata.lastModified).toEqual('');

    mockSaveDatasetMetadata.mockReset();
  });

  it('ダウンロードが正常に実施できることを確認', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    (Client as unknown as jest.Mock).mockImplementation((_: any) => {
      return {
        close: () => true,
        stream: (_: any, __: any,) => { }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 0 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();
    expect(mockSaveDatasetMetadata.mock.calls.length).toEqual(1);

    mockSaveDatasetMetadata.mockReset();
  });

  it('ダウンロードが正常に実施できることを確認(メタデータがundefined)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(undefined));
    const mockSaveEmptyDatasetMetadata = jest.spyOn(ParcelDownloder.prototype as any, 'saveEmptyDatasetMetadata').mockImplementation((_: any, __: any) => Promise.resolve({}));
    // テスト実施・結果
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();
    expect(mockSaveEmptyDatasetMetadata.mock.calls.length).toEqual(1);

    mockSaveEmptyDatasetMetadata.mockReset();
  });

  it('ダウンロードが正常に実施できることを確認(ダウンロード対象が未更新)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { true }
      }));
    // テスト実施・結果
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();
  });

  it('ダウンロードが正常に実施できることを確認(etagが未定義)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: undefined,
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    (Client as unknown as jest.Mock).mockImplementation((_: any) => {
      return {
        close: () => true,
        stream: (_: any, __: any,) => { }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 0 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施・結果
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();

    mockSaveDatasetMetadata.mockReset();
  });

  it('ダウンロードが正常に実施できることを確認(ダウンロード検証で不正)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    (Client as unknown as jest.Mock).mockImplementation((_: any) => {
      return {
        close: () => true,
        stream: (_: any, __: any,) => { }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(false);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 0 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施・結果
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();

    mockSaveDatasetMetadata.mockReset();
  });

  it('ダウンロードが正常に実施できることを確認(読み込みが中止)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    const err = new Error();
    err.message = 'stream abort';
    err.name = 'AbortError';
    (Client as unknown as jest.Mock).mockImplementation(() => {
      return {
        close: () => false,
        stream: async () => {
          throw err;
        }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(false);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 0 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施・結果
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();

    mockSaveDatasetMetadata.mockReset();
  });

  it('ダウンロードが正常に実施できることを確認(ファイルが既に存在している)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    (Client as unknown as jest.Mock).mockImplementation((_: any) => {
      return {
        close: () => false,
        stream: (_: any, __: any,) => { }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(false);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 1 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施・結果
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();

    mockSaveDatasetMetadata.mockReset();
  });

  it('ダウンロードファイル読み込みが失敗した際にエラーが発生することを確認', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    const otherErr = new Error('stream other err');
    otherErr.name = 'other';
    (Client as unknown as jest.Mock).mockImplementation(() => {
      return {
        close: () => false,
        stream: () => { throw otherErr }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(false);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 1 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施・結果
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .rejects.toThrow(new Error("Failed to download the dataset"));

    mockSaveDatasetMetadata.mockReset();
  });

  it('データセットで更新があった場合Trueが返却されることを確認', async () => {
    // モック定義
    (getDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({
      equal: (_: any) => {
        return (
          'ba-o1-011002_g2-000010' === _.dataset_id &&
          '2023-12-26' === _.lastModified &&
          1024 === _.contentLength &&
          'aaa' === _.etag &&
          'https://aaa.com' === _.fileUrl
        );
      }
    }));
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: 'ba-o1-011002_g2-000010',
        lastModified: '2024-01-24',
        contentLength: 2048,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
      }));
    // テスト実施
    const actual = await parcelDownloader['updateCheck']({dataset_id: 'id', datasetUrl: 'datasetUrl'});
    // 結果
    expect(actual).toBe(true);
  })

  it('データセットで更新がない場合Falseが返却されることを確認', async () => {
    // モック定義
    (getDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({
      equal: (_: any) => {
        return (
          'ba-o1-011002_g2-000010' === _.dataset_id &&
          '2024-01-24' === _.lastModified &&
          2048 === _.contentLength &&
          'aaa' === _.etag &&
          'https://aaa.com' === _.fileUrl
        );
      }
    }));
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: 'ba-o1-011002_g2-000010',
        lastModified: '2024-01-24',
        contentLength: 2048,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
      }));
    // テスト実施
    const actual = await parcelDownloader['updateCheck']({dataset_id: 'id', datasetUrl: 'datasetUrl'});
    // 結果
    expect(actual).toBe(false);
  })

  it('データセットで更新でアドレスデータDBに情報がない場合Trueが返却されることを確認', async () => {
    // モック定義
    const mockGetDatasetMetadata = (getDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve(undefined));
    // テスト実施
    const actual = await parcelDownloader['updateCheck']({dataset_id: 'id', datasetUrl: 'datasetUrl'});
    // 結果
    expect(actual).toBe(true);

    mockGetDatasetMetadata.mockReset();
  })

  it('地番マスター・地番マスター位置参照拡張で共に更新がある場合、Trueが返却されることを確認', async () => {
    // モック定義
    const mockGetDatasetMetadata = jest.spyOn(ParcelDownloder.prototype as any, 'updateCheck')
      .mockImplementationOnce((_: any, __: any) => Promise.resolve(true))
      .mockImplementationOnce((_: any, __: any) => Promise.resolve(true));
    // テスト実施
    const actual = await parcelDownloader.updateCheckParcelAndPos();
    // 結果
    expect(actual).toBe(true);

    mockGetDatasetMetadata.mockReset();
  })

  it('地番マスター・地番マスター位置参照拡張で片方で更新がある場合、Trueが返却されることを確認', async () => {
    // モック定義
    const mockGetDatasetMetadata = jest.spyOn(ParcelDownloder.prototype as any, 'updateCheck')
      .mockImplementationOnce((_: any, __: any) => Promise.resolve(false))
      .mockImplementationOnce((_: any, __: any) => Promise.resolve(true));
    // テスト実施
    const actual = await parcelDownloader.updateCheckParcelAndPos();
    // 結果
    expect(actual).toBe(true);

    mockGetDatasetMetadata.mockReset();
  })

  it('地番マスター・地番マスター位置参照拡張で共に更新がない場合、falseが返却されることを確認', async () => {
    // モック定義
    const mockGetDatasetMetadata = jest.spyOn(ParcelDownloder.prototype as any, 'updateCheck')
      .mockImplementationOnce((_: any, __: any) => Promise.resolve(false))
      .mockImplementationOnce((_: any, __: any) => Promise.resolve(false));
    // テスト実施
    const actual = await parcelDownloader.updateCheckParcelAndPos();
    // 結果
    expect(actual).toBe(false);

    mockGetDatasetMetadata.mockReset();
  })

  it('ダウンロードでConnectTimeoutErrorが発生した際にリトライされることを確認(リトライで成功)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    const streamMock = jest.fn().mockImplementationOnce((_: any) => { throw new errors.ConnectTimeoutError() })
    .mockImplementationOnce((_: any) => { throw new errors.ConnectTimeoutError() })
    .mockImplementationOnce((_: any) => {});
    (Client as unknown as jest.Mock).mockImplementationOnce((_: any) => {
      return {
        close: () => true,
        stream: streamMock
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 0 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .resolves.not.toThrow();
    expect(mockSaveDatasetMetadata.mock.calls.length).toEqual(1);

    mockSaveDatasetMetadata.mockReset();
  });
  it('ダウンロードでConnectTimeoutErrorが発生した際にリトライされることを確認(リトライでも失敗)', async () => {
    // モック定義
    const mockId = 'ba-o1-011002_g2-000010';
    jest.spyOn(ParcelDownloder.prototype as any, 'getParcelMetadata').mockImplementation((_: any, __: any) => Promise.resolve(
      {
        dataset_id: mockId,
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
        lastModified: '2024-01-17',
        equal: () => { false }
      }));
    (getDatasetMetadata as jest.Mock).mockImplementation((_: any) => { });
    const connectTimeoutErr = new errors.ConnectTimeoutError();
    const streamMock = jest.fn().mockImplementation((_: any) => { throw connectTimeoutErr });
    (Client as unknown as jest.Mock).mockImplementationOnce((_: any) => {
      return {
        close: () => true,
        stream: streamMock
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 0 });
    const mockSaveDatasetMetadata = (saveDatasetMetadata as jest.Mock).mockImplementation(async (_: any, __: any) => Promise.resolve({}))
    // テスト実施
    await expect(parcelDownloader['download']({downloadUrl: 'downloadUrl', downloadFilePath: 'downloadFilePath', dataset_id: 'id'}))
    .rejects.toThrowError(new Error("Failed to download the dataset"));
    expect(mockSaveDatasetMetadata.mock.calls.length).toEqual(0);

    mockSaveDatasetMetadata.mockReset();
  });
});