import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';

@Entity('detective_guesses')
export class DetectiveGuess {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @ManyToOne(() => User, (user) => user.detective_guesses)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'date' })
  week_of!: string;

  @Column({ type: 'json' })
  guessed_ranking!: string[];

  @Column({ type: 'int', nullable: true })
  score!: number | null;

  @CreateDateColumn()
  submitted_at!: Date;
}
