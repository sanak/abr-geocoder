import { DataSourceOptions, QueryRunner } from 'typeorm';
import { CommonDataSourceOptions } from './common-data-source-options';
import {
  DS_Type,
  DataSourceProvider,
  IPrepareSQL,
} from './data-source-provider';

export class SqliteProvider extends DataSourceProvider {
  get type(): DS_Type {
    return DS_Type.sqlite;
  }

  private constructor(options: DataSourceOptions) {
    super(options);
  }

  prepare(sql: string): IPrepareSQL {
    return super.prepare(sql);
  }

  static readonly create = ({
    commonOptions,
    database,
  }: {
    commonOptions: CommonDataSourceOptions;
    database?: string;
  }): SqliteProvider => {
    return new SqliteProvider({
      ...commonOptions,
      type: 'better-sqlite3',
      // src/interface-adapter/providers/provide-data-source.ts 内で絶対パスに更新
      database: database || 'ba0000001.sqlite',
      statementCacheSize: 150,
      prepareDatabase: db => {
        db.pragma('journal_mode = MEMORY');
        db.pragma('synchronous = OFF');
      },
    });
  };

  static readonly hasOldMetadataIdx = async (queryRunner: QueryRunner) => {
    // TypeORM対応以前のDBのインデックス(metadata_key)が存在するかどうかを確認
    const hasOldMetadataIdx =
      (
        await queryRunner.query(
          "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'metadata_key'"
        )
      )?.length > 0;
    return hasOldMetadataIdx;
  };

  static beforeInitialSchemaMigrate = async (queryRunner: QueryRunner) => {
    // TypeORM対応以前からのマイグレーションの場合は、元テーブルをリネームしておく
    await queryRunner.query('ALTER TABLE "pref" RENAME TO "pref_old"');
    await queryRunner.query('ALTER TABLE "city" RENAME TO "city_old"');
    await queryRunner.query('ALTER TABLE "town" RENAME TO "town_old"');
    await queryRunner.query(
      'ALTER TABLE "rsdtdsp_blk" RENAME TO "rsdtdsp_blk_old"'
    );
    await queryRunner.query(
      'ALTER TABLE "rsdtdsp_rsdt" RENAME TO "rsdtdsp_rsdt_old"'
    );
    await queryRunner.query('ALTER TABLE "metadata" RENAME TO "metadata_old"');
    await queryRunner.query('ALTER TABLE "dataset" RENAME TO "dataset_old"');
  };

  static afterInitialSchemaMigrate = async (queryRunner: QueryRunner) => {
    // 元テーブルからデータをコピー後、元テーブル・インデックスを削除
    await queryRunner.query('INSERT INTO "pref" SELECT * FROM "pref_old"');
    await queryRunner.query('INSERT INTO "city" SELECT * FROM "city_old"');
    await queryRunner.query('INSERT INTO "town" SELECT * FROM "town_old"');
    await queryRunner.query(
      'INSERT INTO "rsdtdsp_blk" SELECT * FROM "rsdtdsp_blk_old"'
    );
    await queryRunner.query(
      'INSERT INTO "rsdtdsp_rsdt" SELECT * FROM "rsdtdsp_rsdt_old"'
    );
    await queryRunner.query(
      'INSERT INTO "metadata" SELECT * FROM "metadata_old"'
    );
    await queryRunner.query(
      'INSERT INTO "dataset" SELECT * FROM "dataset_old"'
    );
    await queryRunner.query('DROP INDEX IF EXISTS "dataset_key"');
    await queryRunner.query('DROP TABLE IF EXISTS "dataset_old"');
    await queryRunner.query('DROP INDEX IF EXISTS "metadata_key"');
    await queryRunner.query('DROP TABLE IF EXISTS "metadata_old"');
    await queryRunner.query('DROP INDEX IF EXISTS "rsdtdsp_rsdt_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "rsdtdsp_rsdt_old"');
    await queryRunner.query('DROP INDEX IF EXISTS "rsdtdsp_blk_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "rsdtdsp_blk_old"');
    await queryRunner.query('DROP INDEX IF EXISTS "town_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "town_old"');
    await queryRunner.query('DROP INDEX IF EXISTS "city_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "city_old"');
    await queryRunner.query('DROP INDEX IF EXISTS "pref_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "pref_old"');
  };
}
