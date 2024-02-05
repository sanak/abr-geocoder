import { DataSourceOptions } from 'typeorm';
import { CommonDataSourceOptions } from './common-data-source-options';
import {
  DS_Type,
  DataSourceProvider,
  IPrepareSQL,
} from './data-source-provider';

export class SqliteProvider extends DataSourceProvider {
  get type(): DS_Type {
    return DS_Type.sqlite;
  }

  private constructor(options: DataSourceOptions) {
    super(options);
  }

  prepare(sql: string): IPrepareSQL {
    return super.prepare(sql);
  }

  static readonly create = ({
    commonOptions,
    database,
  }: {
    commonOptions: CommonDataSourceOptions;
    database?: string;
  }): SqliteProvider => {
    return new SqliteProvider({
      ...commonOptions,
      type: 'better-sqlite3',
      // src/interface-adapter/providers/provide-data-source.ts 内で絶対パスに更新
      database: database || 'ba0000001.sqlite',
      statementCacheSize: 150,
      prepareDatabase: db => {
        db.pragma('journal_mode = MEMORY');
        db.pragma('synchronous = OFF');
      },
    });
  };
}
