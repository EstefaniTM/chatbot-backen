import { Controller, Post, Body } from '@nestjs/common';
import { HuggingFaceService } from '../huggingface/huggingface.service';

@Controller('api')
export class ApiChatController {
  constructor(private readonly huggingFaceService: HuggingFaceService) {}

  @Post('chat')
  async chat(@Body() body: { question: string; csvContext?: string; userId?: string }) {
    const { question, csvContext = '' } = body;
    const response = await this.huggingFaceService.generateWithContext(question, csvContext);
    return { message: response };
  }
}
