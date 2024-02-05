import { describe, expect, it, jest } from '@jest/globals';
import { DataSource } from 'typeorm';
import { getValueWithKey } from '../get-value-with-key';

// jest.mock<DataSource>('typeorm');
jest.mock('string-hash')

const MockedDS = DataSource as unknown as jest.Mock;

describe("getValueWithKey()", () => {
  it.concurrent("should return expected value", async () => {
    MockedDS.mockImplementation(() => {
      return {
        query: (sql: string, params: string[]) => {
          return Promise.resolve([{
            value: '1234',
          }]);
        },
        options: {
          type: 'better-sqlite3',
        },
      };
    });
    const mockedDS = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
    });
    
    const receivedValue = await getValueWithKey({
      ds: mockedDS,
      key: 'ba000001',
    });

    expect(receivedValue).toEqual('1234');
  });
  it.concurrent("should return ", async () => {

    MockedDS.mockImplementation(() => {
      return {
        query: (sql: string, params: string[]) => {
          return Promise.resolve(undefined);
        },
        options: {
          type: 'better-sqlite3',
        },
      };
    });
    const mockedDS = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
    });
    
    const receivedValue = await getValueWithKey({
      ds: mockedDS,
      key: 'ba000001',
    });

    expect(receivedValue).toBe(undefined);
  });
});