import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Conversation } from '../conversations/conversation.entity';

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
  AGENT = 'agent',
}

@Schema({ collection: 'messages' })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation: Conversation | Types.ObjectId;

  @Prop({ enum: MessageSender, required: true })
  sender: MessageSender;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ type: Object, required: false })
  metadata?: any;
}

export const MessageSchema = SchemaFactory.createForClass(Message);