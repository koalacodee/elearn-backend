import { Injectable, NotFoundException } from '@nestjs/common';
import { WordRepository } from '../domain/repositories/word.repository';

@Injectable()
export class DeleteWordUseCase {
  constructor(private readonly words: WordRepository) {}

  async execute(id: string): Promise<void> {
    const ok = await this.words.delete(id);
    if (!ok) throw new NotFoundException('word_not_found');
  }
}
