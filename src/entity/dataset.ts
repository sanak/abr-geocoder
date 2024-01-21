import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('dataset_key_idx', ['key'], { unique: true })
export class Dataset {
  @PrimaryColumn('varchar', { length: '255' })
  key!: string;

  @Column('text')
  type!: string;

  @Column('bigint')
  content_length!: number;

  @Column('bigint')
  crc32!: number;

  @Column('bigint')
  last_modified!: number;
}
