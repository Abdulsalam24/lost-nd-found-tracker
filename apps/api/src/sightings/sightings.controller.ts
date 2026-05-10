import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SightingsService } from './sightings.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('sightings')
export class SightingsController {
  constructor(private sightingsService: SightingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  async create(@Body() dto: CreateSightingDto) {
    return this.sightingsService.create(dto);
  }

  @Get('item/:itemId')
  async findByItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.sightingsService.findByItem(itemId);
  }
}
