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
import { OutputFormat } from '@domain/output-format';
import { describe, expect, it, jest } from '@jest/globals';
import { GEOCODE_RESULT, geocode } from '../geocode';
import { DBFormatCheckResult } from '@domain/db-format-check-result';
import { dbFormatCheck } from '@domain/db-format-check';
import { SearchTarget } from '@domain/search-target';

jest.dontMock('../geocode');
jest.mock('fs');
jest.mock('@domain/geocode/get-read-stream-from-source');
jest.mock('@interface-adapter/setup-container');
jest.mock('../stream-geocoder');
jest.mock('@domain/db-format-check');

/**
 * {@link geocode} のテストを実施します。
 */
describe('geocoding test', () => {
  it('should return ON_GECODING_RESULT.SUCCESS if db is version matched.', async () => {
    // モック定義
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    // テスト実施
    const result = await geocode({
      ckanId: 'ba00001',
      dataDir: './somewhere',
      destination: './output.txt',
      format: OutputFormat.CSV,
      target: SearchTarget.ALL,
      source: './input.txt',
    });

    expect(result).toBe(GEOCODE_RESULT.SUCCESS);
  });

  it.concurrent('should return ON_GECODING_RESULT.SUCCESS', async () => {
    const result = await geocode({
      ckanId: 'ba00001',
      dataDir: './somewhere',
      destination: './output.txt',
      format: OutputFormat.CSV,
      target: SearchTarget.PARCEL,
      source: './input.txt',
    });
    // 結果
    expect(result).toBe(GEOCODE_RESULT.SUCCESS);
  });

  it('should return CANNOT_FIND_INPUT_FILE if db is undefined.', async () => {
    // モック定義
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.UNDEFINED);
    // テスト実施・結果
    await expect(geocode({
      ckanId: 'ba00001',
      dataDir: './somewhere',
      destination: './output.txt',
      format: OutputFormat.CSV,
      target: SearchTarget.ALL,
      source: './input.txt',
    })).rejects.toThrowError(new Error('Can not open the source file'))
  });

  it('should return CANNOT_FIND_INPUT_FILE if db is undefined.', async () => {
    // モック定義
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MISMATCHED);
    // テスト実施・結果
    await expect(geocode({
      ckanId: 'ba00001',
      dataDir: './somewhere',
      destination: './output.txt',
      format: OutputFormat.CSV,
      target: SearchTarget.ALL,
      source: './input.txt',
    })).rejects.toThrowError(new Error('DB definition is invalid. DB needs to be recreated.'))
  });
})