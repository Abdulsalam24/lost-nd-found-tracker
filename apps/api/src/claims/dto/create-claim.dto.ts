import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator';

export class CreateClaimDto {
  @IsUUID()
  item_report_id!: string;

  @IsString()
  @MinLength(10)
  evidence_description!: string;

  @IsOptional()
  @IsUUID()
  image_asset_id?: string;

  @IsOptional()
  @IsString()
  evidence_image_url?: string;
}
