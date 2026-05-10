import {
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ItemCategory, ItemStatus } from '@lostfound/shared';

export class UpdateItemDto {
  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUUID()
  location_id?: string;

  @IsOptional()
  @IsDateString()
  date_of_event?: string;

  @IsOptional()
  @IsString()
  serial_number?: string;

  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;
}
