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
import { DatasetMetadata } from '@domain/dataset-metadata/dataset-metadata';

/**
 * {@link DatasetMetadata} をテストを実施します。
 */
describe('DatasetMetadata test', () => {

    it('JSON形式への変換が正常に行われることを確認', async () => {
        // テストデータ
        const datasetMetadata = new DatasetMetadata({
            dataset_id: 'ba-o1-011011_g2-000010',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip',
            lastModified: '2023/12/26'
        });
        // テスト実施
        const result = datasetMetadata.toJSON();
        // 結果
        expect(result).toEqual({
            "dataset_id": "ba-o1-011011_g2-000010",
            "contentLength": 1024,
            "etag": "aaa",
            "fileUrl": "https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip",
            "lastModified": "2023/12/26"
        });
    })

    it('文字列形式への変換が正常に行われることを確認', async () => {
        // テストデータ
        const datasetMetadata = new DatasetMetadata({
            dataset_id: 'ba-o1-011011_g2-000010',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip',
            lastModified: '2023/12/26'
        });
        // テスト実施
        const result = datasetMetadata.toString();
        // 結果
        expect(result).toEqual(
            "{\"dataset_id\":\"ba-o1-011011_g2-000010\",\"lastModified\":\"2023/12/26\",\"contentLength\":1024,\"etag\":\"aaa\",\"fileUrl\":\"https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip\"}"
            );
    })

    it('比較処理で同等の場合Trueが返却されることを確認', async () => {
        // テストデータ
        const param = {
            dataset_id: 'ba-o1-011011_g2-000010',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip',
            lastModified: '2023/12/26'
        }
        const datasetMetadata = new DatasetMetadata(param);
        const TestDatasetMetadata = new DatasetMetadata(param);
        // テスト実施
        const result = datasetMetadata.equal(TestDatasetMetadata);
        // 結果
        expect(result).toBe(true);
    })

    it('比較処理で同等でない場合Falseが返却されることを確認', async () => {
        // テストデータ
        const param = {
            dataset_id: 'ba-o1-011011_g2-000010',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip',
            lastModified: '2023/12/26'
        }
        const datasetMetadata = new DatasetMetadata(param);
        const testParam = {
            dataset_id: 'ba-o1-011011_g2-000011',
            contentLength: 1024,
            etag: 'bbb',
            fileUrl: 'https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_pos_city011011.csv.zip',
            lastModified: '2023/12/26'
        }
        const testDatasetMetadata = new DatasetMetadata(testParam);
        // テスト実施
        const result = datasetMetadata.equal(testDatasetMetadata);
        // 結果
        expect(result).toBe(false);
    })

    it('比較処理で比較対象がundefinedの場合Falseが返却されることを確認', async () => {
        // テストデータ
        const datasetMetadata = new DatasetMetadata({
            dataset_id: 'ba-o1-011011_g2-000010',
            contentLength: 1024,
            etag: 'aaa',
            fileUrl: 'https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip',
            lastModified: '2023/12/26'
        });
        // テスト実施
        const result = datasetMetadata.equal(undefined);
        // 結果
        expect(result).toBe(false);
    })

    it('データセットメタデータの文字列からDatasetMetadataのパラメータに値が正常に設定できることを確認', async () => {
        // テストデータ
        const metadataString: string = JSON.stringify({
            "dataset_id": "ba-o1-011011_g2-000010",
            "lastModified":"2023/12/26",
            "contentLength":1024,
            "etag":"aaa",
            "fileUrl": "https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip"
        });
        // テスト実施
        const result: DatasetMetadata = DatasetMetadata.from(metadataString)
        // 結果
        expect(result.dataset_id).toEqual('ba-o1-011011_g2-000010');
        expect(result.contentLength).toEqual(1024);
        expect(result.etag).toEqual('aaa');
        expect(result.fileUrl).toEqual('https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip');
    })

    it('データセットメタデータの文字列に不備がある場合、DatasetMetadataの生成時にErrorが発生することを確認', async () => {
        // テストデータ
        const metadataString: string = JSON.stringify({
            "id":"ba-o1-011011_g2-000010", 
            "contentLength":1024,
            "etag":"aaa",
            "fileUrl":"https://catalog.registries.digital.go.jp/rsc/address/mt_parcel_city011011.csv.zip"
          });
        // テスト実施・結果
        expect(
            () => DatasetMetadata.from(metadataString)
        ).toThrowError(new Error('Can not parse value as DatasetMetadata'))
    })

    it('メタデータ情報が未定義の場合、Trueが返却されることを確認', async () => {
        // テストデータ
        const datasetMetadata = new DatasetMetadata({
            dataset_id: 'ba-o1-011011_g2-000010',
            contentLength: 0,
            etag: '',
            fileUrl: '',
            lastModified: ''
        });
        // テスト実施
        const result = datasetMetadata.isUndifined();
        // 結果
        expect(result).toBe(true);
    })
})