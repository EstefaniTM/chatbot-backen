
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await this.messageModel.find({ conversation: conversationId }).sort({ timestamp: 1 }).exec();
  }

  async createMessage(conversationId: string, text: string, author: string): Promise<Message> {
    const message = new this.messageModel({
      conversation: new Types.ObjectId(conversationId),
      sender: author,
      content: text,
      timestamp: new Date(),
    });
    const savedMessage = await message.save();
    // Actualizar el array messages en la conversación
    const ConversationModel = this.messageModel.db.model('Conversation');
    await ConversationModel.findByIdAndUpdate(
      conversationId,
      { $push: { messages: { text, author } } },
      { new: true }
    ).exec();
    return savedMessage;
  }

  async updateMessage(messageId: string, text: string): Promise<Message | null> {
    return await this.messageModel.findByIdAndUpdate(
      messageId,
      { content: text },
      { new: true }
    ).exec();
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const result = await this.messageModel.findByIdAndDelete(messageId).exec();
    return !!result;
  }
}
