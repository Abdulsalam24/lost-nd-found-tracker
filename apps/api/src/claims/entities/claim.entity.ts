import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ClaimStatus } from '@lostfound/shared';
import { ItemReport } from '../../items/entities/item-report.entity';
import { User } from '../../users/entities/user.entity';
import { ImageAsset } from '../../items/entities/image-asset.entity';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  item_report_id!: string;

  @ManyToOne(() => ItemReport, (item) => item.claims)
  @JoinColumn({ name: 'item_report_id' })
  item_report!: ItemReport;

  @Column()
  claimant_id!: string;

  @ManyToOne(() => User, (user) => user.claims)
  @JoinColumn({ name: 'claimant_id' })
  claimant!: User;

  @Column({ type: 'text' })
  evidence_description!: string;

  @Column({ type: 'uuid', nullable: true })
  image_asset_id!: string | null;

  @ManyToOne(() => ImageAsset, { nullable: true })
  @JoinColumn({ name: 'image_asset_id' })
  image_asset!: ImageAsset | null;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.PENDING })
  status!: ClaimStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer!: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewed_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;
}
