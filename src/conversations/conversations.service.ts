import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationStatus } from './conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async create(_createConversationDto: CreateConversationDto): Promise<Conversation | null> {
    try {
      const conversationData: Partial<Conversation> = {
        status: ConversationStatus.ACTIVE,
        started_at: new Date(),
      };
      const conversation = new this.conversationModel(conversationData);
      return await conversation.save();
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Conversation[]; total: number } | null> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.conversationModel
          .find()
          .sort({ started_at: -1 })
          .skip(skip)
          .limit(limit)
          .populate(['messages', 'user'])
          .exec(),
        this.conversationModel.countDocuments().exec(),
      ]);
      return { data, total };
    } catch (err) {
      console.error('Error retrieving conversations:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Conversation | null> {
    try {
      return await this.conversationModel
        .findById(id)
        .populate(['messages', 'user'])
        .exec();
    } catch (err) {
      console.error('Error retrieving conversation:', err);
      return null;
    }
  }
}