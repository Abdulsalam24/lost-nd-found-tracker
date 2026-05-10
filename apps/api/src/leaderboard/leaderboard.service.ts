import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserBadge } from '../users/entities/user-badge.entity';
import { ItemReport } from '../items/entities/item-report.entity';
import { ItemStatus } from '@lostfound/shared';

export interface FacultyLeaderboardEntry {
  faculty: string;
  total_recoveries: number;
  total_reports: number;
  score: number;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private cached: FacultyLeaderboardEntry[] | null = null;
  private cacheExpiry = 0;

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    @InjectRepository(UserBadge)
    private badgesRepo: Repository<UserBadge>,
  ) {}

  async getLeaderboard(): Promise<FacultyLeaderboardEntry[]> {
    const now = Date.now();
    if (this.cached && now < this.cacheExpiry) {
      return this.cached;
    }

    const result = await this.computeLeaderboard();
    this.cached = result;
    this.cacheExpiry = now + 60 * 60 * 1000;
    return result;
  }

  async refreshCache(): Promise<void> {
    this.cached = await this.computeLeaderboard();
    this.cacheExpiry = Date.now() + 60 * 60 * 1000;
    this.logger.log('Leaderboard cache refreshed');
  }

  private async computeLeaderboard(): Promise<FacultyLeaderboardEntry[]> {
    const results = await this.itemsRepo
      .createQueryBuilder('item')
      .select('reporter.faculty', 'faculty')
      .addSelect('COUNT(*)', 'total_reports')
      .addSelect(
        `SUM(CASE WHEN item.status = '${ItemStatus.RECOVERED}' THEN 1 ELSE 0 END)`,
        'total_recoveries',
      )
      .leftJoin('item.reporter', 'reporter')
      .groupBy('reporter.faculty')
      .getRawMany<{ faculty: string; total_reports: string; total_recoveries: string }>();

    return results
      .map((r) => ({
        faculty: r.faculty,
        total_reports: parseInt(r.total_reports, 10),
        total_recoveries: parseInt(r.total_recoveries, 10),
        score: parseInt(r.total_recoveries, 10) * 10 + parseInt(r.total_reports, 10),
      }))
      .sort((a, b) => b.score - a.score);
  }
}
