import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class DeleteMultipleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}

export class DeleteResponseDto {
  success: boolean;
  message: string;
}

export class DeleteMultipleResponseDto {
  success: boolean;
  message: string;
  results: {
    id: string;
    success: boolean;
    message: string;
  }[];
}
