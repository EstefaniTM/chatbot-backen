import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User | null> {
    try {
      // Hashear la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });
      return await this.userRepository.save(user);
    } catch (err) {
      console.error('Error creating user:', err);
      return null;
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

  // Método findByUsername eliminado, usar findByEmail

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (err) {
      console.error('Error finding user by email:', err);
      return null;
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<User | null> {
    try {
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