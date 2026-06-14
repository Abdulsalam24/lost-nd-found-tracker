import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bank_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  account_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  account_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
