// ...eliminado, se agregará dentro de la clase...
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationStatus } from './conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ConversationsService {
  async update(id: string, updateDto: Partial<CreateConversationDto>): Promise<Conversation | null> {
    try {
      // Si se envía messages, reemplaza el array completo
      const updateData: any = { ...updateDto };
      if (updateDto.messages) {
        updateData.messages = updateDto.messages.map(msg => ({
          text: msg.text,
          author: msg.author
        }));
      }
      const updated = await this.conversationModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      return updated;
    } catch (err) {
      console.error('Error updating conversation:', err);
      return null;
    }
  }
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

    async create(createConversationDto: CreateConversationDto, user: User): Promise<Conversation | null> {
    try {
      console.log('DTO recibido:', createConversationDto);
      console.log('Usuario recibido:', user);
      // Si viene user en el body, úsalo, si no, usa el del token
      const userIdValue = createConversationDto.user || user.id?.toString();
      const conversationData: Partial<Conversation> = {
        title: createConversationDto.title,
        description: createConversationDto.description,
        status: ConversationStatus.ACTIVE,
        user: userIdValue,
        started_at: new Date(),
      };
      const conversation = new this.conversationModel(conversationData);
      const savedConversation = await conversation.save();

      // Si vienen mensajes, guárdalos directamente en el array de la conversación
      if (createConversationDto.messages && createConversationDto.messages.length > 0) {
        savedConversation.messages = createConversationDto.messages.map(msg => ({
          text: msg.text,
          author: msg.author
        }));
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