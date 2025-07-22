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

  async create(createConversationDto: CreateConversationDto, user: User): Promise<any> {
    try {
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

      if (createConversationDto.messages && createConversationDto.messages.length > 0) {
        savedConversation.messages = createConversationDto.messages.map(msg => ({
          text: msg.text,
          author: msg.author
        }));
        await savedConversation.save();
      }

      const obj = savedConversation.toObject();
      obj.id = obj._id;
      delete obj._id;
      if (obj.user && typeof obj.user === 'object' && '_id' in obj.user) {
        obj.user = (obj.user as any)._id.toString();
      }
      if (obj.messages && Array.isArray(obj.messages)) {
        obj.messages = obj.messages.map((msg: any) => {
          if (msg._id) {
            msg.id = msg._id;
            delete msg._id;
          }
          return msg;
        });
      }
      return obj;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  }

  async update(id: string, updateDto: Partial<CreateConversationDto>): Promise<any> {
    try {
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
      ).populate('user').exec();
      if (!updated) return null;
      const obj = updated.toObject();
      obj.id = obj._id;
      delete obj._id;
      if (obj.user && typeof obj.user === 'object' && '_id' in obj.user) {
        obj.user = (obj.user as any)._id.toString();
      }
      if (obj.messages && Array.isArray(obj.messages)) {
        obj.messages = obj.messages.map((msg: any) => {
          if (msg._id) {
            msg.id = msg._id;
            delete msg._id;
          }
          return msg;
        });
      }
      return obj;
    } catch (err) {
      console.error('Error updating conversation:', err);
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

  async findOne(id: string): Promise<any> {
    try {
      const found = await this.conversationModel
        .findById(id)
        .populate('user')
        .exec();
      if (!found) return null;
      const obj = found.toObject();
      obj.id = obj._id;
      delete obj._id;
      if (obj.user && typeof obj.user === 'object' && '_id' in obj.user) {
        obj.user = (obj.user as any)._id.toString();
      }
      if (obj.messages && Array.isArray(obj.messages)) {
        obj.messages = obj.messages.map((msg: any) => {
          if (msg._id) {
            msg.id = msg._id;
            delete msg._id;
          }
          return msg;
        });
      }
      return obj;
    } catch (err) {
      console.error('Error retrieving conversation:', err);
      return null;
    }
  }

  async findAllByUser(userId: string, page = 1, limit = 10): Promise<{ data: Conversation[]; total: number } | null> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.conversationModel
          .find({ user: userId })
          .sort({ started_at: -1 })
          .skip(skip)
          .limit(limit)
          .populate(['messages', 'user'])
          .exec(),
        this.conversationModel.countDocuments({ user: userId }).exec(),
      ]);
      return { data, total };
    } catch (err) {
      console.error('Error retrieving conversations by user:', err);
      return null;
    }
  }
}