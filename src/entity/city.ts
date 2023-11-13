import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('city_code_idx', ['lgCode'], { unique: true })
export class City {
  @PrimaryColumn('text', { comment: '全国地方公共団体コード' })
  lgCode!: string;

  @Column('text', { comment: '都道府県名' })
  prefName!: string;

  @Column('text', { comment: '都道府県名_カナ' })
  prefNameKana!: string;

  @Column('text', { comment: '都道府県名_英字' })
  prefNameRoma!: string;

  @Column('text', { nullable: true, comment: '郡名' })
  countyName!: string;

  @Column('text', { nullable: true, comment: '郡名_カナ' })
  countyNameKana!: string;

  @Column('text', { nullable: true, comment: '郡名_英字' })
  countyNameRoma!: string;

  @Column('text', { comment: '市区町村名' })
  cityName!: string;

  @Column('text', { comment: '市区町村名_カナ' })
  cityNameKana!: string;

  @Column('text', { comment: '市区町村名_英字' })
  cityNameRoma!: string;

  @Column('text', { nullable: true, comment: '政令市区名' })
  odCityName!: string;

  @Column('text', { nullable: true, comment: '政令市区名_カナ' })
  odCityNameKana!: string;

  @Column('text', { nullable: true, comment: '政令市区名_英字' })
  odCityNameRoma!: string;

  @Column('date', { nullable: true, comment: '効力発生日' })
  efctDate!: string;

  @Column('date', { nullable: true, comment: '廃止日' })
  abltDate!: string;

  @Column('text', { nullable: true, comment: '備考' })
  remarks!: string;
}
