import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DataSourceProvider } from '@interface-adapter/data-source-providers/__mocks__/data-source-provider';
import {saveKeyAndValue} from '../save-key-and-value';

jest.mock('string-hash')

const MockedDS = DataSourceProvider as unknown as jest.Mock;

const mockRunMethod = jest.fn();

MockedDS.mockImplementation(() => {
  return {
    prepare: (sql: string) => {
      return {
        sql: sql.replace(/(@key|@value)/g, '?'),
        paramKeys: ['key', 'value'],
      }
    },
    query: mockRunMethod, // (sql: string, params: string[]) => {}
  };
});

describe("saveKeyAndValue()", () => {
  const mockedDS = new DataSourceProvider();

  beforeEach(() => {
    mockRunMethod.mockClear();
    MockedDS.mockClear();
  });

  it("should save value correctly", async () => {

    await saveKeyAndValue({
      ds: mockedDS,
      key: 'ba000001',
      value: '1234',
    });
    expect(mockRunMethod).toBeCalled();
    const receivedValue1 = mockRunMethod.mock.calls[0][0];
    const receivedValue2 = mockRunMethod.mock.calls[0][1];
    expect(receivedValue1).toEqual('insert or replace into metadata values(?, ?)');
    expect(receivedValue2).toEqual(['ba000001', '1234']);
  });
});
