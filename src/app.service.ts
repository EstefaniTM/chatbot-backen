import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '¡Chat bot en linea! version: 2025.07.18.16.50';
  }
}
