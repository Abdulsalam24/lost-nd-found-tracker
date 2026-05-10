import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { ItemReport } from '../items/entities/item-report.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemReport]),
    forwardRef(() => NotificationsModule),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
