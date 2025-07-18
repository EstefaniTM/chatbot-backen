import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ApiChatController } from './api-chat.controller';
import { ChatbotService } from './chatbot.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { CargacsvModule } from '../cargacsv/cargacsv.module';
import { HuggingFaceModule } from '../huggingface/huggingface.module';


@Module({
  imports: [ConversationsModule, CargacsvModule, HuggingFaceModule],
  controllers: [ChatbotController, ApiChatController],
  providers: [ChatbotService],
})
export class ChatbotModule {}