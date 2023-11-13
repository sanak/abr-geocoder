import 'reflect-metadata';
import { DataSource } from 'typeorm';

// export const AbrgDataSource = new DataSource({
export default new DataSource({
  type: 'better-sqlite3',
  database: 'ba000001.sqlite',
  synchronize: false,
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  subscribers: [],
});
