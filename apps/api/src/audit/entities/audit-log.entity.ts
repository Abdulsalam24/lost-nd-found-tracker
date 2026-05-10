import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  actor_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  actor!: User;

  @Column()
  action_type!: string;

  @Column()
  target_id!: string;

  @Column()
  target_type!: string;

  @Column({ type: 'varchar', nullable: true })
  old_status!: string | null;

  @Column({ type: 'varchar', nullable: true })
  new_status!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
