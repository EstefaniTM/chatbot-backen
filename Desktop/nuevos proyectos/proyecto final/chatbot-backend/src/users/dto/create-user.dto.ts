import { IsEmail, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: string;
}
