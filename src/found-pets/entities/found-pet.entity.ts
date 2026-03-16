import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('found_pets')
export class FoundPet {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  species: string;

  @Column({ type: 'varchar', nullable: true })
  breed: string | null;

  @Column({ type: 'varchar' })
  color: string;

  @Column({ type: 'varchar' })
  size: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url: string | null;

  @Column({ type: 'varchar' })
  finder_name: string;

  @Column({ type: 'varchar' })
  finder_email: string;

  @Column({ type: 'varchar' })
  finder_phone: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'timestamp' })
  found_date: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

}
