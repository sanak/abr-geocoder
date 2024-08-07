/*!
 * MIT License
 *
 * Copyright (c) 2024 デジタル庁
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
import { MAX_CONCURRENT_DOWNLOAD } from '@config/constant-values';
import { CsvLoadResult, DownloadProcessError, DownloadRequest } from '@domain/models/download-process-query';
import { createPackageTree } from '@domain/services/create-package-tree';
import { DatabaseParams } from '@domain/types/database-params';
import { FileGroupKey } from '@domain/types/download/file-group';
import { AbrgError, AbrgErrorLevel } from '@domain/types/messages/abrg-error';
import { AbrgMessage } from '@domain/types/messages/abrg-message';
import { PrefLgCode, isPrefLgCode } from '@domain/types/pref-lg-code';
import { HttpRequestAdapter } from '@interface/http-request-adapter';
import { StatusCodes } from 'http-status-codes';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import timers from 'node:timers/promises';
import { CounterWritable } from '@domain/services/counter-writable';
import { DownloadDiContainer } from './models/download-di-container';
import { CsvParseTransform } from './transformations/csv-parse-transform';
import { DownloadTransform } from './transformations/download-transform';

export type DownloaderOptions = {
  // データベース接続に関する情報
  database: DatabaseParams;
  // zipファイルのキャッシュファイルを保存するディレクトリ
  cacheDir: string;
  // zipファイルをダウンロードするディレクトリ
  downloadDir: string;
};

export type DownloadOptions = {
  // ダウンロードするデータの対象を示す都道府県コード
  lgCodes?: string[];
  // 進み具合を示すプログレスのコールバック
  progress?: (current: number, total: number) => void;

  //同時ダウンロード数
  concurrentDownloads: number;
};

export class Downloader {
  private container: DownloadDiContainer;

  constructor(params: DownloaderOptions) {
    this.container = new DownloadDiContainer({
      cacheDir: params.cacheDir,
      downloadDir: params.downloadDir,
      database: params.database,
    });
  }

  private async getJSON(url: string) {
    const urlObj = new URL(url);

    const client = new HttpRequestAdapter({
      hostname: urlObj.hostname,
      userAgent: this.container.env.userAgent,
      peerMaxConcurrentStreams: 1,
    });
  
    const response = await client.getJSON({
      url,
    });
    client.close();
    return response;
  }

  async download(params: DownloadOptions) {
    // --------------------------------------
    // ダウンロード開始
    // --------------------------------------

    // LGCodeを整理する
    const lgCodeFilter = this.aggregateLGcodes(params.lgCodes);
    
    // ダウンロードリクエストを作成する
    const requests = await this.createDownloadRequests(lgCodeFilter);
    const total = requests.length;

    // ランダムに入れ替える（DBの書き込みを分散させるため）
    requests.sort((_, __) => {
      return -1 + Math.random() * 3;
    });
    
    const reader = Readable.from(requests);
    
    // ダウンロード処理を行う
    const downloadTransform = new DownloadTransform({
      container: this.container,
      maxTasksPerWorker: Math.min(params.concurrentDownloads || MAX_CONCURRENT_DOWNLOAD),
    });

    // ダウンロードしたzipファイルからcsvファイルを取り出して、
    // データベースに登録する
    const parallel = this.container.env.availableParallelism();
    const csvParseTransform = new CsvParseTransform({
      maxConcurrency: Math.floor(parallel * 1.2),
      container: this.container,
      lgCodeFilter,
    });

    // プログレスバーに進捗を出力する
    const dst = new CounterWritable({
      write: async (_: CsvLoadResult | DownloadProcessError, __, callback) => {
        if (params.progress) {
          params.progress(dst.count, total);
        }
        callback();
      }
    });

    let inputCnt = 0;
    await pipeline(
      reader,
      new Transform({
        objectMode: true,
        async transform(chunk, _, callback) {
          inputCnt++;

          await new Promise<void>(async (resolve: (_?: void) => void) => {
            const waitingCnt = inputCnt - dst.count;
            if (waitingCnt < MAX_CONCURRENT_DOWNLOAD) {
              return resolve();
            }
            // Out of memory を避けるために、受け入れを一時停止
            // 処理済みが追いつくまで、待機する
            const half = MAX_CONCURRENT_DOWNLOAD >> 1;
            while (inputCnt - dst.count > half) {
              await timers.setTimeout(100);
            }
      
            // 再開する
            resolve();
          });

          callback(null, chunk);
        },
      }),
      downloadTransform,
      csvParseTransform,
      dst,
    );
    downloadTransform.close();
    csvParseTransform.close();
  }
  

  private async createDownloadRequests(downloadTargetLgCodes: Set<string>): Promise<DownloadRequest[]> {
    // レジストリ・カタログサーバーから、パッケージの一覧を取得する
    const response = await this.getJSON(`https://${this.container.env.hostname}/rc/api/3/action/package_list`);

    if (response.header.statusCode !== StatusCodes.OK) {
      throw new AbrgError({
        messageId: AbrgMessage.CANNOT_GET_PACKAGE_LIST,
        level: AbrgErrorLevel.ERROR
      });
    }
    
    const packageListResult = response.body as {
      success: boolean;
      result: string[];
    };
    if (!packageListResult.success) {
      throw new AbrgError({
        messageId: AbrgMessage.CANNOT_GET_PACKAGE_LIST,
        level: AbrgErrorLevel.ERROR
      });
    }

    // 各lgCodeが何のdatasetType を持っているのかをツリー構造にする
    // lgcode -> dataset -> packageId
    const lgCodePackages = createPackageTree(packageListResult.result);

    const results: DownloadRequest[] = [];

    const targetPrefixes = new Set<string>();
    const cityPrefixes = new Set<string>();
    downloadTargetLgCodes.forEach(lgCode => {
      const prefix = lgCode.substring(0, 2);
      cityPrefixes.add(prefix);

      const suffix = lgCode.substring(2, 6);
      
      // 都道府県LGCodeの場合、次のステップで、その都道府県下にある市区町村を収集する
      if (suffix === '....') {
        targetPrefixes.add(prefix);
        return;
      }
      // 市区町村LgCodeが指定されている場合、ここでDownloadRequest を作成する
      const packages = lgCodePackages.get(lgCode);
      if (!packages) {
        return false;
      }
      for (const [dataset, packageId] of packages.entries()) {
        results.push({
          kind: 'download',
          dataset,
          packageId,
          useCache: true,
          lgCode,
        } as DownloadRequest);
      }

      return false;
    });

    for (const [lgCode, packages] of lgCodePackages.entries()) {
      const prefix = lgCode.substring(0, 2);
      // 都道府県LgCodeで、市町村が必要な場合、追加する
      if (isPrefLgCode(lgCode)) {
        if (downloadTargetLgCodes.size > 0 && !cityPrefixes.has(prefix)) {
          continue;
        }
        for (const dataset of ['city', 'city_pos'] as FileGroupKey[]) {
          results.push({
            kind: 'download',
            dataset,
            packageId: lgCodePackages.get(lgCode)!.get(dataset)!,
            useCache: true,
            lgCode,
          });
        }
        continue;
      }

      // ダウンロード対象外のlgCodeは省く
      if (downloadTargetLgCodes.size > 0 && !targetPrefixes.has(prefix)) {
        continue;
      }

      // ダウンロードを行う対象に加える
      for (const [dataset, packageId] of packages.entries()) {
        // 市区町村のlgCodeの場合は、ダウンロード対象
        results.push({
          kind: 'download',
          dataset,
          packageId,
          useCache: true,
          lgCode,
        } as DownloadRequest);
      }
    }

    // 都道府県全国マスターだけは必ずダウンロード
    for (const dataset of ['pref', 'pref_pos'] as FileGroupKey[]) {
      results.push({
        kind: 'download',
        dataset,
        packageId: lgCodePackages.get(PrefLgCode.ALL)!.get(dataset)!,
        useCache: true,
        lgCode: '000000',
      });
    }

    // ランダムに並び替えることで、lgCodeが分散され、DB書き込みのときに衝突を起こしにくくなる
    // (衝突すると、書き込み待ちが発生する)
    results.sort((_, __) => Math.random() * 3 - 2);
    return results;
  }

  private aggregateLGcodes(lgCodes: string[] | undefined): Set<string> {
    if (lgCodes === undefined) {
      return new Set();
    }
    const results = new Map<string, string>();

    // params.lgCodesに含まれるlgCodeが prefLgCode(都道府県を示すlgCode)なら、
    // 市町村レベルのlgCodeは必要ないので省く。　
    lgCodes.forEach(lgCode => {
      if (lgCode === PrefLgCode.ALL) {
        return;
      }
      const prefix = lgCode.substring(0, 2);
      if (isPrefLgCode(lgCode)) {
        // 都道府県コードの場合、格納 or 上書き
        results.set(prefix, `${prefix}....`);
      } else if (!results.has(prefix)) {
        // 市町村コードをそのまま格納
        results.set(prefix, lgCode);
      }
    });

    return new Set(results.values());
  }
}

