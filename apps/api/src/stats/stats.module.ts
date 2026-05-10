import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ItemReport } from '../items/entities/item-report.entity';
import { Claim } from '../claims/entities/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemReport, Claim])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
