
import { IsString, IsEmail } from 'class-validator';

export class LoginDto {

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}