import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.entity';
import { Message } from '../messages/message.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  ESCALATED = 'escalated',
}

@Schema({ collection: 'conversations' })
export class Conversation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: User | Types.ObjectId;

  @Prop({ default: Date.now })
  started_at: Date;

  @Prop({ required: false })
  ended_at?: Date;

  @Prop({ enum: ConversationStatus, default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }], default: [] })
  messages: (Message | Types.ObjectId)[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);