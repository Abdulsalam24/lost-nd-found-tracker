import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { TriviaType } from '@lostfound/shared';
import { TriviaAnswer } from './trivia-answer.entity';

@Entity('trivia_questions')
@Unique(['week_of', 'question_text'])
export class TriviaQuestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  week_of!: string;

  @Column({ type: 'text' })
  question_text!: string;

  @Column({ type: 'json' })
  options!: string[];

  @Column()
  correct_answer!: string;

  @Column({ type: 'enum', enum: TriviaType })
  type!: TriviaType;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => TriviaAnswer, (answer) => answer.question)
  answers!: TriviaAnswer[];
}
