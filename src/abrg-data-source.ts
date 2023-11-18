import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

const commonOptions = {
  synchronize: false,
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  migrationsRun: true,
};

const sqliteOptions: DataSourceOptions = {
  ...commonOptions,
  type: 'better-sqlite3',
  database: 'ba000001.sqlite',
  statementCacheSize: 150,
  prepareDatabase: db => {
    db.pragma('journal_mode = MEMORY');
    db.pragma('synchronous = OFF');
  },
};

const postgresOptions: DataSourceOptions = {
  ...commonOptions,
  type: 'postgres',
  database: 'ba000001',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
};

const options: DataSourceOptions =
  process.env.DS_TYPE === 'postgres' ? postgresOptions : sqliteOptions;

// export default new DataSource(options);
export const AbrgDataSource = new DataSource(options);
