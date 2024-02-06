import 'reflect-metadata';
import { join } from 'path';
import 'dotenv/config';
import { CommonDataSourceOptions } from '@interface-adapter/data-source-providers/common-data-source-options';
import {
  DS_Type,
  DataSourceProvider,
} from '@interface-adapter/data-source-providers/data-source-provider';
import { SqliteProvider } from '@interface-adapter/data-source-providers/sqlite-provider';
import { PostgresProvider } from '@interface-adapter/data-source-providers/postgres-provider';
import { MysqlProvider } from '@interface-adapter/data-source-providers/mysql-provider';

export const commonOptions: CommonDataSourceOptions = {
  synchronize: false,
  logging: false,
  entities: [join(__dirname, 'entity', '*.{ts,js}')],
  migrations: [join(__dirname, 'migration', '*.{ts,js}')],
  migrationsRun: true,
};

// .env ファイルが存在しない場合はSQLiteを使用する
const dsType = process.env.DS_TYPE || DS_Type.sqlite;
let dataSource: DataSourceProvider;
switch (dsType) {
  case DS_Type.sqlite:
    dataSource = SqliteProvider.create({ commonOptions });
    break;

  case DS_Type.postgres:
    dataSource = PostgresProvider.create({
      commonOptions,
      host: process.env.DS_HOST,
      port: Number(process.env.DS_PORT),
      username: process.env.DS_USERNAME,
      password: process.env.DS_PASSWORD,
      database: process.env.DS_DATABASE,
    });
    break;

  case DS_Type.mysql:
    dataSource = MysqlProvider.create({
      commonOptions,
      host: process.env.DS_HOST,
      port: Number(process.env.DS_PORT),
      username: process.env.DS_USERNAME,
      password: process.env.DS_PASSWORD,
      database: process.env.DS_DATABASE,
    });
    break;

  default:
    throw 'unimplemented database type is specified';
}

export const AbrgDataSource = dataSource;
