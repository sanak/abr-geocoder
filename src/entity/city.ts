import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('city_code_idx', ['lg_code'], { unique: true })
export class City {
  @PrimaryColumn('varchar', { length: '6', comment: '全国地方公共団体コード' })
  lg_code!: string;

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

  @Column('text', { nullable: true, comment: '効力発生日' })
  efct_date!: string;

  @Column('text', { nullable: true, comment: '廃止日' })
  ablt_date!: string;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;
}
