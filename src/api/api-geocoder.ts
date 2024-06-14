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
import { Request } from 'express';

export class ApiGeocoder {
  private option: string = '';

  async init(request: Request): Promise<boolean> {
    // フォーマットチェック
    const formatValidation = ['json', 'geojson', 'csv', 'ndjson', 'ndgeojson'];
    const format = request.params.format;
    console.log('init' + format);
    if (formatValidation.indexOf(format.toString()) === -1) {
      return false;
    }

    this.option = ' --format ' + format;

    const fuzzy = request.query.fuzzy;
    //許容するのは1文字のみ
    if (fuzzy !== null && fuzzy !== undefined && fuzzy.length !== 0) {
      if (fuzzy.length === 1) {
        this.option += ' --fuzzy ' + fuzzy;
      } else {
        return false;
      }
    }

    const target = request.query.target;
    if (target !== null && target !== undefined && target.length !== 0) {
      if (target === 'all' || target === 'parcel') {
        this.option += ' --target ' + target;
      } else {
        return false;
      }
    }

    return true;
  }

  // geocode実行
  async geocode(addr: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // cliでgeocode実施
      console.log('input:' + addr + ' ' + this.option);

      const chunks: string[] = [];
      const proc = require('child_process').spawn('node', [
        './build/cli/cli.js',
        '-',
        this.option,
      ]);
      proc.stdin.write(addr);
      proc.stdin.end();

      proc.stdout.on('data', (chunk: string) => chunks.push(chunk));
      proc.on('error', (err: string) => {
        reject(err);
      });
      proc.on('close', () => {
        console.log('result:' + chunks.join(''));
        resolve(chunks.join('').toString());
      });
    });
  }
}
