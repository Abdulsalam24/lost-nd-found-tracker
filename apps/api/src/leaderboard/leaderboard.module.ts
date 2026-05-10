import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { User } from '../users/entities/user.entity';
import { UserBadge } from '../users/entities/user-badge.entity';
import { ItemReport } from '../items/entities/item-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserBadge, ItemReport])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
