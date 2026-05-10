import { Controller, Get } from '@nestjs/common';
import { HeatmapService } from './heatmap.service';

@Controller('heatmap')
export class HeatmapController {
  constructor(private heatmapService: HeatmapService) {}

  @Get()
  async getHeatmap() {
    return this.heatmapService.getHeatmap();
  }
}
