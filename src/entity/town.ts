import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Town {
  @PrimaryColumn('varchar', { length: '6', comment: '全国地方公共団体コード' })
  lg_code!: string;

  @PrimaryColumn('varchar', { length: '7', comment: '町字ID' })
  town_id!: string;

  @Column('smallint', { comment: '町字区分コード' })
  town_code!: number;

  @Column('text', { comment: '都道府県名' })
  pref_name!: string;

  @Column('text', { comment: '都道府県名_カナ' })
  pref_name_kana!: string;

  @Column('text', { comment: '都道府県名_英字' })
  pref_name_roma!: string;

  @Column('text', { nullable: true, comment: '郡名' })
  county_name!: string;

  @Column('text', { nullable: true, comment: '郡名_カナ' })
  county_name_kana!: string;

  @Column('text', { nullable: true, comment: '郡名_英字' })
  county_name_roma!: string;

  @Column('text', { comment: '市区町村名' })
  city_name!: string;

  @Column('text', { comment: '市区町村名_カナ' })
  city_name_kana!: string;

  @Column('text', { comment: '市区町村名_英字' })
  city_name_roma!: string;

  @Column('text', { nullable: true, comment: '政令市区名' })
  od_city_name!: string;

  @Column('text', { nullable: true, comment: '政令市区名_カナ' })
  od_city_name_kana!: string;

  @Column('text', { nullable: true, comment: '政令市区名_英字' })
  od_city_name_roma!: string;

  @Column('text', { nullable: true, comment: '大字・町名' })
  oaza_town_name!: string;

  @Column('text', { nullable: true, comment: '大字・町名_カナ' })
  oaza_town_name_kana!: string;

  @Column('text', { nullable: true, comment: '大字・町名_英字' })
  oaza_town_name_roma!: string;

  @Column('text', { nullable: true, comment: '丁目名' })
  chome_name!: string;

  @Column('text', { nullable: true, comment: '丁目名_カナ' })
  chome_name_kana!: string;

  @Column('text', { nullable: true, comment: '丁目名_数字' })
  chome_name_number!: string;

  @Column('text', { nullable: true, comment: '小字名' })
  koaza_name!: string;

  @Column('text', { nullable: true, comment: '小字名_カナ' })
  koaza_name_kana!: string;

  @Column('text', { nullable: true, comment: '小字名_英字' })
  koaza_name_roma!: string;

  @Column('smallint', { comment: '住居表示フラグ' })
  rsdt_addr_flg!: number;

  @Column('smallint', { nullable: true, comment: '住居表示方式コード' })
  rsdt_addr_mtd_code!: number;

  @Column('smallint', { nullable: true, comment: '大字・町_通称フラグ' })
  oaza_town_alt_name_flg!: number;

  @Column('smallint', { nullable: true, comment: '小字_通称フラグ' })
  koaza_alt_name_flg!: number;

  @Column('text', { nullable: true, comment: '大字・町_外字フラグ' })
  oaza_frn_ltrs_flg!: string;

  @Column('text', { nullable: true, comment: '小字_外字フラグ' })
  koaza_frn_ltrs_flg!: string;

  @Column('text', { nullable: true, comment: '状態フラグ' })
  status_flg!: string;

  @Column('smallint', { nullable: true, comment: '起番フラグ' })
  wake_num_flg!: number;

  @Column('text', { nullable: true, comment: '効力発生日' })
  efct_date!: string;

  @Column('text', { nullable: true, comment: '廃止日' })
  ablt_date!: string;

  @Column('smallint', { nullable: true, comment: '原典資料コード' })
  src_code!: number;

  @Column('text', { nullable: true, comment: '郵便番号' })
  post_code!: string;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;

  // 町字位置参照(mt_town_pos_prefXX)から結合
  @Column('double precision', { nullable: true, comment: '代表点_経度' })
  rep_pnt_lon!: number;

  @Column('double precision', { nullable: true, comment: '代表点_緯度' })
  rep_pnt_lat!: number;
}
