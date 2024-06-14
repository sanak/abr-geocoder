/*!
 * MIT License
 *
 * Copyright (c) 2023 デジタル庁
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { describe, expect, it, jest } from '@jest/globals';
import { checkPrefCode } from '@domain/check-pref-code';
import { CliDefaultValues } from '@settings/cli-default-values';

describe('checkPrefCode Test', () => {

  it('デフォルトの都道府県コードが指定された場合、trueが返却されることを確認',() => {
    // テスト実施
    const actual = checkPrefCode({prefCode: CliDefaultValues.PREF_CODE});
    // 結果
    expect(actual).toBe(true);
  });
  
  it('都道府県コードが指定された場合、trueが返却されることを確認',() => {
    // テスト実施
    const actual = checkPrefCode({prefCode: '24'});
    // 結果
    expect(actual).toBe(true);
  })

  it('都道府県コード範囲外の数値が入力された場合、falseが返却されることを確認(0が指定)',() => {
    // テスト実施
    const actual = checkPrefCode({prefCode: '0'});
    // 結果
    expect(actual).toBe(false);
  })

  it('都道府県コード範囲外の数値が入力された場合、falseが返却されることを確認(48が指定)',() => {
    // テスト実施
    const actual = checkPrefCode({prefCode: '48'});
    // 結果
    expect(actual).toBe(false);
  })

  it('数値以外が入力された場合、falseが返却されることを確認(Tokyoが指定)',() => {
    // テスト実施
    const actual = checkPrefCode({prefCode: 'Tokyo'});
    // 結果
    expect(actual).toBe(false);
  })

  it('数値以外が入力された場合、falseが返却されることを確認(東京都が指定)',() => {
    // テスト実施
    const actual = checkPrefCode({prefCode: '東京都'});
    // 結果
    expect(actual).toBe(false);
  })

});