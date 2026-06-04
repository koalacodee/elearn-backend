import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../auth/domain/user.entity';
import { CurrentUser } from '../../auth/interface/decorators/current-user.decorator';
import { ListWordsUseCase } from '../application/list-words.use-case';

@Controller('units/:unitId/words')
export class WordsController {
  constructor(private readonly listWords: ListWordsUseCase) {}

  @Get()
  list(
    @CurrentUser() user: User | undefined,
    @Param('unitId', ParseUUIDPipe) unitId: string,
  ) {
    if (!user) throw new UnauthorizedException('not_authenticated');
    return this.listWords.executeForStudent(user.id, unitId);
  }
}
