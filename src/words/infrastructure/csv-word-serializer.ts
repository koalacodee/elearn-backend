import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export interface WordCsvRow {
  word: string;
  arabicTranslation: string;
  sentence: string;
  arabicSentence: string;
}

const COLUMNS = [
  'word',
  'arabicTranslation',
  'sentence',
  'arabicSentence',
] as const;

@Injectable()
export class CsvWordSerializer {
  parse(input: string): WordCsvRow[] {
    const records: Record<string, string>[] = parse(input, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    return records.map((r, idx) => {
      const row: Partial<WordCsvRow> = {};
      for (const col of COLUMNS) {
        const value: unknown = r[col];
        if (typeof value !== 'string' || value.length === 0) {
          throw new Error(`row ${idx + 1}: missing or empty column "${col}"`);
        }
        row[col] = value;
      }
      return row as WordCsvRow;
    });
  }

  stringify(rows: WordCsvRow[]): string {
    return stringify(rows, {
      header: true,
      columns: COLUMNS as unknown as string[],
    });
  }
}
