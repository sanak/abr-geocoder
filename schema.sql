CREATE TABLE IF NOT EXISTS "pref" (
  "lg_code" TEXT,
  "pref" TEXT,
  "pref_kana" TEXT,
  "pref_roma" TEXT,
  "efct_date" TEXT,
  "ablt_date" TEXT,
  "remarks" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "pref_code" ON "pref" ("lg_code");

CREATE TABLE IF NOT EXISTS "city" (
  "lg_code" TEXT,
  "pref" TEXT,
  "pref_kana" TEXT,
  "pref_roma" TEXT,
  "county" TEXT,
  "county_kana" TEXT,
  "county_roma" TEXT,
  "city" TEXT,
  "city_kana" TEXT,
  "city_roma" TEXT,
  "ward" TEXT,
  "ward_kana" TEXT,
  "ward_roma" TEXT,
  "efct_date" TEXT,
  "ablt_date" TEXT,
  "remarks" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "city_code" ON "city" ("lg_code");

CREATE TABLE IF NOT EXISTS "town" (
  "lg_code" TEXT,
  "machiaza_id" TEXT,
  "machiaza_type" TEXT,
  "pref" TEXT,
  "pref_kana" TEXT,
  "pref_roma" TEXT,
  "county" TEXT,
  "county_kana" TEXT,
  "county_roma" TEXT,
  "city" TEXT,
  "city_kana" TEXT,
  "city_roma" TEXT,
  "ward" TEXT,
  "ward_kana" TEXT,
  "ward_roma" TEXT,
  "oaza_cho" TEXT,
  "oaza_cho_kana" TEXT,
  "oaza_cho_roma" TEXT,
  "chome" TEXT,
  "chome_kana" TEXT,
  "chome_number" TEXT,
  "koaza" TEXT,
  "koaza_kana" TEXT,
  "koaza_roma" TEXT,
  "machiaza_dist" TEXT,
  "rsdt_addr_flg" TEXT,
  "rsdt_addr_mtd_code" TEXT,
  "oaza_cho_aka_flg" TEXT,
  "koaza_aka_code" TEXT,
  "oaza_cho_gsi_uncmn" TEXT,
  "koaza_gsi_uncmn" TEXT,
  "status_flg" TEXT,
  "wake_num_flg" TEXT,
  "efct_date" TEXT,
  "ablt_date" TEXT,
  "src_code" TEXT,
  "post_code" TEXT,
  "remarks" TEXT,

  -- mt_town_pos_prefXX から結合
  "rep_lon" REAL DEFAULT null,
  "rep_lat" REAL DEFAULT null
);
CREATE UNIQUE INDEX IF NOT EXISTS "town_code" ON "town" ("lg_code", "machiaza_id");

CREATE TABLE IF NOT EXISTS "rsdtdsp_blk" (
  "lg_code" TEXT,
  "machiaza_id" TEXT,
  "blk_id" TEXT,
  "city" TEXT,
  "ward" TEXT,
  "oaza_cho" TEXT,
  "chome" TEXT,
  "koaza" TEXT,
  "blk_num" TEXT,
  "rsdt_addr_flg" TEXT,
  "rsdt_addr_mtd_code" TEXT,
  "status_flg" TEXT,
  "efct_date" TEXT,
  "ablt_date" TEXT,
  "src_code" TEXT,
  "remarks" TEXT,

  -- mt_rsdtdsp_blk_pos_prefXX から結合
  "rep_lon" REAL DEFAULT null,
  "rep_lat" REAL DEFAULT null
);
CREATE UNIQUE INDEX IF NOT EXISTS "rsdtdsp_blk_code" ON "rsdtdsp_blk" ("lg_code", "machiaza_id", "blk_id");

CREATE TABLE IF NOT EXISTS "rsdtdsp_rsdt" (
  "lg_code" TEXT,
  "machiaza_id" TEXT,
  "blk_id" TEXT,
  "rsdt_id" TEXT,
  "rsdt2_id" TEXT,
  "city" TEXT,
  "ward" TEXT,
  "oaza_cho" TEXT,
  "chome" TEXT,
  "koaza" TEXT,
  "blk_num" TEXT,
  "rsdt_num" TEXT,
  "rsdt_num2" TEXT,
  "basic_rsdt_div" TEXT,
  "rsdt_addr_flg" TEXT,
  "rsdt_addr_mtd_code" TEXT,
  "status_flg" TEXT,
  "efct_date" TEXT,
  "ablt_date" TEXT,
  "src_code" TEXT,
  "remarks" TEXT,

  -- mt_rsdtdsp_rsdt_pos_prefXX から結合
  "rep_lon" REAL DEFAULT null,
  "rep_lat" REAL DEFAULT null
);

CREATE UNIQUE INDEX IF NOT EXISTS "rsdtdsp_rsdt_code" ON "rsdtdsp_rsdt" (
  "lg_code", "machiaza_id", "blk_id", "rsdt_id", "rsdt2_id"
);

CREATE TABLE IF NOT EXISTS "parcel" (
  "lg_code" TEXT,
  "machiaza_id" TEXT,
  "prc_id" TEXT,
  "city" TEXT,
  "ward" TEXT,
  "oaza_cho" TEXT,
  "chome" TEXT,
  "koaza" TEXT,
  "prc_num1" TEXT,
  "prc_num2" TEXT,
  "prc_num3" TEXT,
  "rsdt_addr_flg" TEXT,
  "prc_rec_flg" TEXT,
  "prc_area_code" TEXT,
  "efct_date" TEXT,
  "ablt_date" TEXT,
  "src_code" TEXT,
  "remarks" TEXT,
  "real_prop_num" TEXT,
  -- mt_parcel_pos_cityXXXXXX から結合
  "rep_lon" REAL DEFAULT null,
  "rep_lat" REAL DEFAULT null
);
CREATE UNIQUE INDEX IF NOT EXISTS "parcel_code" ON "parcel" ("lg_code", "machiaza_id", "prc_id");

CREATE TABLE IF NOT EXISTS "metadata" (
  "ckan_id" TEXT,
  "format_version" TEXT,
  "last_modified" TEXT,
  "content_length" INTEGER,
  "etag" TEXT,
  "file_url" TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "metadata_ckan_id" ON "metadata" ("ckan_id");

CREATE TABLE IF NOT EXISTS "dataset" (
  "key" TEXT,
  "type" TEXT,
  "content_length" NUMBER,
  "crc32" NUMBER,
  "last_modified" NUMBER
);
CREATE UNIQUE INDEX IF NOT EXISTS "dataset_key" ON "dataset" ("key");

CREATE TABLE IF NOT EXISTS "dataset_metadata" (
  "dataset_id" TEXT,
  "last_modified" TEXT,
  "content_length" INTEGER,
  "etag" TEXT,
  "file_url" TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "dataset_id" ON "dataset_metadata" ("dataset_id");
