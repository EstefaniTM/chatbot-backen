import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/dto/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // 👈 Correcto tipo de aplicación

  // Habilitar CORS antes de las otras configuraciones
  app.enableCors({
 origin: [
      'http://localhost:3000',
      'http://localhost:3009',
      'http://localhost:3008',
      'http://localhost:3010',
      'https://estefanitipantunamatiag.netlify.app',
      'https://chatbot-frontend.desarrollo-software.xyz'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'public')); // 👈 Habilita acceso público a /public

  await app.listen(3008);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
