import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('dataset_key_idx', ['key'], { unique: true })
export class Dataset {
  @PrimaryColumn('text')
  key!: string;

  @Column('text')
  type!: string;

  @Column('integer')
  content_length!: number;

  @Column('integer')
  crc32!: number;

  @Column('integer')
  last_modified!: number;
}
