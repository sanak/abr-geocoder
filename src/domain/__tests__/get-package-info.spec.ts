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
import { parsePackageJson } from '@domain/parse-package-json';
import { getPackageInfo } from '@domain/get-package-info';

jest.mock('@domain/upward-file-search')
jest.mock('@domain/parse-package-json');

/**
 * {@link getPackageInfo} のテストを実施します。
 */
describe('getPackageInfo test', () => {

    /**
     * パッケージ情報の取得が正常に取得できることを確認
     */
    it('get package info success', async () => {
        // モック定義
        (upwardFileSearch as jest.Mock).mockImplementation(() => Promise.resolve('c:\\hoge'));
        (parsePackageJson as jest.Mock).mockReturnValue({
            description: 'test',
            version: '1.1.1'
        })
        // テスト実施
        const result = await getPackageInfo()
        // 結果
        expect(result.description).toEqual('test');
        expect(result.version).toEqual('1.1.1');
    })

    /**
     * package.jsonが見つからない場合、エラーが返却されることを確認
     */
    it('get package info thorw err', async () => {
        // モック定義
        (upwardFileSearch as jest.Mock).mockImplementation(() => Promise.resolve(undefined));
        // テスト実施・結果
        await expect(
            getPackageInfo()
        ).rejects.toThrowError(new Error("Can not file the required file \"package.json\""))
    })
});
