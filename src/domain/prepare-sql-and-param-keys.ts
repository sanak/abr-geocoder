import { DataSource } from 'typeorm';

export const prepareSqlAndParamKeys = (
  ds: DataSource,
  sql: string,
  usePgFormat?: boolean
): {
  preparedSql: string;
  paramKeys: string[];
} => {
  let tempSql = sql;
  const keys = [];
  const dbType = ds.options.type;
  const matchedParams = tempSql.match(/@[a-zA-Z_0-9]+/g);
  if (matchedParams) {
    for (let i = 0; i < matchedParams.length; i++) {
      const matchedParam = matchedParams[i];
      const paramName = matchedParam.replace('@', '');
      keys.push(paramName);
      const placeHolder = dbType === 'postgres' ? `$${i + 1}` : '?';
      tempSql = tempSql.replace(matchedParam, placeHolder);
    }
  }
  const matchedInsertOrReplace = tempSql.match(/^INSERT OR REPLACE INTO/i);
  if (matchedInsertOrReplace) {
    if (dbType === 'postgres') {
      tempSql = tempSql.replace(matchedInsertOrReplace[0], 'INSERT INTO');
      if (usePgFormat) {
        tempSql = tempSql.replace(/VALUES\s*\([\s$0-9,]+\)/m, 'VALUES %L ');
      }
      tempSql = tempSql.replace(/--/g, '');
    }
  }
  return {
    preparedSql: tempSql,
    paramKeys: keys,
  };
};
