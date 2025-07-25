import { SetAdminDto } from './dto/set-admin.dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('users')
export class UsersController {
  // Registro de admin por endpoint separado
  @Post('register-admin')
  async registerAdmin(@Body() dto: CreateUserDto) {
    try {
      const user = await this.usersService.createAdmin(dto);
      return new SuccessResponseDto('Admin creado correctamente', user);
    } catch (err) {
      throw new BadRequestException(err?.message || 'No se pudo crear el admin');
    }
  }
  // Permite a cualquier usuario convertirse en admin si ingresa la contraseña especial
  @UseGuards(JwtAuthGuard)
  @Post('set-admin')
  async setAdmin(@Req() req: any, @Body() dto: SetAdminDto) {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (dto.adminPassword !== ADMIN_PASSWORD) {
      throw new BadRequestException('Contraseña de admin incorrecta');
    }
    const userId = req.user?.id || req.user?._id || req.user?.sub;
    const user = await this.usersService.update(userId, { role: 'admin' });
    return new SuccessResponseDto('Ahora eres admin', user);
  }
  constructor(private readonly usersService: UsersService) {}

  // Registro de usuarios solo por /auth/register

  // PRIVADO - Solo admin puede ver todos los usuarios
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: string,
  ): Promise<SuccessResponseDto<{ data: User[]; total: number }>> {
    if (isActive !== undefined && isActive !== 'true' && isActive !== 'false') {
      throw new BadRequestException(
        'Invalid value for "isActive". Use "true" or "false".',
      );
    }
    const result = await this.usersService.findAll(
      Number(page),
      Number(limit),
      isActive === undefined ? undefined : isActive === 'true'
    );
    if (!result)
      throw new InternalServerErrorException('Could not retrieve users');

    return new SuccessResponseDto('Users retrieved successfully', {
      data: result.data,
      total: result.total,
    });
  }

  // PRIVADO - Usuario solo puede ver su propio perfil o admin puede ver cualquier perfil
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) throw new BadRequestException('Invalid user ID');
    
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto('User retrieved successfully', user);
  }

  // PRIVADO - Usuario solo puede editar su propio perfil o admin puede editar cualquier perfil
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req) {
    const userId = Number(id);
    if (isNaN(userId)) throw new BadRequestException('Invalid user ID');
    
    const user = await this.usersService.update(userId, dto, req.user);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto('User updated successfully', user);
  }

  // PRIVADO - Usuario solo puede eliminar su propia cuenta o admin puede eliminar cualquier cuenta
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) throw new BadRequestException('Invalid user ID');
    
    const deleted = await this.usersService.remove(userId);
    if (!deleted) throw new NotFoundException('User not found');
    return new SuccessResponseDto('User deleted successfully', { deleted: true });
  }

  // PRIVADO - Usuario solo puede subir su propia foto o admin puede cambiar cualquier foto
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Put(':id/profile')
  @UseInterceptors(
    FileInterceptor('profile', {
      storage: diskStorage({
        destination: './public/profile',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only JPG or PNG files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Profile image is required');
    
    const userId = parseInt(id);
    if (isNaN(userId)) throw new BadRequestException('Invalid user ID');
    
    const user = await this.usersService.updateProfile(userId, file.filename);
    if (!user) throw new NotFoundException('User not found');
    return new SuccessResponseDto('Profile image updated', user);
  }
}