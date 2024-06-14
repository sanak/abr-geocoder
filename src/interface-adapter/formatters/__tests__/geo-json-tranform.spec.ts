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
import { describe, expect, it } from '@jest/globals';
import { Stream } from 'node:stream';
import { GeoJsonTransform } from '../geo-json-transform';
import { dummyData } from './dummy-data';
import { BLANK_CHAR, BREAK_AT_EOF } from '@settings/constant-values';
import { MatchLevel } from '@domain/match-level';

describe('GeoJsonTransform', () => {
  it('should output rows with expected JSON format()', async () => {
    const transform = GeoJsonTransform.create();

    const expectJson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              139.73495,
              35.681411
            ]
          },
          "properties": {
            "query": {
              "input": "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階"
            },
            "result": {
              "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
              "matching_level": MatchLevel.RESIDENTIAL_DETAIL,
              "lg_code": "131016",
              "pref": "東京都",
              "city": "千代田区",
              "machiaza": "紀尾井町",
              "machiaza_id": "0056000",
              "blk_num": "1",
              "blk_id": "001",
              "rsdt_num": "3",
              "rsdt_id": "003",
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": BLANK_CHAR,
              "prc_num2": BLANK_CHAR,
              "prc_num3": BLANK_CHAR,
              "prc_id": BLANK_CHAR,
              "other": " 東京ガーデンテラス紀尾井町 19階、20階"
            }
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              139.73495,
              35.681411
            ]
          },
          "properties": {
            "query": {
              "input": "東京都千代田区紀尾井町1"
            },
            "result": {
              "output": "東京都千代田区紀尾井町1",
              "matching_level": MatchLevel.RESIDENTIAL_BLOCK,
              "lg_code": "131016",
              "pref": "東京都",
              "city": "千代田区",
              "machiaza": "紀尾井町",
              "machiaza_id": "0056000",
              "blk_num": "1",
              "blk_id": "001",
              "rsdt_num": BLANK_CHAR,
              "rsdt_id": BLANK_CHAR,
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": BLANK_CHAR,
              "prc_num2": BLANK_CHAR,
              "prc_num3": BLANK_CHAR,
              "prc_id": BLANK_CHAR,
              "other": BLANK_CHAR
            }
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              140.339126,
              38.255437
            ]
          },
          "properties": {
            "query": {
              "input": "山形県山形市旅篭町二丁目3番25号"
            },
            "result": {
              "output": "山形県山形市旅篭町二丁目3-25",
              "matching_level": MatchLevel.RESIDENTIAL_DETAIL,
              "lg_code": "062014",
              "pref": "山形県",
              "city": "山形市",
              "machiaza": "旅篭町二丁目",
              "machiaza_id": "0247002",
              "blk_num": "3",
              "blk_id": "003",
              "rsdt_num": "25",
              "rsdt_id": "025",
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": BLANK_CHAR,
              "prc_num2": BLANK_CHAR,
              "prc_num3": BLANK_CHAR,
              "prc_id": BLANK_CHAR,
              "other": BLANK_CHAR
            }
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              140.339126,
              38.255437
            ]
          },
          "properties": {
            "query": {
              "input": "山形市旅篭町二丁目3番25号"
            },
            "result": {
              "output": "山形県山形市旅篭町二丁目3-25",
              "matching_level": MatchLevel.RESIDENTIAL_DETAIL,
              "lg_code": "062014",
              "pref": "山形県",
              "city": "山形市",
              "machiaza": "旅篭町二丁目",
              "machiaza_id": "0247002",
              "blk_num": "3",
              "blk_id": "003",
              "rsdt_num": "25",
              "rsdt_id": "025",
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": BLANK_CHAR,
              "prc_num2": BLANK_CHAR,
              "prc_num3": BLANK_CHAR,
              "prc_id": BLANK_CHAR,
              "other": BLANK_CHAR
            }
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              139.440264,
              35.548247
            ]
          },
          "properties": {
            "query": {
              "input": "東京都町田市森野2-2-22"
            },
            "result": {
              "output": "東京都町田市森野二丁目2-22",
              "matching_level": MatchLevel.RESIDENTIAL_DETAIL,
              "lg_code": "132098",
              "pref": "東京都",
              "city": "町田市",
              "machiaza": "森野二丁目",
              "machiaza_id": "0006002",
              "blk_num": "2",
              "blk_id": "002",
              "rsdt_num": "22",
              "rsdt_id": "022",
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": BLANK_CHAR,
              "prc_num2": BLANK_CHAR,
              "prc_num3": BLANK_CHAR,
              "prc_id": BLANK_CHAR,
              "other": BLANK_CHAR
            }
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              133.049814,
              35.467467
            ]
          },
          "properties": {
            "query": {
              "input": "島根県松江市末次町23-10"
            },
            "result": {
              "output": "島根県松江市末次町23-10",
              "matching_level": MatchLevel.PARCEL,
              "lg_code": "322016",
              "pref": "島根県",
              "city": "松江市",
              "machiaza": "末次町",
              "machiaza_id": "0083000",
              "blk_num": BLANK_CHAR,
              "blk_id": BLANK_CHAR,
              "rsdt_num": BLANK_CHAR,
              "rsdt_id": BLANK_CHAR,
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": "23",
              "prc_num2": "10",
              "prc_num3": BLANK_CHAR,
              "prc_id": "000230001000000",
              "other": BLANK_CHAR
            }
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              133.049814,
              35.467467
            ]
          },
          "properties": {
            "query": {
              "input": "島根県松江市末次町23番10号"
            },
            "result": {
              "output": "島根県松江市末次町23-10",
              "matching_level": MatchLevel.PARCEL,
              "lg_code": "322016",
              "pref": "島根県",
              "city": "松江市",
              "machiaza": "末次町",
              "machiaza_id": "0083000",
              "blk_num": BLANK_CHAR,
              "blk_id": BLANK_CHAR,
              "rsdt_num": BLANK_CHAR,
              "rsdt_id": BLANK_CHAR,
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": "23",
              "prc_num2": "10",
              "prc_num3": BLANK_CHAR,
              "prc_id": "000230001000000",
              "other": BLANK_CHAR
            }
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              null,
              null
            ]
          },
          "properties": {
            "query": {
              "input": "無効な値"
            },
            "result": {
              "output": "無効な値",
              "matching_level": MatchLevel.UNKNOWN,
              "lg_code": BLANK_CHAR,
              "pref": BLANK_CHAR,
              "city": BLANK_CHAR,
              "machiaza": BLANK_CHAR,
              "machiaza_id": BLANK_CHAR,
              "blk_num": BLANK_CHAR,
              "blk_id": BLANK_CHAR,
              "rsdt_num": BLANK_CHAR,
              "rsdt_id": BLANK_CHAR,
              "rsdt_num2": BLANK_CHAR,
              "rsdt2_id": BLANK_CHAR,
              "prc_num1": BLANK_CHAR,
              "prc_num2": BLANK_CHAR,
              "prc_num3": BLANK_CHAR,
              "prc_id": BLANK_CHAR,
              "other": "無効な値"
            }
          }
        }
      ]
    };

    const buffer: string[] = [];
    const writable = new Stream.Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        buffer.push(chunk.toString());
        callback();
      },
    })
    const readStream = Stream.Readable.from(dummyData);

    await Stream.promises.pipeline(
      readStream,
      transform,
      writable,
    )

    expect(buffer.at(-1)).toEqual(BREAK_AT_EOF);
    buffer.pop();

    const result = JSON.parse(buffer.join(''));
    expect(result).toEqual(expectJson);
  });
});
