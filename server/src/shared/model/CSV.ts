import type { ParseConfig, ParseError, ParseResult } from 'papaparse';

export interface IParseCsvDTO {
    data: string;
    options?: ParseConfig<unknown>;
}

export type ParseCsvResult<T> = ParseResult<T>;

export type CSVParsedError = ParseError;
