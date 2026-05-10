import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Claim } from './entities/claim.entity';
import { ItemReport } from '../items/entities/item-report.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ClaimStatus, ItemStatus } from '@lostfound/shared';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private claimsRepo: Repository<Claim>,
    @InjectRepository(ItemReport)
    private itemsRepo: Repository<ItemReport>,
    private dataSource: DataSource,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateClaimDto, user: User): Promise<Claim> {
    const item = await this.itemsRepo.findOne({
      where: { id: dto.item_report_id },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== ItemStatus.ACTIVE) {
      throw new BadRequestException('Item is not claimable');
    }

    if (item.reporter_id === user.id) {
      throw new BadRequestException('Cannot claim your own report');
    }

    const existing = await this.claimsRepo.findOne({
      where: {
        item_report_id: dto.item_report_id,
        claimant_id: user.id,
        status: ClaimStatus.PENDING,
      },
    });
    if (existing) {
      throw new ConflictException('You already have a pending claim');
    }

    const claim = this.claimsRepo.create({
      ...dto,
      claimant_id: user.id,
    });

    const saved = await this.claimsRepo.save(claim);

    await this.auditService.log({
      actor_id: user.id,
      action_type: 'CLAIM_CREATED',
      target_id: saved.id,
      target_type: 'Claim',
      new_status: ClaimStatus.PENDING,
    });

    return saved;
  }

  async findById(id: string): Promise<Claim> {
    const claim = await this.claimsRepo.findOne({
      where: { id },
      relations: ['item_report', 'claimant', 'image_asset'],
    });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim;
  }

  async findMyClaims(userId: string): Promise<Claim[]> {
    return this.claimsRepo.find({
      where: { claimant_id: userId },
      relations: ['item_report'],
      order: { created_at: 'DESC' },
    });
  }

  async approve(claimId: string, admin: User): Promise<Claim> {
    return this.reviewClaim(claimId, ClaimStatus.APPROVED, admin);
  }

  async reject(claimId: string, admin: User): Promise<Claim> {
    return this.reviewClaim(claimId, ClaimStatus.REJECTED, admin);
  }

  private async reviewClaim(
    claimId: string,
    status: ClaimStatus,
    admin: User,
  ): Promise<Claim> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const claim = await queryRunner.manager.findOne(Claim, {
        where: { id: claimId },
        relations: ['item_report'],
      });

      if (!claim) {
        throw new NotFoundException('Claim not found');
      }

      if (claim.status !== ClaimStatus.PENDING) {
        throw new BadRequestException('Claim already reviewed');
      }

      // Optimistic locking on item report
      const item = await queryRunner.manager.findOne(ItemReport, {
        where: { id: claim.item_report_id },
      });

      if (!item) {
        throw new NotFoundException('Item not found');
      }

      claim.status = status;
      claim.reviewed_by = admin.id;
      claim.reviewed_at = new Date();
      await queryRunner.manager.save(claim);

      if (status === ClaimStatus.APPROVED) {
        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(ItemReport)
          .set({ status: ItemStatus.RECOVERED })
          .where('id = :id AND version = :version', {
            id: item.id,
            version: item.version,
          })
          .execute();

        if (result.affected === 0) {
          throw new ConflictException(
            'Item was modified concurrently. Please retry.',
          );
        }

        // Reject other pending claims
        await queryRunner.manager
          .createQueryBuilder()
          .update(Claim)
          .set({ status: ClaimStatus.REJECTED, reviewed_by: admin.id, reviewed_at: new Date() })
          .where('item_report_id = :itemId AND id != :claimId AND status = :pending', {
            itemId: item.id,
            claimId: claim.id,
            pending: ClaimStatus.PENDING,
          })
          .execute();
      }

      await queryRunner.commitTransaction();

      await this.auditService.log({
        actor_id: admin.id,
        action_type: status === ClaimStatus.APPROVED ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED',
        target_id: claimId,
        target_type: 'Claim',
        old_status: ClaimStatus.PENDING,
        new_status: status,
      });

      await this.notificationsService.notifyClaimReviewed(claim);

      return this.findById(claimId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
