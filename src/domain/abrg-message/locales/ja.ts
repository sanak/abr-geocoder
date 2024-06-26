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
import { AbrgMessage } from '../abrg-message';

const messages: Record<AbrgMessage, string> = {
  [AbrgMessage.CLI_COMMON_DATADIR_OPTION]:
    'アドレス・ベース・レジストリのデータを格納するディレクトリを指定する。指定されていない場合はデフォルトのディレクトリを参照します。',
  [AbrgMessage.CLI_COMMON_RESOURCE_OPTION]:
    'アドレス・ベース・レジストリのデータソースID。全国データは `ba000001` をお使いください。',
  [AbrgMessage.CLI_DOWNLOAD_DESC]:
    'アドレス・ベース・レジストリの最新データをCKANからダウンロードする',
  [AbrgMessage.CLI_DOWNLOAD_FORCE_DESC]: 'アップデートを強制的に行います',
  [AbrgMessage.CLI_GEOCODE_DESC]:
    '指定されたファイルに含まれる日本の住所を緯度経度に変換します',
  [AbrgMessage.CLI_GEOCODE_FUZZY_OPTION]:
    '指定した1文字をワイルドカードとして処理します',
  [AbrgMessage.CLI_GEOCODE_INPUT_FILE]:
    "日本の住所を1行ごとに記入したテキストファイルへのパス。'-'を指定すると、標準入力から読み取ります",
  [AbrgMessage.CLI_GEOCODE_OUTPUT_FILE]:
    '出力するファイルのパス。省略すると、標準出力に出力します。',
  [AbrgMessage.CLI_GEOCODE_FORMAT_OPTION]:
    "出力フォーマットを指定します。デフォルトは'csv'",
  [AbrgMessage.APPLICATION_DESC]:
    'デジタル庁：アドレス・ベース・レジストリを用いたジオコーダー',
  [AbrgMessage.CLI_UPDATE_CHECK_DESC]: 'データセットのアップデートを確認します',
  [AbrgMessage.ERROR_NO_UPDATE_IS_AVAILABLE]:
    '現状データが最新です。更新を中断します。',
  [AbrgMessage.CHECKING_UPDATE]: 'アップデートの確認中...',
  [AbrgMessage.START_DOWNLOADING_NEW_DATASET]: 'ダウンロード開始',
  [AbrgMessage.EXTRACTING_THE_DATA]: 'ファイルを展開中...',
  [AbrgMessage.LOADING_INTO_DATABASE]: 'データベースに登録中...',
  [AbrgMessage.NEW_DATASET_IS_AVAILABLE]:
    'ローカルのデータが更新できます。 abrg download で更新してください',
  [AbrgMessage.DATA_DOWNLOAD_ERROR]: 'データの取得に失敗しました',
  [AbrgMessage.CANNOT_FIND_THE_SPECIFIED_RESOURCE]:
    '指定されたリソースが見つかりませんでした',
  [AbrgMessage.DOWNLOADED_DATA_DOES_NOT_CONTAIN_THE_RESOURCE_CSV]:
    '指定されたリソースには、CSVファイルが含まれていませんでした',
  [AbrgMessage.START_DOWNLOADING]: 'ダウンロード開始',
  [AbrgMessage.CANNOT_FIND_INPUT_FILE]: '入力ファイルが見つかりませんでした',
  [AbrgMessage.INPUT_SOURCE_FROM_STDIN_ERROR]:
    "inputFile='-' は標準入力から読み取るときに指定します",
  [AbrgMessage.UNSUPPORTED_OUTPUT_FORMAT]:
    'サポートされていない出力形式が指定されました',
  [AbrgMessage.CANNOT_FIND_SQL_FILE]:
    '"schema.sql"ファイルが見つかりませんでした',
  [AbrgMessage.CANNOT_FIND_PACKAGE_JSON_FILE]:
    '"package.json"ファイルが見つかりませんでした',
  [AbrgMessage.PROMPT_CONTINUE_TO_DOWNLOAD]:
    '続けてデータをダウンロードしますか？',
  [AbrgMessage.DOWNLOAD_ERROR]: 'ダウンロードエラー',
  [AbrgMessage.FINDING_THE_DATASET_FILES]:
    'データセットファイルを探しています...',
};
export default messages;
