# abr-geocoder Rest API
デジタル庁 アドレス・ベース・レジストリ ジオコーダー Rest API
- 町字IDを付与する
- アドレス（住所・所在地）文字列を正規化する
- 緯度経度とマッチングレベルを出力する

## インデックス
- [abr-geocoder Rest API](#abr-geocoder-rest-api)
  - [インデックス](#インデックス)
  - [ドキュメント](#ドキュメント)
  - [使用環境](#使用環境)
  - [事前作業](#事前作業)
    - [インストール](#インストール)
    - [ダウンロード](#ダウンロード)
  - [使い方](#使い方)
    - [API 起動手順](#api-起動手順)
  - [API 仕様](#api-仕様)


## ドキュメント
- [このプロジェクトへの参加について](docs/CONTRIBUTING.ja.md)

-------

## 使用環境

コマンドを実行するためには **node.js version 18以上** が必要です。  
API 起動に Docker を使用しているため、Docker のインストールが必要です。

## 事前作業
### インストール
[インストール](./README.ja.md#インストール)を参照

### ダウンロード
[ダウンロード](./README.ja.md#download)を参照

## 使い方

### API 起動手順

#### abr-geocoder ディレクトリに移動
```
$ cd {インストール先パス}/abr-geocoder
```
#### docker build の実施
```
$ docker image build -t abrg-server . 
```

#### docker 起動
```
$ docker run -v ~/.abr-geocoder:/root/.abr-geocoder -p 3000:3000 abrg-server
```

### リクエスト
`query`: `東京都千代田区紀尾井町1-3`
```
$ curl http://localhost:3000/abr-geocoder/%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%8D%83%E4%BB%A3%E7%94%B0%E5%8C%BA%E7%B4%80%E5%B0%BE%E4%BA%95%E7%94%BA1-3.json
```

## API 仕様

[./redoc/index.html](./redoc/index.html )を参照
