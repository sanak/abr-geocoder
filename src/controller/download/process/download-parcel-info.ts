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
import path from 'path';

/**
 * 地番ダウンロード情報インターフェースを表現します。
 */
export interface IDownloadParcelInfo {
  /** 全国地方公共団体コード */
  lgCode: string;
  /** 地番マスターデータセットURL */
  parcelDatasetUrl: string;
  /** 地番マスター位置参照拡張データセットURL */
  parcelPosDatasetUrl: string;
  /** 地番マスターダウンロード先パス */
  parcelFilePath: string;
  /** 地番マスター位置参照拡張ダウンロード先パス */
  parcelPosFilePath: string;
  /** 地番マスターデータセット管理ID */
  parcelId: string;
  /** 地番マスター位置参照拡張データセット管理ID */
  parcelPosId: string;
}

/**
 * 地番ダウンロード情報を表現します。
 */
export class DownloadParcelInfo implements IDownloadParcelInfo {
  public readonly lgCode: string;
  public readonly parcelDatasetUrl: string;
  public readonly parcelPosDatasetUrl: string;
  public readonly parcelFilePath: string;
  public readonly parcelPosFilePath: string;
  public readonly parcelId: string;
  public readonly parcelPosId: string;

  /** 管理IDプレフィックス */
  private readonly DATASET_ID_PREFIX: string = 'ba-o1-';
  /** 地番マスター管理IDサフィックス */
  private readonly PARCEL_ID_SUFFIX: string = '_g2-000010';
  /** 地番マスター位置参照拡張管理IDサフィックス */
  private readonly PARCEL_POS_ID_SUFFIX: string = '_g2-000011';

  /**
   * {@link DownloadParcelProcessInfo}のインスタンスを生成します。
   * @param params.lgCode 全国地方公共団体コード
   * @param params.downloadDir 地番ダウンロードディレクトリ
   * @param params.datasetPackageShowUrl データセットURL
   */
  constructor(params: {
    /** 全国地方公共団体コード */
    lgCode: string;
    /** 地番ダウンロードディレクトリ */
    downloadDir: string;
    /** データセットURL */
    datasetPackageShowUrl: string;
  }) {
    this.lgCode = params.lgCode;
    this.parcelDatasetUrl = `${params.datasetPackageShowUrl}${this.DATASET_ID_PREFIX}${params.lgCode}${this.PARCEL_ID_SUFFIX}`;
    this.parcelPosDatasetUrl = `${params.datasetPackageShowUrl}${this.DATASET_ID_PREFIX}${params.lgCode}${this.PARCEL_POS_ID_SUFFIX}`;
    this.parcelFilePath = path.join(params.downloadDir, `${params.lgCode}.zip`);
    this.parcelPosFilePath = path.join(
      params.downloadDir,
      `pos_${params.lgCode}.zip`
    );
    this.parcelId = `${this.DATASET_ID_PREFIX}${params.lgCode}${this.PARCEL_ID_SUFFIX}`;
    this.parcelPosId = `${this.DATASET_ID_PREFIX}${params.lgCode}${this.PARCEL_POS_ID_SUFFIX}`;
    Object.freeze(this);
  }
}
