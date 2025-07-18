import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory } from './inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
  ) {}

  async saveInventory(userId: string, fileName: string, data: any[]): Promise<Inventory> {
    // Busca si ya existe inventario para el usuario
    const existing = await this.inventoryModel.findOne({ userId });
    if (existing) {
      existing.fileName = fileName;
      existing.data = data;
      return existing.save();
    }
    return this.inventoryModel.create({ userId, fileName, data });
  }

  async getInventory(userId: string): Promise<Inventory | null> {
    return this.inventoryModel.findOne({ userId });
  }
}
