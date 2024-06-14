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
import { MatchLevel } from '@domain/match-level';
import { describe, expect, it, jest } from '@jest/globals';
import { ApiGeocoder } from "../api-geocoder";

jest.spyOn(ApiGeocoder.prototype, 'geocode')
  .mockImplementation(async () => {
    return JSON.stringify([
      {
        "query":{
          "input":"東京都文京区"
        },
        "result":{
          "output":"東京都文京区",
          "matching_level":MatchLevel.ADMINISTRATIVE_AREA,
          "lg_code":null,
          "pref":"東京都",
          "city":"文京区",
          "machiaza":null,
          "machiaza_id":null,
          "blk_num":null,
          "blk_id":null,
          "rsdt_num":null,
          "rsdt_id":null,
          "rsdt_num2":null,
          "rsdt2_id":null,
          "prc_num1":null,
          "prc_num2":null,
          "prc_num3":null,
          "prc_id":null,
          "other":null,
          "lat":null,
          "lon":null
        }
      }
    ]);
  });

describe("api-geocoder", () => {
    describe("geocoder", () => {
        it("geocoder", async () => {
            const apiGeocoder = new ApiGeocoder();

            const testAddr = "東京都文京区";
            const testOption = "";
            const expectResult = JSON.stringify([
              {
                "query":{
                  "input":"東京都文京区"
                },
                "result":{
                  "output":"東京都文京区",
                  "matching_level":MatchLevel.ADMINISTRATIVE_AREA,
                  "lg_code":null,
                  "pref":"東京都",
                  "city":"文京区",
                  "machiaza":null,
                  "machiaza_id":null,
                  "blk_num":null,
                  "blk_id":null,
                  "rsdt_num":null,
                  "rsdt_id":null,
                  "rsdt_num2":null,
                  "rsdt2_id":null,
                  "prc_num1":null,
                  "prc_num2":null,
                  "prc_num3":null,
                  "prc_id":null,
                  "other":null,
                  "lat":null,
                  "lon":null
                }
              }
            ]);
            const result = await apiGeocoder.geocode(testAddr);
            await expect(result).toEqual(expectResult);
        });
    });
});