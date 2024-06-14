import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import { saveDatasetMetadata } from '@domain/dataset-metadata/save-dataset-metadata';
import { DatasetMetadata } from '@domain/dataset-metadata/dataset-metadata';

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
 * {@link saveDatasetMetadata} のテストを実施します。
 */
describe("saveDatasetMetadata test", () => {
  const mockedDB = new Database('<no sql file>');

  beforeEach(() => {
    mockRunMethod.mockClear();
    MockedDB.mockClear();
  });

  it("データセットメタデータの登録が正常に処理されることを確認", () => {
    // テストデータ
    const mockDatasetMetadata = new DatasetMetadata({
        dataset_id: 'ba-o1-011011_g2-000010',
        contentLength: 1024,
        etag: 'aaa',
        lastModified: '2023-01-01',
        fileUrl: 'https://catalog.registries.digital.go.jp//rsc/address/mt_parcel_city011011.csv.zip'
    })
    // テスト実施
    saveDatasetMetadata({
      db: mockedDB,
      datasetMetadata: mockDatasetMetadata
    });
    const receivedValue = mockRunMethod.mock.calls[0][0];
    // 結果
    expect(mockRunMethod).toBeCalled();
    expect(receivedValue).toEqual({
       "dataset_id": "ba-o1-011011_g2-000010",
       "contentLength": 1024,
       "etag": "aaa",
       "fileUrl": "https://catalog.registries.digital.go.jp//rsc/address/mt_parcel_city011011.csv.zip",
       "lastModified": "2023-01-01"
      });
  });
});