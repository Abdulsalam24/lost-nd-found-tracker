import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TriviaService } from '../games/trivia/trivia.service';
import { DetectiveService } from '../games/detective/detective.service';
import { StatsService } from '../stats/stats.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { ItemsService } from '../items/items.service';
import { StorageService } from '../storage/storage.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ItemReport } from '../items/entities/item-report.entity';
import { ItemStatus } from '@lostfound/shared';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private triviaService: TriviaService,
    private detectiveService: DetectiveService,
    private statsService: StatsService,
    private leaderboardService: LeaderboardService,
    private itemsService: ItemsService,
    private storageService: StorageService,
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
  ) {}

  // Monday 8am — log start of new week
  @Cron('0 8 * * 1')
  async handleMondayMorning(): Promise<void> {
    this.logger.log('New week started — trivia uses random pool, no generation needed');
  }

  // Sunday 11pm — compute detective scores
  @Cron('0 23 * * 0')
  async handleSundayNight(): Promise<void> {
    this.logger.log('Computing detective rankings');
    await this.detectiveService.computeScores();
  }

  // Every hour — refresh stats cache
  @Cron(CronExpression.EVERY_HOUR)
  async refreshStatsCache(): Promise<void> {
    await this.statsService.refreshCache();
    await this.leaderboardService.refreshCache();
  }

  // Daily midnight — auto-dispose old items
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoDisposeItems(): Promise<void> {
    this.logger.log('Running auto-dispose for old items');
    await this.itemsService.disposeOldItems();
  }

  // Weekly Sunday — purge R2 images for old disposed items
  @Cron('0 2 * * 0')
  async retentionCleanup(): Promise<void> {
    this.logger.log('Running retention cleanup');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const disposedItems = await this.itemsRepo.find({
      where: {
        status: ItemStatus.DISPOSED,
        updated_at: LessThan(ninetyDaysAgo),
      },
    });

    const deletePromises = disposedItems.map(async (item) => {
      try {
        await this.storageService.deleteItemImages(item.id);
        this.logger.log(`Cleaned images for disposed item ${item.id}`);
      } catch (err) {
        this.logger.error(`Failed to clean images for item ${item.id}`, err);
      }
    });

    await Promise.all(deletePromises);
    this.logger.log(`Retention cleanup done. Processed ${disposedItems.length} items.`);
  }
}
