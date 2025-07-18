import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesService } from './menssages.service';
import { MessagesController } from './messages.controller';
import { Message, MessageSchema } from './message.entity';
import { Conversation, ConversationSchema } from '../conversations/conversation.entity';
import { HuggingFaceModule } from '../huggingface/huggingface.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    HuggingFaceModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}