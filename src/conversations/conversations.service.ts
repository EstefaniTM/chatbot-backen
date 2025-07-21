import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationStatus } from './conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

    async create(createConversationDto: CreateConversationDto, user: User): Promise<Conversation | null> {
    try {
      // Si viene userId en el body, úsalo, si no, usa el del token
      const userId = createConversationDto.userId || user.id?.toString();
      const conversationData: Partial<Conversation> = {
        title: createConversationDto.title,
        description: createConversationDto.description,
        status: ConversationStatus.ACTIVE,
        user: userId,
        started_at: new Date(),
      };
      const conversation = new this.conversationModel(conversationData);
      const savedConversation = await conversation.save();

      // Si vienen mensajes, guárdalos y asócialos a la conversación
      if (createConversationDto.messages && createConversationDto.messages.length > 0) {
        const MessageModel = require('mongoose').model('Message');
        const messageDocs = await Promise.all(
          createConversationDto.messages.map(async (msg) => {
            const message = new MessageModel({
              conversation: savedConversation._id,
              sender: msg.author,
              content: msg.text,
              timestamp: new Date(),
            });
            return await message.save();
          })
        );
        savedConversation.messages = messageDocs.map(m => m._id);
        await savedConversation.save();
      }
      return savedConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  }
    async delete(id: string): Promise<boolean> {
    try {
      const result = await this.conversationModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      return false;
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