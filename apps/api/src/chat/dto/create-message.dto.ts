import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  item_report_id!: string;

  @IsUUID()
  recipient_id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
