import { MigrationInterface, QueryRunner } from 'typeorm';
import { DS_Type } from '@interface-adapter/data-source-providers/data-source-provider';
import { SqliteProvider } from '@interface-adapter/data-source-providers/sqlite-provider';

export class InitialSchema1705589170557 implements MigrationInterface {
  name = 'InitialSchema1705589170557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    let needsOldDataMigration = false;
    if (queryRunner.connection.options.type === DS_Type.sqlite) {
      if (await SqliteProvider.hasOldMetadataIdx(queryRunner)) {
        needsOldDataMigration = true;
      }
    }
    if (needsOldDataMigration) {
      await SqliteProvider.beforeInitialSchemaMigrate(queryRunner);
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
      await SqliteProvider.afterInitialSchemaMigrate(queryRunner);
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
