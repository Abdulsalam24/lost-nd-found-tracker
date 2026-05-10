import { IsString, IsUUID, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateSightingDto {
  @IsUUID()
  item_report_id!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsUUID()
  location_id?: string;

  @IsDateString()
  spotted_at!: string;
}
