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
import express, { Request, Response, NextFunction } from 'express';
import cluster from 'cluster';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { ApiGeocoder } from './api-geocoder';

import os from 'os';

// CPUコア数をプロセス数とする
const PROCESS_COUNT = os.cpus().length;
const PORT = 3000;

if (cluster.isPrimary) {
  //メインプロセス
  for (let i = 0; i < PROCESS_COUNT; ++i) {
    cluster.fork();
    //console.log('fork process, pid:${process.pid}, sub-process pid: ${supProcess.process.pid}');
  }
  cluster.on('exit', worker => {
    console.log('worker ' + worker.process.pid + 'died');
  });
} else {
  //サブプロセス
  const app = express();
  // CORS許可
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // サーバー起動
  const server = app.listen(PORT, () => {
    console.log(`server start on port ${PORT}!`);
  });
  // Handle errors
  server.on('error', err => {
    if (err.message === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error(err);
    }
  });

  app.get(
    '/abr-geocoder/:query.:format',
    async (request: Request, response: Response) => {
      try {
        // cliに投げるオプション作成・チェック
        console.log('get api start');
        const apiGeocoder = new ApiGeocoder();
        if (!(await apiGeocoder.init(request))) {
          return response
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }

        const query = request.params.query;
        const result = await apiGeocoder.geocode(query.toString());
        if (result !== '') {
          // Content-Typeの設定
          const format = request.params.format;
          if (format === 'csv') {
            response.type('text/csv');
          } else {
            response.type('application/json');
          }
          response.status(StatusCodes.OK).send(result);
        } else {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
          });
        }
        console.log('get api end');
      } catch {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        });
      }
    }
  );

  app.all('*', (req, res) => {
    res.type('application/json');
    res.status(StatusCodes.NOT_FOUND);
    res.send(
      JSON.stringify({ message: getReasonPhrase(StatusCodes.NOT_FOUND) })
    );
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.type('application/json');
    res.status(StatusCodes.BAD_REQUEST);
    res.send(
      JSON.stringify({ message: getReasonPhrase(StatusCodes.BAD_REQUEST) })
    );
    next();
  });
}
