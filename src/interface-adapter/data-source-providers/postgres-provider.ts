import { DataSourceOptions } from 'typeorm';
import { CommonDataSourceOptions } from './common-data-source-options';
import {
  DS_Type,
  DataSourceProvider,
  IPrepareSQL,
} from './data-source-provider';
import { RegExpEx } from '@domain/reg-exp-ex';

export class PostgresProvider extends DataSourceProvider {
  get type(): DS_Type {
    return DS_Type.postgres;
  }

  private constructor(options: DataSourceOptions) {
    super(options);
  }

  prepare(sql: string): IPrepareSQL {
    const result = super.prepare(sql);
    let tempSql: string = result.sql;
    const keys: string[] = result.paramKeys;

    tempSql = tempSql.replace(/^INSERT OR REPLACE INTO/i, 'INSERT INTO');
    tempSql = tempSql.replace(/-- /g, '');

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
      const key = matchedJSONFucntion.toLowerCase();
      switch (key) {
        case 'json_group_array':
          tempSql = tempSql.replace(matchedJSONFucntion, 'json_agg');
          break;
        case 'json_object':
          tempSql = tempSql.replace(matchedJSONFucntion, 'json_build_object');
          break;
        default:
          throw 'unexpected key';
      }
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
  }): PostgresProvider => {
    return new PostgresProvider({
      ...commonOptions,
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      parseInt8: true,
    });
  };
}
