import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { NotifChannel } from '@lostfound/shared';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  type!: string;

  @Column({ type: 'enum', enum: NotifChannel })
  channel!: NotifChannel;

  @Column({ type: 'jsonb' })
  payload_json!: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  sent_at!: Date | null;

  @Column()
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}
