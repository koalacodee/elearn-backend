import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitRepository } from '../../units/domain/repositories/unit.repository';
import { Word } from '../domain/word.entity';
import { WordRepository } from '../domain/repositories/word.repository';
import { CsvWordSerializer } from '../infrastructure/csv-word-serializer';

export type ExportFormat = 'json' | 'csv';

export interface ExportResult {
  contentType: string;
  filename: string;
  body: string;
}

@Injectable()
export class ExportWordsUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly units: UnitRepository,
    private readonly csv: CsvWordSerializer,
  ) {}

  async execute(unitId: string, format: ExportFormat): Promise<ExportResult> {
    const unit = await this.units.findById(unitId);
    if (!unit) throw new NotFoundException('unit_not_found');
    const rows = await this.words.listByUnit(unitId);

    if (format === 'json') {
      return {
        contentType: 'application/json',
        filename: `unit-${unit.orderIndex}-words.json`,
        body: JSON.stringify(
          rows.map((w) => this.toExportRow(w)),
          null,
          2,
        ),
      };
    }
    return {
      contentType: 'text/csv',
      filename: `unit-${unit.orderIndex}-words.csv`,
      body: this.csv.stringify(rows.map((w) => this.toExportRow(w))),
    };
  }

  private toExportRow(w: Word) {
    return {
      word: w.word,
      arabicTranslation: w.arabicTranslation,
      sentence: w.sentence,
      arabicSentence: w.arabicSentence,
    };
  }
}
