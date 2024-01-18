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
  const matchedParams = tempSql.match(/@[a-zA-Z_0-9]+/g);
  if (matchedParams) {
    for (let i = 0; i < matchedParams.length; i++) {
      const matchedParam = matchedParams[i];
      const paramName = matchedParam.replace('@', '');
      keys.push(paramName);
      const placeHolder = '?';
      tempSql = tempSql.replace(matchedParam, placeHolder);
    }
  }
  return {
    preparedSql: tempSql,
    paramKeys: keys,
  };
};
