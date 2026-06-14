import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  VersionColumn,
} from 'typeorm';
import { ItemType, ItemCategory, ItemStatus } from '@lostfound/shared';
import { User } from '../../users/entities/user.entity';
import { Location } from './location.entity';
import { ImageAsset } from './image-asset.entity';
import { Claim } from '../../claims/entities/claim.entity';
import { Sighting } from '../../sightings/entities/sighting.entity';

@Entity('item_reports')
export class ItemReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  reporter_id!: string;

  @ManyToOne(() => User, (user) => user.item_reports)
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @Column({ type: 'enum', enum: ItemType })
  type!: ItemType;

  @Column({ type: 'enum', enum: ItemCategory })
  category!: ItemCategory;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  location_id!: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location!: Location;

  @Column({ type: 'date' })
  date_of_event!: string;

  @Column({ type: 'varchar', nullable: true })
  serial_number!: string | null;

  @Column({ type: 'varchar', nullable: true })
  image_url!: string | null;

  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.ACTIVE })
  status!: ItemStatus;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => ImageAsset, (img) => img.item_report)
  images!: ImageAsset[];

  @OneToMany(() => Claim, (claim) => claim.item_report)
  claims!: Claim[];

  @OneToMany(() => Sighting, (sighting) => sighting.item_report)
  sightings!: Sighting[];
}
