import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { ClaimsModule } from './claims/claims.module';
import { SightingsModule } from './sightings/sightings.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { StatsModule } from './stats/stats.module';
import { HeatmapModule } from './heatmap/heatmap.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { DetectiveModule } from './games/detective/detective.module';
import { GhostHuntModule } from './games/ghost-hunt/ghost-hunt.module';
import { TriviaModule } from './games/trivia/trivia.module';
import { CronModule } from './cron/cron.module';
import { ChatModule } from './chat/chat.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ItemsModule,
    ClaimsModule,
    SightingsModule,
    SearchModule,
    NotificationsModule,
    AuditModule,
    AdminModule,
    StorageModule,
    StatsModule,
    HeatmapModule,
    LeaderboardModule,
    DetectiveModule,
    GhostHuntModule,
    TriviaModule,
    CronModule,
    ChatModule,
    FeedbackModule,
  ],
})
export class AppModule {}
