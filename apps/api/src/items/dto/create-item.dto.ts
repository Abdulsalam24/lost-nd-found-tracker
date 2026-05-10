import {
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ItemType, ItemCategory } from '@lostfound/shared';

export class CreateItemDto {
  @IsEnum(ItemType)
  type!: ItemType;

  @IsEnum(ItemCategory)
  category!: ItemCategory;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @IsUUID()
  location_id!: string;

  @IsDateString()
  date_of_event!: string;

  @IsOptional()
  @IsString()
  serial_number?: string;
}
