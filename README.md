# abr-geocoder

[日本語 (Japanese)](./README.ja.md)

Address Base Registry Geocoder by Japan Digital Agency
- Assigns a town ID.
- Normalizes address strings.
- Outputs latitude and longitude pair with matched level.

## Index
- [abr-geocoder](#abr-geocoder)
  - [Index](#index)
  - [Documents](#documents)
  - [Requirement](#requirement)
  - [Install](#install)
  - [Usage](#usage)
    - [download](#download)
    - [update-check](#update-check)
    - [geocode(without command is specified)]
    - [Prefecture codes](#prefecture-codes)
    (#geocode-without-command-is-specified)
  - [Get help with the abr-geocoder](#get-help-with-the-abr-geocoder)
  - [Output Formats](#output-formats)
    - [csv](#csv)
    - [json](#json)
    - [ndjson](#ndjson)
    - [geojson](#geojson)
    - [ndgeojson](#ndgeojson)
    - [Matching Levels](#matching-levels)

## Documents
- [Contributing this project](CONTRIBUTING/CONTRIBUTING.md)

-------

## Requirement

This command requires **node.js version 18 or above**.

## Install

```
$ npm install @digital-go-jp/abr-geocoder
```

## Usage

```
$ abrg download # Download data from the address base registry and create a database.
$ echo "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階" | abrg -
```

### `download`

  Obtains the latest data from server.

  ```
  $ abrg download [options]
  ```

  Downloads the public data from the address base registry ["全アドレスデータ"](https://catalog.registries.digital.go.jp/rc/dataset/ba000001), the parcel master and the parcel positional reference extension into the `$HOME/.abr-geocoder` directory, then creates a local database using SQLite.
  To update the local database, runs `abrg download`.

#### parameters
- `options`  
[OPTIONAL]

  - `-p`, `--pref`

    Downloads the parcel master and the parcel positional reference extension for the specified prefecture code.  
    If omitted, downloads the parcel master and the parcel positional reference extension for all prefectures.
    For prefecture codes, see [Prefecture codes](#prefecture-codes) .

### `update-check`

  Checks the new update data.

  ```
  $ abrg update-check [options]
  ```

  Returns `0` if new data is available in CKAN, the parcel master or the parcel positional reference extension if no local database exists.  
  Returns `1` if the local database is the latest.  
  In that case, runs `download` command.

#### parameters
- `options`  
[OPTIONAL]

  - `-p`, `--pref`

    Checks for updating of the parcel master and the parcel positional reference extension for the specified prefecture code.  
    If omitted, checks for updating of the parcel master and the parcel positional reference extension for all prefectures.  
    For prefecture codes, see [Prefecture codes](#prefecture-codes) .

### `geocode` (without command is specified)

Geocodes from the `<inputFile>`. 
You can also specify `-` for stdin.

```
$ abrg <inputFile> [<outputFile>] [options]
```

#### parameters
- `<inputFile>`  
[REQUIRED]

  - case: Specifies a query file path:  
    Geocodes from the `<inputFile>`. The input file must have Japanese address each line.

    For example:
    ```
    abrg ./sample.txt
    ```

    ```sample.txt
    東京都千代田区紀尾井町1-3
    東京都千代田区永田町1-10-1
    ...
    東京都千代田区永田町一丁目7番1号
    ```

  - case: Specifies `-`:  
    You can also pass the input query through `pipe` command. `-` denotes `stdin`.

    ```
    echo "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階" | abrg -
    ```

- `<outputFile>`  
[OPTIONAL]

  Specifies the file path to save the output.  
  If you ommit, the command prints out to stdout.

  For example：
  ```
  abrg ./sample.txt ./output.json
  echo "東京都千代田区紀尾井町1-3" | abrg - ./output.json
  cat ./sample.txt | abrg - | jq
  ```

- `options`  
[OPTIONAL]
  - `--target`

    Specify the search target.  
    The default is to search for both prefecture and parcel.
    | target | description                                            |
    | ------ | ------------------------------------------------------ |
    | all    | In areas where residential indication has been implemented, the search is performed by street code and dwelling number. <br> In areas where it has not yet been implemented, the search is performed by lot number. |
    | parcel | Searches are performed for parcel.                     |
  
  - `-f`, `--format`

    Specifies output format. Default is `json`.
    | format    | description                                  |
    |-----------|----------------------------------------------|
    | csv       |Output results in comma-separated csv format. |
    | json      |Output results in json format.                |
    | ndjson    |Output results in NDJSON format.              |
    | geojson   |Output results in GeoJSON format.             |
    | ndgeojson |Output results in NDGeoJSON format.           |

  - `--fuzzy`

      Specifies the character to be used as a wildcard. Default is `?``.  
      For example:
      ```
      echo "東京都町?市森野2-2-22" | abrg - --fuzzy "?"
      ```

### Prefecture codes
<details>
<summary>Prefecture codes</summary>

  | code | prefecture |
  |:----:|----------- |
  | 01   | Hokkaido   |
  | 02   | Aomori     |
  | 03   | Iwate      |
  | 04   | Miyagi     |
  | 05   | Akita      |
  | 06   | Yamagata   |
  | 07   | Fukushima  |
  | 08   | Ibaraki    |
  | 09   | Tochigi    |
  | 10   | Gumma      |
  | 11   | Saitama    |
  | 12   | Chiba      |
  | 13   | Tokyo      |
  | 14   | Kanagawa   |
  | 15   | Niigata    |
  | 16   | Toyama     |
  | 17   | Ishikawa   |
  | 18   | Fukui      |
  | 19   | Yamanashi  |
  | 20   | Nagano     |
  | 21   | Gifu       |
  | 22   | Shizuoka   |
  | 23   | Aichi      |
  | 24   | Mie        |
  | 25   | Shiga      |
  | 26   | Kyoto      |
  | 27   | Osaka      |
  | 28   | Hyogo      |
  | 29   | Nara       |
  | 30   | Wakayama   |
  | 31   | Tottori    |
  | 32   | Shimane    |
  | 33   | Okayama    |
  | 34   | Hiroshima  |
  | 35   | Yamaguchi  |
  | 36   | Tokushima  |
  | 37   | Kagawa     |
  | 38   | Ehime      |
  | 39   | Kochi      |
  | 40   | Fukuoka    |
  | 41   | Saga       |
  | 42   | Nagasaki   |
  | 43   | Kumamoto   |
  | 44   | Oita       |
  | 45   | Miyazaki   |
  | 46   | Kagoshima  |
  | 47   | Okinawa    |

</details>

## Get help with the abr-geocoder
Displays this command usage.
  ```
  $ abrg --help
  ```

## Output Formats

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

### Matching Levels

The `level` property denotes the address maching level. 

| level | description |
|-------|-------------|
|  0 | Could not detect at all. |
|  1 | Could detect only prefecture level. |
|  2 | Could detect prefecture and city levels. |
|  3 | Could detect prefecture, city, and a oaza town name. |
|  4 | Could detect prefecture, city, oaza town name and a chome koaza. |
|  7 | Could detect prefecture, city, a town ID, and street name level. |
|  8 | Could detect prefecture, city, a town ID, street name, and extra information, such as suite number. |
| 10 | Could detect prefecture, city, a town ID and parcel.
