import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { TriviaQuestion } from './trivia-question.entity';

@Entity('trivia_answers')
export class TriviaAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @ManyToOne(() => User, (user) => user.trivia_answers)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  question_id!: string;

  @ManyToOne(() => TriviaQuestion, (q) => q.answers)
  @JoinColumn({ name: 'question_id' })
  question!: TriviaQuestion;

  @Column()
  answer!: string;

  @Column()
  is_correct!: boolean;

  @CreateDateColumn()
  answered_at!: Date;

  @Column({ default: 0 })
  points_earned!: number;
}
