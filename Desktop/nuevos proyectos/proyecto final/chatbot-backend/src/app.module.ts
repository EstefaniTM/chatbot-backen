import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { InventoryModule } from './inventory/inventory.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
// import { MailModule } from './mail/mail.module';
import { HuggingFaceModule } from './huggingface/huggingface.module';
import { CargacsvModule } from './cargacsv/cargacsv.module';
import { User } from './users/user.entity';
import { ChatbotModule } from './chatbot/chatbot.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongoDB para mensajes y conversaciones
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb+srv://estefani:Salanmandraasada84@cluster0.xactxkv.mongodb.net/db_mongoAtlas_demo?retryWrites=true&w=majority&appName=Cluster0'),
    // PostgreSQL para usuarios y analytics
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      // username eliminado, usar solo email si aplica
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User],
      synchronize: false, // Tablas ya creadas manualmente
      logging: false,
      ssl: {
        rejectUnauthorized: false // Para Neon
      },
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
    ConversationsModule,
    // MailModule,
    HuggingFaceModule,
    CargacsvModule,
    ChatbotModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}