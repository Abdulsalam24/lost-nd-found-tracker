import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

interface CreateAuditLogDto {
  actor_id: string;
  action_type: string;
  target_id: string;
  target_type: string;
  old_status?: string;
  new_status?: string;
  notes?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const entry = this.auditRepo.create({
      actor_id: dto.actor_id,
      action_type: dto.action_type,
      target_id: dto.target_id,
      target_type: dto.target_type,
      old_status: dto.old_status ?? null,
      new_status: dto.new_status ?? null,
      notes: dto.notes ?? null,
    });
    return this.auditRepo.save(entry);
  }

  async findAll(page = 1, limit = 50): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditRepo.findAndCount({
      relations: ['actor'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }
}
