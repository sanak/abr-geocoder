# abr-geocoder
デジタル庁 アドレス・ベース・レジストリ ジオコーダー
- 町字IDを付与する
- アドレス（住所・所在地）文字列を正規化する
- 緯度経度とマッチングレベルを出力する

## インデックス
- [abr-geocoder](#abr-geocoder)
  - [インデックス](#インデックス)
  - [ドキュメント](#ドキュメント)
  - [使用環境](#使用環境)
  - [インストール](#インストール)
  - [使い方](#使い方)
    - [download](#download)
    - [update-check](#update-check)
    - [geocoding](#geocoding)
    - [都道府県コード一覧](#都道府県コード一覧)
  - [abr-geocoder のヘルプを参照する](#abr-geocoder-のヘルプを参照する)
  - [出力結果のフォーマット](#出力結果のフォーマット)
    - [csv](#csv)
    - [json](#json)
    - [ndjson](#ndjson)
    - [geojson](#geojson)
    - [ndgeojson](#ndgeojson)
    - [マッチングレベルについて](#マッチングレベルについて)

## ドキュメント
- [このプロジェクトへの参加について](CONTRIBUTING/CONTRIBUTING.ja.md)

-------

## 使用環境

コマンドを実行するためには **node.js version 18以上** が必要です。

## インストール

```
$ npm install @digital-go-jp/abr-geocoder
```

## 使い方

```
$ abrg download # アドレス・ベース・レジストリのデータをダウンロードし、データベース作成します。
$ echo "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階" | abrg -
```

### `download`

  サーバーから最新データを取得します。

  ```
  $ abrg download [options]
  ```

  アドレス・ベース・レジストリの [全アドレスデータ](https://catalog.registries.digital.go.jp/rc/dataset/ba000001) 、地番マスター、地番マスター位置参照拡張を `$HOME/.abr-geocoder` ディレクトリにダウンロードし、SQLiteを使ってデータベースを構築します。  
  作成済みのデータベースを更新するには、`abrg download` を実行してください。  

#### パラメータ
- `options`  
[任意]

  - `-p`, `--pref`

    指定した都道府県コードの地番マスター・地番マスター位置参照拡張のダウンロードを行います。  
    省略された場合はすべての都道府県を対象に地番マスター・地番マスター位置参照拡張をダウンロードします。   
    都道府県コードは [都道府県コード一覧](#都道府県コード一覧) を参照してください。

 
### `update-check`

  データのアップデートの有無を確認します。

  ```
  $ abrg update-check
  ```

  アドレス・ベース・レジストリの [全アドレスデータ](https://catalog.registries.digital.go.jp/rc/dataset/ba000001) 、地番マスター、地番マスター位置参照拡張に新しいデータがある場合（ローカルのデータを確認できなかった場合を含む）は、戻り値 `0` を返し終了します。  
  最新である場合は戻り値 `1` を返し終了します。  
  新しいデータがある場合は、`download` サブコマンドで更新してください。

#### パラメータ
- `options`  
[任意]

  - `-p`, `--pref`

    指定した都道府県コードの地番マスター・地番マスター位置参照拡張の更新確認を行います。  
    省略された場合はすべての都道府県を対象に地番マスター・地番マスター位置参照拡張の更新確認します。  
    都道府県コードは [都道府県コード一覧](#都道府県コード一覧) を参照してください。

### `geocoding`

`<inputFile>`で指定されたファイルに含まれる住所をジオコーディングします。
`-` を指定した場合、標準入力からデータを入力することができます。

```
$ abrg <inputFile> [<outputFile>] [options]
```
#### パラメータ
- `<inputFile>`  
[必須] 

  - ファイルへのパスを指定した場合
  
    指定されたテキストファイルをジオコーディングします。1行単位（１行につき１つのアドレス）で記入してください。
    
      例：
      ```
      abrg ./sample.txt
      ```
      sample.txt
      ```
      東京都千代田区紀尾井町1-3
      東京都千代田区永田町1-10-1
      ...
      東京都千代田区永田町一丁目7番1号
      ```

  - `-` を指定した場合

    標準入力からデータを受け取ります。

      例：
      ```
      echo "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階" | abrg -
      ```

- `<outputFile>`  
[任意]

  指定されたファイルにデータを保存します。省略された場合は標準出力(stdout)に出力されます。

    例：
    ```
    abrg ./sample.txt ./output.json
    echo "東京都千代田区紀尾井町1-3" | abrg - ./output.json
    cat ./sample.txt | abrg - | jq
    ```

- `options`  
[任意]
  - `--target`

    検索対象を指定します。省略された場合は住居表示・地番の両方を対象に検索します。
    | target | 説明 |
    | ------ | ---- |
    | all    | 住居表示実施地域では街区符号・住居番号を、未実施地域では地番を対象に検索を行います
    | parcel | 地番を対象に検索を行います

  - `-f`, `--format`

    出力書式を指定します。省略された場合は `json` で出力されます。
    | format   | 説明 |
    |----------|------|
    | csv      | カンマ区切りのcsv形式で結果を出力します |
    | json     | JSON形式で結果を出力します |
    | ndjson   | NDJSON形式で結果を出力します |
    | geojson  | GeoJSON形式で結果を出力します |
    | ndgeojson| NDGeoJSON形式で結果を出力します |

  - `--fuzzy`

    `--fuzzy` の後ろに、任意の1文字を指定することで、ワイルドカードとして使う文字を変更することが出来ます。  
    省略された場合は `?` です。

        例:
        ```
        echo "東京都町?市森野2-2-22" | abrg - -f json --fuzzy "?"
        ```

### 都道府県コード一覧
<details>
<summary>都道府県コード一覧</summary>

  |コード| 都道府県 |
  |:----:|----------|
  | 01   | 北海道   |
  | 02   | 青森県   |
  | 03   | 岩手県   |
  | 04   | 宮城県   |
  | 05   | 秋田県   |
  | 06   | 山形県   |
  | 07   | 福島県   |
  | 08   | 茨城県   |
  | 09   | 栃木県   |
  | 10   | 群馬県   |
  | 11   | 埼玉県   |
  | 12   | 千葉県   |
  | 13   | 東京都   |
  | 14   | 神奈川県 |
  | 15   | 新潟県   |
  | 16   | 富山県   |
  | 17   | 石川県   |
  | 18   | 福井県   |
  | 19   | 山梨県   |
  | 20   | 長野県   |
  | 21   | 岐阜県   |
  | 22   | 静岡県   |
  | 23   | 愛知県   |
  | 24   | 三重県   |
  | 25   | 滋賀県   |
  | 26   | 京都府   |
  | 27   | 大阪府   |
  | 28   | 兵庫県   |
  | 29   | 奈良県   |
  | 30   | 和歌山県 |
  | 31   | 鳥取県   |
  | 32   | 島根県   |
  | 33   | 岡山県   |
  | 34   | 広島県   |
  | 35   | 山口県   |
  | 36   | 徳島県   |
  | 37   | 香川県   |
  | 38   | 愛媛県   |
  | 39   | 高知県   |
  | 40   | 福岡県   |
  | 41   | 佐賀県   |
  | 42   | 長崎県   |
  | 43   | 熊本県   |
  | 44   | 大分県   |
  | 45   | 宮崎県   |
  | 46   | 鹿児島県 |
  | 47   | 沖縄県   |

</details>

## abr-geocoder のヘルプを参照する
コマンドの使用方法を表示します。
```
$ abrg --help
```

## 出力結果のフォーマット
### `csv`
```
input,output,matching_level,lg_code,pref,city,machiaza,machiaza_id,blk_num,blk_id,rsdt_num,rsdt_id,rsdt_num2,rsdt2_id,prc_num1,prc_num2,prc_num3,prc_id,other,lat,lon
"東京都千代田区紀尾井町1-3","東京都千代田区紀尾井町1-3",8,131016,東京都,千代田区,紀尾井町,0056000,1,001,3,003,,,,,,,,35.679107172,139.736394597
```

### `json`
```
[
  {
    "query": {
      "input": "東京都千代田区紀尾井町1-3"
    },
    "result": {
      "output": "東京都千代田区紀尾井町1-3",
      "matching_level": 8,
      "lg_code": "131016",
      "pref": "東京都",
      "city": "千代田区",
      "machiaza": "紀尾井町",
      "machiaza_id": "0056000",
      "blk_num": "1",
      "blk_id": "001",
      "rsdt_num": "3",
      "rsdt_id": "003",
      "rsdt_num2": null,
      "rsdt2_id": null,
      "prc_num1": null,
      "prc_num2": null,
      "prc_num3": null,
      "prc_id": null,
      "other": null,
      "lat": 35.679107172,
      "lon": 139.736394597
    }
  }
]
```

### `ndjson`
```
{"query":{"input":"東京都千代田区紀尾井町1-3"},"result":{"output":"東京都千代田区紀尾井町1-3","matching_level":8,"lg_code":"131016","pref":"東京都","city":"千代田区","machiaza":"紀尾井町","machiaza_id":"0056000","blk_num":"1","blk_id":"001","rsdt_num":"3","rsdt_id":"003","rsdt_num2":null,"rsdt2_id":null,"prc_num1":null,"prc_num2":null,"prc_num3":null,"prc_id":null,"other":null,"lat":35.679107172,"lon":139.736394597}}
```

### `geojson`
```
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          139.736394597,
          35.679107172
        ]
      },
      "properties": {
        "query": {
          "input": "東京都千代田区紀尾井町1-3"
        },
        "result": {
          "output": "東京都千代田区紀尾井町1-3",
          "matching_level": 8,
          "lg_code": "131016",
          "pref": "東京都",
          "city": "千代田区",
          "machiaza": "紀尾井町",
          "machiaza_id": "0056000",
          "blk_num": "1",
          "blk_id": "001",
          "rsdt_num": "3",
          "rsdt_id": "003",
          "rsdt_num2": null,
          "rsdt2_id": null,
          "prc_num1": null,
          "prc_num2": null,
          "prc_num3": null,
          "prc_id": null,
          "other": null
        }
      }
    }
  ]
}
```

### `ndgeojson`
```
{"type":"Feature","geometry":{"type":"Point","coordinates":[139.736394597,35.679107172]},"properties":{"query":{"input":"東京都千代田区紀尾井町1-3"},"result":{"output":"東京都千代田区紀尾井町1-3","matching_level":8,"lg_code":"131016","pref":"東京都","city":"千代田区","machiaza":"紀尾井町","machiaza_id":"0056000","blk_num":"1","blk_id":"001","rsdt_num":"3","rsdt_id":"003","rsdt_num2":null,"rsdt2_id":null,"prc_num1":null,"prc_num2":null,"prc_num3":null,"prc_id":null,"other":null}}}
```

### マッチングレベルについて
`level` プロパティは、マッチしたアドレスの精度を示しています。
| level | description |
|-------|-------------|
| 0  | 全く判定できなかった |
| 1  | 都道府県まで判別できた |
| 2  | 市区町村まで判別できた |
| 3  | 大字・町名まで判別できた |
| 4  | 丁目・小字まで判別できた |
| 7  | 住居表示の街区までの判別ができた |
| 8  | 住居表示の街区符号・住居番号までの判別ができた |
| 10 | 地番まで判別ができた |