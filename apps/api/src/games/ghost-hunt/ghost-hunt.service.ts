import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GhostHunt } from './entities/ghost-hunt.entity';
import { UserBadge } from '../../users/entities/user-badge.entity';
import { User } from '../../users/entities/user.entity';
import { GhostHuntClaimDto } from './dto/ghost-hunt-claim.dto';
import { CreateGhostHuntDto } from './dto/create-ghost-hunt.dto';
import { BadgeType } from '@lostfound/shared';

@Injectable()
export class GhostHuntService {
  constructor(
    @InjectRepository(GhostHunt)
    private ghostHuntRepo: Repository<GhostHunt>,
    @InjectRepository(UserBadge)
    private badgesRepo: Repository<UserBadge>,
  ) {}

  async getCurrent(): Promise<GhostHunt | null> {
    const weekOf = this.getCurrentWeekStart();
    const hunt = await this.ghostHuntRepo.findOne({
      where: { week_of: weekOf },
      relations: ['location', 'winner'],
    });
    if (hunt) {
      // Don't leak the secret code
      const { secret_code: _, ...safe } = hunt;
      return safe as GhostHunt;
    }
    return null;
  }

  async claimCode(dto: GhostHuntClaimDto, user: User): Promise<{ success: boolean; message: string }> {
    const weekOf = this.getCurrentWeekStart();
    const hunt = await this.ghostHuntRepo.findOne({
      where: { week_of: weekOf },
    });

    if (!hunt) {
      throw new NotFoundException('No ghost hunt this week');
    }

    if (hunt.winner_id) {
      throw new BadRequestException('This hunt has already been won');
    }

    if (hunt.secret_code !== dto.secret_code) {
      return { success: false, message: 'Wrong code. Keep hunting!' };
    }

    // First correct code wins
    hunt.winner_id = user.id;
    hunt.claimed_at = new Date();
    await this.ghostHuntRepo.save(hunt);

    // Award badge if they don't already have one
    const existingBadge = await this.badgesRepo.findOne({
      where: { user_id: user.id, badge_type: BadgeType.GHOST_HUNTER },
    });

    if (!existingBadge) {
      const badge = this.badgesRepo.create({
        user_id: user.id,
        badge_type: BadgeType.GHOST_HUNTER,
      });
      await this.badgesRepo.save(badge);
    }

    return { success: true, message: 'You found the ghost! Badge awarded.' };
  }

  async create(dto: CreateGhostHuntDto): Promise<GhostHunt> {
    const hunt = this.ghostHuntRepo.create(dto);
    return this.ghostHuntRepo.save(hunt);
  }

  private getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }
}
