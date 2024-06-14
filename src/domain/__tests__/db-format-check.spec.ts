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
import { dbFormatCheck } from '../db-format-check';
import { default as BetterSqlite3, default as Database } from 'better-sqlite3';
import { getMetadata } from '@domain/metadata/get-metadata';
import { DBFormatCheckResult } from '@domain/db-format-check-result';
import { getPackageInfo } from '@domain/get-package-info';

jest.mock<BetterSqlite3.Database>('better-sqlite3');
jest.mock('@domain/metadata/get-metadata');
jest.mock('@domain/get-package-info');

const MockedDB = Database as unknown as jest.Mock;

/**
 * {@link dbFormnatCheck} のテストを実施します。
 */
describe('dbFormnatCheck Test', () => {

    it('DB Format is undefind', async () => {
        // モック定義
        const mockedDB = new Database('<no sql file>');
        (getMetadata as jest.Mock).mockReturnValue(undefined);
        // テスト実施
        const result = await dbFormatCheck(mockedDB, 'ba000001')
        // 結果
        expect(result).toEqual(DBFormatCheckResult.UNDEFINED)
    });

    it('DB Format is matched', async () => {
        // モック定義
        const mockedDB = new Database('<no sql file>');
        (getMetadata as jest.Mock).mockReturnValue({
            ckanId: 'ba000001',
            formatVersion: '1.2.0',
            lastModified: '2023-12-31',
            contentLength: '1024',
            etag: 'aa-aa',
            fileUrl: 'https://aaa.com',
        });
        (getPackageInfo as jest.Mock).mockImplementation(() => Promise.resolve({
            version: "1.2.0",
            description: "test"
        }))
        // テスト実施
        const result = await dbFormatCheck(mockedDB, 'ba000001')
        // 結果
        expect(result).toEqual(DBFormatCheckResult.MATCHED)
    });

    it('DB Format is mismatched', async () => {
        // モック定義
        const mockedDB = new Database('<no sql file>');
        (getMetadata as jest.Mock).mockReturnValue({
            ckanId: 'ba000001',
            formatVersion: '1.1.0',
            lastModified: '2023-12-31',
            contentLength: '1024',
            etag: 'aa-aa',
            fileUrl: 'https://aaa.com',
        });
        (getPackageInfo as jest.Mock).mockImplementation(() => Promise.resolve({
            version: "1.2.0",
            description: "test"
        }))
        // テスト実施
        const result = await dbFormatCheck(mockedDB, 'ba000001')
        // 結果
        expect(result).toEqual(DBFormatCheckResult.MISMATCHED)
    });
})