import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemReport } from './entities/item-report.entity';
import { Location } from './entities/location.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryItemsDto } from './dto/query-items.dto';
import { ItemType, ItemStatus, UserRole } from '@lostfound/shared';
import { User } from '../users/entities/user.entity';
import { SearchService } from '../search/search.service';
import { AuditService } from '../audit/audit.service';
import { PaginatedResponse } from '@lostfound/shared';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    @InjectRepository(Location)
    private locationRepo: Repository<Location>,
    private searchService: SearchService,
    private auditService: AuditService,
  ) {}

  async findAllLocations(): Promise<Location[]> {
    return this.locationRepo.find({ order: { name: 'ASC' } });
  }

  async findAll(query: QueryItemsDto): Promise<PaginatedResponse<ItemReport>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.itemsRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.location', 'location')
      .leftJoinAndSelect('item.reporter', 'reporter')
      .leftJoinAndSelect('item.images', 'images');

    if (query.type) {
      qb.andWhere('item.type = :type', { type: query.type });
    }
    if (query.category) {
      qb.andWhere('item.category = :category', { category: query.category });
    }
    if (query.status) {
      qb.andWhere('item.status = :status', { status: query.status });
    }
    if (query.location_id) {
      qb.andWhere('item.location_id = :location_id', { location_id: query.location_id });
    }
    if (query.search) {
      qb.andWhere('(item.title ILIKE :search OR item.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('item.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ItemReport> {
    const item = await this.itemsRepo.findOne({
      where: { id },
      relations: ['location', 'reporter', 'images', 'claims', 'sightings'],
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async create(dto: CreateItemDto, user: User): Promise<ItemReport> {
    let location = await this.locationRepo.findOne({ where: { name: dto.location_name } });
    if (!location) {
      location = await this.locationRepo.save(
        this.locationRepo.create({ name: dto.location_name, building: dto.location_name, faculty: 'General', description: '' }),
      );
    }

    const { location_name, ...rest } = dto;
    const item = this.itemsRepo.create({
      ...rest,
      location_id: location.id,
      reporter_id: user.id,
    });

    const saved = await this.itemsRepo.save(item);

    await this.auditService.log({
      actor_id: user.id,
      action_type: 'ITEM_CREATED',
      target_id: saved.id,
      target_type: 'ItemReport',
      new_status: ItemStatus.ACTIVE,
    });

    if (dto.type === ItemType.FOUND) {
      await this.searchService.matchAndNotify(saved);
    }

    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateItemDto, user: User): Promise<ItemReport> {
    const item = await this.findById(id);

    if (item.reporter_id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not allowed to update this item');
    }

    const oldStatus = item.status;
    await this.itemsRepo.update(id, dto);

    if (dto.status && dto.status !== oldStatus) {
      await this.auditService.log({
        actor_id: user.id,
        action_type: 'ITEM_STATUS_CHANGED',
        target_id: id,
        target_type: 'ItemReport',
        old_status: oldStatus,
        new_status: dto.status,
      });
    }

    return this.findById(id);
  }

  async softDelete(id: string, user: User): Promise<void> {
    const item = await this.findById(id);

    if (item.reporter_id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not allowed to delete this item');
    }

    await this.itemsRepo.update(id, { status: ItemStatus.DISPOSED });

    await this.auditService.log({
      actor_id: user.id,
      action_type: 'ITEM_DELETED',
      target_id: id,
      target_type: 'ItemReport',
      old_status: item.status,
      new_status: ItemStatus.DISPOSED,
    });
  }

  async disposeOldItems(): Promise<void> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await this.itemsRepo
      .createQueryBuilder()
      .update(ItemReport)
      .set({ status: ItemStatus.DISPOSED })
      .where('status = :status', { status: ItemStatus.ACTIVE })
      .andWhere('created_at < :date', { date: ninetyDaysAgo })
      .execute();
  }
}
