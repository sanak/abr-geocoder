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
import { AddressFinderForStep3and5 } from '@usecase/geocode/address-finder-for-step3and5';
import { MatchLevel } from '@domain/match-level';
import { PrefectureName } from '@domain/prefecture-name';
import { Query } from '@domain/query';
import { beforeAll, afterAll, describe, expect, it, jest } from '@jest/globals';
import { DataSourceProvider } from '@interface-adapter/data-source-providers/__mocks__/data-source-provider';
import Stream, { PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { GeocodingStep5 } from '../step5-transform';
import { WritableStreamToArray } from './stream-to-array.skip';

jest.mock<AddressFinderForStep3and5>('@usecase/geocode/address-finder-for-step3and5');

const createWriteStream = () => {
  return new WritableStreamToArray<Query>();
};

const createAddressFinder = () => {
  const ds = new DataSourceProvider();
  const wildcardHelper = (address: string) => address;
  const finder = new AddressFinderForStep3and5({
    ds,
    wildcardHelper,
  });
  return finder;
}
const createTestTarget = () => {
  const finder = createAddressFinder();
  return new GeocodingStep5(finder);
}

describe('step5-transform', () => {

  it.concurrent('市町村名が不明の場合はスキップ', async () => {
    const dummyData1 = Query.create('どこか');
    const outputWrite = createWriteStream();
    const target = createTestTarget();
    const findByCitySpy = jest.fn();
    Object.defineProperty(target, 'findByCity', {
      value: findByCitySpy,
    });
    
    await pipeline(
      Stream.Readable.from([
        dummyData1,
      ], {
        objectMode: true,
      }),
      target,
      outputWrite
    );

    // this.findByCitySpy() が呼び出されないことを確認する
    expect(findByCitySpy).not.toBeCalled();
  });

  describe('(private) normalization', () => {

    const outputWrite = createWriteStream();
    const source = [
      // findByCityで見つからないときの結果
      Query.create('広島県広島市のどこか').copy({
        prefecture: PrefectureName.HIROSHIMA,
        city: '広島市',
      }),
  
      // findByCityが正常に機能したときの結果
      Query.create('八幡市八幡園内75').copy({
        city: '八幡市',
        lat: 34.877027,
        lg_code: '262102',
        lon: 135.708529,
        match_level: 3,
        prefecture: PrefectureName.KYOTO,
        tempAddress: '75',
        town: '八幡園内',
        town_id: '0302000',
      }),

      // 「二十二番地」の部分が、「22」になることを期待
      Query.create('東京都府中市宮西町二丁目二十二番地').copy({
        city: '府中市',
        lat: 35.669764,
        lg_code: '132063',
        lon: 139.477636,
        match_level: 3,
        prefecture: PrefectureName.TOKYO,
        tempAddress: '二十二番地',
        town: '宮西町二丁目',
        town_id: '0015002',
      }),

      // 「1丁目3番地」の部分が、「一丁目3」になることを期待
      // https://github.com/digital-go-jp/abr-geocoder/issues/86
      Query.create('東京都千代田区紀尾井町1丁目3番地').copy({
        city: '千代田区',
        lat: 35.681411,
        lg_code: '131016',
        lon: 139.73495,
        match_level: 3,
        prefecture: PrefectureName.TOKYO,
        tempAddress: '1丁目3番地',
        town: '紀尾井町',
        town_id: '0056000',
      }),
    ];

    beforeAll(async () => {
      const target = createTestTarget();
      Object.defineProperty(target, 'findByCity', {
        value: (query: Query) => Promise.resolve(query),
      });
      
      await pipeline(
        Stream.Readable.from(source, {
          objectMode: true,
        }),
        target,
        outputWrite
      );
    });
    
    it('市町村名が不明な場合はスキップ', async () => {
      const results = outputWrite.toArray();
      expect(results.length).toBe(source.length);
      expect(results[0]).toEqual(source[0]);
    });
    
    it('変換する', async () => {
      const results = outputWrite.toArray();
      expect(results.length).toBe(source.length);
      expect(results[1]).toEqual(source[1]);
      expect(results[2]).toEqual(
        Query.create('東京都府中市宮西町二丁目二十二番地').copy({
          city: '府中市',
          lat: 35.669764,
          lg_code: '132063',
          lon: 139.477636,
          match_level: 3,
          prefecture: PrefectureName.TOKYO,
          tempAddress: '22',
          town: '宮西町二丁目',
          town_id: '0015002',
        }),
      )
      expect(results[3]).toEqual(
        Query.create('東京都千代田区紀尾井町1丁目3番地').copy({
          city: '千代田区',
          lat: 35.681411,
          lg_code: '131016',
          lon: 139.73495,
          match_level: 3,
          prefecture: PrefectureName.TOKYO,
          tempAddress: '1丁目3',
          town: '紀尾井町',
          town_id: '0056000',
        }),
      )
    });
  })

  describe('(private) findByCity', () => {
    const outputWrite = createWriteStream();
    const source = [
      Query.create('八幡市八幡園内75').copy({
        prefecture: PrefectureName.KYOTO,
        city: '八幡市',
        tempAddress: '八幡園内75',
        match_level: MatchLevel.ADMINISTRATIVE_AREA,
      }),
  
      Query.create('広島県広島市のどこか').copy({
        prefecture: PrefectureName.HIROSHIMA,
        city: '広島市',
      }),
    ];
  
    beforeAll(async () => {
      const target = createTestTarget();
      Object.defineProperty(target, 'normalize', {
        value: new PassThrough(),
      });
      
      await pipeline(
        Stream.Readable.from(source, {
          objectMode: true,
        }),
        target,
        outputWrite
      );
    });
  
    it('期待する値を返すはず', async () => {
      const results = outputWrite.toArray();
      expect(results.length).toBe(source.length);
      expect(results[0]).toEqual(
        Query.create('八幡市八幡園内75').copy({
          city: '八幡市',
          lat: 34.877027,
          lg_code: '262102',
          lon: 135.708529,
          match_level: 3,
          prefecture: PrefectureName.KYOTO,
          tempAddress: '75',
          town: '八幡園内',
          town_id: '0302000',
        })
      );
    });
  
    it('見つけられないとき、Queryを返す', async () => {
      const results = outputWrite.toArray();
      expect(results.length).toBe(source.length);
      expect(results[1]).toEqual(source[1]);
    });
  });
});
