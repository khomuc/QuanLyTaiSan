import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tenQuyen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  moTa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  module?: string;
}
