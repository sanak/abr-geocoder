import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import { saveMetadata } from '../save-metadata';
import { Metadata } from '@domain/metadata/metadata';

jest.mock<BetterSqlite3.Database>('better-sqlite3');
jest.mock('string-hash')

const MockedDB = Database as unknown as jest.Mock;

const mockRunMethod = jest.fn();

MockedDB.mockImplementation(() => {
  return {
    prepare: (sql: string) => {
      return {
        run: mockRunMethod,
      };
    },
  };
});

/**
 * {@link saveMetadata} のテストを実施します。
 */
describe("saveMetadata test", () => {
  const mockedDB = new Database('<no sql file>');

  beforeEach(() => {
    mockRunMethod.mockClear();
    MockedDB.mockClear();
  });

  it("should save value correctly", () => {
    // テストデータ
    const mockMetadata = new Metadata({
      ckanId: 'ba000001',
      contentLength: 1024,
      etag: 'aaa',
      fileUrl: "https://aaa.com",
      lastModified: "2023-01-01",
      formatVersion: "1.0.0"
    })
    // テスト実施
    saveMetadata({
      db: mockedDB,
      metadata: mockMetadata
    });
    const receivedValue = mockRunMethod.mock.calls[0][0];
    // 結果
    expect(mockRunMethod).toBeCalled();
    expect(receivedValue).toEqual({
       "ckanId": "ba000001",
       "contentLength": 1024,
       "etag": "aaa",
       "fileUrl": "https://aaa.com",
       "formatVersion": "1.0.0",
       "lastModified": "2023-01-01"
      });
  });
});