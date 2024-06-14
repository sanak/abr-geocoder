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
// reflect-metadata is necessary for DI
import 'reflect-metadata';

import { AbrgMessage } from '@abrg-message/abrg-message';
import { setupContainer } from '@interface-adapter/setup-container';
import { DI_TOKEN } from '@interface-adapter/tokens';
import { CkanDownloader } from '@usecase/ckan-downloader/ckan-downloader';
import { Database } from 'better-sqlite3';
import { Logger } from 'winston';
import { UPDATE_CHECK_RESULT } from './update-check-result';
import { dbFormatCheck } from '@domain/db-format-check';
import { DBFormatCheckResult } from '@domain/db-format-check-result';
import { getLgCodesFromDB } from '@domain/geocode/get-lg-codes-from-db';
import { DownloadParcelInfo } from '@controller/download/process/download-parcel-info';
import { ParcelDownloder } from '@usecase/parcel-downloader/parcel-downloader';
import { checkPrefCode } from '@domain/check-pref-code';

/**
 * アップデートチェックを実施します。
 * @param param.ckanId CkanID
 * @param param.dataDir データディレクトリ
 * @param param.prefCode 都道府県コード
 * @returns アップデートチェック結果
 */
export const updateCheck = async ({
  ckanId,
  dataDir,
  prefCode,
}: {
  /** CkanID */
  ckanId: string;
  /** データディレクトリ */
  dataDir: string;
  /** 都道府県コード */
  prefCode: string;
}): Promise<UPDATE_CHECK_RESULT> => {
  const container = await setupContainer({
    dataDir,
    ckanId,
  });

  const logger = container.resolve<Logger | undefined>(DI_TOKEN.LOGGER);

  if (!checkPrefCode({ prefCode })) {
    logger?.info(AbrgMessage.toString(AbrgMessage.INPUT_PREF_CODE_ERROR));
    return UPDATE_CHECK_RESULT.PARAMETER_ERROR;
  }

  const db = container.resolve<Database>(DI_TOKEN.DATABASE);
  const datasetUrl = container.resolve<string>(DI_TOKEN.DATASET_URL);
  const userAgent = container.resolve<string>(DI_TOKEN.USER_AGENT);

  switch (await dbFormatCheck(db, ckanId)) {
    case DBFormatCheckResult.UNDEFINED:
      break;
    case DBFormatCheckResult.MISMATCHED:
      logger?.info(
        AbrgMessage.toString(AbrgMessage.ERROR_DB_FORMAT_MISMATCHED)
      );
      return UPDATE_CHECK_RESULT.DB_FORMAT_MISMATCHED;
    case DBFormatCheckResult.MATCHED:
      break;
  }

  // 全アドレスデータ処理
  const downloader = new CkanDownloader({
    db,
    userAgent,
    datasetUrl,
    ckanId,
    dstDir: '',
  });
  const isUpdateDataAvailable = await downloader.updateCheck();
  if (isUpdateDataAvailable) {
    logger?.info(AbrgMessage.toString(AbrgMessage.NEW_DATASET_IS_AVAILABLE));
    return UPDATE_CHECK_RESULT.NEW_DATASET_IS_AVAILABLE;
  }

  // 地番データ処理
  const lgCodes = await getLgCodesFromDB({
    db,
    prefCode,
  });
  for (const lgCode of lgCodes) {
    const isUpdateDataAvailableByParcelOrPos = await new ParcelDownloder({
      userAgent,
      lgCode,
      downloadParcelInfo: new DownloadParcelInfo({
        lgCode,
        downloadDir: '',
        datasetPackageShowUrl: container.resolve<string>(
          DI_TOKEN.DATASET_PACKAGE_SHOW_URL
        ),
      }),
      db,
    }).updateCheckParcelAndPos();
    if (isUpdateDataAvailableByParcelOrPos) {
      logger?.info(AbrgMessage.toString(AbrgMessage.NEW_DATASET_IS_AVAILABLE));
      return UPDATE_CHECK_RESULT.NEW_DATASET_IS_AVAILABLE;
    }
  }

  logger?.info(AbrgMessage.toString(AbrgMessage.ERROR_NO_UPDATE_IS_AVAILABLE));
  return UPDATE_CHECK_RESULT.NO_UPDATE_IS_AVAILABLE;
};
