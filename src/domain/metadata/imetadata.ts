/**
 * メタデータインターフェースを表現します。
 */
export interface IMetadata {
  /** 最終更新日時 */
  lastModified?: string;
  /** データサイズ */
  contentLength: number;
  /** エンティティタグ */
  etag?: string;
  /** ファイルURL */
  fileUrl: string;
}
