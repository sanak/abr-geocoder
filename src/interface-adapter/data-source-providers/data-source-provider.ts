import { DataSource, DataSourceOptions } from 'typeorm';
import { RegExpEx } from '@domain/reg-exp-ex';
import { DASH } from '@settings/constant-values';

export enum DS_Type {
  sqlite = 'better-sqlite3',
  mysql = 'mysql',
  postgres = 'postgres',
}

export interface IPrepareSQL {
  sql: string;
  paramKeys: string[];
}

interface IDataSourceProvider {
  get type(): DS_Type;

  // 各DB向けにSQLを調整しなければならない処理
  prepare(sql: string): IPrepareSQL;
  replaceInsertValues(
    sql: string,
    paramsCount: number,
    rowCount: number
  ): string;
  // migration(): void;
}

export abstract class DataSourceProvider
  extends DataSource
  implements IDataSourceProvider
{
  constructor(options: DataSourceOptions) {
    super(options);
  }

  abstract get type(): DS_Type;

  prepare(sql: string): IPrepareSQL {
    // prepare に関する共通処理
    let tempSql = sql;
    const keys: string[] = [];
    const matchedParams = tempSql.match(
      RegExpEx.create(`${DASH}[a-zA-Z_0-9]+`, 'g')
    );
    if (!matchedParams) {
      return {
        sql: tempSql,
        paramKeys: keys,
      };
    }

    for (let i = 0; i < matchedParams.length; i++) {
      const matchedParam = matchedParams[i];
      const paramName = matchedParam.replace('@', '');
      keys.push(paramName);

      // どうしても小さな分岐をするなら、局所的に可。でも何回も登場するなら設計し直したほうが良い。
      const placeHolder = this.type === DS_Type.postgres ? `$${i + 1}` : '?';
      tempSql = tempSql.replace(matchedParam, placeHolder);
    }

    return {
      sql: tempSql,
      paramKeys: keys,
    };
  }

  replaceInsertValues(
    sql: string,
    paramsCount: number,
    rowCount: number
  ): string {
    let tempSql = sql;
    const rows = [];
    const pattern =
      this.type === DS_Type.postgres
        ? /VALUES[\s\n]*\([\s\n$0-9,]+\)/im
        : /VALUES[\s\n]*\([\s\n?,]+\)/im;
    const matchedInsertValues = tempSql.match(pattern);
    if (!matchedInsertValues) {
      return tempSql;
    }

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const placeHolders = [];
      for (let paramIdx = 0; paramIdx < paramsCount; paramIdx++) {
        const placeHolder =
          this.type === DS_Type.postgres
            ? `$${rowIdx * paramsCount + paramIdx + 1}`
            : '?';
        placeHolders.push(placeHolder);
      }
      rows.push(`(${placeHolders.join(',')})`);
    }
    tempSql = tempSql.replace(
      matchedInsertValues[0],
      'VALUES ' + rows.join(',')
    );
    return tempSql;
  }

  // migration(): void {
  //   // 共通する処理は、あとで書く
  // }
}
