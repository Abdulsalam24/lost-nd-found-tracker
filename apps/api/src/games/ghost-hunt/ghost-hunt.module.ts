import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GhostHuntController } from './ghost-hunt.controller';
import { GhostHuntService } from './ghost-hunt.service';
import { GhostHunt } from './entities/ghost-hunt.entity';
import { UserBadge } from '../../users/entities/user-badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GhostHunt, UserBadge])],
  controllers: [GhostHuntController],
  providers: [GhostHuntService],
  exports: [GhostHuntService],
})
export class GhostHuntModule {}
