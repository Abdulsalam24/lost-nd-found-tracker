import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ItemReport } from '../items/entities/item-report.entity';
import { ImageAsset } from '../items/entities/image-asset.entity';
import { Claim } from '../claims/entities/claim.entity';
import { Sighting } from '../sightings/entities/sighting.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { AuditModule } from '../audit/audit.module';
import { GhostHuntModule } from '../games/ghost-hunt/ghost-hunt.module';
import { TriviaModule } from '../games/trivia/trivia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemReport, ImageAsset, Claim, Sighting, Conversation, User]),
    AuditModule,
    GhostHuntModule,
    TriviaModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
