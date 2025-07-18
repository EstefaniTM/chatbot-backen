import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '¡Hola, mundo! este es la segunda confirmacion del sistema';
  }
}
