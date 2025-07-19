

import { parse } from 'csv-parse/sync';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cargacsv } from './cargacsv.entity';
import { CreateCargacsvDto } from './dto/createCargacsv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CargacsvService {
  constructor(
    @InjectModel(Cargacsv.name)
    private readonly cargacsvModel: Model<Cargacsv>,
  ) {}

  async findById(_id: string | Types.ObjectId): Promise<Cargacsv | null> {
    try {
      // Si el id es string, conviértelo a ObjectId
      const objectId = typeof _id === 'string' ? new Types.ObjectId(_id) : _id;
      return await this.cargacsvModel.findById(objectId).exec();
    } catch (err) {
      console.error('Error buscando CSV por id:', err);
      return null;
    }
  }

  // Guarda las filas del CSV como un array en el campo 'data' del documento principal
  async saveCsvRowsInDocument(csvContent: string, csvId: Types.ObjectId) {
    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      const result = await this.cargacsvModel.findByIdAndUpdate(
        csvId,
        { $set: { data: records, status: 'processed' } },
        { new: true }
      );
      console.log(`[CSV] Se guardaron ${records.length} filas en el documento csvId: ${csvId}`);
      return records.length;
    } catch (error) {
      console.error('[CSV] Error al parsear o guardar filas:', error);
      return 0;
    }
  }

  // (Constructor already defined above, remove this duplicate)

  async create(createCargacsvDto: CreateCargacsvDto): Promise<Cargacsv | null> {
    try {
      const cargacsv = new this.cargacsvModel(createCargacsvDto);
      return await cargacsv.save();
    } catch (err) {
      console.error('Error creating CSV upload:', err);
      return null;
    }
  }


  async findAllByUser(userId: string, page = 1, limit = 10): Promise<{ data: Cargacsv[]; total: number } | null> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.cargacsvModel
          .find({ uploadedBy: userId })
          .sort({ uploadedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.cargacsvModel.countDocuments({ uploadedBy: userId }).exec(),
      ]);
      return { data, total };
    } catch (err) {
      console.error('Error retrieving CSV uploads by user:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Cargacsv | null> {
    try {
      return await this.cargacsvModel.findById(id).exec();
    } catch (err) {
      console.error('Error retrieving CSV upload:', err);
      return null;
    }
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Primero buscar el archivo en la base de datos
      const csvRecord = await this.cargacsvModel.findById(id).exec();
      
      if (!csvRecord) {
        return {
          success: false,
          message: 'Archivo CSV no encontrado en la base de datos'
        };
      }

      // Construir la ruta del archivo
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadsDir, csvRecord.filename);

      // Eliminar el archivo físico si existe
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Archivo físico eliminado: ${filePath}`);
        } catch (fileError) {
          console.error('Error eliminando archivo físico:', fileError);
          // Continuar con la eliminación de la base de datos aunque falle la eliminación del archivo
        }
      } else {
        console.warn(`Archivo físico no encontrado: ${filePath}`);
      }

      // Eliminar el registro de la base de datos
      await this.cargacsvModel.findByIdAndDelete(id).exec();

      return {
        success: true,
        message: `Archivo CSV "${csvRecord.originalname}" eliminado exitosamente`
      };

    } catch (err) {
      console.error('Error eliminando CSV upload:', err);
      return {
        success: false,
        message: 'Error interno del servidor al eliminar el archivo'
      };
    }
  }

  async deleteMultiple(ids: string[]): Promise<{ 
    success: boolean; 
    message: string; 
    results: { id: string; success: boolean; message: string }[] 
  }> {
    const results: { id: string; success: boolean; message: string }[] = [];
    let successCount = 0;

    for (const id of ids) {
      const result = await this.delete(id);
      results.push({
        id,
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        successCount++;
      }
    }

    return {
      success: successCount > 0,
      message: `${successCount} de ${ids.length} archivos eliminados exitosamente`,
      results
    };
  }
}