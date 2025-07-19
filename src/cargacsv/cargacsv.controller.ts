
import {
  Controller,
  Post as HttpPost,
  Get,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { CargacsvService } from './cargacsv.service';
import { DeleteMultipleDto } from './dto/deleteCargacsv';
import { Cargacsv } from './cargacsv.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';

@Controller('csv-uploads')
export class CargacsvController {
  constructor(private readonly cargacsvService: CargacsvService) {}


  @UseGuards(JwtAuthGuard)
  @HttpPost()
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any
  ): Promise<SuccessResponseDto<Cargacsv>> {
    if (!file) {
      console.error('[CSV] No se recibió ningún archivo CSV');
      throw new BadRequestException('No se recibió ningún archivo CSV');
    }
    console.log('[CSV] Archivo recibido:', {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    console.log('[CSV] Body recibido:', body);

    // Guardar los metadatos y el nombre del archivo, asociando el usuario autenticado
    const userId = req.user?.id || req.user?._id || req.user?.sub;
    const csvInfo = {
      filename: file.filename,
      originalname: file.originalname,
      uploadedBy: userId,
      status: body.status || 'pending',
      errorMessage: body.errorMessage || undefined
    };
    const csv = await this.cargacsvService.create(csvInfo);
    if (!csv) {
      console.error('[CSV] Error creando metadatos en la base de datos');
      throw new NotFoundException('Error creating CSV upload');
    }

    // Leer y guardar el contenido del CSV en la base de datos
    const filePath = require('path').join(process.cwd(), 'uploads', file.filename);
    console.log('[CSV] Ruta del archivo:', filePath);
    const fs = require('fs');
    let csvContent = '';
    try {
      csvContent = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      console.error('[CSV] Error leyendo el archivo:', err);
    }
    if (csvContent) {
      const { ObjectId } = require('mongodb');
      await this.cargacsvService.saveCsvRowsInDocument(csvContent, new ObjectId(csv._id));
    }

    // Obtener el documento actualizado
    if (!csv._id) {
      throw new NotFoundException('No se pudo obtener el ID del CSV procesado');
    }
    const updatedCsv = await this.cargacsvService.findById(csv._id.toString());
    if (!updatedCsv) {
      throw new NotFoundException('No se pudo encontrar el CSV procesado');
    }
    return new SuccessResponseDto(
      'Archivo CSV subido y procesado exitosamente',
      updatedCsv,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Req() req: any
  ): Promise<SuccessResponseDto<{ data: Cargacsv[]; total: number }>> {
    const userId = req.user?.id || req.user?._id || req.user?.sub;
    const result = await this.cargacsvService.findAllByUser(userId, Number(page), Number(limit));

    if (!result || !result.data) {
      throw new InternalServerErrorException('Error retrieving CSV uploads');
    }

    return new SuccessResponseDto(
      'CSV uploads retrieved successfully',
      result,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<Cargacsv>> {
    const csv = await this.cargacsvService.findOne(id);

    if (!csv) {
      throw new NotFoundException('CSV upload not found');
    }

    return new SuccessResponseDto(
      'CSV upload retrieved successfully',
      csv,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteOne(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<{ message: string }>> {
    if (!id) {
      throw new BadRequestException('ID del archivo CSV es requerido');
    }

    const result = await this.cargacsvService.delete(id);

    if (!result.success) {
      throw new NotFoundException(result.message);
    }

    return new SuccessResponseDto(
      'Archivo CSV eliminado exitosamente',
      { message: result.message },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteMultiple(
    @Body() deleteMultipleDto: DeleteMultipleDto,
  ): Promise<SuccessResponseDto<{ 
    message: string; 
    results: { id: string; success: boolean; message: string }[] 
  }>> {
    const result = await this.cargacsvService.deleteMultiple(deleteMultipleDto.ids);

    return new SuccessResponseDto(
      result.message,
      {
        message: result.message,
        results: result.results
      },
    );
  }
}