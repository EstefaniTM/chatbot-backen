import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CargacsvService } from './cargacsv.service';
import { CargacsvController } from './cargacsv.controller';
import { Cargacsv, CargacsvSchema } from './cargacsv.entity';
import { Message, MessageSchema } from '../messages/message.entity';
import { Schema } from 'mongoose';

// Esquema para las filas del CSV
const CsvRowSchema = new Schema({
  csvId: { type: Schema.Types.ObjectId, ref: 'Cargacsv', required: true },
  // El resto de las columnas del CSV serán dinámicas
}, { strict: false, timestamps: true });

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cargacsv.name, schema: CargacsvSchema },
      { name: Message.name, schema: MessageSchema },
      { name: 'CsvRow', schema: CsvRowSchema },
    ]),
  ],
  controllers: [CargacsvController],
  providers: [CargacsvService],
  exports: [CargacsvService]
})
export class CargacsvModule {}