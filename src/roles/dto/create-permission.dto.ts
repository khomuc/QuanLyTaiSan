import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MaxLength(50)
  maQuyen: string;

  @IsString()
  @MaxLength(100)
  tenQuyen: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  moTa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  module?: string;
}
