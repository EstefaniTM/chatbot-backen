import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { HuggingFaceService } from './huggingface/huggingface.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly hfService: HuggingFaceService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('chat')
  async chat(@Query('q') query: string) {
    if (!query) {
      return { error: 'Parámetro "q" es requerido' };
    }

    const response = await this.hfService.generate(query);
    return { 
      question: query,
      response: response,
      timestamp: new Date().toISOString()
    };
  }

  @Post('api/chat')
  async chatPost(@Body() body: { message: string; inventoryData?: any[]; userId?: string }) {
    if (!body.message) {
      return { error: 'Mensaje es requerido' };
    }

    try {
      let response: string;
      
      // Si hay datos de inventario, usar el contexto
      if (body.inventoryData && body.inventoryData.length > 0) {
        const csvContext = this.formatInventoryContext(body.inventoryData);
        response = await this.hfService.generateWithContext(body.message, csvContext);
      } else {
        response = await this.hfService.generate(body.message);
      }

      return {
        message: response,
        timestamp: new Date().toISOString(),
        userId: body.userId
      };
    } catch (error) {
      console.error('Error en chat:', error);
      return {
        message: 'Lo siento, ocurrió un error procesando tu mensaje.',
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  }

  private formatInventoryContext(inventoryData: any[]): string {
    if (!inventoryData || inventoryData.length === 0) return '';
    
    // Tomar los primeros 10 items para no sobrecargar el contexto
    const limitedData = inventoryData.slice(0, 10);
    
    return limitedData.map((item, index) => {
      return `Item ${index + 1}: ${JSON.stringify(item)}`;
    }).join('\n');
  }

  @Get('hf-status')
  getHuggingFaceStatus() {
    return this.hfService.getStatus();
  }
}
