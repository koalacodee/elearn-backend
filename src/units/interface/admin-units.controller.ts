import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '../../auth/domain/user-role.enum';
import { Role } from '../../auth/interface/decorators/role.decorator';
import { CreateUnitUseCase } from '../application/create-unit.use-case';
import { DeleteUnitUseCase } from '../application/delete-unit.use-case';
import { GetUnitUseCase } from '../application/get-unit.use-case';
import { UpdateUnitUseCase } from '../application/update-unit.use-case';
import { UnitRepository } from '../domain/repositories/unit.repository';
import { CreateUnitDto } from './dtos/create-unit.dto';
import { UpdateUnitDto } from './dtos/update-unit.dto';

@Role([UserRole.ADMIN])
@Controller('admin/units')
export class AdminUnitsController {
  constructor(
    private readonly createUnit: CreateUnitUseCase,
    private readonly updateUnit: UpdateUnitUseCase,
    private readonly deleteUnit: DeleteUnitUseCase,
    private readonly getUnit: GetUnitUseCase,
    private readonly units: UnitRepository,
  ) {}

  @Get()
  list() {
    return this.units.listOrdered();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUnit.executeForAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUnitDto) {
    return this.createUnit.execute({
      title: dto.title,
      description: dto.description ?? null,
      orderIndex: dto.orderIndex,
    });
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUnitDto) {
    return this.updateUnit.execute({ id, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteUnit.execute(id);
  }
}
