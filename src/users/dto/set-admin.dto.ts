import { IsString } from 'class-validator';

export class SetAdminDto {
  @IsString()
  adminPassword: string;
}
