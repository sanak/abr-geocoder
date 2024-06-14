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

import { DI_TOKEN } from '@interface-adapter/tokens';
import {
  ParcelDownloaderEvent,
  ParcelDownloder,
} from '@usecase/parcel-downloader/parcel-downloader';
import { SingleBar } from 'cli-progress';
import { DependencyContainer } from 'tsyringe';
import { DownloadParcelInfo } from './download-parcel-info';
import { Database } from 'better-sqlite3';

/**
 * 地番データのダウンロード処理を実行します。
 * @param param.container DBコンテナ
 * @param param.lgCode 全国地方公共団体コード
 * @param param.downloadDir 地番データダウンロードディレクトリ
 * @returns 地番ダウンロード情報
 */
export const downloadParcelProcess = async ({
  container,
  lgCode,
  downloadDir,
}: {
  /** DBコンテナ */
  container: DependencyContainer;
  /** 全国地方公共団体コード */
  lgCode: string;
  /** 地番データダウンロードディレクトリ */
  downloadDir: string;
}): Promise<DownloadParcelInfo> => {
  const userAgent = container.resolve<string>(DI_TOKEN.USER_AGENT);
  const downloadParcelInfo = new DownloadParcelInfo({
    lgCode,
    downloadDir,
    datasetPackageShowUrl: container.resolve<string>(
      DI_TOKEN.DATASET_PACKAGE_SHOW_URL
    ),
  });
  const progress = container.resolve<SingleBar | undefined>(
    DI_TOKEN.PROGRESS_BAR
  );
  const db = container.resolve<Database>(DI_TOKEN.DATABASE);
  const downloader = new ParcelDownloder({
    userAgent,
    downloadParcelInfo,
    lgCode,
    db,
  });

  downloader.on(
    ParcelDownloaderEvent.START,
    ({ position, length }: { position: number; length: number }) => {
      progress?.start(length, position);
    }
  );

  downloader.on(ParcelDownloaderEvent.DATA, (chunkSize: number) => {
    progress?.increment(chunkSize);
  });

  downloader.on(ParcelDownloaderEvent.END, () => {
    progress?.stop();
  });

  return await downloader.downloadParcelAndPos();
};
