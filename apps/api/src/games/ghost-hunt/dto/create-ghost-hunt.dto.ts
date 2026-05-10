import { IsString, IsUUID, IsDateString, MinLength } from 'class-validator';

export class CreateGhostHuntDto {
  @IsDateString()
  week_of!: string;

  @IsString()
  @MinLength(10)
  clue_text!: string;

  @IsUUID()
  location_id!: string;

  @IsString()
  @MinLength(4)
  secret_code!: string;
}
