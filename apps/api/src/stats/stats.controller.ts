import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get()
  async getStats() {
    return this.statsService.getStats();
  }

  @Get('by-category')
  async getByCategory() {
    return this.statsService.getStatsByCategory();
  }

  @Get('by-month')
  async getByMonth() {
    return this.statsService.getStatsByMonth();
  }
}
