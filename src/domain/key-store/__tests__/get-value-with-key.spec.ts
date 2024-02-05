import { describe, expect, it, jest } from '@jest/globals';
import { DataSourceProvider } from '@interface-adapter/data-source-providers/__mocks__/data-source-provider';
import { getValueWithKey } from '../get-value-with-key';

jest.mock('string-hash')

const MockedDS = DataSourceProvider as unknown as jest.Mock;

describe("getValueWithKey()", () => {
  it.concurrent("should return expected value", async () => {
    MockedDS.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            sql: sql,
            paramKeys: [],
          }
        },
        query: (sql: string, params: string[]) => {
          return Promise.resolve([{
            value: '1234',
          }]);
        },
      };
    });
    const mockedDS = new DataSourceProvider();
    
    const receivedValue = await getValueWithKey({
      ds: mockedDS,
      key: 'ba000001',
    });

    expect(receivedValue).toEqual('1234');
  });
  it.concurrent("should return ", async () => {

    MockedDS.mockImplementation(() => {
      return {
        prepare: (sql: string) => {
          return {
            sql: sql,
            paramKeys: [],
          }
        },
        query: (sql: string, params: string[]) => {
          return Promise.resolve(undefined);
        },
      };
    });
    const mockedDS = new DataSourceProvider();
    
    const receivedValue = await getValueWithKey({
      ds: mockedDS,
      key: 'ba000001',
    });

    expect(receivedValue).toBe(undefined);
  });
});
