import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ItemReport } from './entities/item-report.entity';
import { Location } from './entities/location.entity';
import { ImageAsset } from './entities/image-asset.entity';
import { SearchModule } from '../search/search.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemReport, Location, ImageAsset]),
    forwardRef(() => SearchModule),
    AuditModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService, TypeOrmModule],
})
export class ItemsModule {}
