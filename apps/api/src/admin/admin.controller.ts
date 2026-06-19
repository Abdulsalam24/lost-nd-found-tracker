import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ItemStatus } from '@lostfound/shared';
import { GhostHuntService } from '../games/ghost-hunt/ghost-hunt.service';
import { CreateGhostHuntDto } from '../games/ghost-hunt/dto/create-ghost-hunt.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private ghostHuntService: GhostHuntService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('items')
  async getAllItems(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllItems(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('claims')
  async getClaims(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getClaims(
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Patch('items/:id/status')
  async updateItemStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ItemStatus,
  ) {
    return this.adminService.updateItemStatus(id, status);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteItem(id);
    return { message: 'Item deleted' };
  }

  @Post('games/ghost-hunt')
  async createGhostHunt(@Body() dto: CreateGhostHuntDto) {
    return this.ghostHuntService.create(dto);
  }
}
