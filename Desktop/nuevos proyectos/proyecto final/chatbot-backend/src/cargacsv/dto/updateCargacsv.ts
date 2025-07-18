import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class UpdateCsvUploadDto {
  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  originalname?: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @IsOptional()
  @IsString()
  status?: 'pending' | 'processed' | 'error';

  @IsOptional()
  @IsString()
  errorMessage?: string;
}