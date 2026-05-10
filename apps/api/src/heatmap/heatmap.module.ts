import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeatmapController } from './heatmap.controller';
import { HeatmapService } from './heatmap.service';
import { ItemReport } from '../items/entities/item-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemReport])],
  controllers: [HeatmapController],
  providers: [HeatmapService],
  exports: [HeatmapService],
})
export class HeatmapModule {}
