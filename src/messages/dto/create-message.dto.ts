import { IsOptional, IsString, IsEnum, IsObject } from 'class-validator';
import { MessageSender } from '../message.entity';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsEnum(MessageSender)
  @IsOptional()
  sender?: MessageSender;

  @IsString()
  conversationId: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}