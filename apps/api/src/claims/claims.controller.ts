import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private claimsService: ClaimsService) {}

  @Post()
  async create(@Body() dto: CreateClaimDto, @CurrentUser() user: User) {
    return this.claimsService.create(dto, user);
  }

  @Get('my')
  async findMyClaims(@CurrentUser() user: User) {
    return this.claimsService.findMyClaims(user.id);
  }

  @Get('item/:itemId')
  async findClaimsForItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: User,
  ) {
    return this.claimsService.findClaimsForItem(itemId, user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.findById(id);
  }

  @Patch(':id/approve')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.claimsService.approve(id, user);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.claimsService.reject(id, user);
  }
}
