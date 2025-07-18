import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    debugger;
    const token = await this.authService.login(loginDto);
    if (!token) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return new SuccessResponseDto('Login successful', { access_token: token });
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Solo acepta email y password
    try {
      const token = await this.authService.register(createUserDto);
      if (!token) {
        throw new BadRequestException('Failed to register user');
      }
      return new SuccessResponseDto('Registration successful', {
        access_token: token,
      });
    } catch (err) {
      throw new BadRequestException(err?.message || JSON.stringify(err) || 'Failed to register user');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    // Devuelve el usuario autenticado extraído del token
    return { user: req.user };
  }
}
