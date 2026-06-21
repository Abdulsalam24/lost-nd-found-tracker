import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemReport } from '../items/entities/item-report.entity';
import { ImageAsset } from '../items/entities/image-asset.entity';
import { Claim } from '../claims/entities/claim.entity';
import { Sighting } from '../sightings/entities/sighting.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { ItemStatus, ClaimStatus } from '@lostfound/shared';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    @InjectRepository(ImageAsset)
    private imageRepo: Repository<ImageAsset>,
    @InjectRepository(Claim)
    private claimsRepo: Repository<Claim>,
    @InjectRepository(Sighting)
    private sightingsRepo: Repository<Sighting>,
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private auditService: AuditService,
  ) {}

  async getDashboard() {
    const totalUsers = await this.usersRepo.count({ where: { is_verified: true } });
    const totalItems = await this.itemsRepo.count();
    const activeItems = await this.itemsRepo.count({ where: { status: ItemStatus.ACTIVE } });
    const recoveredItems = await this.itemsRepo.count({ where: { status: ItemStatus.RECOVERED } });
    const pendingClaims = await this.claimsRepo.count({ where: { status: ClaimStatus.PENDING } });

    const recentItems = await this.itemsRepo.find({
      relations: ['reporter', 'location'],
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      totalUsers,
      totalItems,
      activeItems,
      recoveredItems,
      pendingClaims,
      recentItems,
    };
  }

  async getAllUsers(page = 1, limit = 20, search?: string) {
    const qb = this.usersRepo.createQueryBuilder('user')
      .select([
        'user.id', 'user.name', 'user.email', 'user.faculty',
        'user.role', 'user.phone', 'user.is_verified', 'user.created_at',
      ])
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    qb.where('user.is_verified = :verified', { verified: true });

    if (search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async getAllItems(page = 1, limit = 20, search?: string, category?: string, status?: string) {
    const qb = this.itemsRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.reporter', 'reporter')
      .leftJoinAndSelect('item.location', 'location')
      .orderBy('item.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('item.title ILIKE :search', { search: `%${search}%` });
    }
    if (category) {
      qb.andWhere('item.category = :category', { category });
    }
    if (status) {
      qb.andWhere('item.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, total_pages: Math.ceil(total / limit) };
  }

  async updateItemStatus(id: string, status: ItemStatus) {
    if (!Object.values(ItemStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}. Must be one of: ${Object.values(ItemStatus).join(', ')}`);
    }
    const item = await this.itemsRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    item.status = status;
    return this.itemsRepo.save(item);
  }

  async deleteItem(id: string) {
    const item = await this.itemsRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    // Delete related records first to avoid FK constraints
    await this.claimsRepo.delete({ item_report_id: id });
    await this.sightingsRepo.delete({ item_report_id: id });
    await this.imageRepo.delete({ item_report_id: id });
    await this.conversationsRepo.update({ item_report_id: id }, { item_report_id: null as any });
    await this.itemsRepo.remove(item);
  }

  async getClaims(status?: string, page = 1, limit = 50) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.claimsRepo.findAndCount({
      where,
      relations: ['claimant', 'item_report'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((c) => ({
        id: c.id,
        item_report_id: c.item_report_id,
        item_title: c.item_report?.title ?? null,
        claimant_id: c.claimant_id,
        claimant_name: c.claimant?.name ?? null,
        evidence_description: c.evidence_description,
        evidence_image_url: (c as any).evidence_image_url ?? null,
        status: c.status,
        created_at: c.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async getAuditLogs(page = 1, limit = 50) {
    return this.auditService.findAll(page, limit);
  }
}
