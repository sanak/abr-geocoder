import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class RsdtdspBlk {
  @PrimaryColumn('varchar', { length: '6', comment: '全国地方公共団体コード' })
  lg_code!: string;

  @PrimaryColumn('varchar', { length: '7', comment: '町字ID' })
  town_id!: string;

  @PrimaryColumn('varchar', { length: '3', comment: '街区ID' })
  blk_id!: string;

  @Column('text', { comment: '市区町村名' })
  city_name!: string;

  @Column('text', { nullable: true, comment: '政令市区名' })
  od_city_name!: string;

  @Column('text', { comment: '大字・町名' })
  oaza_town_name!: string;

  @Column('text', { nullable: true, comment: '丁目名' })
  chome_name!: string;

  @Column('text', { nullable: true, comment: '小字名' })
  koaza_name!: string;

  @Column('text', { nullable: true, comment: '街区符号' })
  blk_num!: string;

  @Column('smallint', { comment: '住居表示フラグ' })
  rsdt_addr_flg!: number;

  @Column('smallint', { comment: '住居表示方式コード' })
  rsdt_addr_mtd_code!: number;

  @Column('text', { nullable: true, comment: '大字・町_外字フラグ' })
  oaza_frn_ltrs_flg!: string;

  @Column('text', { nullable: true, comment: '小字_外字フラグ' })
  koaza_frn_ltrs_flg!: string;

  @Column('text', { nullable: true, comment: '状態フラグ' })
  status_flg!: string;

  @Column('text', { nullable: true, comment: '効力発生日' })
  efct_date!: string;

  @Column('text', { nullable: true, comment: '廃止日' })
  ablt_date!: string;

  @Column('smallint', { nullable: true, comment: '原典資料コード' })
  src_code!: number;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;

  // 住居表示-街区位置参照(mt_rsdtdsp_blk_pos_prefXX)から結合
  @Column('double precision', { nullable: true, comment: '代表点_経度' })
  rep_pnt_lon!: number;

  @Column('double precision', { nullable: true, comment: '代表点_緯度' })
  rep_pnt_lat!: number;
}
