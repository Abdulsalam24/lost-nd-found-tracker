import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemReport } from '../items/entities/item-report.entity';

export interface HeatmapData {
  location_id: string;
  location_name: string;
  building: string;
  count: string;
}

@Injectable()
export class HeatmapService {
  constructor(
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
  ) {}

  async getHeatmap(): Promise<HeatmapData[]> {
    const results = await this.itemsRepo
      .createQueryBuilder('item')
      .select('item.location_id', 'location_id')
      .addSelect('location.name', 'location_name')
      .addSelect('location.building', 'building')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('item.location', 'location')
      .groupBy('item.location_id')
      .addGroupBy('location.name')
      .addGroupBy('location.building')
      .orderBy('count', 'DESC')
      .getRawMany<HeatmapData>();

    return results;
  }
}
