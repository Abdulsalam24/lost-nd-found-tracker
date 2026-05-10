import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class DetectiveGuessDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  guessed_ranking!: string[];
}
