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
import { upwardFileSearch } from '@domain/upward-file-search';
import fs from 'node:fs'
import path from 'node:path';

jest.mock('node:fs')

/**
 * {@link upwardFileSearch} のテストを実施します。
 */
describe('upwardFileSearch test', () => {
    it('up ward file search success', async () => {
        // モック定義
        (fs.promises.readdir as jest.Mock) =
            jest.fn<(_: any) => Promise<string[]>>()
                .mockResolvedValueOnce(['path1', 'path2'])
                .mockResolvedValueOnce(['package.json']);
        // テスト実施
        const result = await upwardFileSearch('demo_path', 'package.json');
        // 結果
        expect(result).toEqual(path.resolve('package.json'));
    })

    it('up ward file search failed', async () => {
        // モック定義
        (fs.promises.readdir as jest.Mock) =
            jest.fn<(_: any) => Promise<string[]>>().mockResolvedValueOnce(['hoge'])
        // テスト実施
        const result = await upwardFileSearch('demo_path', 'package.json');
        // 結果
        expect(result).toBeUndefined;
    })
})

