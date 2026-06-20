import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ItemReport } from '../../items/entities/item-report.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  item_report_id!: string | null;

  @ManyToOne(() => ItemReport, { nullable: true })
  @JoinColumn({ name: 'item_report_id' })
  item_report!: ItemReport | null;

  @Column()
  initiator_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiator_id' })
  initiator!: User;

  @Column()
  recipient_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient!: User;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Message, (msg) => msg.conversation)
  messages!: Message[];
}
