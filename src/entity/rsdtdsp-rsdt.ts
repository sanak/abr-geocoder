import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index(
  'rsdtdsp_rsdt_code_idx',
  ['lgCode', 'townId', 'blkId', 'addrId', 'addr2Id'],
  { unique: true }
)
export class RsdtdspRsdt {
  @PrimaryColumn('text', { comment: '全国地方公共団体コード' })
  lgCode!: string;

  @PrimaryColumn('text', { comment: '町字ID' })
  townId!: string;

  @PrimaryColumn('text', { comment: '街区ID' })
  blkId!: string;

  @PrimaryColumn('text', { comment: '住居ID' })
  addrId!: string;

  @PrimaryColumn('text', {
    // nullable: true, // TODO: インデックスに含まれるため、nullableにできない
    comment: '住居2ID',
  })
  addr2Id!: string;

  @Column('text', { comment: '市区町村名' })
  cityName!: string;

  @Column('text', { nullable: true, comment: '政令市区名' })
  odCityName!: string;

  @Column('text', { comment: '大字・町名' })
  oazaTownName!: string;

  @Column('text', { nullable: true, comment: '丁目名' })
  chomeName!: string;

  @Column('text', { nullable: true, comment: '小字名' })
  koazaName!: string;

  @Column('text', { nullable: true, comment: '街区符号' })
  blkNum!: string;

  @Column('text', { comment: '住居番号' })
  rsdtNum!: string;

  @Column('text', { nullable: true, comment: '住居番号2' })
  rsdtNum2!: string;

  @Column('integer', { comment: '住居表示フラグ' })
  rsdtAddrFlg!: number;

  @Column('integer', { comment: '住居表示方式コード' })
  rsdtAddrMtdCode!: number;

  @Column('text', { nullable: true, comment: '大字・町_外字フラグ' })
  oazaFrnLtrsFlg!: string;

  @Column('text', { nullable: true, comment: '小字_外字フラグ' })
  koazaFrnLtrsFlg!: string;

  @Column('text', { nullable: true, comment: '状態フラグ' })
  statusFlg!: string;

  @Column('date', { nullable: true, comment: '効力発生日' })
  efctDate!: string;

  @Column('date', { nullable: true, comment: '廃止日' })
  abltDate!: string;

  @Column('integer', { nullable: true, comment: '原典資料コード' })
  srcCode!: number;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;

  // 住居表示-住居位置参照(mt_rsdtdsp_rsdt_pos_prefXX)から結合
  @Column('float', { nullable: true, comment: '代表点_経度' })
  repPntLon!: number;

  @Column('float', { nullable: true, comment: '代表点_緯度' })
  repPntLat!: number;
}