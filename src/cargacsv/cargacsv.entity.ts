import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'csv_uploads' })
export class Cargacsv extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;


  @Prop({ default: 'pending' })
  status: 'pending' | 'processed' | 'error';

  // Nuevo campo para guardar los datos del CSV como array de objetos JSON
  @Prop({ type: [Object], default: [] })
  data: Record<string, any>[];

  @Prop()
  errorMessage?: string;
}

export const CargacsvSchema = SchemaFactory.createForClass(Cargacsv);