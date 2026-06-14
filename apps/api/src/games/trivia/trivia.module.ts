import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriviaController } from './trivia.controller';
import { TriviaService } from './trivia.service';
import { TriviaQuestion } from './entities/trivia-question.entity';
import { TriviaAnswer } from './entities/trivia-answer.entity';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TriviaQuestion, TriviaAnswer, User])],
  controllers: [TriviaController],
  providers: [TriviaService],
  exports: [TriviaService],
})
export class TriviaModule {}
