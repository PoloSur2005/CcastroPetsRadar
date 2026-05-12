import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis.module';
import { LostPetsController } from './lost-pets.controller';
import { LostPetsService } from './lost-pets.service';
import { LostPet } from './entities/lost-pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet]), RedisModule],
  controllers: [LostPetsController],
  providers: [LostPetsService],
  exports: [LostPetsService, TypeOrmModule],
})
export class LostPetsModule {}
