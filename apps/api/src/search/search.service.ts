import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemReport } from '../items/entities/item-report.entity';
import { ItemType, ItemStatus } from '@lostfound/shared';
import { NotificationsService } from '../notifications/notifications.service';

interface MatchResult {
  item: ItemReport;
  score: number;
  percentage: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    private notificationsService: NotificationsService,
  ) {}

  async matchAndNotify(newItem: ItemReport): Promise<MatchResult[]> {
    const oppositeType =
      newItem.type === ItemType.FOUND ? ItemType.LOST : ItemType.FOUND;

    const candidates = await this.itemsRepo.find({
      where: {
        type: oppositeType,
        status: ItemStatus.ACTIVE,
      },
      relations: ['location', 'reporter'],
    });

    const matches: MatchResult[] = [];

    candidates.forEach((candidate) => {
      let score = 0;

      // Category match: 3 points
      if (candidate.category === newItem.category) {
        score += 3;
      }

      // Location match: 2 points
      if (candidate.location_id === newItem.location_id) {
        score += 2;
      }

      // Date proximity <= 3 days: 1 point
      const newDate = new Date(newItem.date_of_event);
      const candidateDate = new Date(candidate.date_of_event);
      const daysDiff = Math.abs(
        (newDate.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff <= 3) {
        score += 1;
      }

      // Serial number match: 1 point
      if (
        newItem.serial_number &&
        candidate.serial_number &&
        newItem.serial_number.toLowerCase() === candidate.serial_number.toLowerCase()
      ) {
        score += 1;
      }

      if (score > 0) {
        matches.push({
          item: candidate,
          score,
          percentage: Math.round((score / 7) * 100),
        });
      }
    });

    matches.sort((a, b) => b.score - a.score);

    // Notify if any match scores >= 4
    const highMatches = matches.filter((m) => m.score >= 4);
    if (highMatches.length > 0) {
      await this.notificationsService.notifyPotentialMatches(newItem, highMatches.map((m) => m.item));
    }

    return matches;
  }
}
