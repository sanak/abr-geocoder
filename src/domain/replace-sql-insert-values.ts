import { DataSource } from 'typeorm';

export const replaceSqlInsertValues = (
  ds: DataSource,
  sql: string,
  paramsCount: number,
  rowCount: number
): string => {
  let tempSql = sql;
  const dsType = ds.options.type;
  const rows = [];
  const pattern =
    dsType === 'postgres'
      ? /VALUES[\s\n]*\([\s\n$0-9,]+\)/im
      : /VALUES[\s\n]*\([\s\n?,]+\)/im;
  const matchedInsertValues = tempSql.match(pattern);
  if (matchedInsertValues) {
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const placeHolders = [];
      for (let paramIdx = 0; paramIdx < paramsCount; paramIdx++) {
        const placeHolder =
          dsType === 'postgres'
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
  }
  return tempSql;
};
