import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { LostPet } from '../lost-pets/entities/lost-pet.entity';
import { FoundPet } from './entities/found-pet.entity';

type CreateFoundPetDto = {
  species: string;
  breed?: string;
  color: string;
  size: string;
  description: string;
  photo_url?: string;
  finder_name: string;
  finder_email: string;
  finder_phone: string;
  address: string;
  found_date: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
};

type MatchResult = LostPet & { distance: number };

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetsRepository: Repository<FoundPet>,
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
  ) {}

  async create(createFoundPetDto: CreateFoundPetDto) {
    if (!createFoundPetDto) {
      throw new BadRequestException('Request body is required');
    }

    const [longitude, latitude] = this.extractCoordinates(createFoundPetDto);

    const foundPet = await this.foundPetsRepository.save(
      this.foundPetsRepository.create({
        ...createFoundPetDto,
        breed: createFoundPetDto.breed ?? null,
        photo_url: createFoundPetDto.photo_url ?? null,
        found_date: new Date(createFoundPetDto.found_date),
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      }),
    );

    const matches = await this.findMatchesIn500Meters(longitude, latitude);

    await Promise.all(
      matches.map(async (lostPet) => {
        await this.mailerService.sendMatchNotification(
          lostPet,
          foundPet,
          lostPet.distance,
        );
      }),
    );

    return { foundPet, notifiedOwners: matches.length, matches };
  }

  private extractCoordinates(createFoundPetDto: CreateFoundPetDto): [number, number] {
    const longitude =
      createFoundPetDto.longitude ??
      createFoundPetDto.lng ??
      createFoundPetDto.location?.coordinates?.[0];

    const latitude =
      createFoundPetDto.latitude ??
      createFoundPetDto.lat ??
      createFoundPetDto.location?.coordinates?.[1];

    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      throw new BadRequestException(
        'Location is required. Provide longitude/latitude, lng/lat, or location.coordinates [lng, lat].',
      );
    }

    return [longitude, latitude];
  }

  private async findMatchesIn500Meters(
    longitude: number,
    latitude: number,
  ): Promise<MatchResult[]> {
    const query = `
      SELECT 
        lp.*,
        ST_AsGeoJSON(lp.location) AS location_geojson,
        ST_Distance(
          lp.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance
      FROM lost_pets lp
      WHERE lp.is_active = true
      AND ST_DWithin(
        lp.location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        500
      )
      ORDER BY distance ASC;
    `;

    const results = await this.dataSource.query(query, [longitude, latitude]);

    return results.map((row: any) => {
      const location = row.location_geojson
        ? JSON.parse(row.location_geojson)
        : null;

      return {
        ...row,
        location,
        distance: Number(row.distance),
      };
    });
  }
}

