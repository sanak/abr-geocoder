import { EntitySchema } from 'typeorm';
import { LoggerOptions } from 'typeorm';
import { MixedList } from 'typeorm';

export interface CommonDataSourceOptions {
  readonly entities?: MixedList<Function | string | EntitySchema>;
  readonly migrations?: MixedList<Function | string>;
  readonly logging?: LoggerOptions;
  readonly synchronize?: boolean;
  readonly migrationsRun?: boolean;
}
