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
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DataSourceProvider } from '@interface-adapter/data-source-providers/__mocks__/data-source-provider';

jest.mock('@domain/http/head-request');

import { CkanDownloader } from '../ckan-downloader'; // adjust this import according to your project structure

describe('CkanDownloader', () => {
  let ckanDownloader: CkanDownloader;

  beforeEach(() => {
    ckanDownloader = new CkanDownloader({
      userAgent: 'testUserAgent',
      datasetUrl: 'testDatasetUrl',
      ds: new DataSourceProvider(),
      ckanId: 'testCkanId',
      dstDir: 'testDstDir',
    });
  });

  it('getDatasetMetadata method should be defined', () => {
    expect(ckanDownloader.getDatasetMetadata).toBeDefined();
  });

  it('updateCheck method should be defined', () => {
    expect(ckanDownloader.updateCheck).toBeDefined();
  });
});
