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
    switch (dsType) {
      case 'postgres':
        tempSql = tempSql.replace(matchedInsertOrReplace[0], 'INSERT INTO');
        tempSql = tempSql.replace(/-- /g, '');
        break;

      case 'mysql':
        tempSql = tempSql.replace(matchedInsertOrReplace[0], 'REPLACE INTO');
        break;

      default:
        break;
    }
  }
  const matchedJSONFunctions = tempSql.match(
    /(json_group_array|json_object)/gi
  );
  if (!matchedJSONFunctions) {
    return {
      preparedSql: tempSql,
      paramKeys: keys,
    };
  }

  matchedJSONFunctions.forEach(matchedJSONFucntion => {
    const functionName = matchedJSONFucntion.toLowerCase();
    switch (`${functionName}-${dsType}`) {
      case 'json_group_array-postgress':
        tempSql = tempSql.replace(matchedJSONFucntion, 'json_agg');
        break;

      case 'json_group_array-mysql':
        tempSql = tempSql.replace(matchedJSONFucntion, 'json_arrayagg');
        break;

      case 'json_object-postgres':
        tempSql = tempSql.replace(matchedJSONFucntion, 'json_build_object');
        break;

      default:
        break;
    }
  });

  return {
    preparedSql: tempSql,
    paramKeys: keys,
  };
};
