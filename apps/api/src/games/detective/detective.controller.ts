import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DetectiveService } from './detective.service';
import { DetectiveGuessDto } from './dto/detective-guess.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('games/detective')
export class DetectiveController {
  constructor(private detectiveService: DetectiveService) {}

  @Get('current')
  async getCurrent() {
    return this.detectiveService.getCurrentWeekRanking();
  }

  @Post('guess')
  @UseGuards(JwtAuthGuard)
  async submitGuess(
    @Body() dto: DetectiveGuessDto,
    @CurrentUser() user: User,
  ) {
    return this.detectiveService.submitGuess(dto, user);
  }
}
