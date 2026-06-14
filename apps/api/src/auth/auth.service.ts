import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthPayload {
  access_token: string;
  refresh_token: string;
  user: Omit<User, 'password_hash' | 'deleted_at' | 'otp_code' | 'otp_expires_at'> & { points: number };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string; email: string }> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing && existing.is_verified) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);

    let user: User;
    if (existing && !existing.is_verified) {
      // Update unverified user with new data
      existing.password_hash = password_hash;
      existing.name = dto.name;
      existing.faculty = dto.faculty;
      user = existing;
    } else {
      user = this.usersRepo.create({
        email: dto.email,
        password_hash,
        name: dto.name,
        faculty: dto.faculty,
      });
    }

    const otp = this.generateOtp();
    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.logger.log(`[OTP] ${dto.email} => ${otp}`);

    const saved = await this.usersRepo.save(user);

    await this.notificationsService.sendOtpEmail(saved, otp);

    return { message: 'OTP sent to your email', email: saved.email };
  }

  async verifyOtp(email: string, otp: string): Promise<AuthPayload> {
    const user = await this.usersRepo.findOne({
      where: { email },
      relations: ['badges'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.otp_code || !user.otp_expires_at) {
      throw new BadRequestException('No OTP requested. Please register again.');
    }

    if (new Date() > user.otp_expires_at) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (user.otp_code !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    user.is_verified = true;
    user.otp_code = null;
    user.otp_expires_at = null;
    await this.usersRepo.save(user);

    return this.buildAuthPayload(user);
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_verified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = this.generateOtp();
    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    this.logger.log(`[OTP] ${email} => ${otp}`);

    await this.usersRepo.save(user);

    await this.notificationsService.sendOtpEmail(user, otp);

    return { message: 'OTP resent to your email' };
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      relations: ['badges'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_verified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthPayload(user);
  }

  async refresh(userId: string): Promise<AuthPayload> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['badges'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.buildAuthPayload(user);
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

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private buildAuthPayload(user: User): AuthPayload {
    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    const { password_hash, deleted_at, otp_code, otp_expires_at, ...safeUser } = user;

    return {
      access_token: this.jwtService.sign(jwtPayload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(jwtPayload, { expiresIn: '7d' }),
      user: {
        ...safeUser,
        points: (user.detective_points ?? 0) + (user.trivia_points ?? 0),
      },
    };
  }
}
