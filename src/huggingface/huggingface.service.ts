import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { max } from 'class-validator';
import { model } from 'mongoose';
import { Message } from 'src/messages/message.entity';

@Injectable()
export class HuggingFaceService {
  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get<string>(
      'HUGGINGFACE_MODEL_URL',
      'HUGGINGFACE_MODEL_URL=https://openrouter.ai/api/v1/chat/completions'
    );
    this.apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY') || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  HUGGINGFACE_API_KEY no está configurado en las variables de entorno');
    }
  }

  async generate(prompt: string): Promise<string> {
    try {
      if (!this.apiKey) {
        return 'Error: Token de Hugging Face no configurado. Por favor configura HUGGINGFACE_API_KEY en tu archivo .env';
      }
      console.log('[HuggingFace] Generando respuesta con prompt:', prompt);
      console.log('thisapiKey:', this.apiKey);
      console.log('this.endpoint:', this.endpoint);
      const response = await axios.post(
        this.endpoint,
        { 
          model: 'meta-llama/llama-3-8b-instruct',
          messages: [{role:'user',content:prompt}],
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 segundos de timeout
        }
      );

      // Manejar diferentes formatos de respuesta de la API
  const result:any = response.data;

  if (
    result &&
    Array.isArray(result.choices) &&
    result.choices.length > 0 &&
    result.choices[0].message?.content
  ) {
    return result.choices[0].message.content;
  }

  return 'Sin respuesta del modelo';

} catch (error) {
  console.error('Error al generar respuesta con OpenRouter:', error);

  if (error.response?.status === 503) {
    return 'El modelo está cargando, por favor intenta de nuevo en unos minutos.';
  }

  if (error.response?.status === 401) {
    return 'Error de autenticación: Verifica tu token de OpenRouter.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'Timeout: El modelo tardó demasiado en responder.';
  }

  return 'Error al procesar tu solicitud. Por favor intenta de nuevo.';
}
    }
  

  /**
   * Genera una respuesta basada en el contexto de datos CSV y la pregunta del usuario
   */
  async generateWithContext(userQuestion: string, csvContext: string = ''): Promise<string> {
    let prompt = '';
    
    if (csvContext.trim()) {
      prompt = `Contexto de datos disponibles:
${csvContext}

Pregunta del usuario: ${userQuestion}

Por favor responde la pregunta basándote en los datos proporcionados. Si la información no está disponible en los datos, indícalo claramente.

Respuesta:`;
    } else {
      prompt = `Pregunta: ${userQuestion}

Respuesta:`;
    }

    return this.generate(prompt);
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Obtiene información sobre la configuración actual
   */
  getStatus(): { configured: boolean; endpoint: string } {
    return {
      configured: this.isConfigured(),
      endpoint: this.endpoint,
    };
  }
}
