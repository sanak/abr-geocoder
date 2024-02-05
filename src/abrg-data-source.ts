import 'reflect-metadata';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const commonOptions = {
  synchronize: false,
  logging: false,
  entities: [join(__dirname, 'entity', '*.{ts,js}')],
  migrations: [join(__dirname, 'migration', '*.{ts,js}')],
  migrationsRun: true,
};

const sqliteOptions: DataSourceOptions = {
  ...commonOptions,
  type: 'better-sqlite3',
  // src/interface-adapter/providers/provide-data-source.ts 内で絶対パスに置換
  database: 'ba000001.sqlite',
};

let options: DataSourceOptions = sqliteOptions;
if (process.env.DS_TYPE === 'postgres') {
  options = {
    ...commonOptions,
    type: 'postgres',
    host: process.env.DS_HOST,
    port: Number(process.env.DS_PORT),
    username: process.env.DS_USERNAME,
    password: process.env.DS_PASSWORD,
    database: process.env.DS_DATABASE,
    parseInt8: true,
  };
} else if (process.env.DS_TYPE === 'mysql') {
  options = {
    ...commonOptions,
    type: 'mysql',
    host: process.env.DS_HOST,
    port: Number(process.env.DS_PORT),
    username: process.env.DS_USERNAME,
    password: process.env.DS_PASSWORD,
    database: process.env.DS_DATABASE,
    charset: 'utf8mb4',
  };
}

export const AbrgDataSource = new DataSource(options);
