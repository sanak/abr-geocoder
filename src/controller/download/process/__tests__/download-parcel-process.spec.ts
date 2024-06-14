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
import { setupContainer } from "@interface-adapter/__mocks__/setup-container";
import { describe, expect, it, jest } from "@jest/globals";
import { DependencyContainer } from 'tsyringe';
import { downloadParcelProcess } from "@process/download-parcel-process";
import { DownloadParcelInfo } from "@process/download-parcel-info";
import { ParcelDownloder } from "@usecase/parcel-downloader/parcel-downloader";

jest.mock('@interface-adapter/setup-container');
jest.mock('@process/download-parcel-info');
jest.mock("@usecase/parcel-downloader/parcel-downloader")

describe('download-parcel-process test', () => {
    it('地番データのダウンロード処理が正常に行われることを確認します。', async () => {
        // // モック定義
        const mockContainer = setupContainer() as DependencyContainer;
        const mockLgCode = "011002";
        const mockDownloadDir = "/download/parcel/";
        const mockDownloadParcelInfo = (DownloadParcelInfo as jest.Mock).mockImplementationOnce((_: any) => { });
        const mockOn = jest.fn().mockImplementation((_: any, __: any) => { });
        const mockParcelDownloder = (ParcelDownloder as unknown as jest.Mock).mockImplementationOnce((_: any) => {
            return {
                on: mockOn,
                downloadParcelAndPos: () => {
                    return mockDownloadParcelInfo
                }
            }
        })
        // テスト実施
        const acual = await downloadParcelProcess({
            container: mockContainer,
            lgCode: mockLgCode,
            downloadDir: mockDownloadDir,
        })
        // 結果
        expect(mockDownloadParcelInfo.mock.calls[0][0]).toStrictEqual({
            lgCode: "011002",
            downloadDir: mockDownloadDir,
            datasetPackageShowUrl: 'https://dataset/package_show?='
        })
        expect(mockParcelDownloder.mock.calls.length).toBe(1);
        expect(mockOn.mock.calls.length).toBe(3)
        expect(acual).toEqual(mockDownloadParcelInfo);
    })
})