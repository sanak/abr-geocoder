import { IDatasetFile, IDatasetFileMeta } from "@domain/dataset-file";
import { IStreamReady } from "@domain/istream-ready";

export class ParcelPosDatasetFile implements IDatasetFile {
  sql: string = 'ParcelPosDatasetFile sql'
  fileArea: string = 'city991011';
  path: string = 'somewhere';
  filename: string = 'mt_parcel_pos_city991011.csv';
  type: string = 'parcel_pos';
  
  constructor(
    public csvFile: IStreamReady,
  ) {}

  process(row: { [key: string]: string }): Record<string, string | number> {
    return row;
  }

  static create = jest.fn().mockImplementation((params: IDatasetFileMeta, csvFile: IStreamReady) => {
    return new ParcelPosDatasetFile(csvFile);
  })
}