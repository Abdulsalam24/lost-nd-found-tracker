import { IsString, IsUUID } from 'class-validator';

export class TriviaAnswerDto {
  @IsUUID()
  question_id!: string;

  @IsString()
  answer!: string;
}
