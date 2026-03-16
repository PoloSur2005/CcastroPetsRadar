import { Body, Controller, Post } from '@nestjs/common';
import { FoundPetsService } from './found-pets.service';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  @Post()
  create(@Body() body: any) {
    return this.foundPetsService.create(body);
  }
}
