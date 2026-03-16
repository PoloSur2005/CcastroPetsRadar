import { Body, Controller, Post } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly service: LostPetsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }
}
