import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('pref_code_idx', ['lgCode'], { unique: true })
export class Pref {
  @PrimaryColumn('text', { comment: '全国地方公共団体コード' })
  lgCode!: string;

  @Column('text', { comment: '都道府県名' })
  prefName!: string;

  @Column('text', { comment: '都道府県名_カナ' })
  prefNameKana!: string;

  @Column('text', { comment: '都道府県名_英字' })
  prefNameRoma!: string;

  @Column('date', { nullable: true, comment: '効力発生日' })
  efctDate!: string;

  @Column('date', { nullable: true, comment: '廃止日' })
  abltDate!: string;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;
}
