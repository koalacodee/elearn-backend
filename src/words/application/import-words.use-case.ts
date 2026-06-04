import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UnitRepository } from '../../units/domain/repositories/unit.repository';
import { parseMarkerSentence } from '../domain/marker';
import { Word } from '../domain/word.entity';
import {
  CreateWordInput,
  WordRepository,
} from '../domain/repositories/word.repository';
import { CsvWordSerializer } from '../infrastructure/csv-word-serializer';

export type ImportFormat = 'json' | 'csv';

export interface ImportWordsInput {
  unitId: string;
  format: ImportFormat;
  body: string;
}

interface RawWord {
  word?: unknown;
  arabicTranslation?: unknown;
  sentence?: unknown;
  arabicSentence?: unknown;
}

@Injectable()
export class ImportWordsUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly units: UnitRepository,
    private readonly csv: CsvWordSerializer,
  ) {}

  async execute(input: ImportWordsInput): Promise<Word[]> {
    const unit = await this.units.findById(input.unitId);
    if (!unit) throw new NotFoundException('unit_not_found');

    let raw: RawWord[];
    if (input.format === 'json') {
      raw = this.parseJson(input.body);
    } else {
      try {
        raw = this.csv.parse(input.body);
      } catch (e) {
        throw new BadRequestException(
          `csv_parse_error: ${(e as Error).message}`,
        );
      }
    }
    if (raw.length === 0) throw new BadRequestException('no_rows_to_import');

    const toInsert: CreateWordInput[] = raw.map((r, idx) => {
      const row = this.validateRow(r, idx);
      return { unitId: input.unitId, ...row };
    });

    return this.words.createMany(toInsert);
  }

  private parseJson(body: string): RawWord[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      throw new BadRequestException(
        `json_parse_error: ${(e as Error).message}`,
      );
    }
    if (!Array.isArray(parsed)) {
      throw new BadRequestException('json_must_be_array');
    }
    return parsed as RawWord[];
  }

  private validateRow(r: RawWord, idx: number) {
    const fields = [
      'word',
      'arabicTranslation',
      'sentence',
      'arabicSentence',
    ] as const;
    for (const f of fields) {
      if (typeof r[f] !== 'string' || r[f].length === 0) {
        throw new BadRequestException(`row ${idx + 1}: invalid field "${f}"`);
      }
    }
    const sentence = r.sentence as string;
    const arabicSentence = r.arabicSentence as string;
    try {
      parseMarkerSentence(sentence);
      parseMarkerSentence(arabicSentence);
    } catch (e) {
      throw new BadRequestException(`row ${idx + 1}: ${(e as Error).message}`);
    }
    return {
      word: r.word as string,
      arabicTranslation: r.arabicTranslation as string,
      sentence,
      arabicSentence,
    };
  }
}
