import { describe, expect, it, jest } from '@jest/globals';
import { DataSource } from 'typeorm';
import { getValueWithKey } from '../get-value-with-key';

jest.mock('typeorm');
jest.mock('string-hash')

const MockedDS = DataSource as unknown as jest.Mock;

describe("getValueWithKey()", () => {
  it.concurrent("should return expected value", async () => {
    MockedDS.mockImplementation(() => {
      return {
        query: (sql: string) => {
          return {
            get: (key: number): { [key: string]: string } | undefined => {
              return {
                key: 'ba000001',
                value: '1234',
              }
            },
          };
        },
      };
    });
    const mockedDS = new DataSource({
      type: 'better-sqlite3',
      database: 'dummy.sqlite',
    });
    
    const receivedValue = getValueWithKey({
      ds: mockedDS,
      key: 'ba000001',
    });

    expect(receivedValue).toEqual('1234');
  });
  it.concurrent("should return ", async () => {

    MockedDS.mockImplementation(() => {
      return {
        query: (sql: string) => {
          return {
            get: (key: number): { [key: string]: string } | undefined => {
              return undefined
            },
          };
        },
      };
    });
    const mockedDS = new DataSource({
      type: 'better-sqlite3',
      database: 'dummy.sqlite',
    });
    
    const receivedValue = getValueWithKey({
      ds: mockedDS,
      key: 'ba000001',
    });

    expect(receivedValue).toBe(undefined);
  });
});
