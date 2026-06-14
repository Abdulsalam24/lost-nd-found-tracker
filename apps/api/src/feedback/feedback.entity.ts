import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  message!: string;

  @Column({ type: 'smallint', nullable: true })
  rating!: number | null;

  @Column({ default: false })
  reviewed!: boolean;

  @Column({ nullable: true })
  user_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @CreateDateColumn()
  created_at!: Date;
}
