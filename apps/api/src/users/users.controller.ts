import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.usersService.findById(user.id);
    const { password_hash, deleted_at, ...safe } = profile;
    return {
      ...safe,
      points: (profile.detective_points ?? 0) + (profile.trivia_points ?? 0),
      bank_name: profile.bank_name,
      account_number: profile.account_number,
      account_name: profile.account_name,
      phone: profile.phone,
      avatar_url: profile.avatar_url,
    };
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
