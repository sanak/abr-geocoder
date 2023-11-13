import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index(
  'rsdtdsp_rsdt_code_idx',
  ['lgCode', 'townId', 'blkId', 'addrId', 'addr2Id'],
  { unique: true }
)
export class RsdtdspRsdt {
  @PrimaryColumn('text', { name: 'lg_code', comment: '全国地方公共団体コード' })
  lgCode!: string;

  @PrimaryColumn('text', { name: 'town_id', comment: '町字ID' })
  townId!: string;

  @PrimaryColumn('text', { name: 'blk_id', comment: '街区ID' })
  blkId!: string;

  @PrimaryColumn('text', { name: 'addr_id', comment: '住居ID' })
  addrId!: string;

  @PrimaryColumn('text', {
    name: 'addr2_id',
    // nullable: true, // TODO: インデックスに含まれるため、nullableにできない
    comment: '住居2ID',
  })
  addr2Id!: string;

  @Column('text', { name: 'city_name', comment: '市区町村名' })
  cityName!: string;

  @Column('text', {
    name: 'od_city_name',
    nullable: true,
    comment: '政令市区名',
  })
  odCityName!: string;

  @Column('text', { name: 'oaza_town_name', comment: '大字・町名' })
  oazaTownName!: string;

  @Column('text', { name: 'chome_name', nullable: true, comment: '丁目名' })
  chomeName!: string;

  @Column('text', { name: 'koaza_name', nullable: true, comment: '小字名' })
  koazaName!: string;

  @Column('text', { name: 'blk_num', nullable: true, comment: '街区符号' })
  blkNum!: string;

  @Column('text', { name: 'rsdt_num', comment: '住居番号' })
  rsdtNum!: string;

  @Column('text', { name: 'rsdt_num2', nullable: true, comment: '住居番号2' })
  rsdtNum2!: string;

  @Column('integer', { name: 'rsdt_addr_flg', comment: '住居表示フラグ' })
  rsdtAddrFlg!: number;

  @Column('integer', {
    name: 'rsdt_addr_mtd_code',
    comment: '住居表示方式コード',
  })
  rsdtAddrMtdCode!: number;

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

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;

  // 住居表示-住居位置参照(mt_rsdtdsp_rsdt_pos_prefXX)から結合
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
