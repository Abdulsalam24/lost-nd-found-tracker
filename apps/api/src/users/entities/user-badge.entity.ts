import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BadgeType } from '@lostfound/shared';
import { User } from './user.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @ManyToOne(() => User, (user) => user.badges)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: BadgeType })
  badge_type!: BadgeType;

  @CreateDateColumn()
  awarded_at!: Date;
}
