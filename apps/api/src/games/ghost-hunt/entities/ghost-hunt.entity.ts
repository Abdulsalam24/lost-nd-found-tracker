import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Location } from '../../../items/entities/location.entity';
import { User } from '../../../users/entities/user.entity';

@Entity('ghost_hunts')
export class GhostHunt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  week_of!: string;

  @Column({ type: 'text' })
  clue_text!: string;

  @Column()
  location_id!: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location!: Location;

  @Column()
  secret_code!: string;

  @Column({ type: 'uuid', nullable: true })
  winner_id!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winner_id' })
  winner!: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  claimed_at!: Date | null;
}
