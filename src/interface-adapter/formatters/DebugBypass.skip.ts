import { Stream } from 'node:stream';
import { GeocodeResult } from '../../domain';
import { TransformCallback } from 'stream';

export class DebugBypass extends Stream.Transform {
  private constructor() {
    super({
      // Data format coming from the previous stream is object mode.
      // Because we expect GeocodeResult
      writableObjectMode: true,

      // Data format to the next stream is non-object mode.
      // Because we output string as Buffer.
      readableObjectMode: false,
    });
  }

  _transform(
    result: GeocodeResult,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    callback(
      null,
      `new GeocodeResult(\n
      '${result.input}',
      ${result.match_level},
      ${result.lat || null},
      ${result.lon || null},
      '${result.other || ''}',
      ${result.prefecture ? "'" + result.prefecture + "'" : undefined},
      ${result.city ? "'" + result.city + "'" : undefined},
      ${result.town ? "'" + result.town + "'" : undefined},
      ${result.town_id ? "'" + result.town_id + "'" : undefined},
      ${result.lg_code ? "'" + result.lg_code + "'" : undefined},
      ${result.block ? "'" + result.block + "'" : undefined},
      ${result.block_id ? "'" + result.block_id + "'" : undefined},
      ${result.addr1 ? "'" + result.addr1 + "'" : undefined},
      ${result.addr1_id ? "'" + result.addr1_id + "'" : undefined},
      ${result.addr2 ? "'" + result.addr2 + "'" : undefined},
      ${result.addr2_id ? "'" + result.addr2_id + "'" : undefined},
    ),
\n`
    );
  }

  static create = (): DebugBypass => {
    return new DebugBypass();
  };
}
