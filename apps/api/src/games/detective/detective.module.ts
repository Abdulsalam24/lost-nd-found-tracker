import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectiveController } from './detective.controller';
import { DetectiveService } from './detective.service';
import { DetectiveGuess } from './entities/detective-guess.entity';
import { ItemReport } from '../../items/entities/item-report.entity';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetectiveGuess, ItemReport, User])],
  controllers: [DetectiveController],
  providers: [DetectiveService],
  exports: [DetectiveService],
})
export class DetectiveModule {}
