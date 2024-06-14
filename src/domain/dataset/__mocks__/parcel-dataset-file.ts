import { IDatasetFile, IDatasetFileMeta } from "@domain/dataset-file";
import { Stream } from 'stream';
import { DummyCsvFile } from "./dummy-csv.skip";
import { IStreamReady } from "@domain/istream-ready";

export class ParcelDatasetFile implements IDatasetFile {
  sql: string = 'ParcelDatasetFile sql'
  fileArea: string = 'city011011';
  path: string = 'somewhere';
  filename: string = 'mt_parcel_city011011.csv';
  type: string = 'parcel';
  constructor(
    public csvFile: IStreamReady,
  ) {}

  process(row: { [key: string]: string }): Record<string, string | number> {
    return row;
  }
  
  static create = jest.fn().mockImplementation((params: IDatasetFileMeta, csvFile: IStreamReady) => {
    return new ParcelDatasetFile(csvFile);
  })
}