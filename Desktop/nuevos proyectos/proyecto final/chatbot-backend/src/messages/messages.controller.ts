import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './menssages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateMessageDto) {
    const message = await this.messagesService.create(dto);
    if (!message)
      throw new InternalServerErrorException('Failed to create message');
    return new SuccessResponseDto('Message created successfully', message);
  }
}
