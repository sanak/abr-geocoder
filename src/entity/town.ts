import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('town_code_idx', ['lgCode', 'townId'], { unique: true })
export class Town {
  @PrimaryColumn('text', { name: 'lg_code', comment: '全国地方公共団体コード' })
  lgCode!: string;

  @PrimaryColumn('text', { name: 'town_id', comment: '町字ID' })
  townId!: string;

  @Column('integer', { name: 'town_code', comment: '町字区分コード' })
  townCode!: number;

  @Column('text', { name: 'pref_name', comment: '都道府県名' })
  prefName!: string;

  @Column('text', { name: 'pref_name_kana', comment: '都道府県名_カナ' })
  prefNameKana!: string;

  @Column('text', { name: 'pref_name_roma', comment: '都道府県名_英字' })
  prefNameRoma!: string;

  @Column('text', { name: 'county_name', nullable: true, comment: '郡名' })
  countyName!: string;

  @Column('text', {
    name: 'county_name_kana',
    nullable: true,
    comment: '郡名_カナ',
  })
  countyNameKana!: string;

  @Column('text', {
    name: 'county_name_roma',
    nullable: true,
    comment: '郡名_英字',
  })
  countyNameRoma!: string;

  @Column('text', { name: 'city_name', comment: '市区町村名' })
  cityName!: string;

  @Column('text', { name: 'city_name_kana', comment: '市区町村名_カナ' })
  cityNameKana!: string;

  @Column('text', { name: 'city_name_roma', comment: '市区町村名_英字' })
  cityNameRoma!: string;

  @Column('text', {
    name: 'od_city_name',
    nullable: true,
    comment: '政令市区名',
  })
  odCityName!: string;

  @Column('text', {
    name: 'od_city_name_kana',
    nullable: true,
    comment: '政令市区名_カナ',
  })
  odCityNameKana!: string;

  @Column('text', {
    name: 'od_city_name_roma',
    nullable: true,
    comment: '政令市区名_英字',
  })
  odCityNameRoma!: string;

  @Column('text', {
    name: 'oaza_town_name',
    nullable: true,
    comment: '大字・町名',
  })
  oazaTownName!: string;

  @Column('text', {
    name: 'oaza_town_name_kana',
    nullable: true,
    comment: '大字・町名_カナ',
  })
  oazaTownNameKana!: string;

  @Column('text', {
    name: 'oaza_town_name_roma',
    nullable: true,
    comment: '大字・町名_英字',
  })
  oazaTownNameRoma!: string;

  @Column('text', { name: 'chome_name', nullable: true, comment: '丁目名' })
  chomeName!: string;

  @Column('text', {
    name: 'chome_name_kana',
    nullable: true,
    comment: '丁目名_カナ',
  })
  chomeNameKana!: string;

  @Column('text', {
    name: 'chome_name_number',
    nullable: true,
    comment: '丁目名_数字',
  })
  chomeNameNumber!: string;

  @Column('text', { name: 'koaza_name', nullable: true, comment: '小字名' })
  koazaName!: string;

  @Column('text', {
    name: 'koaza_name_kana',
    nullable: true,
    comment: '小字名_カナ',
  })
  koazaNameKana!: string;

  @Column('text', {
    name: 'koaza_name_roma',
    nullable: true,
    comment: '小字名_英字',
  })
  koazaNameRoma!: string;

  @Column('integer', { name: 'rsdt_addr_flg', comment: '住居表示フラグ' })
  rsdtAddrFlg!: number;

  @Column('integer', {
    name: 'rsdt_addr_mtd_code',
    nullable: true,
    comment: '住居表示方式コード',
  })
  rsdtAddrMtdCode!: number;

  @Column('integer', {
    name: 'oaza_town_alt_name_flg',
    nullable: true,
    comment: '大字・町_通称フラグ',
  })
  oazaTownAltNameFlg!: number;

  @Column('integer', {
    name: 'koaza_alt_name_flg',
    nullable: true,
    comment: '小字_通称フラグ',
  })
  koazaAltNameFlg!: number;

  @Column('text', {
    name: 'oaza_frn_ltrs_flg',
    nullable: true,
    comment: '大字・町_外字フラグ',
  })
  oazaFrnLtrsFlg!: string;

  @Column('text', {
    name: 'koaza_frn_ltrs_flg',
    nullable: true,
    comment: '小字_外字フラグ',
  })
  koazaFrnLtrsFlg!: string;

  @Column('text', { name: 'status_flg', nullable: true, comment: '状態フラグ' })
  statusFlg!: string;

  @Column('integer', {
    name: 'wake_num_flg',
    nullable: true,
    comment: '起番フラグ',
  })
  wakeNumFlg!: number;

  @Column('date', { name: 'efct_date', nullable: true, comment: '効力発生日' })
  efctDate!: string;

  @Column('date', { name: 'ablt_date', nullable: true, comment: '廃止日' })
  abltDate!: string;

  @Column('integer', {
    name: 'src_code',
    nullable: true,
    comment: '原典資料コード',
  })
  srcCode!: number;

  @Column('text', { name: 'post_code', nullable: true, comment: '郵便番号' })
  postCode!: string;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;

  // 町字位置参照(mt_town_pos_prefXX)から結合
  @Column('float', {
    name: 'rep_pnt_lon',
    nullable: true,
    comment: '代表点_経度',
  })
  repPntLon!: number;

  @Column('float', {
    name: 'rep_pnt_lat',
    nullable: true,
    comment: '代表点_緯度',
  })
  repPntLat!: number;
}
