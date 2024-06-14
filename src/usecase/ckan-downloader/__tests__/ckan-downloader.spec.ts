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
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import { CkanDownloader } from '../ckan-downloader'; // adjust this import according to your project structure
import { getRequest } from '@domain/http/get-request';
import { getMetadata } from '@domain/metadata/get-metadata';
import { headRequest } from '@domain/http/head-request';
import { getPackageInfo } from '@domain/get-package-info';
import { Metadata } from '@domain/metadata/metadata';
import fs from 'node:fs'
import { verifyPartialDownloadedFile } from '../verify-partial-downloaded-file';
import { Client } from 'undici';

jest.mock<BetterSqlite3.Database>('better-sqlite3');
jest.mock('@domain/http/head-request');
jest.mock('@domain/http/get-request');
jest.mock('@domain/metadata/get-metadata');
jest.mock('@domain/get-package-info');
jest.mock('node:fs')
jest.mock('../verify-partial-downloaded-file')
jest.mock<Client>('undici')

const MockedDB = Database as unknown as jest.Mock;

describe('CkanDownloader', () => {
  let ckanDownloader: CkanDownloader;

  beforeEach(() => {
    ckanDownloader = new CkanDownloader({
      userAgent: 'testUserAgent',
      datasetUrl: 'testDatasetUrl',
      db: new Database('dummy'), // mock this according to your Database implementation
      ckanId: 'testCkanId',
      dstDir: 'testDstDir',
    });
  });

  it('getDatasetMetadata method should be defined', () => {
    expect(ckanDownloader.getMetadata).toBeDefined();
  });

  it('getDatasetMetadata is succeed', async () => {
    // モック定義
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
    (getMetadata as jest.Mock).mockReturnValue({
      ckanId: 'ba000001',
      formatVersion: '1.2.0',
      lastModified: '2023/12/27',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com',
    });
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 200,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    (getPackageInfo as jest.Mock).mockImplementation(async () => Promise.resolve({
      version: '1.2.0',
    }));
    // テスト実施
    const result = await ckanDownloader.getMetadata();
    // 結果
    expect(result.ckanId).toEqual('testCkanId');
    expect(result.contentLength).toEqual(1024);
    expect(result.etag).toEqual('aaa');
    expect(result.fileUrl).toEqual('https://aaa.com');
    expect(result.formatVersion).toEqual('1.2.0');
    expect(result.lastModified).toEqual('2023-12-27');
  });

  it('getDatasetMetadata is not 200 response', async () => {
    // モック定義
    (getRequest as jest.Mock).mockImplementation((_: any, __: any) => Promise.resolve({
      url: 'htts://aaa.com',
      userAgent: 'user-agent',
      statusCode: 400,
    },
    ));
    // テスト実施・結果
    await expect(
      ckanDownloader.getMetadata()
    ).rejects.toThrowError(new Error("Failed to download the dataset"))
  });

  it('getDatasetMetadata is CKANResponse failed', async () => {
    // モック定義
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
    // テスト実施・結果
    await expect(
      ckanDownloader.getMetadata()
    ).rejects.toThrowError(new Error("Can not find the specified resource"))
  });

  it('getDatasetMetadata is csvResource undifined', async () => {
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
              resources: []
            },
          }
        }
      }
    },
    ));
    // テスト実施・結果
    await expect(
      ckanDownloader.getMetadata()
    ).rejects.toThrowError(new Error("Specified resource does not contain the data csv file"))
  });

  it('getDatasetMetadata is csvMetadata null', async () => {
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
    (getMetadata as jest.Mock).mockReturnValue(null);
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 200,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    (getPackageInfo as jest.Mock).mockImplementation(async () => Promise.resolve({
      version: '1.2.0',
    }));
    // テスト実施
    const result = await ckanDownloader.getMetadata();
    // 結果
    expect(result.ckanId).toEqual('testCkanId');
    expect(result.contentLength).toEqual(1024);
    expect(result.etag).toEqual('aaa');
    expect(result.fileUrl).toEqual('https://aaa.com');
    expect(result.formatVersion).toEqual('1.2.0');
    expect(result.lastModified).toEqual('2023-12-27');
  });

  it('getDatasetMetadata is headRequest 304', async () => {
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
    (getMetadata as jest.Mock).mockReturnValue({
      ckanId: 'ba000001',
      formatVersion: '1.2.0',
      lastModified: '2023/12/27',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com',
    });
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 304,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    (getPackageInfo as jest.Mock).mockImplementation(async () => Promise.resolve({
      version: '1.2.0',
    }));
    // テスト実施
    const result = await ckanDownloader.getMetadata();
    // 結果
    expect(result.ckanId).toEqual('ba000001');
    expect(result.contentLength).toEqual(1024);
    expect(result.etag).toEqual('aaa');
    expect(result.fileUrl).toEqual('https://aaa.com');
    expect(result.formatVersion).toEqual('1.2.0');
    expect(result.lastModified).toEqual('2023/12/27');
  });

  it('getDatasetMetadata is headRequest not in 200/304', async () => {
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
    (getMetadata as jest.Mock).mockReturnValue({
      ckanId: 'ba000001',
      formatVersion: '1.2.0',
      lastModified: '2023/12/27',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com',
    });
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 400,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    (getPackageInfo as jest.Mock).mockImplementation(async () => Promise.resolve({
      version: '1.2.0',
    }));
    // テスト実施・結果
    await expect(
      ckanDownloader.getMetadata()
    ).rejects.toThrowError(new Error("Specified resource does not contain the data csv file"))
  });

  it('getDatasetMetadata is succeed from cache', async () => {
    // モック定義
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
    (getMetadata as jest.Mock).mockReturnValue({
      ckanId: 'ba000001',
      formatVersion: '1.2.0',
      lastModified: '2023/12/27',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com',
    });
    (headRequest as jest.Mock).mockImplementation(async (_: any, __: any, ___: any) => Promise.resolve({
      statusCode: 200,
      headers: {
        'content-length': '1024',
        etag: 'aaa',
        'last-modified': '2023-12-27',
      }
    }));
    (getPackageInfo as jest.Mock).mockImplementation(async () => Promise.resolve({
      version: '1.2.0',
    }));
    // テスト実施
    await ckanDownloader.getMetadata();
    const result = await ckanDownloader.getMetadata();
    // 結果
    expect(result.ckanId).toEqual('testCkanId');
    expect(result.contentLength).toEqual(1024);
    expect(result.etag).toEqual('aaa');
    expect(result.fileUrl).toEqual('https://aaa.com');
    expect(result.formatVersion).toEqual('1.2.0');
    expect(result.lastModified).toEqual('2023-12-27');
  });

  it('updateCheck method should be defined', () => {
    // テスト実施・結果
    expect(ckanDownloader.updateCheck).toBeDefined();
  });

  it('updateCheck is update', async () => {
    // モック定義
    (getMetadata as jest.Mock).mockReturnValue(undefined)
    // テスト実施
    const result = await ckanDownloader.updateCheck();
    // 結果
    expect(result).toBe(true);
  });

  it('updateCheck is not update', async () => {
    // モック定義
    (getMetadata as jest.Mock).mockReturnValue({
      ckanId: 'ba000001',
      formatVersion: '1.2.0',
      lastModified: '2023/12/27',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com',
      equal: (_: Metadata) => {
        return _.ckanId === 'ba000001' &&
          _.contentLength === 1024 &&
          _.etag === 'aaa' &&
          _.fileUrl === 'https://aaa.com' &&
          _.formatVersion === '1.2.0' &&
          _.lastModified === '2023/12/27'
      }
    });
    ckanDownloader.getMetadata = jest.fn<() => Promise<any>>().mockImplementation(async () => Promise.resolve(
      {
        ckanId: 'ba000001',
        formatVersion: '1.2.0',
        lastModified: '2023/12/27',
        contentLength: 1024,
        etag: 'aaa',
        fileUrl: 'https://aaa.com',
      }))
    // テスト実施
    const result = await ckanDownloader.updateCheck();
    // 結果
    expect(result).toBe(false);
  });

  it('getDownloadFilePath is succeed', () => {
    // テスト実施
    const result = (ckanDownloader as any).getDownloadFilePath();
    // 結果
    expect(result).toEqual('testDstDir/testCkanId.zip')
  })

  it('download is succeed ', async () => {
    // モック定義
    const param = {
      ckanId: 'ba000001',
      formatVersion: '1.0.0',
      lastModified: '2023/12/26',
      contentLength: 1,
      etag: 'aaa',
      fileUrl: 'https://aaa.com'
    }
    jest.spyOn(ckanDownloader, 'getMetadata').mockImplementation(() => Promise.resolve(new Metadata(param)));
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

    // テスト実施
    const result = await ckanDownloader.download();

    // 結果
    expect(result).toEqual('testDstDir/testCkanId.zip')
  })

  it('download is succeed by etag is undefined', async () => {
    // モック定義
    const param = {
      ckanId: 'ba000001',
      formatVersion: '1.0.0',
      lastModified: '2023/12/26',
      contentLength: 1,
      etag: undefined,
      fileUrl: 'https://aaa.com'
    }
    jest.spyOn(ckanDownloader, 'getMetadata').mockImplementation(() => Promise.resolve(new Metadata(param)));
    (Client as unknown as jest.Mock).mockImplementation(() => {
      return {
        close: () => false,
        stream: () => { }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { },
    });
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(false);
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 1 });

    // テスト実施
    const result = await ckanDownloader.download();

    // 結果
    expect(result).toEqual('testDstDir/testCkanId.zip')
  })

  it('download is succeed by verifyPartialDownloadedFile is false', async () => {
    // モック定義
    const param = {
      ckanId: 'ba000001',
      formatVersion: '1.0.0',
      lastModified: '2023/12/26',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com'
    }
    jest.spyOn(ckanDownloader, 'getMetadata').mockImplementation(() => Promise.resolve(new Metadata(param)));
    (Client as unknown as jest.Mock).mockImplementation(() => {
      return {
        close: () => false,
        stream: () => { }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(true);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { },
    });
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(false);
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 1 });

    // テスト実施
    const result = await ckanDownloader.download();

    // 結果
    expect(result).toEqual('testDstDir/testCkanId.zip')
  })

  it('download is succeed by exist file', async () => {
    // モック定義
    const param = {
      ckanId: 'ba000001',
      formatVersion: '1.0.0',
      lastModified: '2023/12/26',
      contentLength: 1,
      etag: 'aaa',
      fileUrl: 'https://aaa.com'
    }
    jest.spyOn(ckanDownloader, 'getMetadata').mockImplementation(() => Promise.resolve(new Metadata(param)));
    (Client as unknown as jest.Mock).mockImplementation(() => {
      return {
        close: () => false,
        stream: () => { }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(false);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 1 });

    // テスト実施
    const result = await ckanDownloader.download();

    // 結果
    expect(result).toEqual('testDstDir/testCkanId.zip')
  })

  it('download is stream abort', async () => {
    // モック定義
    const param = {
      ckanId: 'ba000001',
      formatVersion: '1.0.0',
      lastModified: '2023/12/26',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com'
    }
    jest.spyOn(ckanDownloader, 'getMetadata').mockImplementation(() => Promise.resolve(new Metadata(param)));
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
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(false);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 1 });

    // テスト実施
    const result = await ckanDownloader.download();

    // 結果
    expect(result).toEqual('testDstDir/testCkanId.zip')
  })

  it('download is stream err', async () => {
    // モック定義
    const param = {
      ckanId: 'ba000001',
      formatVersion: '1.0.0',
      lastModified: '2023/12/26',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: 'https://aaa.com'
    }
    jest.spyOn(ckanDownloader, 'getMetadata').mockImplementation(() => Promise.resolve(new Metadata(param)));
    const otherErr = new Error('stream other err');
    otherErr.name = 'other';
    (Client as unknown as jest.Mock).mockImplementation(() => {
      return {
        close: () => false,
        stream: () => { throw otherErr }
      }
    });
    (fs.existsSync as jest.Mock) = jest.fn<(_: any) => Promise<any>>().mockResolvedValue(false);
    (fs.promises.open as jest.Mock) = jest.fn<(_: any, __: any) => Promise<any>>().mockResolvedValue({
      close: () => { }
    });
    (verifyPartialDownloadedFile as jest.Mock) = jest.fn<(_: any, __: any, ___: any) => Promise<any>>().mockResolvedValue(true);
    (fs.statSync as jest.Mock) = jest.fn().mockReturnValue({ size: 1 });


    // テスト実施
    expect(() => ckanDownloader.download()).rejects.toThrowError(otherErr.message)
  })
});
