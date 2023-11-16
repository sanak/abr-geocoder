import 'reflect-metadata';
import { DataSource } from 'typeorm';

// export default new DataSource({
export const AbrgDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'ba000001.sqlite',
  synchronize: false,
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  migrationsRun: true,
  statementCacheSize: 150,
  prepareDatabase: db => {
    db.pragma('journal_mode = MEMORY');
    db.pragma('synchronous = OFF');
  },
});
