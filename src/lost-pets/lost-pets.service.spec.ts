import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LostPet } from './entities/lost-pet.entity';
import { LostPetsService } from './lost-pets.service';

describe('LostPetsService', () => {
  let service: LostPetsService;
  const repository = { create: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LostPetsService,
        {
          provide: getRepositoryToken(LostPet),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<LostPetsService>(LostPetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    repository.create.mockImplementation((input) => input);
    repository.save.mockImplementation(async (input) => input);
  });

  it('maps location.coordinates when provided in the payload', async () => {
    const result = await service.create({
      name: 'Firulais',
      species: 'dog',
      color: 'brown',
      size: 'medium',
      description: 'test',
      owner_name: 'Claudio',
      owner_email: 'claudio@test.com',
      owner_phone: '123456',
      address: 'Parque',
      lost_date: '2026-03-16T12:00:00Z',
      location: {
        type: 'Point',
        coordinates: [-101.684, 21.122],
      },
    });

    expect(result.location.coordinates).toEqual([-101.684, 21.122]);
  });

  it('maps lat/lng aliases when provided in the payload', async () => {
    const result = await service.create({
      name: 'Firulais',
      species: 'dog',
      color: 'brown',
      size: 'medium',
      description: 'test',
      owner_name: 'Claudio',
      owner_email: 'claudio@test.com',
      owner_phone: '123456',
      address: 'Parque',
      lost_date: '2026-03-16T12:00:00Z',
      lat: 21.122,
      lng: -101.684,
    });

    expect(result.location.coordinates).toEqual([-101.684, 21.122]);
  });
});
