// import { jest } from '@jest/globals';
// import 'reflect-metadata';

export const QueryRunner = jest.fn().mockImplementation(
  () => {
    return {
      isTransactionActive: false,
      connect: jest.fn().mockImplementation(() => {
        return Promise.resolve();
      }),
      startTransaction: jest.fn(() => {
        return Promise.resolve();
      }),
      connection: {
        query: jest.fn(() => {
          return Promise.resolve();
        })
      },
      commitTransaction: jest.fn(() => {
        return Promise.resolve();
      }),
      rollbackTransaction: jest.fn(() => {
        return Promise.resolve();
      }),
      release: jest.fn(() => {
        return Promise.resolve();
      })
    }
  }
);

export const DataSource = jest.fn().mockImplementation(
  () => {
    return {
      initialize: jest.fn(() => {
        return Promise.resolve(this);
      }),
      query: jest.fn().mockImplementation(() => {
        return Promise.resolve([]);
      }),
      createQueryRunner: jest.fn().mockImplementation(() => {
        return new QueryRunner();
      }),
      destroy: jest.fn(() => {
        return Promise.resolve();
      }),
      options: {
        type: 'better-sqlite3'
      }
    };
  }
);
