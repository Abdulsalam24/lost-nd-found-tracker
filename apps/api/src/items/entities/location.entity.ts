import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true, default: '' })
  building!: string;

  @Column({ nullable: true, default: '' })
  faculty!: string;

  @Column({ type: 'text', default: '' })
  description!: string;
}
