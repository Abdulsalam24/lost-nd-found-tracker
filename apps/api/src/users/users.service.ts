import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBadge } from './entities/user-badge.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(UserBadge)
    private badgesRepo: Repository<UserBadge>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['badges'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    await this.usersRepo.update(userId, dto);
    return this.findById(userId);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return this.badgesRepo.find({ where: { user_id: userId } });
  }
}
