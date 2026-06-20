import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { TriviaModule } from '../games/trivia/trivia.module';
import { DetectiveModule } from '../games/detective/detective.module';
import { StatsModule } from '../stats/stats.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { ItemsModule } from '../items/items.module';
import { StorageModule } from '../storage/storage.module';
import { ItemReport } from '../items/entities/item-report.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemReport, User]),
    TriviaModule,
    DetectiveModule,
    StatsModule,
    LeaderboardModule,
    ItemsModule,
    StorageModule,
  ],
  providers: [CronService],
})
export class CronModule {}
