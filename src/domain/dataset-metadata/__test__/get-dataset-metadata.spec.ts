import { describe, expect, it, jest } from '@jest/globals';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import { getDatasetMetadata } from '@domain/dataset-metadata/get-dataset-metadata';
import { DatasetMetadata } from '@domain/dataset-metadata/dataset-metadata';

jest.mock<BetterSqlite3.Database>('better-sqlite3');
jest.mock('string-hash')

const MockedDB = Database as unknown as jest.Mock;

/**
 * {@link getDatasetMetadata} のテストを実施します。
 */
describe("getDatasetMetadata test", () => {
  it.concurrent("指定した管理IDのデータセットメタデータが正常に取得できることを確認", async () => {
    // モック定義
    MockedDB.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            get: (dataset_id: string): {
              dataset_id: string;
              last_modified: string;
              content_length: number;
              etag: string;
              file_url: string;
            } | undefined => {
              return {
                dataset_id: 'ba-o1-011011_g2-000010',
                content_length: 1024,
                etag: 'aaa',
                file_url: "https://catalog.registries.digital.go.jp//rsc/address/mt_parcel_city011011.csv.zip",
                last_modified: "2023-01-01",
              }
            },
          };
        },
      };
    });
    const mockedDB = new Database('<no sql file>');
    // テスト実施
    const receivedValue: DatasetMetadata | undefined = await getDatasetMetadata({
      db: mockedDB,
      dataset_id: 'ba-o1-011011_g2-000010',
    })
    // 結果
    expect(receivedValue?.dataset_id).toEqual('ba-o1-011011_g2-000010');
    expect(receivedValue?.contentLength).toEqual(1024);
    expect(receivedValue?.etag).toEqual('aaa');
    expect(receivedValue?.fileUrl).toEqual('https://catalog.registries.digital.go.jp//rsc/address/mt_parcel_city011011.csv.zip');
    expect(receivedValue?.lastModified).toEqual('2023-01-01');
  });

  it.concurrent("指定した管理IDのデータセットメタデータが存在しない場合undefinedが返却されることを確認", async () => {
    // モック定義
    MockedDB.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            get: (dataset_id: string): {
              dataset_id: string;
              last_modified: string;
              content_length: number;
              etag: string;
              file_url: string;
            } | undefined => {
              return undefined
            },
          };
        },
      };
    });
    const mockedDB = new Database('<no sql file>');
    // テスト実施
    const receivedValue = await getDatasetMetadata({
      db: mockedDB,
      dataset_id: 'ba-o1-011011_g2-000010',
    });
    // 結果
    expect(receivedValue).toBe(undefined);
  });
});