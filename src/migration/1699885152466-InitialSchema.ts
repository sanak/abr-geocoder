import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1699885152466 implements MigrationInterface {
  name = 'InitialSchema1699885152466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "pref" (
        "lg_code" text PRIMARY KEY NOT NULL,
        "pref_name" text NOT NULL,
        "pref_name_kana" text NOT NULL,
        "pref_name_roma" text NOT NULL,
        "efct_date" date,
        "ablt_date" date,
        "remarks" text
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "pref_code_idx" ON "pref" ("lg_code")
    `);
    await queryRunner.query(`
      CREATE TABLE "city" (
        "lg_code" text PRIMARY KEY NOT NULL,
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
        "efct_date" date,
        "ablt_date" date,
        "remarks" text
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "city_code_idx" ON "city" ("lg_code")
    `);
    await queryRunner.query(`
      CREATE TABLE "town" (
        "lg_code" text NOT NULL,
        "town_id" text NOT NULL,
        "town_code" integer NOT NULL,
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
        "rsdt_addr_flg" integer NOT NULL,
        "rsdt_addr_mtd_code" integer,
        "oaza_town_alt_name_flg" integer,
        "koaza_alt_name_flg" integer,
        "oaza_frn_ltrs_flg" text,
        "koaza_frn_ltrs_flg" text,
        "status_flg" text,
        "wake_num_flg" integer,
        "efct_date" date,
        "ablt_date" date,
        "src_code" integer,
        "post_code" text,
        "remarks" text,
        "rep_pnt_lon" float,
        "rep_pnt_lat" float,
        PRIMARY KEY ("lg_code", "town_id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "town_code_idx" ON "town" ("lg_code", "town_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "rsdtdsp_blk" (
        "lg_code" text NOT NULL,
        "town_id" text NOT NULL,
        "blk_id" text NOT NULL,
        "city_name" text NOT NULL,
        "od_city_name" text,
        "oaza_town_name" text NOT NULL,
        "chome_name" text,
        "koaza_name" text,
        "blk_num" text,
        "rsdt_addr_flg" integer NOT NULL,
        "rsdt_addr_mtd_code" integer NOT NULL,
        "oaza_frn_ltrs_flg" text,
        "koaza_frn_ltrs_flg" text,
        "status_flg" text,
        "efct_date" date,
        "ablt_date" date,
        "src_code" integer,
        "remarks" text,
        "rep_pnt_lon" float,
        "rep_pnt_lat" float,
        PRIMARY KEY ("lg_code", "town_id", "blk_id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "rsdtdsp_blk_code_idx" ON "rsdtdsp_blk" ("lg_code", "town_id", "blk_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "rsdtdsp_rsdt" (
        "lg_code" text NOT NULL,
        "town_id" text NOT NULL,
        "blk_id" text NOT NULL,
        "addr_id" text NOT NULL,
        "addr2_id" text NOT NULL,
        "city_name" text NOT NULL,
        "od_city_name" text,
        "oaza_town_name" text NOT NULL,
        "chome_name" text,
        "koaza_name" text,
        "blk_num" text,
        "rsdt_num" text NOT NULL,
        "rsdt_num2" text,
        "rsdt_addr_flg" integer NOT NULL,
        "rsdt_addr_mtd_code" integer NOT NULL,
        "oaza_frn_ltrs_flg" text,
        "koaza_frn_ltrs_flg" text,
        "status_flg" text,
        "efct_date" date,
        "ablt_date" date,
        "src_code" integer,
        "remarks" text,
        "rep_pnt_lon" float,
        "rep_pnt_lat" float,
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
      CREATE UNIQUE INDEX "rsdtdsp_rsdt_code_idx" ON "rsdtdsp_rsdt" (
        "lg_code",
        "town_id",
        "blk_id",
        "addr_id",
        "addr2_id"
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "metadata" (
        "key" text PRIMARY KEY NOT NULL,
        "value" text NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "metadata_key_idx" ON "metadata" ("key")
    `);
    await queryRunner.query(`
      CREATE TABLE "dataset" (
        "key" text PRIMARY KEY NOT NULL,
        "type" text NOT NULL,
        "content_length" integer NOT NULL,
        "crc32" integer NOT NULL,
        "last_modified" integer NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "dataset_key_idx" ON "dataset" ("key")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "dataset_key_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "dataset"
    `);
    await queryRunner.query(`
      DROP INDEX "metadata_key_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "metadata"
    `);
    await queryRunner.query(`
      DROP INDEX "rsdtdsp_rsdt_code_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "rsdtdsp_rsdt"
    `);
    await queryRunner.query(`
      DROP INDEX "rsdtdsp_blk_code_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "rsdtdsp_blk"
    `);
    await queryRunner.query(`
      DROP INDEX "town_code_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "town"
    `);
    await queryRunner.query(`
      DROP INDEX "city_code_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "city"
    `);
    await queryRunner.query(`
      DROP INDEX "pref_code_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "pref"
    `);
  }
}
