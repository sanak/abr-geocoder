import { DataSource, QueryRunner } from 'typeorm';

export const queryWithNamedParams = async (
  ds: DataSource,
  sql: string,
  params: Record<string, string | number>,
  queryRunner?: QueryRunner
): Promise<any> => {
  let tempSql = sql;
  const values = [];
  const dbType = ds.options.type;
  const matches = tempSql.match(/@[a-zA-Z_0-9]+/g);
  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const paramName = match.replace('@', '');
      const paramValue = params[paramName];
      if (paramValue === undefined) {
        throw new Error(`@${paramName} is not found in params.`);
      }
      values.push(paramValue);
      const placeHolder = dbType === 'postgres' ? `$${i + 1}` : '?';
      tempSql = tempSql.replace(match, placeHolder);
    }
  }
  return ds.query(tempSql, values, queryRunner);
};
