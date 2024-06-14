ARG env_dataset_url=null

# buildコンテナ
FROM node:20-slim AS build
WORKDIR /usr/src/app

# ビルドに必要なものをインストール
RUN apt-get update && apt-get install -y \
  sqlite3 \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*

# 依存関係を開発用も含めてインストール
COPY package.json .
RUN npm install

# ソース群をコピーしビルド
COPY . .
RUN npm run build

# runコンテナ
FROM node:20-slim AS run
ARG env_dataset_url
WORKDIR /usr/src/app

# 必要なものをインストールし、タイムゾーン、ロケールの設定を変更する
RUN apt-get update && apt-get install -y \
  locales \
  sqlite3 \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/* \
  && sed -i -e 's/# \(ja_JP.UTF-8\)/\1/' /etc/locale.gen \
  && locale-gen \
  && update-locale LANG=ja_JP.UTF-8 \
  && ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

# 環境を日本語環境にする（ジオコーディングの結果には影響ないため英語のままで良い場合は不要）
ENV LANG "ja_JP.UTF-8"

# 依存関係をインストール
COPY package.json .
COPY schema.sql .
RUN npm install --omit=dev

# 環境変数
ENV DATASET_URL $env_dataset_url

# ビルドしたソース群をコピー
COPY --from=build /usr/src/app/build build

# ポートを開く
EXPOSE 3000
# サービス起動
CMD ["node","build/api/index.js"]