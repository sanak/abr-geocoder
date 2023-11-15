export const DataSource = jest.fn().mockImplementation(() => ({
  initialize: jest.fn(async () => {
    return Promise.resolve();
  }),
  query: jest.fn(async () => {
    return Promise.resolve([]);
  }),
  createQueryRunner: jest.fn().mockImplementation(() => ({
    run: jest.fn(),
    all: jest.fn().mockReturnValue([]),
  })),
  createQueryBuilder: jest.fn().mockImplementation(() => ({
    run: jest.fn(),
    all: jest.fn().mockReturnValue([]),
  })),
  destroy: jest.fn(async () => {
    return Promise.resolve();
  }),
}));
