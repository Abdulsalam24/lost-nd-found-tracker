import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ItemReport } from '../../items/entities/item-report.entity';
import { Location } from '../../items/entities/location.entity';

@Entity('sightings')
export class Sighting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  item_report_id!: string;

  @ManyToOne(() => ItemReport, (item) => item.sightings)
  @JoinColumn({ name: 'item_report_id' })
  item_report!: ItemReport;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'uuid', nullable: true })
  location_id!: string | null;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location!: Location | null;

  @Column({ type: 'timestamptz' })
  spotted_at!: Date;

  @CreateDateColumn()
  created_at!: Date;
}
