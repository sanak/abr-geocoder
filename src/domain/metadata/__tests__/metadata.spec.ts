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
import { Metadata } from '../metadata';

/**
 * {@link Metadata} をテストを実施します。
 */
describe('Metadata test', () => {

    it('convert to json is successed', async () => {
        // テストデータ
        const param = {
            ckanId: 'ba000001',
            formatVersion: '1.0.0',
            lastModified: '2023/12/26',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://aaa.com'
        }
        const metadata = new Metadata(param);
        // テスト実施
        const result = metadata.toJSON();
        // 結果
        expect(result).toEqual({ "ckanId": "ba000001", "formatVersion": "1.0.0", "contentLength": 1024, "etag": "aaa", "fileUrl": "https://aaa.com", "lastModified": "2023/12/26" });
    })

    it('convert to string is successed', async () => {
        // テストデータ
        const param = {
            ckanId: 'ba000001',
            formatVersion: '1.0.0',
            lastModified: '2023/12/26',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://aaa.com'
        }
        const metadata = new Metadata(param);
        // テスト実施
        const result = metadata.toString();
        // 結果
        expect(result).toEqual("{\"ckanId\":\"ba000001\",\"formatVersion\":\"1.0.0\",\"lastModified\":\"2023/12/26\",\"contentLength\":1024,\"etag\":\"aaa\",\"fileUrl\":\"https://aaa.com\"}");
    })

    it('equal is trued', async () => {
        // テストデータ
        const param = {
            ckanId: 'ba000001',
            formatVersion: '1.0.0',
            lastModified: '2023/12/26',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://aaa.com'
        }
        const metadata = new Metadata(param);
        const testMetadata = new Metadata(param);
        // テスト実施
        const result = metadata.equal(testMetadata);
        // 結果
        expect(result).toBe(true);
    })

    it('equal is failed', async () => {
        // テストデータ
        const param = {
            ckanId: 'ba000001',
            formatVersion: '1.0.0',
            lastModified: '2023/12/26',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://aaa.com'
        }
        const metadata = new Metadata(param);
        const testParam = {
            ckanId: 'ba000001',
            formatVersion: '2.0.0',
            lastModified: '2023/12/26',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://aaa.com'
        }
        const testMetadata = new Metadata(testParam);
        // テスト実施
        const result = metadata.equal(testMetadata);
        // 結果
        expect(result).toBe(false);
    })

    it('equal target undifined', async () => {
        // テストデータ
        const param = {
            ckanId: 'ba000001',
            formatVersion: '1.0.0',
            lastModified: '2023/12/26',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://aaa.com'
        }
        const metadata = new Metadata(param);
        // テスト実施
        const result = metadata.equal(undefined);
        // 結果
        expect(result).toBe(false);
    })

    it('convert from string to Metadata is successed', async () => {
        // テストデータ
        const metadataString: string = "{\"ckanId\":\"ba000001\",\"formatVersion\":\"1.0.0\",\"lastModified\":\"2023/12/26\",\"contentLength\":1024,\"etag\":\"aaa\",\"fileUrl\":\"https://aaa.com\"}"
        // テスト実施
        const result: Metadata = Metadata.from(metadataString)
        // 結果
        const param = {
            ckanId: 'ba000001',
            formatVersion: '1.0.0',
            lastModified: '2023/12/26',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://aaa.com'
        }
        const actual: Metadata = new Metadata(param);
        expect(result).toEqual(actual);
    })

    it('convert from string to Metadata is failed', async () => {
        // テストデータ
        const metadataString: string = "{\"ckanId\":\"ba000001\",\"lastModified\":\"2023/12/26\",\"contentLength\":1024,\"etag\":\"aaa\",\"fileUrl\":\"https://aaa.com\"}"
        // テスト実施・結果
        expect(
            () => Metadata.from(metadataString)
        ).toThrowError(new Error('Can not parse value as Metadata'))
    })
})