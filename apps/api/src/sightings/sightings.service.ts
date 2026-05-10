import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sighting } from './entities/sighting.entity';
import { ItemReport } from '../items/entities/item-report.entity';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SightingsService {
  constructor(
    @InjectRepository(Sighting)
    private sightingsRepo: Repository<Sighting>,
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateSightingDto): Promise<Sighting> {
    const item = await this.itemsRepo.findOne({
      where: { id: dto.item_report_id },
      relations: ['reporter'],
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const sighting = this.sightingsRepo.create({
      item_report_id: dto.item_report_id,
      description: dto.description,
      location_id: dto.location_id ?? null,
      spotted_at: new Date(dto.spotted_at),
    });

    const saved = await this.sightingsRepo.save(sighting);

    await this.notificationsService.notifySighting(item, saved);

    return saved;
  }

  async findByItem(itemId: string): Promise<Sighting[]> {
    return this.sightingsRepo.find({
      where: { item_report_id: itemId },
      relations: ['location'],
      order: { spotted_at: 'DESC' },
    });
  }
}
