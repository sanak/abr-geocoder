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
  const dsType = ds.options.type;
  const matchedParams = tempSql.match(/@[a-zA-Z_0-9]+/g);
  if (matchedParams) {
    for (let i = 0; i < matchedParams.length; i++) {
      const matchedParam = matchedParams[i];
      const paramName = matchedParam.replace('@', '');
      keys.push(paramName);
      const placeHolder = dsType === 'postgres' ? `$${i + 1}` : '?';
      tempSql = tempSql.replace(matchedParam, placeHolder);
    }
  }
  const matchedInsertOrReplace = tempSql.match(/^INSERT OR REPLACE INTO/i);
  if (matchedInsertOrReplace) {
    if (dsType === 'postgres') {
      tempSql = tempSql.replace(matchedInsertOrReplace[0], 'INSERT INTO');
      tempSql = tempSql.replace(/-- /g, '');
    } else if (dsType === 'mysql') {
      tempSql = tempSql.replace(matchedInsertOrReplace[0], 'REPLACE INTO');
    }
  }
  const matchedJSONFunctions = tempSql.match(
    /(json_group_array|json_object)/gi
  );
  if (matchedJSONFunctions) {
    for (let i = 0; i < matchedJSONFunctions.length; i++) {
      const matchedJSONFucntion = matchedJSONFunctions[i];
      if (matchedJSONFucntion.toLowerCase() === 'json_group_array') {
        if (dsType === 'postgres') {
          tempSql = tempSql.replace(matchedJSONFucntion, 'json_agg');
        }
      } else if (matchedJSONFucntion.toLowerCase() === 'json_object') {
        if (dsType === 'postgres') {
          tempSql = tempSql.replace(matchedJSONFucntion, 'json_build_object');
        }
      }
    }
  }
  return {
    preparedSql: tempSql,
    paramKeys: keys,
  };
};
