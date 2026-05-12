import { Body, Controller, Get, Post } from '@nestjs/common';
import { FoundPetsService } from './found-pets.service';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  @Post()
  create(@Body() body: any) {
    return this.foundPetsService.create(body);
  }

  @Get()
  findAll() {
    return this.foundPetsService.findAll();
  }
}
