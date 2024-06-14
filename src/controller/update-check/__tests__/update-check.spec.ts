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

import { describe, expect, it, jest } from '@jest/globals';
import { updateCheck } from '../update-check';
import { UPDATE_CHECK_RESULT } from '../update-check-result';
import { DBFormatCheckResult } from '@domain/db-format-check-result';
import { dbFormatCheck } from '@domain/db-format-check';
import { getLgCodesFromDB } from '@domain/geocode/get-lg-codes-from-db';
import { ParcelDownloder } from '@usecase/parcel-downloader/parcel-downloader';
import { checkPrefCode } from '@domain/check-pref-code';
import { CliDefaultValues } from '@settings/cli-default-values';

jest.mock('@interface-adapter/setup-container');
jest.mock('@usecase/ckan-downloader/ckan-downloader');
jest.mock('@domain/db-format-check');
jest.mock('@usecase/parcel-downloader/parcel-downloader');
jest.mock('@domain/geocode/get-lg-codes-from-db');
jest.mock('@domain/check-pref-code')

/**
 * {@link updateCheck} のテストを実施します。
 */
describe('updateCheck test', () => {
  it('should return "NEW_DATASET_IS_AVAILABLE" if db is not defined and CkanId is update.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.UNDEFINED);
    // テスト実施
    const result = await updateCheck({
      ckanId: 'updateCkanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.NEW_DATASET_IS_AVAILABLE);
  });

  it('should return "NEW_DATASET_IS_AVAILABLE" if db is not defined, CkanId is no update and Parcel is update.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.UNDEFINED);
    (getLgCodesFromDB as jest.Mock).mockReturnValue(['updateLgCode']);
    (ParcelDownloder as unknown as jest.Mock).mockImplementationOnce((_: any) => {
      return {
          updateCheckParcelAndPos: () => {
              return true
          }
      }
    });
    // テスト実施
    const result = await updateCheck({
      ckanId: 'noUpdateCkanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.NEW_DATASET_IS_AVAILABLE);
  });

  it('should return "NO_UPDATE_IS_AVAILABLE" if db is not defined, CkanId is no update and Parcel is no update.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.UNDEFINED);
    (ParcelDownloder as unknown as jest.Mock).mockImplementationOnce((_: any) => {
      return {
          updateCheckParcelAndPos: () => {
              return false
          }
      }
    });
    // テスト実施
    const result = await updateCheck({
      ckanId: 'noUpdateCkanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.NO_UPDATE_IS_AVAILABLE);
  });

  it('should return "ERROR_DB_FORMAT_MISMATCHED" if db is not mismatched.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MISMATCHED);
    // テスト実施
    const result = await updateCheck({
      ckanId: 'noUpdateCkanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.DB_FORMAT_MISMATCHED);
  });

  it('should return "NEW_DATASET_IS_AVAILABLE" if db is matched and CkanId is update.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    // テスト実施
    const result = await updateCheck({
      ckanId: 'updateCkanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.NEW_DATASET_IS_AVAILABLE);
  });

  it('should return "NEW_DATASET_IS_AVAILABLE" if db is matched, CkanId is no update and Parcel is update.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    (getLgCodesFromDB as jest.Mock).mockReturnValue(['updateLgCode']);
    (ParcelDownloder as unknown as jest.Mock).mockImplementationOnce((_: any) => {
      return {
          updateCheckParcelAndPos: () => {
              return true
          }
      }
    });
    // テスト実施
    const result = await updateCheck({
      ckanId: 'noUpdateCkanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.NEW_DATASET_IS_AVAILABLE);
  });

  it('should return "NO_UPDATE_IS_AVAILABLE" if db is not defined, CkanId is no update and Parcel is no update.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    (getLgCodesFromDB as jest.Mock).mockReturnValue(['noUpdateLgCode']);
    (ParcelDownloder as unknown as jest.Mock).mockImplementationOnce((_: any) => {
      return {
          updateCheckParcelAndPos: () => {
              return false
          }
      }
    });
    // テスト実施
    const result = await updateCheck({
      ckanId: 'noUpdateCkanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.NO_UPDATE_IS_AVAILABLE);
  });

  it('should return "PARAMETER_ERROR" if input pref code is invalid.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(false);
    // テスト実施
    const result = await updateCheck({
      ckanId: 'no update',
      dataDir: 'noupdate_somewhere',
      prefCode: 'InvalidPrefCode'
    });
    // 結果
    expect(result).toBe(UPDATE_CHECK_RESULT.PARAMETER_ERROR);
  });
})