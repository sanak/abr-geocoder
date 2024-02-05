/*!
 * MIT License
 *
 * Copyright (c) 2023 デジタル庁
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { City, ICity } from '@domain/city';
import { DataField } from '@domain/dataset/data-field';
import { IPrefecture, Prefecture } from '@domain/prefecture';
import { PrefectureName } from '@domain/prefecture-name';
import { DataSourceProvider } from '@interface-adapter/data-source-providers/data-source-provider';

export const getPrefecturesFromDB = async ({
  ds,
}: {
  ds: DataSourceProvider;
}): Promise<IPrefecture[]> => {
  const sql: string = `
    SELECT
      pref_name AS "name",
      json_group_array(json_object(
        'name', (
          "${DataField.COUNTY_NAME.dbColumn}" || 
          "${DataField.CITY_NAME.dbColumn}" || 
          "${DataField.OD_CITY_NAME.dbColumn}"
        ),
        '${DataField.LG_CODE.dbColumn}', "${DataField.LG_CODE.dbColumn}"
      )) AS "cities"
    FROM city
    GROUP BY pref_name
  `;
  const prepared = ds.prepare(sql);

  const prefectures = (await ds.query(prepared.sql)) as {
    name: string;
    cities: string;
  }[];
  return prefectures.map(value => {
    const townRawValues: ICity[] =
      typeof value.cities === 'string'
        ? JSON.parse(value.cities)
        : value.cities;
    const cities = townRawValues.map(value => {
      return new City(value);
    });

    return new Prefecture({
      name: value.name as PrefectureName,
      cities,
    });
  });
};
