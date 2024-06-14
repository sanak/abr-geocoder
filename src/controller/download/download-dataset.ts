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
import { saveMetadata } from '@domain/metadata/save-metadata';
import { setupContainer } from '@interface-adapter/setup-container';
import { DI_TOKEN } from '@interface-adapter/tokens';
import { Database } from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { Logger } from 'winston';
import { DOWNLOAD_DATASET_RESULT } from './download-dataset-result';
import { downloadProcess } from './process/download-process';
import { extractDatasetProcess } from './process/extract-dataset-process';
import { loadDatasetHistory } from './process/load-dataset-history';
import { loadDatasetProcess } from './process/load-dataset-process';
import { DBFormatCheckResult } from '@domain/db-format-check-result';
import { dbFormatCheck } from '@domain/db-format-check';
import { getLgCodesFromDB } from '@domain/geocode/get-lg-codes-from-db';
import { downloadParcelProcess } from './process/download-parcel-process';
import { checkPrefCode } from '@domain/check-pref-code';

/**
 * ダウンロードデータセットの構築を行います。
 */
export const downloadDataset = async ({
  ckanId,
  dataDir,
  prefCode,
}: {
  /** CkanID */
  ckanId: string;
  /** ダウンロードディレクトリ */
  dataDir: string;
  /** 都道府県コード */
  prefCode: string;
}): Promise<DOWNLOAD_DATASET_RESULT> => {
  const container = await setupContainer({
    dataDir,
    ckanId,
  });

  const logger = container.resolve<Logger | undefined>(DI_TOKEN.LOGGER);

  if (!checkPrefCode({ prefCode })) {
    logger?.info(AbrgMessage.toString(AbrgMessage.INPUT_PREF_CODE_ERROR));
    return DOWNLOAD_DATASET_RESULT.PARAMETER_ERROR;
  }

  const db = container.resolve<Database>(DI_TOKEN.DATABASE);
  switch (await dbFormatCheck(db, ckanId)) {
    case DBFormatCheckResult.UNDEFINED:
      break;
    case DBFormatCheckResult.MISMATCHED:
      logger?.info(
        AbrgMessage.toString(AbrgMessage.ERROR_DB_FORMAT_MISMATCHED)
      );
      return DOWNLOAD_DATASET_RESULT.DB_FORMAT_MISMATCHED;
    case DBFormatCheckResult.MATCHED:
      break;
  }

  const downloadDir = path.join(dataDir, 'download', ckanId);
  const exists = fs.existsSync(downloadDir);
  if (!exists) {
    await fs.promises.mkdir(downloadDir, {
      recursive: true,
    });
  }

  const downloadInfo = await downloadProcess({
    container,
    ckanId,
    dstDir: downloadDir,
  });

  if (!downloadInfo?.downloadFilePath) {
    return DOWNLOAD_DATASET_RESULT.CAN_NOT_ACCESS_TO_DATASET_ERROR;
  }

  const datasetHistory = await loadDatasetHistory({
    db,
  });

  // --------------------------------------
  // ダウンロードしたzipファイルを全展開する
  // --------------------------------------
  logger?.info(AbrgMessage.toString(AbrgMessage.EXTRACTING_THE_DATA));

  const extractDir = await fs.promises.mkdtemp(path.join(dataDir, 'dataset'));
  const csvFiles = await extractDatasetProcess({
    container,
    srcPath: downloadInfo.downloadFilePath,
    dstDir: extractDir,
    datasetHistory,
  });

  if (csvFiles.length === 0) {
    logger?.info(
      AbrgMessage.toString(AbrgMessage.ERROR_NO_UPDATE_IS_AVAILABLE)
    );
  } else {
    // 各データセットのzipファイルを展開して、Databaseに登録する
    logger?.info(AbrgMessage.toString(AbrgMessage.LOADING_INTO_DATABASE));

    await loadDatasetProcess({
      db,
      csvFiles,
      container,
    });
  }
  await fs.promises.rm(extractDir, { recursive: true });

  // 地番データ処理
  logger?.info(AbrgMessage.toString(AbrgMessage.EXTRACTING_THE_PARCEL_DATA));
  const lgCodes = await getLgCodesFromDB({
    db,
    prefCode,
  });
  if (lgCodes.length > 0) {
    const downloadDir = path.join(dataDir, 'download', 'parcel');
    if (!fs.existsSync(downloadDir)) {
      await fs.promises.mkdir(downloadDir, {
        recursive: true,
      });
    }
    for (const lgCode of lgCodes) {
      await downloadParcelProcess({
        container,
        lgCode,
        downloadDir,
      });
    }

    const parcelTmpDir = await fs.promises.mkdtemp(
      path.join(dataDir, 'dataset_parcel')
    );
    const parcelCsvFiles = await extractDatasetProcess({
      container,
      srcPath: downloadDir,
      dstDir: parcelTmpDir,
      datasetHistory,
    });
    if (parcelCsvFiles.length === 0) {
      logger?.info(
        AbrgMessage.toString(AbrgMessage.ERROR_NO_UPDATE_IS_AVAILABLE)
      );
      if (csvFiles.length === 0) {
        await fs.promises.rm(parcelTmpDir, { recursive: true });
        return DOWNLOAD_DATASET_RESULT.NO_UPDATE_IS_AVAILABLE;
      }
    } else {
      logger?.info(AbrgMessage.toString(AbrgMessage.LOADING_INTO_DATABASE));
      await loadDatasetProcess({
        db,
        csvFiles: parcelCsvFiles,
        container,
      });
    }
    await fs.promises.rm(parcelTmpDir, { recursive: true });
  }

  saveMetadata({
    db,
    metadata: downloadInfo.metadata,
  });

  db.close();

  return DOWNLOAD_DATASET_RESULT.SUCCESS;
};

export { DOWNLOAD_DATASET_RESULT };
