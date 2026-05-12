import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '../common.redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet } from './entities/lost-pet.entity';

type CreateLostPetDto = {
  name: string;
  species: string;
  breed?: string;
  color: string;
  size: string;
  description: string;
  photo_url?: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  address: string;
  lost_date: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
};

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetsRepository: Repository<LostPet>,
    private readonly redisService: RedisService,
  ) {}

  async create(createLostPetDto: CreateLostPetDto): Promise<LostPet> {
    if (!createLostPetDto) {
      throw new BadRequestException('Request body is required');
    }

    const [longitude, latitude] = this.extractCoordinates(createLostPetDto);

    const pet = this.lostPetsRepository.create({
      ...createLostPetDto,
      breed: createLostPetDto.breed ?? null,
      photo_url: createLostPetDto.photo_url ?? null,
      lost_date: new Date(createLostPetDto.lost_date),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    const saved = await this.lostPetsRepository.save(pet);
    await this.redisService.del('lost-pets:active');
    return saved;
  }


  async findActive(): Promise<LostPet[]> {
    const cacheKey = 'lost-pets:active';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as LostPet[];
    }

    const data = await this.lostPetsRepository.find({
      where: { is_active: true },
      order: { lost_date: 'DESC' },
    });

    await this.redisService.setEx(cacheKey, 60, JSON.stringify(data));
    return data;
  }

  private extractCoordinates(createLostPetDto: CreateLostPetDto): [number, number] {
    const longitude = createLostPetDto.longitude ?? createLostPetDto.lng ?? createLostPetDto.location?.coordinates?.[0];
    const latitude = createLostPetDto.latitude ?? createLostPetDto.lat ?? createLostPetDto.location?.coordinates?.[1];

    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      throw new BadRequestException(
        'Location is required. Provide longitude/latitude, lng/lat, or location.coordinates [lng, lat].',
      );
    }

    return [longitude, latitude];
  }
}
