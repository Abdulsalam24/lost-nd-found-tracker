import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
