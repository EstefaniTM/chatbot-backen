import {
  Controller,
  Get,
  Param,
  Body,
  Query,
  NotFoundException,
  InternalServerErrorException,
  Delete,
  Post,
  Patch,
  UseGuards,
  Request
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from './conversation.entity';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async findAllByUser(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<SuccessResponseDto<{ data: Conversation[]; total: number }>> {
    const userId = req.user.id;
    const conversations = await this.conversationsService.findAllByUser(userId, Number(page), Number(limit));
    if (!conversations) {
      throw new InternalServerErrorException('Error retrieving user conversations');
    }
    return new SuccessResponseDto(
      'User conversations retrieved successfully',
      conversations,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<Conversation>> {
    const conversation = await this.conversationsService.findOne(id);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return new SuccessResponseDto(
      'Conversation retrieved successfully',
      conversation,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req
  ): Promise<SuccessResponseDto<Conversation>> {
    const conversation = await this.conversationsService.create(
      createConversationDto,
      req.user
    );
    if (!conversation)
      throw new NotFoundException('Error creating conversation');
    return new SuccessResponseDto(
      'Conversation created successfully',
      conversation,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConversationDto: Partial<CreateConversationDto>,
  ): Promise<SuccessResponseDto<Conversation>> {
    const updated = await this.conversationsService.update(id, updateConversationDto);
    if (!updated) throw new NotFoundException('Conversation not found');
    return new SuccessResponseDto('Conversation updated successfully', updated);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<null>> {
    const deleted = await this.conversationsService.delete(id);
    if (!deleted) throw new NotFoundException('Conversation not found');
    return new SuccessResponseDto('Conversation deleted successfully', null);
  }
}