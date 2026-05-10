import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { TriviaAnswerDto } from './dto/trivia-answer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('games/trivia')
export class TriviaController {
  constructor(private triviaService: TriviaService) {}

  @Get('current')
  async getCurrentQuestions() {
    return this.triviaService.getCurrentQuestions();
  }

  @Post('answer')
  @UseGuards(JwtAuthGuard)
  async submitAnswer(
    @Body() dto: TriviaAnswerDto,
    @CurrentUser() user: User,
  ) {
    return this.triviaService.submitAnswer(dto, user);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.triviaService.getLeaderboard();
  }
}
