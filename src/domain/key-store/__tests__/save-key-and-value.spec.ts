import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DataSource } from 'typeorm';
import {saveKeyAndValue} from '../save-key-and-value';

// jest.mock<DataSource>('typeorm');
jest.mock('string-hash')

const MockedDS = DataSource as unknown as jest.Mock;

const mockRunMethod = jest.fn();

MockedDS.mockImplementation(() => {
  return {
    query: mockRunMethod, // (sql: string, params: string[]) => {}
    options: {
      type: 'better-sqlite3',
    },
  };
});

describe("saveKeyAndValue()", () => {
  const mockedDS = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
  });

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