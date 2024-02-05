import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Metadata {
  @PrimaryColumn('varchar', { length: '255' })
  key!: string;

  @Column('text')
  value!: string;
}
