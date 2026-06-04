import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parseMarkerSentence } from '../domain/marker';
import { Word } from '../domain/word.entity';
import {
  UpdateWordInput,
  WordRepository,
} from '../domain/repositories/word.repository';

@Injectable()
export class UpdateWordUseCase {
  constructor(private readonly words: WordRepository) {}

  async execute(id: string, input: UpdateWordInput): Promise<Word> {
    try {
      if (input.sentence !== undefined) parseMarkerSentence(input.sentence);
      if (input.arabicSentence !== undefined)
        parseMarkerSentence(input.arabicSentence);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }

    const updated = await this.words.update(id, input);
    if (!updated) throw new NotFoundException('word_not_found');
    return updated;
  }
}
