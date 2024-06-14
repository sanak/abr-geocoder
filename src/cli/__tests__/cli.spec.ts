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
import { main, parseHelper } from '@cli/cli';
import { downloadDataset } from '@controller/download/download-dataset';
import { geocode } from '@controller/geocode/geocode';
import { updateCheck } from '@controller/update-check/update-check';
import { OutputFormat } from '@domain/output-format';
import { upwardFileSearch, } from '@domain/upward-file-search';
import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DEFAULT_FUZZY_CHAR, SINGLE_DASH_ALTERNATIVE } from '@settings/constant-values';
import { UPDATE_CHECK_RESULT } from '@controller/update-check/update-check-result';
import fs from 'node:fs';
import { getPackageInfo } from '@domain/get-package-info';
import { SearchTarget } from '@domain/search-target';

jest.mock('@controller/update-check/update-check');
jest.mock('@controller/geocode/geocode');
jest.mock('@controller/download/download-dataset');
jest.mock('@domain/upward-file-search');
jest.mock('@domain/parse-package-json');

/**
 * cli のテストを実施します。
 */
describe('cli', () => {

  /**
   * cliのテストを実施します。
   */
  describe('cli.ts', () => {
    it('should start with "#!/usr/bin/env node"', () => {
      // テストデータ
      const buffer = Buffer.alloc(50); // 50 Bytes
      const fd = fs.openSync(`${__dirname}/../cli.ts`, 'r');
      // テスト実施
      fs.readSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);
      // 結果
      expect(buffer.toString().startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  /**
   * {@link getPackageInfo}のテストを実施します。
   */
  describe('getPackageInfo', () => {
    it('should return expected values', async () => {
      // テスト実施・結果
      await expect(getPackageInfo())
        .resolves
        .toMatchObject({
          version: '0.0.0',
          description: 'unit test'
        });
    });

    it('should occur an error if upwardFileSearch() returns undefined', async () => {
      // モック定義
      const orgMock = (upwardFileSearch as jest.Mock).getMockImplementation;
      (upwardFileSearch as jest.Mock).mockImplementation(async () => {
        return undefined;
      });
      // テスト実施・結果
      await expect(getPackageInfo())
        .rejects
        .toThrow(AbrgMessage.toString(AbrgMessage.CANNOT_FIND_PACKAGE_JSON_FILE));
      (upwardFileSearch as jest.Mock).mockImplementation(orgMock)
    });
  });

  /**
   * {@link parseHelper} のテストを実施します。
   */
  describe('parseHelper', () => {
    it.concurrent('should receive [node, abrg]', async () => {
      // テストデータ
      const processArgv = ['node', 'abrg'];
      // テスト実施
      const results = parseHelper(processArgv);
      // 結果
      expect(results).toEqual(['node', 'abrg']);
    });

    it.concurrent('should receive [node, abrg, update-check]', async () => {
      // テストデータ
      const processArgv = ['node', 'abrg', 'update-check'];
      // テスト実施
      const results = parseHelper(processArgv);
      // 結果
      expect(results).toEqual(['node', 'abrg', 'update-check']);
    });

    it.concurrent('should receive [node, abrg, update-check] even if arguments are not formatted', async () => {
      // テストデータ
      const processArgv = ['node    abrg    update-check'];
      // テスト実施
      const results = parseHelper(processArgv);
      // 結果
      expect(results).toEqual(['node', 'abrg', 'update-check']);
    });

    it.concurrent('should receive [node, abrg, update-check, -d, 1234]', async () => {
      // テストデータ
      const processArgv = ['node', 'abrg', 'update-check', '-d 1234'];
      // テスト実施
      const results = parseHelper(processArgv);
      // 結果
      expect(results).toEqual(['node', 'abrg', 'update-check', '-d', '1234']);
    });

    it.concurrent('should receive [node, abrg, -d, 1234,  update-check]', async () => {
      // テストデータ
      const processArgv = ['node', 'abrg', '-d 1234', 'update-check'];
      // テスト実施
      const results = parseHelper(processArgv);
      // 結果
      expect(results).toEqual(['node', 'abrg', '-d', '1234', 'update-check']);
    });
  });

  /**
   * update-checkコマンドのテストを実施します。
   */
  describe('update-check', () => {

    it.concurrent('should run update-check command', async () => {
      // テスト実施
      await runCommand('update-check');
      // 結果
      expect(updateCheck).toBeCalledWith({
        dataDir: expect.any(String),
        ckanId: 'ba000001',
        prefCode: '00',
      })
    });

    it.concurrent('should receive specified options', async () => {
      // テスト実施
      await runCommand('update-check', '-r', 'something', '-d', 'somewhere');
      // 結果
      expect(updateCheck).toBeCalledWith({
        dataDir: 'somewhere',
        ckanId: 'something',
        prefCode: '00',
      })
    });

    it.concurrent('should receive specified options with long option names', async () => {
      // テスト実施
      await runCommand('update-check', '--resource', 'something', '--dataDir', 'somewhere');
      // 結果
      expect(updateCheck).toBeCalledWith({
        dataDir: 'somewhere',
        ckanId: 'something',
        prefCode: '00',
      })
    });
    it.concurrent('should exit with code 1 if NO_UPDATE_IS_AVAILABLE', async () => {
      (updateCheck as jest.MockedFunction<typeof updateCheck>).mockResolvedValue(UPDATE_CHECK_RESULT.NO_UPDATE_IS_AVAILABLE);

      const originalExit = process.exit;
      const exitMock = jest.fn();
      process.exit = exitMock as never;

      await runCommand('update-check');

      expect(exitMock).toHaveBeenCalledWith(1);
      process.exit = originalExit;
    });
  });

  /**
   * downloadコマンドのテストを実施します。
   */
  describe('download', () => {

    it.concurrent('should run download command', async () => {
      // テスト実施
      await runCommand('download');
      // 結果
      expect(downloadDataset).toBeCalledWith({
        dataDir: expect.any(String),
        ckanId: 'ba000001',
        prefCode: '00',
      })
    });

    it.concurrent('should receive specified options', async () => {
      // テスト実施
      await runCommand('download', '-r', 'something', '-d', 'somewhere', '-p', '24');
      // 結果
      expect(downloadDataset).toBeCalledWith({
        container: undefined,
        ckanId: 'something',
        dataDir: 'somewhere',
        prefCode: '24',
      })
    });

    it.concurrent('should receive specified options with long option names', async () => {
      // テスト実施
      await runCommand('download', '--resource', 'something', '--dataDir', 'somewhere', '--pref', '47');
      // 結果
      expect(downloadDataset).toBeCalledWith({
        container: undefined,
        ckanId: 'something',
        dataDir: 'somewhere',
        prefCode: '47'
      })
    });
  });

  /**
   * geocodingコマンドのテストを実施します。
   */
  describe('geocoding', () => {
    describe('regular usages', () => {
      it.concurrent('should run geocoding command', async () => {
        // テストデータ
        const inputFile = './somewhere/query.txt';
        // テスト実施
        await runCommand(inputFile);
        // 結果
        expect(geocode).toBeCalledWith({
          ckanId: 'ba000001',
          dataDir: expect.any(String),
          source: inputFile,
          format: OutputFormat.JSON,
          destination: undefined,
          target: SearchTarget.ALL,
          fuzzy: undefined,
        });
      });

      it.concurrent('case: abrg <inputFile> -f json -fuzzy "?"', async () => {
        const inputFile = './somewhere/query.txt';

        await runCommand('-f', OutputFormat.JSON, '--fuzzy', '?', inputFile);

        expect(geocode).toBeCalledWith({
          ckanId: 'ba000001',
          dataDir: expect.any(String),
          source: inputFile,
          format: OutputFormat.JSON,
          destination: undefined,
          target: SearchTarget.ALL,
          fuzzy: DEFAULT_FUZZY_CHAR,
        });
      });

      it.concurrent('should run geocoding command without fuzzy option', async () => {
        const inputFile = './somewhere/query.txt';

        await runCommand(inputFile);

        expect(geocode).toBeCalledWith(expect.objectContaining({
          fuzzy: undefined
        }));
      });

      it.concurrent('case: abrg -f csv --fuzzy ● <inputFile>', async () => {
        // テストデータ
        const inputFile = './somewhere/query.txt';
        const fuzzyChar = '●';
        // テスト実施
        await runCommand('-f', OutputFormat.CSV, '--fuzzy', fuzzyChar, inputFile);
        // 結果
        expect(geocode).toBeCalledWith({
          ckanId: 'ba000001',
          dataDir: expect.any(String),
          source: inputFile,
          format: OutputFormat.CSV,
          destination: undefined,
          target: SearchTarget.ALL,
          fuzzy: fuzzyChar,
        });

      });

      it.concurrent('case: abrg -f ndjson <inputFile>', async () => {
        // テストデータ
        const inputFile = './somewhere/query.txt';
        // テスト実施
        await runCommand('-f', OutputFormat.NDJSON, inputFile);
        // 結果
        expect(geocode).toBeCalledWith({
          ckanId: 'ba000001',
          dataDir: expect.any(String),
          source: inputFile,
          format: OutputFormat.NDJSON,
          destination: undefined,
          target: SearchTarget.ALL,
          fuzzy: undefined,
        });
      });

      it.concurrent('case: abrg -d somewhere <inputFile>', async () => {
        // テストデータ
        const inputFile = './somewhere/query.txt';
        // テスト実施
        await runCommand('-d', 'somewhere', inputFile);
        // 結果
        expect(geocode).toBeCalledWith({
          ckanId: 'ba000001',
          dataDir: expect.any(String),
          source: inputFile,
          format: OutputFormat.JSON,
          destination: undefined,
          target: SearchTarget.ALL,
          fuzzy: undefined,
        });
      });

      it.concurrent('should receive outputFile option', async () => {
        // テストデータ
        const inputFile = './somewhere/query.txt';
        const outputFile = './somewhere/result.csv';
        // テスト実施
        await runCommand(inputFile, outputFile, '-f', OutputFormat.CSV);
        // 結果
        expect(geocode).toBeCalledWith({
          ckanId: 'ba000001',
          dataDir: expect.any(String),
          source: inputFile,
          format: OutputFormat.CSV,
          destination: outputFile,
          target: SearchTarget.ALL,
          fuzzy: undefined,
        });
      });

      it.concurrent('should receive outputFile option, even if arguments order is incorrect', async () => {
        // テストデータ
        const inputFile = './somewhere/query.txt';
        const outputFile = './somewhere/result.csv';
        // テスト実施
        await runCommand('-f', OutputFormat.CSV, inputFile, outputFile);
        // 結果
        expect(geocode).toBeCalledWith({
          ckanId: 'ba000001',
          dataDir: expect.any(String),
          source: inputFile,
          format: OutputFormat.CSV,
          destination: outputFile,
          target: SearchTarget.ALL,
          fuzzy: undefined,
        });
      });
    });

  });

  /**
   * 特殊ケースのテストを実施します。
   */
  describe('special cases', () => {

    beforeAll(() => {
      jest.clearAllMocks();
    });

    it('should receive "-" as inputFile', async () => {
      // テストデータ
      const inputFile = '-';
      // テスト実施
      await runCommand(inputFile);
      // 結果
      expect(geocode).toBeCalledWith({
        ckanId: 'ba000001',
        dataDir: expect.any(String),
        source: SINGLE_DASH_ALTERNATIVE,
        format: OutputFormat.JSON,
        destination: undefined,
        target: SearchTarget.ALL,
        fuzzy: undefined,
      });
    });

    it('should show the command help if no arguments', async () => {
      // テストデータ
      const buffer: string[] = [];
      // モック定義
      const stdErr = jest.spyOn(console, 'error').mockImplementation(
        (line: string) => {
          buffer.push(line);
        });
      // テスト実施
      await runCommand();
      // 結果
      expect(stdErr).toBeCalled();
      expect(buffer.join("\n")).toContain('abr-geocoder version');

      stdErr.mockRestore();
    });

    it('should occur an error if input file is invalid', async () => {
      // テストデータ
      const buffer: string[] = [];
      // モック定義
      const stdErr = jest.spyOn(console, 'error').mockImplementation(
        (line: string) => {
          buffer.push(line);
        });
      // テスト実施
      await runCommand('invalidFilePathSuchAs1');
      // 結果
      expect(stdErr).toBeCalled();
      expect(buffer.join("\n")).toContain(
        AbrgMessage.toString(AbrgMessage.CANNOT_FIND_INPUT_FILE),
      );
      stdErr.mockRestore();
    });

  });
});


describe('cli › geocoding › special cases › fuzzy option errors', () => {
  let originalConsoleError: typeof console.error;
  let originalExit: typeof process.exit;
  let consoleErrorCalledWith: any;
  let exitCalledWith: number | undefined;

  beforeEach(() => {
    originalConsoleError = console.error;
    originalExit = process.exit;
    consoleErrorCalledWith = undefined;
    exitCalledWith = undefined;

    console.error = (...args: any[]) => { consoleErrorCalledWith = args; };
    process.exit = ((code?: number) => { exitCalledWith = code; }) as unknown as typeof process.exit;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.exit = originalExit;
  });

  const runFuzzyOptionTest = async (fuzzyValue: string) => {
    const inputFile = './somewhere/query.txt';
    await runCommand('--fuzzy', fuzzyValue, inputFile);
  };

  it('should exit with code 1 when fuzzy option is an empty string', async () => {
    await runFuzzyOptionTest('');

    expect(consoleErrorCalledWith).toContain(AbrgMessage.toString(AbrgMessage.CLI_GEOCODE_FUZZY_CHAR_ERROR));
    expect(exitCalledWith).toEqual(1);
  });

  it('should exit with code 1 when fuzzy option has multiple characters', async () => {
    await runFuzzyOptionTest('??');

    expect(consoleErrorCalledWith).toContain(AbrgMessage.toString(AbrgMessage.CLI_GEOCODE_FUZZY_CHAR_ERROR));
    expect(exitCalledWith).toEqual(1);
  });
});

// Programmatically set arguments and execute the CLI script
const runCommand = async (...args: string[]) => {
  const dummyArgv = [
    'node', // Not used but a value is reqired at the index in the array
    'abrg', // Not used but a value is reqired at the index in the array
    ...args
  ];

  // Require the yargs CLI script
  return await main('test', ...dummyArgv);
}