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

import { IMetadata } from '@domain/metadata/imetadata';
/**
 * メタデータを表現します。
 */
export class Metadata implements IMetadata {
  /** CKAN ID */
  public readonly ckanId: string;
  /** フォーマットバージョン */
  public readonly formatVersion: string;
  /** 最終更新日時 */
  public readonly lastModified?: string;
  /** データサイズ */
  public readonly contentLength: number;
  /** エンティティタグ */
  public readonly etag?: string;
  /** ファイルURL */
  public readonly fileUrl: string;

  /**
   * DatasetMetadata クラスのインスタンスを生成します。
   * @param params メタデータ情報に設定する値
   */
  constructor(params: {
    /** CKAN ID */
    ckanId: string;
    /** フォーマットバージョン */
    formatVersion: string;
    /** 最終更新日時 */
    lastModified?: string;
    /** データサイズ */
    contentLength: number;
    /** エンティティタグ */
    etag?: string;
    /** ファイルURL */
    fileUrl: string;
  }) {
    this.ckanId = params.ckanId;
    this.formatVersion = params.formatVersion;
    this.lastModified = params.lastModified;
    this.contentLength = params.contentLength;
    this.etag = params.etag;
    this.fileUrl = params.fileUrl;
    Object.freeze(this);
  }

  /**
   * メタデータ情報をオブジェクト化した値を却します。
   * @returns オブジェクト化したメタデータ情報
   */
  toJSON() {
    return {
      ckanId: this.ckanId,
      formatVersion: this.formatVersion,
      lastModified: this.lastModified,
      contentLength: this.contentLength,
      etag: this.etag,
      fileUrl: this.fileUrl,
    };
  }

  /**
   * メタデータ情報をJSONとして返却します。
   * @returns JSON化したメタデータ情報
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }

  /**
   * 指定されたメタデータ情報との整合性を確認します。
   * @param other 比較対象のメタデータ情報
   * @returns 比較結果
   */
  equal(other?: Metadata): boolean {
    if (!other) {
      return false;
    }

    return (
      this.ckanId === other.ckanId &&
      this.formatVersion === other.formatVersion &&
      this.contentLength === other.contentLength &&
      this.etag === other.etag &&
      this.fileUrl === other.fileUrl &&
      this.lastModified === other.lastModified
    );
  }

  /**
   * メタデータ情報を生成します。
   * @param value メタデータ情報の元なる値
   * @returns メタデータ情報
   */
  static from = (value: string): Metadata => {
    const jsonValue = JSON.parse(value);
    if (
      !('ckanId' in jsonValue) ||
      !('formatVersion' in jsonValue) ||
      !('lastModified' in jsonValue) ||
      !('contentLength' in jsonValue) ||
      !('etag' in jsonValue) ||
      !('fileUrl' in jsonValue)
    ) {
      throw new Error('Can not parse value as Metadata');
    }
    return new Metadata(jsonValue);
  };
}
