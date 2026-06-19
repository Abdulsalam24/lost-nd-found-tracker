import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemReport } from '../items/entities/item-report.entity';
import { Claim } from '../claims/entities/claim.entity';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { ItemStatus, ClaimStatus } from '@lostfound/shared';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    @InjectRepository(Claim)
    private claimsRepo: Repository<Claim>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private auditService: AuditService,
  ) {}

  async getDashboard() {
    const totalUsers = await this.usersRepo.count();
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

  async getAllItems(page = 1, limit = 20) {
    const [data, total] = await this.itemsRepo.findAndCount({
      relations: ['reporter', 'location', 'claims'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
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
