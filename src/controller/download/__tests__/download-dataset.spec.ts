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
import { downloadDataset } from '../download-dataset';
import { downloadProcess } from '../process/download-process';
import { extractDatasetProcess } from '../process/extract-dataset-process';
import { DOWNLOAD_DATASET_RESULT } from '../download-dataset-result';

jest.mock('fs');
jest.mock('node:fs');
jest.mock('winston');
// jest.mock('typeorm.DataSource');
jest.mock('@interface-adapter/setup-container');
jest.mock('@usecase/ckan-downloader/ckan-downloader');
jest.mock('@domain/key-store/get-value-with-key')
jest.mock('@domain/key-store/save-key-and-value')
jest.mock('@process/download-process');
jest.mock('@process/load-dataset-history');
jest.mock('@process/load-dataset-process');
jest.mock('@process/extract-dataset-process');

describe('downloadDataset', () => {
  it('should return "UPDATED" if update is available', async () => {

    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);

    const result = await downloadDataset({
      ckanId: 'first access',
      dataDir: 'somewhere',
    });

    expect(result).toBe(DOWNLOAD_DATASET_RESULT.SUCCESS);
    expect(existsSync).toBeCalledWith('somewhere/download/first access');
  });

  it('should involve fs.mkdir() with {recursive: true} if download path is not existed.', async () => {

    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(false);

    const result = await downloadDataset({
      ckanId: 'ckanId',
      dataDir: 'somewhere',
    });

    expect(mockedFs.promises.mkdir).toBeCalledWith('somewhere/download/ckanId', {
      recursive: true,
    });
  });

  it('should return "CAN_NOT_ACCESS_TO_DATASET_ERROR" if downloadProcess() return undefined.', async () => {

    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);

    (downloadProcess as jest.Mock).mockReturnValueOnce({});
    
    const result = await downloadDataset({
      ckanId: 'ckanId',
      dataDir: 'somewhere',
    });

    expect(result).toBe(DOWNLOAD_DATASET_RESULT.CAN_NOT_ACCESS_TO_DATASET_ERROR);
  });

  it('should return "NO_UPDATE_IS_AVAILABLE" if extractDatasetProcess() return an empty list.', async () => {

    const existsSync = mockedFs.existsSync;
    existsSync.mockReturnValueOnce(true);

    (extractDatasetProcess as jest.Mock).mockReturnValue([]);
    
    const result = await downloadDataset({
      ckanId: 'ckanId',
      dataDir: 'somewhere',
    });

    expect(result).toBe(DOWNLOAD_DATASET_RESULT.NO_UPDATE_IS_AVAILABLE);
  });

})