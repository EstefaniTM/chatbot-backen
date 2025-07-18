import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../conversations/conversations.service';
import { CargacsvService } from '../cargacsv/cargacsv.service';
import { HuggingFaceService } from '../huggingface/huggingface.service';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly cargacsvService: CargacsvService,
    private readonly huggingFaceService: HuggingFaceService,
  ) {}

  async ask(question: string, conversationId: string, csvId: string) {
    const conversation = await this.conversationsService.findOne(conversationId);
    const csv = await this.cargacsvService.findOne(csvId);

    const context = `
Conversación: ${conversation?.title || ''}
Descripción: ${conversation?.description || ''}
Datos CSV: ${csv ? JSON.stringify(csv) : ''}
`;

    const prompt = `${context}\nPregunta del usuario: ${question}`;

    const iaResponse = await this.huggingFaceService.generate(prompt);

    return { answer: iaResponse };
  }
}