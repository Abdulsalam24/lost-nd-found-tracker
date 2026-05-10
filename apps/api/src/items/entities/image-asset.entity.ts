import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ItemReport } from './item-report.entity';
import { User } from '../../users/entities/user.entity';

@Entity('image_assets')
export class ImageAsset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  item_report_id!: string;

  @ManyToOne(() => ItemReport, (item) => item.images)
  @JoinColumn({ name: 'item_report_id' })
  item_report!: ItemReport;

  @Column()
  object_key!: string;

  @Column()
  thumbnail_key!: string;

  @Column()
  mime_type!: string;

  @Column()
  file_size_bytes!: number;

  @Column()
  checksum!: string;

  @Column()
  uploaded_by!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader!: User;

  @CreateDateColumn()
  created_at!: Date;
}
