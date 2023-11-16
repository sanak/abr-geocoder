import { DataSource } from 'typeorm';

export const prepareSqlAndParamKeys = (
  ds: DataSource,
  sql: string
): {
  preparedSql: string;
  paramKeys: string[];
} => {
  let tempSql = sql;
  const keys = [];
  const dbType = ds.options.type;
  const matches = tempSql.match(/@[a-zA-Z_0-9]+/g);
  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const paramName = match.replace('@', '');
      keys.push(paramName);
      const placeHolder = dbType === 'postgres' ? `$${i + 1}` : '?';
      tempSql = tempSql.replace(match, placeHolder);
    }
  }
  return {
    preparedSql: tempSql,
    paramKeys: keys,
  };
};
