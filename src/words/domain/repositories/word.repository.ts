import { Word } from '../word.entity';

export interface CreateWordInput {
  unitId: string;
  word: string;
  arabicTranslation: string;
  sentence: string;
  arabicSentence: string;
}

export type UpdateWordInput = Partial<Omit<CreateWordInput, 'unitId'>>;

export abstract class WordRepository {
  abstract create(input: CreateWordInput): Promise<Word>;
  abstract createMany(inputs: CreateWordInput[]): Promise<Word[]>;
  abstract update(id: string, input: UpdateWordInput): Promise<Word | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract findById(id: string): Promise<Word | null>;
  abstract listByUnit(unitId: string): Promise<Word[]>;
}
