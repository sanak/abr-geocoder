import { describe, expect, it, jest } from '@jest/globals';
import fs from 'node:fs'
import { provideDatabase } from '../provide-database';
import Database from 'better-sqlite3';

jest.mock('node:fs');
jest.mock('better-sqlite3');

describe("provideDatabase test", () => {

    it("provide database by no sqlite file.", async () => {
        // モック定義
        (fs.promises.readFile as jest.Mock) = jest.fn<(_: any) => Promise<string>>().mockResolvedValueOnce('sqlString');
        (fs.existsSync as jest.Mock).mockImplementation((_) => true);
        const mockPragma = jest.fn();
        const mockExec = jest.fn();
        (Database as unknown as jest.Mock).mockImplementationOnce(() => {
            return {
                pragma: mockPragma,
                exec: mockExec
            }
        });
        // テスト実施
        await provideDatabase({
            sqliteFilePath: 'sqliteFilePath',
            schemaFilePath: 'schemaFilePath'
        })
        // 結果
        expect(mockPragma.mock.calls.length).toEqual(2);
        expect(mockExec.mock.calls.length).toEqual(0);
    });

    it("provide database by exist sqlite file.", async () => {
        // モック定義
        (fs.promises.readFile as jest.Mock) = jest.fn<(_: any) => Promise<string>>().mockResolvedValueOnce('sqlString');
        (fs.existsSync as jest.Mock).mockImplementation((_) => false);
        const mockPragma = jest.fn();
        const mockExec = jest.fn();
        (Database as unknown as jest.Mock).mockImplementationOnce(() => {
            return {
                pragma: mockPragma,
                exec: mockExec
            }
        });
        // テスト実施
        await provideDatabase({
            sqliteFilePath: 'sqliteFilePath',
            schemaFilePath: 'schemaFilePath'
        })
        // 結果
        expect(mockPragma.mock.calls.length).toEqual(2);
        expect(mockExec.mock.calls.length).toEqual(1);
    });
});