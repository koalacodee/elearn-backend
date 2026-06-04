import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../auth/domain/user.entity';
import { CurrentUser } from '../../auth/interface/decorators/current-user.decorator';
import { GetUnitUseCase } from '../application/get-unit.use-case';
import { ListUnitsUseCase } from '../application/list-units.use-case';

@Controller('units')
export class UnitsController {
  constructor(
    private readonly listUnits: ListUnitsUseCase,
    private readonly getUnit: GetUnitUseCase,
  ) {}

  @Get()
  list(@CurrentUser() user: User | undefined) {
    if (!user) throw new UnauthorizedException('not_authenticated');
    return this.listUnits.execute(user.id);
  }

  @Get(':id')
  get(
    @CurrentUser() user: User | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!user) throw new UnauthorizedException('not_authenticated');
    return this.getUnit.executeForStudent(user.id, id);
  }
}
