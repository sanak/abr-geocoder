import { DataSourceOptions } from 'typeorm';
import { CommonDataSourceOptions } from './common-data-source-options';
import {
  DS_Type,
  DataSourceProvider,
  IPrepareSQL,
} from './data-source-provider';
import { RegExpEx } from '@domain/reg-exp-ex';

export class MysqlProvider extends DataSourceProvider {
  get type(): DS_Type {
    return DS_Type.mysql;
  }

  private constructor(options: DataSourceOptions) {
    super(options);
  }

  prepare(sql: string): IPrepareSQL {
    const result = super.prepare(sql);
    let tempSql: string = result.sql;
    const keys: string[] = result.paramKeys;

    tempSql = tempSql.replace(/^INSERT OR REPLACE INTO/i, 'REPLACE INTO');

    const matchedJSONFunctions = tempSql.match(
      RegExpEx.create('(json_group_array|json_object)', 'gi')
    );
    if (!matchedJSONFunctions) {
      return {
        sql: tempSql,
        paramKeys: keys,
      };
    }
    Array.from(matchedJSONFunctions).forEach(matchedJSONFucntion => {
      tempSql = tempSql.replace(matchedJSONFucntion, 'json_arrayagg');
    });

    return {
      sql: tempSql,
      paramKeys: keys,
    };
  }

  static readonly create = ({
    commonOptions,
    host,
    port,
    username,
    password,
    database,
  }: {
    commonOptions: CommonDataSourceOptions;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
  }): MysqlProvider => {
    return new MysqlProvider({
      ...commonOptions,
      type: 'mysql',
      host,
      port,
      username,
      password,
      database,
      charset: 'utf8mb4',
    });
  };
}
