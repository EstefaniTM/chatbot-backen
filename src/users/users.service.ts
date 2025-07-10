import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User | null> {
    try {
      const user = this.userRepository.create(dto);
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

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { username } });
    } catch (err) {
      console.error('Error finding user by username:', err);
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