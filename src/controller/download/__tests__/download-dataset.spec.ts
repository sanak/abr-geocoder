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
import mockedFs from '@mock/fs';
import { default as BetterSqlite3 } from 'better-sqlite3';
import { downloadDataset } from '@controller/download/download-dataset';
import { downloadProcess } from '@process/download-process';
import { DOWNLOAD_DATASET_RESULT } from '@controller/download/download-dataset-result';
import { DBFormatCheckResult } from '@domain/db-format-check-result';
import { dbFormatCheck } from '@domain/db-format-check';
import { getLgCodesFromDB } from '@domain/geocode/get-lg-codes-from-db';
import { downloadParcelProcess } from '@process/download-parcel-process';
import { checkPrefCode } from '@domain/check-pref-code';
import { CliDefaultValues } from '@settings/cli-default-values';

jest.mock('fs');
jest.mock('node:fs');
jest.mock('winston');
jest.mock<BetterSqlite3.Database>('better-sqlite3');
jest.mock('@interface-adapter/setup-container');
jest.mock('@usecase/ckan-downloader/ckan-downloader');
jest.mock('@domain/metadata/get-metadata')
jest.mock('@domain/metadata/save-metadata')
jest.mock('@process/download-process');
jest.mock('@process/load-dataset-history');
jest.mock('@process/load-dataset-process');
jest.mock('@process/extract-dataset-process');
jest.mock('@domain/db-format-check');
jest.mock('@domain/geocode/get-lg-codes-from-db');
jest.mock('@process/download-parcel-process')
jest.mock('@domain/check-pref-code')

/**
 * {@link downloadDataset} のテストを実施します。
 */
describe('downloadDataset test', () => {

  it('should involve fs.mkdir() with {recursive: true} if download path is not existed.', async () => {
    // モック定義
    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(false);
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    (getLgCodesFromDB as jest.Mock).mockReturnValue(['0000001']);
    (downloadParcelProcess as jest.Mock).mockImplementation(() => {})
    // テスト実施
    const result = await downloadDataset({
      ckanId: 'first access',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(mockedFs.promises.mkdir).toBeCalledWith('somewhere/download/first access', {
      recursive: true,
    });
  });

  it('should return "SUCCESS" if update is available and db is version matched.', async () => {
    // モック定義
    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    (getLgCodesFromDB as jest.Mock).mockReturnValue(['0000001']);
    (downloadParcelProcess as jest.Mock).mockImplementation(() => {})
    // テスト実施
    const result = await downloadDataset({
      ckanId: 'first access',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(DOWNLOAD_DATASET_RESULT.SUCCESS);
    expect(existsSync).toBeCalledWith('somewhere/download/first access');
  });

  it('should return "SUCCESS" if update is available and db is not defined.', async () => {
    // モック定義
    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.UNDEFINED);
    (getLgCodesFromDB as jest.Mock).mockReturnValue(['0000001']);
    (downloadParcelProcess as jest.Mock).mockImplementation(() => {})
    // テスト実施
    const result = await downloadDataset({
      ckanId: 'first access',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(DOWNLOAD_DATASET_RESULT.SUCCESS);
    expect(existsSync).toBeCalledWith('somewhere/download/first access');
  });

  it('should return "DB_FORMAT_MISMATCHED" if update is available and db is version mismatched.', async () => {
    // モック定義
    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MISMATCHED);
    // テスト実施
    const result = await downloadDataset({
      ckanId: 'first access',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(DOWNLOAD_DATASET_RESULT.DB_FORMAT_MISMATCHED);
    expect(existsSync).toBeCalledWith('somewhere/download/first access');
  });

  it('should return "CAN_NOT_ACCESS_TO_DATASET_ERROR" if downloadProcess() return undefined.', async () => {
    // モック定義
    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    (downloadProcess as jest.Mock).mockReturnValueOnce({});
    // テスト実施
    const result = await downloadDataset({
      ckanId: 'ckanId',
      dataDir: 'somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(DOWNLOAD_DATASET_RESULT.CAN_NOT_ACCESS_TO_DATASET_ERROR);
  });

  it('should return "NO_UPDATE_IS_AVAILABLE" if ckan all, parcel, parcel_pos is not update.', async () => {
    // モック定義
    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);
    (checkPrefCode as jest.Mock).mockReturnValue(true);
    (dbFormatCheck as jest.Mock).mockReturnValue(DBFormatCheckResult.MATCHED);
    (getLgCodesFromDB as jest.Mock).mockReturnValue(['0000002']);
    (downloadParcelProcess as jest.Mock).mockImplementation(() => {})
    // テスト実施
    const result = await downloadDataset({
      ckanId: 'no update',
      dataDir: 'noupdate_somewhere',
      prefCode: CliDefaultValues.PREF_CODE
    });
    // 結果
    expect(result).toBe(DOWNLOAD_DATASET_RESULT.NO_UPDATE_IS_AVAILABLE);
  });

  it('should return "PARAMETER_ERROR" if input pref code is invalid.', async () => {
    // モック定義
    (checkPrefCode as jest.Mock).mockReturnValue(false);
    // テスト実施
    const result = await downloadDataset({
      ckanId: 'no update',
      dataDir: 'noupdate_somewhere',
      prefCode: 'InvalidPrefCode'
    });
    // 結果
    expect(result).toBe(DOWNLOAD_DATASET_RESULT.PARAMETER_ERROR);
  });
})