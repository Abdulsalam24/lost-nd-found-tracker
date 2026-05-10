import { IsString, MinLength } from 'class-validator';

export class GhostHuntClaimDto {
  @IsString()
  @MinLength(1)
  secret_code!: string;
}
