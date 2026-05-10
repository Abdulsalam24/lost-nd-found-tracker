import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { NotificationsService } from '../notifications/notifications.service';

interface TokenPayload {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPayload> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email: dto.email,
      password_hash,
      name: dto.name,
      faculty: dto.faculty,
    });

    const saved = await this.usersRepo.save(user);

    await this.notificationsService.sendVerificationEmail(saved);

    return this.generateTokens(saved);
  }

  async login(dto: LoginDto): Promise<TokenPayload> {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refresh(userId: string): Promise<TokenPayload> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateTokens(user);
  }

  async verifyEmail(token: string): Promise<void> {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (payload.type !== 'email_verification') {
      throw new BadRequestException('Invalid token type');
    }

    await this.usersRepo.update(payload.sub, { is_verified: true });
  }

  private generateTokens(user: User): TokenPayload {
    const jwtPayload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(jwtPayload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(jwtPayload, { expiresIn: '7d' }),
    };
  }
}
