import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1705589170557 implements MigrationInterface {
  name = 'InitialSchema1705589170557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    let needsOldDataMigration = false;
    if (queryRunner.connection.options.type === 'better-sqlite3') {
      const hasOldMetadataIdx =
        (
          await queryRunner.query(
            "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'metadata_key'"
          )
        )?.length > 0;
      if (hasOldMetadataIdx) {
        needsOldDataMigration = true;
      }
    }
    if (needsOldDataMigration) {
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
      await queryRunner.query(
        'ALTER TABLE "metadata" RENAME TO "metadata_old"'
      );
      await queryRunner.query('ALTER TABLE "dataset" RENAME TO "dataset_old"');
    }

    await queryRunner.query(`
      CREATE TABLE "pref" (
        "lg_code" varchar(6) PRIMARY KEY NOT NULL,
        "pref_name" text NOT NULL,
        "pref_name_kana" text NOT NULL,
        "pref_name_roma" text NOT NULL,
        "efct_date" text,
        "ablt_date" text,
        "remarks" text
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "city" (
        "lg_code" varchar(6) PRIMARY KEY NOT NULL,
        "pref_name" text NOT NULL,
        "pref_name_kana" text NOT NULL,
        "pref_name_roma" text NOT NULL,
        "county_name" text,
        "county_name_kana" text,
        "county_name_roma" text,
        "city_name" text NOT NULL,
        "city_name_kana" text NOT NULL,
        "city_name_roma" text NOT NULL,
        "od_city_name" text,
        "od_city_name_kana" text,
        "od_city_name_roma" text,
        "efct_date" text,
        "ablt_date" text,
        "remarks" text
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "town" (
        "lg_code" varchar(6) NOT NULL,
        "town_id" varchar(7) NOT NULL,
        "town_code" smallint NOT NULL,
        "pref_name" text NOT NULL,
        "pref_name_kana" text NOT NULL,
        "pref_name_roma" text NOT NULL,
        "county_name" text,
        "county_name_kana" text,
        "county_name_roma" text,
        "city_name" text NOT NULL,
        "city_name_kana" text NOT NULL,
        "city_name_roma" text NOT NULL,
        "od_city_name" text,
        "od_city_name_kana" text,
        "od_city_name_roma" text,
        "oaza_town_name" text,
        "oaza_town_name_kana" text,
        "oaza_town_name_roma" text,
        "chome_name" text,
        "chome_name_kana" text,
        "chome_name_number" text,
        "koaza_name" text,
        "koaza_name_kana" text,
        "koaza_name_roma" text,
        "rsdt_addr_flg" smallint NOT NULL,
        "rsdt_addr_mtd_code" smallint,
        "oaza_town_alt_name_flg" smallint,
        "koaza_alt_name_flg" smallint,
        "oaza_frn_ltrs_flg" text,
        "koaza_frn_ltrs_flg" text,
        "status_flg" text,
        "wake_num_flg" smallint,
        "efct_date" text,
        "ablt_date" text,
        "src_code" smallint,
        "post_code" text,
        "remarks" text,
        "rep_pnt_lon" double precision,
        "rep_pnt_lat" double precision,
        PRIMARY KEY ("lg_code", "town_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rsdtdsp_blk" (
        "lg_code" varchar(6) NOT NULL,
        "town_id" varchar(7) NOT NULL,
        "blk_id" varchar(3) NOT NULL,
        "city_name" text NOT NULL,
        "od_city_name" text,
        "oaza_town_name" text NOT NULL,
        "chome_name" text,
        "koaza_name" text,
        "blk_num" text,
        "rsdt_addr_flg" smallint NOT NULL,
        "rsdt_addr_mtd_code" smallint NOT NULL,
        "oaza_frn_ltrs_flg" text,
        "koaza_frn_ltrs_flg" text,
        "status_flg" text,
        "efct_date" text,
        "ablt_date" text,
        "src_code" smallint,
        "remarks" text,
        "rep_pnt_lon" double precision,
        "rep_pnt_lat" double precision,
        PRIMARY KEY ("lg_code", "town_id", "blk_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rsdtdsp_rsdt" (
        "lg_code" varchar(6) NOT NULL,
        "town_id" varchar(7) NOT NULL,
        "blk_id" varchar(3) NOT NULL,
        "addr_id" varchar(3) NOT NULL,
        "addr2_id" varchar(5) NOT NULL,
        "city_name" text NOT NULL,
        "od_city_name" text,
        "oaza_town_name" text NOT NULL,
        "chome_name" text,
        "koaza_name" text,
        "blk_num" text,
        "rsdt_num" text NOT NULL,
        "rsdt_num2" text,
        "basic_rsdt_div" text,
        "rsdt_addr_flg" smallint NOT NULL,
        "rsdt_addr_mtd_code" smallint NOT NULL,
        "oaza_frn_ltrs_flg" text,
        "koaza_frn_ltrs_flg" text,
        "status_flg" text,
        "efct_date" text,
        "ablt_date" text,
        "src_code" smallint,
        "remarks" text,
        "rep_pnt_lon" double precision,
        "rep_pnt_lat" double precision,
        PRIMARY KEY (
            "lg_code",
            "town_id",
            "blk_id",
            "addr_id",
            "addr2_id"
        )
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "metadata" (
        "key" varchar(255) PRIMARY KEY NOT NULL,
        "value" text NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "dataset" (
        "key" varchar(255) PRIMARY KEY NOT NULL,
        "type" text NOT NULL,
        "content_length" bigint NOT NULL,
        "crc32" bigint NOT NULL,
        "last_modified" bigint NOT NULL
      )
    `);

    if (needsOldDataMigration) {
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
      await queryRunner.query(`
        DROP INDEX IF EXISTS "dataset_key";
        DROP TABLE IF EXISTS "dataset_old";
        DROP INDEX IF EXISTS "metadata_key";
        DROP TABLE IF EXISTS "metadata_old";
        DROP INDEX IF EXISTS "rsdtdsp_rsdt_code";
        DROP TABLE IF EXISTS "rsdtdsp_rsdt_old";
        DROP INDEX IF EXISTS "rsdtdsp_blk_code";
        DROP TABLE IF EXISTS "rsdtdsp_blk_old";
        DROP INDEX IF EXISTS "town_code";
        DROP TABLE IF EXISTS "town_old";
        DROP INDEX IF EXISTS "city_code";
        DROP TABLE IF EXISTS "city_old";
        DROP INDEX IF EXISTS "pref_code";
        DROP TABLE IF EXISTS "pref_old";
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "dataset"
    `);
    await queryRunner.query(`
      DROP TABLE "metadata"
    `);
    await queryRunner.query(`
      DROP TABLE "rsdtdsp_rsdt"
    `);
    await queryRunner.query(`
      DROP TABLE "rsdtdsp_blk"
    `);
    await queryRunner.query(`
      DROP TABLE "city"
    `);
    await queryRunner.query(`
      DROP TABLE "town"
    `);
    await queryRunner.query(`
      DROP TABLE "pref"
    `);
  }
}
