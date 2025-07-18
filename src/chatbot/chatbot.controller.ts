import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ask')
  async ask(@Body() body: { question: string; conversationId: string; csvId: string }) {
    return this.chatbotService.ask(body.question, body.conversationId, body.csvId);
  }
}