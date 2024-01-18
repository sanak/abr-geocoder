import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

export const commonOptions = {
  synchronize: false,
  logging: false,
  entities: ['dist/entity/*.js'],
  migrations: ['dist/migration/*.js'],
  migrationsRun: true,
};

const sqliteOptions: DataSourceOptions = {
  ...commonOptions,
  type: 'better-sqlite3',
  // src/interface-adapter/providers/provide-data-source.ts 内で絶対パスに置換
  database: 'ba000001.sqlite',
};

const options: DataSourceOptions = sqliteOptions;

export const AbrgDataSource = new DataSource(options);
