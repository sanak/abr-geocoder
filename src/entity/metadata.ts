import { Entity, Index, PrimaryColumn, Column } from 'typeorm';

@Entity()
@Index('metadata_key_idx', ['key'], { unique: true })
export class Metadata {
  @PrimaryColumn('text')
  key!: string;

  @Column('text')
  value!: string;
}
