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

import { describe, expect, it, jest } from "@jest/globals";
import { DownloadParcelInfo } from "@process/download-parcel-info";

describe('download-parcel-info test', () => {
    it('DownloadParcelInfoのインスタンスが正常に作成されることを確認', () => {
       // テストデータ
       const mockLgCode = '011002';
       const mockDwnloadDir = '/dowload/parcel/'
       const mockDatasetPackageShowUrl = 'https://catalog.registries.digital.go.jp/rc/api/3/action/package_show?id='     

       // テスト実施
       const actual = new DownloadParcelInfo({
        lgCode: mockLgCode,
        downloadDir: mockDwnloadDir,
        datasetPackageShowUrl: mockDatasetPackageShowUrl
       })
       // 結果
       expect(actual.lgCode).toEqual(mockLgCode);
       expect(actual.parcelDatasetUrl).toEqual(`${mockDatasetPackageShowUrl}ba-o1-${mockLgCode}_g2-000010`);
       expect(actual.parcelPosDatasetUrl).toEqual(`${mockDatasetPackageShowUrl}ba-o1-${mockLgCode}_g2-000011`);
       expect(actual.parcelFilePath).toEqual(`${mockDwnloadDir}${mockLgCode}.zip`);
       expect(actual.parcelPosFilePath).toEqual(`${mockDwnloadDir}pos_${mockLgCode}.zip`);
       expect(actual.parcelId).toEqual(`ba-o1-${mockLgCode}_g2-000010`);
       expect(actual.parcelPosId).toEqual(`ba-o1-${mockLgCode}_g2-000011`)
    })
});