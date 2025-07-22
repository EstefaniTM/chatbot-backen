// ...existing code...
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async createAdmin(dto: CreateUserDto): Promise<User | null> {
    try {
      // Validar email único
      const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const ADMIN_PASSWORD = 'landing borrowing tiara overrate frying enable hexagram';
      if (!dto.adminPassword || dto.adminPassword !== ADMIN_PASSWORD) {
        throw new Error('Contraseña de admin incorrecta');
      }
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
        role: 'admin',
      });
      return await this.userRepository.save(user);
    } catch (err) {
      console.error('Error creating admin:', err);
      throw new Error(err?.detail || err?.message || 'Error creating admin');
    }
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User | null> {
    try {
      // Validar email único
      const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
      // Verificar si es el primer usuario
      const userCount = await this.userRepository.count();
      // Hashear la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      let role = 'user';
      const ADMIN_PASSWORD = 'landing borrowing tiara overrate frying enable hexagram';
      if (dto.adminPassword && dto.adminPassword === ADMIN_PASSWORD) {
        role = 'admin';
      }
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
        role,
      });
      return await this.userRepository.save(user);
    } catch (err) {
      console.error('Error creating user:', err);
      throw new Error(err?.detail || err?.message || 'Error creating user');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    isActive?: boolean,
  ): Promise<{ data: User[]; total: number } | null> {
    try {
      const skip = (page - 1) * limit;
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      
      if (isActive !== undefined) {
        queryBuilder.where('user.is_active = :isActive', { isActive });
      }
      
      const [data, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();
        
      return { data, total };
    } catch (err) {
      console.error('Error retrieving users:', err);
      return null;
    }
  }

  async findOne(id: number): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (err) {
      console.error('Error finding user:', err);
      return null;
    }
  }


  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (err) {
      console.error('Error finding user by email:', err);
      return null;
    }
  }

  async update(id: number, dto: UpdateUserDto, currentUser?: User): Promise<User | null> {
    try {
      // Validar que solo los administradores puedan cambiar el rol
      if (dto.role && currentUser?.role !== 'admin') {
        throw new Error('Solo los administradores pueden cambiar el rol de un usuario');
      }
      // Si el DTO incluye password, hashearla antes de actualizar
      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
      }
      await this.userRepository.update(id, dto);
      return await this.userRepository.findOne({ where: { id } });
    } catch (err) {
      console.error('Error updating user:', err);
      return null;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (err) {
      console.error('Error deleting user:', err);
      return false;
    }
  }

  async updateProfile(id: number, filename: string): Promise<User | null> {
    try {
      await this.userRepository.update(id, { profile: filename });
      return await this.userRepository.findOne({ where: { id } });
    } catch (err) {
      console.error('Error updating user profile image:', err);
      return null;
    }
  }
}