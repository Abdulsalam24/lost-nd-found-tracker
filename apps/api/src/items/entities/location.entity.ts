import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: '' })
  building!: string;

  @Column({ default: '' })
  faculty!: string;

  @Column({ type: 'text', default: '' })
  description!: string;
}
