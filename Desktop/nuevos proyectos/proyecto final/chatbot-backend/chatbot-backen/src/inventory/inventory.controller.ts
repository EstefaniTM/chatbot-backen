import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async saveInventory(
    @Body('userId') userId: string,
    @Body('fileName') fileName: string,
    @Body('data') data: any[],
  ) {
    const result = await this.inventoryService.saveInventory(userId, fileName, data);
    return { success: true, inventory: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getInventory(@Param('userId') userId: string) {
    const result = await this.inventoryService.getInventory(userId);
    return { success: !!result, inventory: result };
  }
}
