import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '@lostfound/shared';
import { ItemReport } from '../../items/entities/item-report.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { DetectiveGuess } from '../../games/detective/entities/detective-guess.entity';
import { UserBadge } from '../../users/entities/user-badge.entity';
import { TriviaAnswer } from '../../games/trivia/entities/trivia-answer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column()
  faculty!: string;

  @Column({ default: false })
  is_verified!: boolean;

  @Column({ default: 0 })
  detective_points!: number;

  @Column({ default: 0 })
  trivia_points!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;

  @OneToMany(() => ItemReport, (item) => item.reporter)
  item_reports!: ItemReport[];

  @OneToMany(() => Claim, (claim) => claim.claimant)
  claims!: Claim[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications!: Notification[];

  @OneToMany(() => DetectiveGuess, (guess) => guess.user)
  detective_guesses!: DetectiveGuess[];

  @OneToMany(() => UserBadge, (badge) => badge.user)
  badges!: UserBadge[];

  @OneToMany(() => TriviaAnswer, (answer) => answer.user)
  trivia_answers!: TriviaAnswer[];
}
