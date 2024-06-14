import { describe, expect, it, jest } from '@jest/globals';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import { getMetadata } from '../get-metadata';
import { Metadata } from '@domain/metadata/metadata';

jest.mock<BetterSqlite3.Database>('better-sqlite3');
jest.mock('string-hash')

const MockedDB = Database as unknown as jest.Mock;

/**
 * {@link getMetadata} のテストを実施します。
 */
describe("getMetadata test", () => {
  it.concurrent("should return expected value", async () => {
    // モック定義
    MockedDB.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            get: (ckanId: number): {
              ckan_id: string;
              format_version: string;
              last_modified: string;
              content_length: number;
              etag: string;
              file_url: string;
            } | undefined => {
              return {
                ckan_id: 'ba000001',
                content_length: 0,
                etag: 'aaa',
                file_url: "https://aaa.com",
                last_modified: "2023-01-01",
                format_version: "1.0.0"
              }
            },
          };
        },
      };
    });
    const mockedDB = new Database('<no sql file>');
    // テスト実施
    const receivedValue: Metadata | undefined = getMetadata({
      db: mockedDB,
      ckanId: 'ba000001',
    })
    // 結果
    expect(receivedValue?.ckanId).toEqual('ba000001');
    expect(receivedValue?.contentLength).toEqual(0);
    expect(receivedValue?.etag).toEqual('aaa');
    expect(receivedValue?.fileUrl).toEqual('https://aaa.com');
    expect(receivedValue?.lastModified).toEqual('2023-01-01');
    expect(receivedValue?.formatVersion).toEqual('1.0.0');
  });

  it.concurrent("should return ", async () => {
    // モック定義
    MockedDB.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            get: (key: number): { [key: string]: string } | undefined => {
              return undefined
            },
          };
        },
      };
    });
    const mockedDB = new Database('<no sql file>');
    // テスト実施
    const receivedValue = getMetadata({
      db: mockedDB,
      ckanId: 'ba000001',
    });
    // 結果
    expect(receivedValue).toBe(undefined);
  });
});