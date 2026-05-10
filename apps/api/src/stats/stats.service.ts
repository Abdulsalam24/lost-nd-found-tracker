import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemReport } from '../items/entities/item-report.entity';
import { Claim } from '../claims/entities/claim.entity';
import { ItemType, ItemStatus } from '@lostfound/shared';
import { StatsResponse } from '@lostfound/shared';

export interface CategoryStatRow {
  category: string;
  count: number;
}

export interface MonthlyStatRow {
  month: string;
  count: number;
}

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  private cachedStats: StatsResponse | null = null;
  private cacheExpiry = 0;

  constructor(
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    @InjectRepository(Claim)
    private claimsRepo: Repository<Claim>,
  ) {}

  async getStats(): Promise<StatsResponse> {
    const now = Date.now();
    if (this.cachedStats && now < this.cacheExpiry) {
      return this.cachedStats;
    }

    const stats = await this.computeStats();
    this.cachedStats = stats;
    this.cacheExpiry = now + 60 * 60 * 1000; // 1hr
    return stats;
  }

  async refreshCache(): Promise<void> {
    this.cachedStats = await this.computeStats();
    this.cacheExpiry = Date.now() + 60 * 60 * 1000;
    this.logger.log('Stats cache refreshed');
  }

  async getStatsByCategory(): Promise<CategoryStatRow[]> {
    const rows = await this.itemsRepo
      .createQueryBuilder('item')
      .select('item.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('item.category')
      .orderBy('count', 'DESC')
      .getRawMany<{ category: string; count: string }>();

    return rows.map((r) => ({
      category: r.category,
      count: Number(r.count),
    }));
  }

  async getStatsByMonth(): Promise<MonthlyStatRow[]> {
    const rows = await this.itemsRepo
      .createQueryBuilder('item')
      .select("TO_CHAR(item.created_at, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy("TO_CHAR(item.created_at, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; count: string }>();

    return rows.map((r) => ({
      month: r.month,
      count: Number(r.count),
    }));
  }

  private async computeStats(): Promise<StatsResponse> {
    const total_items = await this.itemsRepo.count();
    const total_lost = await this.itemsRepo.count({ where: { type: ItemType.LOST } });
    const total_found = await this.itemsRepo.count({ where: { type: ItemType.FOUND } });
    const total_recovered = await this.itemsRepo.count({
      where: { status: ItemStatus.RECOVERED },
    });
    const total_claims = await this.claimsRepo.count();
    const recovery_rate = total_items > 0
      ? Math.round((total_recovered / total_items) * 100)
      : 0;

    return {
      total_items,
      total_lost,
      total_found,
      total_recovered,
      total_claims,
      recovery_rate,
    };
  }
}
