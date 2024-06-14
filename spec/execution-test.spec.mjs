const trimLines = (target) => {
  return target.replace(/^\s*(.*?)\s*$/gm, '$1');
};

const { $ } = await import('zx');
const csvtojson = (await import('csvtojson')).default;
const path = await import('path');
const { fileURLToPath } = await import('url');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { test } = await import('uvu');
const assert = await import('uvu/assert');
const jsonDiff = (await import('json-diff')).default;
const fs = (await import('node:fs')).default;
const which = (await import('which')).default;

class Test {

  async execute(args, input) {
    const p = $`node ${__dirname}/../build/cli/cli.js ${args} --dataDir ${__dirname} --resource demo`.quiet().stdio('pipe');
    p.stdin.write(input);
    p.stdin.end();
    return await p;
  }
}

class JsonTest extends Test {

  async validate(args, input, expectCode, expectOutput) {
    const result = await this.execute(args, input).catch(err => {
      if (expectCode === err.exitCode) {
        return;
      }
      throw err;
    })

    if (result) {
      assert.equal(result.exitCode, expectCode, `The exit code should be ${expectCode}`);
      const diffResult = jsonDiff.diffString(
        JSON.parse(trimLines(result.stdout)),
        expectOutput,
      )
      assert.equal(diffResult, '')
    }
  }
}

class CsvTest extends Test {

  async validate(args, input, expectCode, expectOutput) {
    const result = await this.execute(args, input).catch(err => {
      if (expectCode === err.exitCode) {
        return;
      }
      throw err;
    })

    if (result) {
      assert.equal(result.exitCode, expectCode, `The exit code should be ${expectCode}`);

      const results = await csvtojson({
        output: 'csv',
      }).fromString(trimLines(result.stdout));
      const expectCsv = await csvtojson({
        output: 'csv',
      }).fromString(trimLines(expectOutput));

      const diffResult = jsonDiff.diffString(
        results,
        expectCsv,
      )
      assert.equal(diffResult, '')
    }
  }
}

test('setup', async () => {
  const sqlite3Path = await which('sqlite3', {
    nothrow: true,
  });
  assert.not.equal(sqlite3Path, null, '[error] sqlite3 is not installed')

  if (!fs.existsSync(`${__dirname}/demo.sqlite`)) {
    let result = await $`sqlite3 ${__dirname}/demo.sqlite < ${__dirname}/demo.sql`.quiet();
    assert.equal(result.exitCode, 0, `The exit code should be 0`);
    // metadataテーブルのformat_versionをabr-geocoderのバージョンに更新
    result = await $`sqlite3 ${__dirname}/demo.sqlite "UPDATE metadata SET format_version='${process.env.npm_package_version}' WHERE ckan_id='demo'"`.quiet();
    assert.equal(result.exitCode, 0, `The exit code should be 0`);
  }
})

test(`'echo "<input data>" | abrg - -f csv' should return the expected results as CSV format`, async () => {
  /*
  検索モード：設定しない（all）
  住居検索パターン（住表示フラグ:1）
   東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階
   東京都千代田区九段南10丁目2-1
   東京都千代田区九段南1丁目2-1
  地番検索パターン（住表示フラグ:1）
   島根県松江市青葉台121-2
  */
  const input = `
  //
  // サンプルデータ ('#' または // で始まる行はコメント行として処理します)
  //
  東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階
  東京都千代田区九段南10丁目2-1
  東京都千代田区九段南1丁目2-1
  島根県松江市青葉台121-2
  `;

  const expectResult = `
    input,output,matching_level,lg_code,pref,city,machiaza,machiaza_id,blk_num,blk_id,rsdt_num,rsdt_id,rsdt_num2,rsdt2_id,prc_num1,prc_num2,prc_num3,prc_id,other,lat,lon
    "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階","東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",8,131016,東京都,千代田区,紀尾井町,0056000,1,001,3,003,,,,,,,東京ガーデンテラス紀尾井町 19階、20階,35.679107172,139.736394597
    "東京都千代田区九段南10丁目2-1","東京都千代田区九段南10丁目2-1",3,131016,東京都,千代田区,九段南,0008000,,,,,,,,,,,10丁目2-1,35.693972,139.753265
    "東京都千代田区九段南1丁目2-1","東京都千代田区九段南一丁目2-1",7,131016,東京都,千代田区,九段南一丁目,0008001,2,002,,,,,,,,,-1,35.693948,139.753535
    "島根県松江市青葉台121-2","島根県松江市青葉台121-2",10,322016,島根県,松江市,青葉台,0002000,,,,,,,121,2,,001210000200000,,35.44712148,133.105246137
    `;

  const expectExitCode = 0;
  const tester = new CsvTest();
  await tester.validate('- -f csv', input, expectExitCode, expectResult)
})

test(`'echo "<input data>" | abrg - -f csv' should be error because "brabrabra" is unknown file.`, async () => {

  const input = `東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`;

  const expectResult = `[error] Can not open the source file`;

  const expectExitCode = 1;
  const tester = new CsvTest();
  await tester.validate('brabrabra -f csv', input, expectExitCode, expectResult);
})

test(`'echo "<input data>" | abrg - -f json' should return the expected results as JSON format`, async () => {

  const input = `東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`;

  const expectResult = [
    {
      "query": { "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階" },
      "result": {
        "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
        "matching_level": 8,
        "lg_code": "131016",
        "pref": "東京都",
        "city": "千代田区",
        "machiaza": "紀尾井町",
        "machiaza_id": "0056000",
        "blk_num": "1",
        "blk_id": "001",
        "rsdt_num": "3",
        "rsdt_id": "003",
        "rsdt_num2": null,
        "rsdt2_id": null,
        "prc_num1": null,
        "prc_num2": null,
        "prc_num3": null,
        "prc_id": null,
        "other": "東京ガーデンテラス紀尾井町 19階、20階",
        "lat": 35.679107172,
        "lon": 139.736394597
      }
    }
  ];

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f json', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f ndjson' should return the expected results as JSON format on each line`, async () => {

  const input = `東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`;

  const expectResult = {
    "query": {
      "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
    },
    "result": {
      "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
      "matching_level": 8,
      "lg_code": "131016",
      "pref": "東京都",
      "city": "千代田区",
      "machiaza": "紀尾井町",
      "machiaza_id": "0056000",
      "blk_num": "1",
      "blk_id": "001",
      "rsdt_num": "3",
      "rsdt_id": "003",
      "rsdt_num2": null,
      "rsdt2_id": null,
      "prc_num1": null,
      "prc_num2": null,
      "prc_num3": null,
      "prc_id": null,
      "other": "東京ガーデンテラス紀尾井町 19階、20階",
      "lat": 35.679107172,
      "lon": 139.736394597
    }
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f ndjson', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f geojson' should return the expected results as GEO-JSON format`, async () => {

  const input = trimLines(`東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`);

  const expectResult = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            139.736394597,
            35.679107172
          ]
        },
        "properties": {
          "query": {
            "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階"
          },
          "result": {
            "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
            "matching_level": 8,
            "lg_code": "131016",
            "pref": "東京都",
            "city": "千代田区",
            "machiaza": "紀尾井町",
            "machiaza_id": "0056000",
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": "3",
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "other": "東京ガーデンテラス紀尾井町 19階、20階"
          }
        }
      }
    ]
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f geojson', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f ndgeojson' should return the expected results as GEO-JSON format on each line`, async () => {

  const input = trimLines(`東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`);

  const expectResult = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [
        139.736394597,
        35.679107172
      ]
    },
    "properties": {
      "query": {
        "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階"
      },
      "result": {
        "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
        "matching_level": 8,
        "lg_code": "131016",
        "pref": "東京都",
        "city": "千代田区",
        "machiaza": "紀尾井町",
        "machiaza_id": "0056000",
        "blk_num": "1",
        "blk_id": "001",
        "rsdt_num": "3",
        "rsdt_id": "003",
        "rsdt_num2": null,
        "rsdt2_id": null,
        "prc_num1": null,
        "prc_num2": null,
        "prc_num3": null,
        "prc_id": null,
        "other": "東京ガーデンテラス紀尾井町 19階、20階"
      }
    }
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f ndgeojson', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f csv' should return the expected results as CSV format`, async () => {
  /*
  検索モード：設定しない（all）
    神奈川県横浜市港南区港南
    神奈川県横浜市港南区港南1丁目1-1
    神奈川県横浜市港南区港南3丁目1-1
    東京都千代田区猿楽町3丁目2-3
  */
  const input = `
  //
  // サンプルデータ ('#' または // で始まる行はコメント行として処理します)
  //
  神奈川県横浜市港南区港南10丁目1-1
  神奈川県横浜市港南区港南3丁目100-1
  神奈川県横浜市港南区港南1丁目1-1
  東京都千代田区猿楽町3丁目2-3
  `;

  const expectResult = `
    input,output,match_level,lg_code,prefecture,city,town,town_id,block,block_id,addr1,addr1_id,addr2,addr2_id,prc_num1,prc_num2,prc_num3,prc_id,other,lat,lon
    "神奈川県横浜市港南区港南10丁目1-1","神奈川県横浜市港南区港南10丁目1-1",3,141119,神奈川県,横浜市港南区,港南,0007000,,,,,,,,,,,10丁目1-1,35.40472,139.590001
    "神奈川県横浜市港南区港南3丁目100-1","神奈川県横浜市港南区港南三丁目100-1",7,141119,神奈川県,横浜市港南区,港南三丁目,0007003,1,001,,,,,,,,,00-1,35.400889,139.58923
    "神奈川県横浜市港南区港南1丁目1-1","神奈川県横浜市港南区港南一丁目1-1",8,141119,神奈川県,横浜市港南区,港南一丁目,0007001,1,001,1,001,,,,,,,,35.406337314,139.592841572
    "東京都千代田区猿楽町3丁目2-3","東京都千代田区猿楽町3丁目2-3",3,131016,東京都,千代田区,猿楽町,0060000,,,,,,,,,,,3丁目2-3,,
    `;

  const expectExitCode = 0;
  const tester = new CsvTest();
  await tester.validate('- -f csv', input, expectExitCode, expectResult)
})

// 検索モード：all用
test(`'echo "<input data>" | abrg - -f csv --target all' should return the expected results as CSV format`, async () => {
  /*
  検索モード：住居表示+地番検索モード（all）
  住居検索パターン（住表示フラグ:1）
    東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階
    東京都千代田区九段南10丁目2-1
    東京都千代田区九段南1丁目2-1
  地番検索パターン（住表示フラグ:1）
    島根県松江市青葉台121-2
  */
  const input = `
  //
  // サンプルデータ ('#' または // で始まる行はコメント行として処理します)
  //
  東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階
  東京都千代田区九段南10丁目2-1
  東京都千代田区九段南1丁目2-1
  島根県松江市青葉台121-2
  `;

  const expectResult = `
  input,output,matching_level,lg_code,pref,city,machiaza,machiaza_id,blk_num,blk_id,rsdt_num,rsdt_id,rsdt_num2,rsdt2_id,prc_num1,prc_num2,prc_num3,prc_id,other,lat,lon
    "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階","東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",8,131016,東京都,千代田区,紀尾井町,0056000,1,001,3,003,,,,,,,東京ガーデンテラス紀尾井町 19階、20階,35.679107172,139.736394597
    "東京都千代田区九段南10丁目2-1","東京都千代田区九段南10丁目2-1",3,131016,東京都,千代田区,九段南,0008000,,,,,,,,,,,10丁目2-1,35.693972,139.753265
    "東京都千代田区九段南1丁目2-1","東京都千代田区九段南一丁目2-1",7,131016,東京都,千代田区,九段南一丁目,0008001,2,002,,,,,,,,,-1,35.693948,139.753535
    "島根県松江市青葉台121-2","島根県松江市青葉台121-2",10,322016,島根県,松江市,青葉台,0002000,,,,,,,121,2,,001210000200000,,35.44712148,133.105246137
    `;

  const expectExitCode = 0;
  const tester = new CsvTest();
  await tester.validate('- -f csv --target all', input, expectExitCode, expectResult)
})

test(`'echo "<input data>" | abrg - -f csv --target all' should be error because "brabrabra" is unknown file.`, async () => {

  const input = `東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`;

  const expectResult = `[error] Can not open the source file`;

  const expectExitCode = 1;
  const tester = new CsvTest();
  await tester.validate('brabrabra -f csv --target all', input, expectExitCode, expectResult);
})

test(`'echo "<input data>" | abrg - -f json --target all' should return the expected results as JSON format`, async () => {

  const input = `東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`;

  const expectResult = [
    {
      "query": { "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階" },
      "result": {
        "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
        "matching_level": 8,
        "lg_code": "131016",
        "pref": "東京都",
        "city": "千代田区",
        "machiaza": "紀尾井町",
        "machiaza_id": "0056000",
        "blk_num": "1",
        "blk_id": "001",
        "rsdt_num": "3",
        "rsdt_id": "003",
        "rsdt_num2": null,
        "rsdt2_id": null,
        "prc_num1": null,
        "prc_num2": null,
        "prc_num3": null,
        "prc_id": null,
        "other": "東京ガーデンテラス紀尾井町 19階、20階",
        "lat": 35.679107172,
        "lon": 139.736394597
      }
    }
  ];

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f json --target all', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f ndjson --target all' should return the expected results as JSON format on each line`, async () => {

  const input = `東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`;

  const expectResult = {
    "query": {
      "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
    },
    "result": {
      "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
      "matching_level": 8,
      "lg_code": "131016",
      "pref": "東京都",
      "city": "千代田区",
      "machiaza": "紀尾井町",
      "machiaza_id": "0056000",
      "blk_num": "1",
      "blk_id": "001",
      "rsdt_num": "3",
      "rsdt_id": "003",
      "rsdt_num2": null,
      "rsdt2_id": null,
      "prc_num1": null,
      "prc_num2": null,
      "prc_num3": null,
      "prc_id": null,
      "other": "東京ガーデンテラス紀尾井町 19階、20階",
      "lat": 35.679107172,
      "lon": 139.736394597
    }
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f ndjson --target all', input, expectExitCode, expectResult);
});


test(`'echo "<input data>" | abrg - -f geojson --target all' should return the expected results as GEO-JSON format`, async () => {

  const input = trimLines(`東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`);

  const expectResult = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            139.736394597,
            35.679107172
          ]
        },
        "properties": {
          "query": {
            "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階"
          },
          "result": {
            "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
            "matching_level": 8,
            "lg_code": "131016",
            "pref": "東京都",
            "city": "千代田区",
            "machiaza": "紀尾井町",
            "machiaza_id": "0056000",
            "blk_num": "1",
            "blk_id": "001",
            "rsdt_num": "3",
            "rsdt_id": "003",
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": null,
            "prc_num2": null,
            "prc_num3": null,
            "prc_id": null,
            "other": "東京ガーデンテラス紀尾井町 19階、20階"
          }
        }
      }
    ]
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f geojson --target all', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f ndgeojson --target all' should return the expected results as GEO-JSON format on each line`, async () => {

  const input = trimLines(`東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階`);

  const expectResult = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [
        139.736394597,
        35.679107172
      ]
    },
    "properties": {
      "query": {
        "input": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階"
      },
      "result": {
        "output": "東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",
        "matching_level": 8,
        "lg_code": "131016",
        "pref": "東京都",
        "city": "千代田区",
        "machiaza": "紀尾井町",
        "machiaza_id": "0056000",
        "blk_num": "1",
        "blk_id": "001",
        "rsdt_num": "3",
        "rsdt_id": "003",
        "rsdt_num2": null,
        "rsdt2_id": null,
        "prc_num1": null,
        "prc_num2": null,
        "prc_num3": null,
        "prc_id": null,
        "other": "東京ガーデンテラス紀尾井町 19階、20階"
      }
    }
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f ndgeojson --target all', input, expectExitCode, expectResult);
});

// 検索モード：地番用
test(`'echo "<input data>" | abrg - -f csv --target parcel' should return the expected results as CSV format`, async () => {
  /*
  検索モード：地番検索モード（parcel）
  地番データにデータなし（住表示フラグ:1）
    東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階
    東京都千代田区九段南10丁目2-1
    東京都千代田区九段南1丁目2-1
  地番検索（住表示フラグ:1）
    島根県松江市青葉台121-2
  */
  const input = `
  //
  // サンプルデータ ('#' または // で始まる行はコメント行として処理します)
  //
  東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階
  東京都千代田区九段南10丁目2-1
  東京都千代田区九段南1丁目2-1
  島根県松江市青葉台121-2
  `;

  const expectResult = `
    input,output,matching_level,lg_code,pref,city,machiaza,machiaza_id,blk_num,blk_id,rsdt_num,rsdt_id,rsdt_num2,rsdt2_id,prc_num1,prc_num2,prc_num3,prc_id,other,lat,lon
    "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階","東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",4,131016,東京都,千代田区,紀尾井町,0056000,,,,,,,,,,,1-3 東京ガーデンテラス紀尾井町 19階、20階,35.681411,139.73495
    "東京都千代田区九段南10丁目2-1","東京都千代田区九段南10丁目2-1",3,131016,東京都,千代田区,九段南,0008000,,,,,,,,,,,10丁目2-1,35.693972,139.753265
    "東京都千代田区九段南1丁目2-1","東京都千代田区九段南一丁目2-1",4,131016,東京都,千代田区,九段南一丁目,0008001,,,,,,,,,,,2-1,35.693972,139.753265
    "島根県松江市青葉台121-2","島根県松江市青葉台121-2",10,322016,島根県,松江市,青葉台,0002000,,,,,,,121,2,,001210000200000,,35.44712148,133.105246137
    `;

  const expectExitCode = 0;
  const tester = new CsvTest();
  await tester.validate('- -f csv --target parcel', input, expectExitCode, expectResult)
})

test(`'echo "<input data>" | abrg - -f csv --target parcel' should be error because "brabrabra" is unknown file.`, async () => {

  const input = `島根県松江市末次本町7-1`;

  const expectResult = `[error] Can not open the source file`;

  const expectExitCode = 1;
  const tester = new CsvTest();
  await tester.validate('brabrabra -f csv --target parcel', input, expectExitCode, expectResult);
})

test(`'echo "<input data>" | abrg - -f json --target parcel' should return the expected results as JSON format`, async () => {

  const input = `島根県松江市青葉台121-2`;

  const expectResult = [
    {
      "query": { "input": "島根県松江市青葉台121-2" },
      "result": {
        "output": "島根県松江市青葉台121-2",
        "matching_level": 10,
        "lg_code": "322016",
        "pref": "島根県",
        "city": "松江市",
        "machiaza": "青葉台",
        "machiaza_id": "0002000",
        "blk_num": null,
        "blk_id": null,
        "rsdt_num": null,
        "rsdt_id": null,
        "rsdt_num2": null,
        "rsdt2_id": null,
        "prc_num1": "121",
        "prc_num2": "2",
        "prc_num3": null,
        "prc_id": "001210000200000",
        "other": null,
        "lat": 35.44712148,
        "lon": 133.105246137
      }
    }
  ];

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f json --target parcel', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f ndjson --target parcel' should return the expected results as JSON format on each line`, async () => {

  const input = `島根県松江市青葉台121-2`;

  const expectResult = {
    "query": { "input": "島根県松江市青葉台121-2" },
    "result": {
      "output": "島根県松江市青葉台121-2",
      "matching_level": 10,
      "lg_code": "322016",
      "pref": "島根県",
      "city": "松江市",
      "machiaza": "青葉台",
      "machiaza_id": "0002000",
      "blk_num": null,
      "blk_id": null,
      "rsdt_num": null,
      "rsdt_id": null,
      "rsdt_num2": null,
      "rsdt2_id": null,
      "prc_num1": "121",
      "prc_num2": "2",
      "prc_num3": null,
      "prc_id": "001210000200000",
      "other": null,
      "lat": 35.44712148,
      "lon": 133.105246137
    }
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f ndjson --target parcel', input, expectExitCode, expectResult);
});


test(`'echo "<input data>" | abrg - -f geojson --target parcel' should return the expected results as GEO-JSON format`, async () => {

  const input = trimLines(`島根県松江市青葉台121-2`);

  const expectResult = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            133.105246137,
            35.44712148
          ]
        },
        "properties": {
          "query": {
            "input": "島根県松江市青葉台121-2"
          },
          "result": {
            "output": "島根県松江市青葉台121-2",
            "matching_level": 10,
            "lg_code": "322016",
            "pref": "島根県",
            "city": "松江市",
            "machiaza": "青葉台",
            "machiaza_id": "0002000",
            "blk_num": null,
            "blk_id": null,
            "rsdt_num": null,
            "rsdt_id": null,
            "rsdt_num2": null,
            "rsdt2_id": null,
            "prc_num1": "121",
            "prc_num2": "2",
            "prc_num3": null,
            "prc_id": "001210000200000",
            "other": null
          }
        }
      }
    ]
  };

  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f geojson --target parcel', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f ndgeojson --target parcel' should return the expected results as GEO-JSON format on each line`, async () => {

  const input = trimLines(`島根県松江市青葉台121-2`);

  const expectResult = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [
        133.105246137,
        35.44712148
      ]
    },
    "properties": {
      "query": {
        "input": "島根県松江市青葉台121-2"
      },
      "result": {
        "output": "島根県松江市青葉台121-2",
        "matching_level": 10,
        "lg_code": "322016",
        "pref": "島根県",
        "city": "松江市",
        "machiaza": "青葉台",
        "machiaza_id": "0002000",
        "blk_num": null,
        "blk_id": null,
        "rsdt_num": null,
        "rsdt_id": null,
        "rsdt_num2": null,
        "rsdt2_id": null,
        "prc_num1": "121",
        "prc_num2": "2",
        "prc_num3": null,
        "prc_id": "001210000200000",
        "other": null
      }
    }
  };
  const expectExitCode = 0;
  const tester = new JsonTest();
  await tester.validate('- -f ndgeojson --target parcel', input, expectExitCode, expectResult);
});

test(`'echo "<input data>" | abrg - -f normalize' should return the expected results as CSV format`, async () => {

  const input = `
  //
  // サンプルデータ ('#' または // で始まる行はコメント行として処理します)
  //
  東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階
  東京都千代田区九段南1丁目2-1
  `;

  const expectResult = `
  input,output,match_level
  "東京都千代田区紀尾井町1-3　東京ガーデンテラス紀尾井町 19階、20階","東京都千代田区紀尾井町1-3 東京ガーデンテラス紀尾井町 19階、20階",8
  "東京都千代田区九段南1丁目2-1","東京都千代田区九段南一丁目2-1",7
  `;

  const expectExitCode = 0;
  const tester = new CsvTest();
  await tester.validate('- -f normalize', input, expectExitCode, expectResult)
})
test.run();