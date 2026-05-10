import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { GhostHuntService } from './ghost-hunt.service';
import { GhostHuntClaimDto } from './dto/ghost-hunt-claim.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('games/ghost-hunt')
export class GhostHuntController {
  constructor(private ghostHuntService: GhostHuntService) {}

  @Get('current')
  async getCurrent() {
    return this.ghostHuntService.getCurrent();
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claimCode(
    @Body() dto: GhostHuntClaimDto,
    @CurrentUser() user: User,
  ) {
    return this.ghostHuntService.claimCode(dto, user);
  }
}
