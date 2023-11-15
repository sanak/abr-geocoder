import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { default as typeorm, DataSource } from 'typeorm';

import {saveKeyAndValue} from '../save-key-and-value';

jest.mock<typeorm.DataSource>('typeorm');
jest.mock('string-hash')

const MockedDS = DataSource as unknown as jest.Mock;

const mockValuesMethod = jest.fn();

MockedDS.mockImplementation(() => {
  return {
    createQueryBuilder: () => {
      return {
        insert: () => {
          return {
            into: (entity: any) => {
              return {
                values: mockValuesMethod,
              };
            },
          };
        }
      };
    },
  };
});

describe("saveKeyAndValue()", () => {
  const mockedDS = new DataSource({
    type: 'better-sqlite3',
    database: 'dummy.sqlite',
  });

  beforeEach(() => {
    mockValuesMethod.mockClear();
    MockedDS.mockClear();
  });

  it("should save value correctly", () => {

    saveKeyAndValue({
      ds: mockedDS,
      key: 'ba000001',
      value: '1234',
    });
    expect(mockValuesMethod).toBeCalled();
    const receivedValue = mockValuesMethod.mock.calls[0][0];
    expect(receivedValue).toEqual({"key": 'ba000001', "value": "1234"});
  });
});
