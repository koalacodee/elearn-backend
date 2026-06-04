import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UnitRepository } from '../../units/domain/repositories/unit.repository';
import { parseMarkerSentence } from '../domain/marker';
import { Word } from '../domain/word.entity';
import { WordRepository } from '../domain/repositories/word.repository';

export interface CreateWordInput {
  unitId: string;
  word: string;
  arabicTranslation: string;
  sentence: string;
  arabicSentence: string;
}

@Injectable()
export class CreateWordUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly units: UnitRepository,
  ) {}

  async execute(input: CreateWordInput): Promise<Word> {
    const unit = await this.units.findById(input.unitId);
    if (!unit) throw new NotFoundException('unit_not_found');

    try {
      parseMarkerSentence(input.sentence);
      parseMarkerSentence(input.arabicSentence);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }

    return this.words.create(input);
  }
}
