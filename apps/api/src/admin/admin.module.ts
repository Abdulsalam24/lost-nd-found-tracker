import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ItemReport } from '../items/entities/item-report.entity';
import { Claim } from '../claims/entities/claim.entity';
import { User } from '../users/entities/user.entity';
import { AuditModule } from '../audit/audit.module';
import { GhostHuntModule } from '../games/ghost-hunt/ghost-hunt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemReport, Claim, User]),
    AuditModule,
    GhostHuntModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
