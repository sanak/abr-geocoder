#!/usr/bin/env node

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

import { AbrgError, AbrgErrorLevel } from '@abrg-error/abrg-error';
import { AbrgMessage } from '@abrg-message/abrg-message';
import { downloadDataset } from '@controller/download/download-dataset';
import { geocode } from '@controller/geocode/geocode';
import { updateCheck } from '@controller/update-check/update-check';
import { UPDATE_CHECK_RESULT } from '@controller/update-check/update-check-result';
import { OutputFormat } from '@domain/output-format';
import { SearchTarget } from '@domain/search-target';
import {
  DEFAULT_FUZZY_CHAR,
  SINGLE_DASH_ALTERNATIVE,
} from '@settings/constant-values';
import fs from 'node:fs';
import { exit } from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getPackageInfo } from '@domain/get-package-info';
import { CliDefaultValues } from '@settings/cli-default-values';

const terminalWidth = Math.min(yargs.terminalWidth(), 120);

// yargs が '-' を解析できないので、別の文字に置き換える
export const parseHelper = (processArgv: string[]): string[] => {
  const SINGLE_SPACE = ' ';

  const result: string[] = [];
  const stack: string[] = [SINGLE_SPACE];

  for (const arg of processArgv) {
    for (const char of arg) {
      if (char === SINGLE_SPACE && stack.at(-1) === SINGLE_SPACE) {
        continue;
      }
      stack.push(char);
    }
    if (stack.at(-1) !== SINGLE_SPACE) {
      stack.push(SINGLE_SPACE);
    }
  }

  const buffer: string[] = [];
  while (stack.length > 0) {
    const char = stack.pop()!;

    if (char !== SINGLE_SPACE) {
      buffer.unshift(char);
      continue;
    }

    if (buffer.length === 0) {
      continue;
    }

    // Special replace cases
    let word = buffer.join('');
    switch (word) {
      case '-':
        word = SINGLE_DASH_ALTERNATIVE;
        break;

      case '--fuzzy':
        if (result.length === 0) {
          result.unshift(DEFAULT_FUZZY_CHAR);
        }
        break;

      default:
        break;
    }

    result.unshift(word);
    buffer.length = 0;
  }
  return result;
};

export const main = async (
  nodeEnv: string | undefined,
  ...processArgv: string[]
) => {
  const { version } = await getPackageInfo();
  const parsedArgs = parseHelper(processArgv);

  /**
   * CLIパーサー (通常のプログラムのエントリーポイント)
   */
  yargs
    .version(version)
    .wrap(terminalWidth)
    .scriptName('abrg')

    /**
     * abrg update-check
     * ローカルDBと比較して新しいデータセットの有無を調べる
     */
    .command(
      'update-check [options]',
      AbrgMessage.toString(AbrgMessage.CLI_UPDATE_CHECK_DESC),
      (yargs: yargs.Argv) => {
        return yargs
          .option('dataDir', {
            alias: 'd',
            type: 'string',
            default: CliDefaultValues.DATA_DIR,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_COMMON_DATADIR_OPTION
            ),
          })
          .option('resource', {
            alias: 'r',
            type: 'string',
            default: CliDefaultValues.CKAN_ID,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_COMMON_RESOURCE_OPTION
            ),
          })
          .option('pref', {
            alias: 'p',
            type: 'string',
            default: CliDefaultValues.PREF_CODE,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_UPDATE_CHECK_PREF_OPTION
            ),
          });
      },
      async argv => {
        const result = await updateCheck({
          ckanId: argv.resource,
          dataDir: argv.dataDir,
          prefCode: argv.pref,
        });
        if (result === UPDATE_CHECK_RESULT.NO_UPDATE_IS_AVAILABLE) {
          exit(1);
        }
      }
    )

    /**
     * abrg download
     * データセットをダウンロードする
     */
    .command(
      'download [options]',
      AbrgMessage.toString(AbrgMessage.CLI_DOWNLOAD_DESC),
      (yargs: yargs.Argv) => {
        return yargs
          .option('dataDir', {
            alias: 'd',
            type: 'string',
            default: CliDefaultValues.DATA_DIR,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_COMMON_DATADIR_OPTION
            ),
          })
          .option('resource', {
            alias: 'r',
            type: 'string',
            default: CliDefaultValues.CKAN_ID,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_COMMON_RESOURCE_OPTION
            ),
          })
          .option('pref', {
            alias: 'p',
            type: 'string',
            default: CliDefaultValues.PREF_CODE,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_DOWNLOAD_PREF_OPTION
            ),
          });
      },
      async argv => {
        await downloadDataset({
          ckanId: argv.resource,
          dataDir: argv.dataDir,
          prefCode: argv.pref,
        });
      }
    )

    /**
     * abrg
     * 入力されたファイル、または標準入力から与えられる住所をジオコーディングする
     */
    .command(
      '$0 <inputFile> [outputFile] [options]',
      AbrgMessage.toString(AbrgMessage.CLI_GEOCODE_DESC),
      (yargs: yargs.Argv) => {
        return yargs
          .option('target', {
            type: 'string',
            default: SearchTarget.ALL,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_GEOCODE_TARGET_OPTION
            ),
            choices: [SearchTarget.ALL, SearchTarget.PARCEL],
          })
          .option('fuzzy', {
            type: 'string',
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_GEOCODE_FUZZY_OPTION
            ),
            coerce: fuzzy => {
              if (fuzzy.length !== 1) {
                console.error(
                  AbrgMessage.toString(AbrgMessage.CLI_GEOCODE_FUZZY_CHAR_ERROR)
                );
                exit(1);
              }
              return fuzzy;
            },
          })
          .option('dataDir', {
            alias: 'd',
            type: 'string',
            default: CliDefaultValues.DATA_DIR,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_COMMON_DATADIR_OPTION
            ),
          })
          .option('resource', {
            alias: 'r',
            type: 'string',
            default: CliDefaultValues.CKAN_ID,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_COMMON_RESOURCE_OPTION
            ),
          })
          .option('format', {
            alias: 'f',
            type: 'string',
            default: OutputFormat.JSON,
            describe: AbrgMessage.toString(
              AbrgMessage.CLI_GEOCODE_FORMAT_OPTION
            ),
            choices: [
              OutputFormat.CSV,
              OutputFormat.JSON,
              OutputFormat.NDJSON,
              OutputFormat.GEOJSON,
              OutputFormat.NDGEOJSON,
              OutputFormat.NORMALIZE,
            ],
          })
          .positional('inputFile', {
            describe: AbrgMessage.toString(AbrgMessage.CLI_GEOCODE_INPUT_FILE),
            type: 'string',
            coerce: (inputFile: string) => {
              if (
                inputFile === SINGLE_DASH_ALTERNATIVE ||
                (nodeEnv === 'test' && inputFile !== 'invalidFilePathSuchAs1')
              ) {
                return inputFile;
              }

              if (fs.existsSync(inputFile)) {
                return inputFile;
              }
              throw new AbrgError({
                messageId: AbrgMessage.CANNOT_FIND_INPUT_FILE,
                level: AbrgErrorLevel.ERROR,
              });
            },
          })
          .positional('outputFile', {
            describe: AbrgMessage.toString(AbrgMessage.CLI_GEOCODE_OUTPUT_FILE),
            type: 'string',
            default: undefined,
          });
      },
      async argv => {
        // Prevent users from running this command without options.
        // i.e. $> abrg
        if (!argv['inputFile']) {
          return;
        }
        await geocode({
          source: argv['inputFile'] as string,
          destination: argv['outputFile'] as string | undefined,
          format: argv.format as OutputFormat,
          target: argv.target,
          fuzzy: argv.fuzzy,
          dataDir: argv.dataDir,
          ckanId: argv.resource,
        });
      }
    )
    .fail((msg: string, e: Error, yargs: yargs.Argv<{}>) => {
      if (parsedArgs.length <= 2) {
        // Show help if no options are provided.
        yargs.showVersion((version: string) => {
          console.error('====================================');
          console.error(`= abr-geocoder version: ${version}`);
          console.error('====================================');
        });
        yargs.showHelp();
        return;
      }

      // Otherwise, show the error message
      console.error(`[error] ${msg || e.message}`, e);

      if (process.env.NODE_ENV !== 'test') {
        exit(1);
      }
    })
    .parse(hideBin(parsedArgs));
};
if (process.env.NODE_ENV !== 'test') {
  main(process.env.NODE_ENV, ...process.argv);
}
