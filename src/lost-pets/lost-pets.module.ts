import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPetsController } from './lost-pets.controller';
import { LostPetsService } from './lost-pets.service';
import { LostPet } from './entities/lost-pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet])],
  controllers: [LostPetsController],
  providers: [LostPetsService],
  exports: [LostPetsService, TypeOrmModule],
})
export class LostPetsModule {}
