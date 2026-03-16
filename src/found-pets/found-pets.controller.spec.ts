import { Test, TestingModule } from '@nestjs/testing';
import { FoundPetsController } from './found-pets.controller';
import { FoundPetsService } from './found-pets.service';

describe('FoundPetsController', () => {
  let controller: FoundPetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoundPetsController],
      providers: [
        {
          provide: FoundPetsService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<FoundPetsController>(FoundPetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
