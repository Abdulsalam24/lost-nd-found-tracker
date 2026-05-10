import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { SightingsController } from './sightings.controller';
import { SightingsService } from './sightings.service';
import { Sighting } from './entities/sighting.entity';
import { ItemReport } from '../items/entities/item-report.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sighting, ItemReport]),
    ThrottlerModule.forRoot([{ ttl: 3600000, limit: 5 }]),
    NotificationsModule,
  ],
  controllers: [SightingsController],
  providers: [SightingsService],
  exports: [SightingsService],
})
export class SightingsModule {}
