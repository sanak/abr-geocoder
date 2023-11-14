import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('pref_code_idx', ['lg_code'], { unique: true })
export class Pref {
  @PrimaryColumn('text', { comment: '全国地方公共団体コード' })
  lg_code!: string;

  @Column('text', { comment: '都道府県名' })
  pref_name!: string;

  @Column('text', { comment: '都道府県名_カナ' })
  pref_name_kana!: string;

  @Column('text', { comment: '都道府県名_英字' })
  pref_name_roma!: string;

  @Column('date', { nullable: true, comment: '効力発生日' })
  efct_date!: string;

  @Column('date', { nullable: true, comment: '廃止日' })
  ablt_date!: string;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;
}
