import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ConversationStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  ESCALATED = 'escalated',
}

class EmbeddedMessage {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  author: string;
}

@Schema({ collection: 'conversations' })
export class Conversation extends Document {
  @Prop({ type: String, required: true })
  user: string;

  @Prop({ default: Date.now })
  started_at: Date;

  @Prop({ required: false })
  ended_at?: Date;

  @Prop({ enum: ConversationStatus, default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  @Prop({
    type: [
      {
        text: { type: String, required: true },
        author: { type: String, required: true }
      }
    ],
    default: []
  })
  messages: { text: string; author: string }[];

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  title: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);