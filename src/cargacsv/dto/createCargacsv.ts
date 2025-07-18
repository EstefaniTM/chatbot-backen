import { IsString, IsOptional } from 'class-validator';

export class CreateCargacsvDto {
  @IsString()
  filename: string;

  @IsString()
  originalname: string;

  @IsString()
  uploadedBy: string;

  @IsOptional()
  @IsString()
  status?: 'pending' | 'processed' | 'error';

  @IsOptional()
  @IsString()
  errorMessage?: string;
}