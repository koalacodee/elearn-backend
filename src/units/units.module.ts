import { Module } from '@nestjs/common';
import { CreateUnitUseCase } from './application/create-unit.use-case';
import { DeleteUnitUseCase } from './application/delete-unit.use-case';
import { GetUnitUseCase } from './application/get-unit.use-case';
import { IsUnitUnlockedUseCase } from './application/is-unit-unlocked.use-case';
import { ListUnitsUseCase } from './application/list-units.use-case';
import { UnlockNextUnitUseCase } from './application/unlock-next-unit.use-case';
import { UpdateUnitUseCase } from './application/update-unit.use-case';
import { UnitProgressRepository } from './domain/repositories/unit-progress.repository';
import { UnitRepository } from './domain/repositories/unit.repository';
import { DrizzleUnitProgressRepository } from './infrastructure/drizzle-unit-progress.repository';
import { DrizzleUnitRepository } from './infrastructure/drizzle-unit.repository';
import { AdminUnitsController } from './interface/admin-units.controller';
import { UnitsController } from './interface/units.controller';

@Module({
  controllers: [UnitsController, AdminUnitsController],
  providers: [
    CreateUnitUseCase,
    UpdateUnitUseCase,
    DeleteUnitUseCase,
    GetUnitUseCase,
    ListUnitsUseCase,
    IsUnitUnlockedUseCase,
    UnlockNextUnitUseCase,
    { provide: UnitRepository, useClass: DrizzleUnitRepository },
    {
      provide: UnitProgressRepository,
      useClass: DrizzleUnitProgressRepository,
    },
  ],
  exports: [UnitRepository, IsUnitUnlockedUseCase, UnlockNextUnitUseCase],
})
export class UnitsModule {}
