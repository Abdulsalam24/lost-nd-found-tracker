import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsUUID()
  item_report_id?: string | null;

  @IsUUID()
  recipient_id!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message?: string;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
