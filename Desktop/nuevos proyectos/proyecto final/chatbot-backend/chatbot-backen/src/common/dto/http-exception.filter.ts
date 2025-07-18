import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from '../dto/response.dto';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const message =
      typeof exceptionResponse === 'string'
       ? exceptionResponse
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
       : (exceptionResponse as any).message;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const errorResponse = new ErrorResponseDto(message, status);
    response.status(status).json(errorResponse);
  }
}
