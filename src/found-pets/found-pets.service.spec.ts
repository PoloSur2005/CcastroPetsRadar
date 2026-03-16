import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { FoundPet } from './entities/found-pet.entity';
import { FoundPetsService } from './found-pets.service';

describe('FoundPetsService', () => {
  let service: FoundPetsService;
  const repository = { create: jest.fn(), save: jest.fn() };
  const dataSource = { query: jest.fn() };
  const mailerService = { sendMatchNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoundPetsService,
        {
          provide: getRepositoryToken(FoundPet),
          useValue: repository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: MailerService,
          useValue: mailerService,
        },
      ],
    }).compile();

    service = module.get<FoundPetsService>(FoundPetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    repository.create.mockImplementation((input) => input);
    repository.save.mockImplementation(async (input) => input);
    dataSource.query.mockResolvedValue([]);
    mailerService.sendMatchNotification.mockResolvedValue(undefined);
  });

  it('maps lat/lng aliases when creating a found report', async () => {
    const result = await service.create({
      species: 'dog',
      color: 'brown',
      size: 'medium',
      description: 'test',
      finder_name: 'Carlos',
      finder_email: 'carlos@test.com',
      finder_phone: '55555',
      address: 'Plaza',
      found_date: '2026-03-16T13:00:00Z',
      lat: 21.1222,
      lng: -101.6838,
    });

    expect(result.foundPet.location.coordinates).toEqual([-101.6838, 21.1222]);
  });

  it('maps location.coordinates when creating a found report', async () => {
    const result = await service.create({
      species: 'dog',
      color: 'brown',
      size: 'medium',
      description: 'test',
      finder_name: 'Carlos',
      finder_email: 'carlos@test.com',
      finder_phone: '55555',
      address: 'Plaza',
      found_date: '2026-03-16T13:00:00Z',
      location: {
        type: 'Point',
        coordinates: [-101.6838, 21.1222],
      },
    });

    expect(result.foundPet.location.coordinates).toEqual([-101.6838, 21.1222]);
  });
});
