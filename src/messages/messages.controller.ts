import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() body: { conversationId: string; text: string; author: string }) {
    return await this.messagesService.createMessage(body.conversationId, body.text, body.author);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { text: string }) {
    return await this.messagesService.updateMessage(id, body.text);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.messagesService.deleteMessage(id);
  }
}
