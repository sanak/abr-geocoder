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
import { CityDatasetFile } from '@domain/dataset/city-dataset-file';
import { DatasetFile } from '@domain/dataset/dataset-file';
import { parseFilename } from '@domain/dataset/parse-filename';
import { PrefDatasetFile } from '@domain/dataset/pref-dataset-file';
import { RsdtdspBlkFile } from '@domain/dataset/rsdtdsp-blk-file';
import { RsdtdspBlkPosFile } from '@domain/dataset/rsdtdsp-blk-pos-file';
import { RsdtdspRsdtFile } from '@domain/dataset/rsdtdsp-rsdt-file';
import { RsdtdspRsdtPosFile } from '@domain/dataset/rsdtdsp-rsdt-pos-file';
import { TownDatasetFile } from '@domain/dataset/town-dataset-file';
import { TownPosDatasetFile } from '@domain/dataset/town-pos-dataset-file';
import { IStreamReady } from '@domain/istream-ready';
import { DI_TOKEN } from '@interface-adapter/tokens';
import { DataSource } from 'typeorm';
import { MultiBar } from 'cli-progress';
import csvParser from 'csv-parser';
import { Stream } from 'node:stream';
import { DependencyContainer } from 'tsyringe';
import { Logger } from 'winston';
import { Dataset } from '@entity/dataset';
import { prepareSqlAndParamKeys } from '@domain/prepare-sql-and-param-keys';

export const loadDatasetProcess = async ({
  ds,
  container,
  csvFiles,
}: {
  ds: DataSource;
  csvFiles: IStreamReady[];
  container: DependencyContainer;
}) => {
  const logger = container.resolve<Logger | undefined>(DI_TOKEN.LOGGER);
  const multiProgressBar = container.resolve<MultiBar | undefined>(
    DI_TOKEN.MULTI_PROGRESS_BAR
  );

  // _pos_ ファイルのSQL が updateになっているので、
  // それ以外の基本的な情報を先に insert する必要がある。
  // そのため _pos_ がファイル名に含まれている場合は、
  // 後方の順番になるように並び替える
  csvFiles = csvFiles.sort((a, b) => {
    const isA_posFile = a.name.includes('_pos_');
    const isB_posFile = b.name.includes('_pos_');
    if (isA_posFile && !isB_posFile) {
      return 1;
    }

    if (!isA_posFile && isB_posFile) {
      return -1;
    }
    for (let i = 0; i < Math.min(a.name.length, b.name.length); i++) {
      const diff = a.name.charCodeAt(i) - b.name.charCodeAt(i);
      if (diff !== 0) {
        return diff;
      }
    }
    return a.name.length - b.name.length;
  });

  // 各ファイルを処理する
  const filesStream = Stream.Readable.from(csvFiles, {
    objectMode: true,
  });

  const fileParseProgresss = multiProgressBar?.create(csvFiles.length, 0, {
    filename: 'analysis...',
  });

  const fileParseStream = new Stream.Transform({
    objectMode: true,
    transform(chunk: IStreamReady, encoding, callback) {
      fileParseProgresss?.increment();

      // ファイル名から情報を得る
      const fileMeta = parseFilename({
        filepath: chunk.name,
      });
      if (!fileMeta) {
        // skip
        logger?.debug(`[skip]--->${chunk.name}`);
        callback();
        return;
      }

      switch (fileMeta.type) {
        case 'pref':
          callback(null, PrefDatasetFile.create(fileMeta, chunk));
          break;
        case 'city':
          callback(null, CityDatasetFile.create(fileMeta, chunk));
          break;
        case 'town':
          callback(null, TownDatasetFile.create(fileMeta, chunk));
          break;
        case 'rsdtdsp_blk':
          callback(null, RsdtdspBlkFile.create(fileMeta, chunk));
          break;
        case 'rsdtdsp_rsdt':
          callback(null, RsdtdspRsdtFile.create(fileMeta, chunk));
          break;
        case 'town_pos':
          callback(null, TownPosDatasetFile.create(fileMeta, chunk));
          break;
        case 'rsdtdsp_blk_pos':
          callback(null, RsdtdspBlkPosFile.create(fileMeta, chunk));
          break;
        case 'rsdtdsp_rsdt_pos':
          callback(null, RsdtdspRsdtPosFile.create(fileMeta, chunk));
          break;
        default:
          logger?.error(`[error]--->${chunk.name}`);
          throw new Error(`unknown type: ${fileMeta.type}`);
      }
    },
  });

  const loadDataProgress = multiProgressBar?.create(csvFiles.length, 0, {
    filename: 'loading...',
  });
  const loadDataStream = new Stream.Writable({
    objectMode: true,
    async write(datasetFile: DatasetFile, encoding, callback) {
      // 1ファイルごと transform() が呼び出される

      const queryRunner = ds.createQueryRunner();
      await queryRunner.connect();

      // CSVファイルの読み込み
      const { preparedSql, paramKeys } = prepareSqlAndParamKeys(
        ds,
        datasetFile.sql
      );

      const errorHandler = async (error: unknown) => {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }

        if (error instanceof Error) {
          callback(error);
        } else if (typeof error === 'string') {
          callback(new Error(error));
        } else {
          callback(new Error('unknown error'));
        }
      };

      // DBに登録
      await queryRunner.startTransaction();

      datasetFile.csvFile.getStream().then(fileStream => {
        fileStream
          .pipe(
            csvParser({
              skipComments: true,
            })
          )
          .pipe(
            new Stream.Writable({
              objectMode: true,
              async write(chunk, encoding, next) {
                try {
                  const processed = datasetFile.process(chunk);
                  await queryRunner.connection.query(
                    preparedSql,
                    paramKeys.map(key => processed[key])
                  );
                  next(null);
                } catch (error) {
                  await errorHandler(error);
                }
              },
            })
          )
          .on('finish', async () => {
            await queryRunner.commitTransaction();
            await ds
              .createQueryBuilder()
              .insert()
              .into(Dataset)
              .values([
                {
                  key: datasetFile.filename,
                  type: datasetFile.type,
                  content_length: datasetFile.csvFile.contentLength,
                  crc32: datasetFile.csvFile.crc32,
                  last_modified: datasetFile.csvFile.lastModified,
                },
              ])
              .execute();

            loadDataProgress?.increment();
            loadDataProgress?.updateETA();
            callback(null);
          })
          .on('error', async (error: Error) => {
            await errorHandler(error);
          });
      });
      await queryRunner.release();
    },
  });

  await Stream.promises.pipeline(filesStream, fileParseStream, loadDataStream);

  loadDataProgress?.stop();
  if (loadDataProgress) {
    multiProgressBar?.remove(loadDataProgress);
  }
};
