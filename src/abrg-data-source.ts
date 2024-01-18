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
  database: '~/.abr-geocoder/ba000001.sqlite',
};

const options: DataSourceOptions = sqliteOptions;

export const AbrgDataSource = new DataSource(options);
