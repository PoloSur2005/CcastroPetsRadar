import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '../mailer/mailer.module';
import { FoundPetsController } from './found-pets.controller';
import { FoundPetsService } from './found-pets.service';
import { FoundPet } from './entities/found-pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoundPet]), MailerModule],
  controllers: [FoundPetsController],
  providers: [FoundPetsService],
})
export class FoundPetsModule {}
