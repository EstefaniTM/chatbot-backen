import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageSender } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Conversation } from 'src/conversations/conversation.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message | null> {
    try {
      const conversation = await this.conversationModel.findById(createMessageDto.conversationId);
      if (!conversation) return null;

      const message = new this.messageModel({
        content: createMessageDto.content,
        metadata: createMessageDto.metadata,
        conversation: conversation._id,
        sender: createMessageDto.sender || MessageSender.USER,
        timestamp: new Date(),
      });

      const savedMessage = await message.save();

      conversation.messages.push(savedMessage._id as Types.ObjectId);
      await conversation.save();

      return savedMessage;
    } catch (err) {
      console.error('Error creating message:', err);
      return null;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Message[]; total: number } | null> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.messageModel
          .find()
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .populate(['conversation'])
          .exec(),
        this.messageModel.countDocuments().exec(),
      ]);
      return { data, total };
    } catch (err) {
      console.error('Error retrieving messages:', err);
      return null;
    }
  }
}