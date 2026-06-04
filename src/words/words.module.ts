import { Module } from '@nestjs/common';
import { UnitsModule } from '../units/units.module';
import { CreateWordUseCase } from './application/create-word.use-case';
import { DeleteWordUseCase } from './application/delete-word.use-case';
import { ExportWordsUseCase } from './application/export-words.use-case';
import { ImportWordsUseCase } from './application/import-words.use-case';
import { ListWordsUseCase } from './application/list-words.use-case';
import { UpdateWordUseCase } from './application/update-word.use-case';
import { WordRepository } from './domain/repositories/word.repository';
import { CsvWordSerializer } from './infrastructure/csv-word-serializer';
import { DrizzleWordRepository } from './infrastructure/drizzle-word.repository';
import { AdminWordsController } from './interface/admin-words.controller';
import { WordsController } from './interface/words.controller';

@Module({
  imports: [UnitsModule],
  controllers: [WordsController, AdminWordsController],
  providers: [
    CreateWordUseCase,
    UpdateWordUseCase,
    DeleteWordUseCase,
    ListWordsUseCase,
    ImportWordsUseCase,
    ExportWordsUseCase,
    CsvWordSerializer,
    { provide: WordRepository, useClass: DrizzleWordRepository },
  ],
})
export class WordsModule {}
