import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(20)
  maVaiTro: string;

  @IsString()
  @MaxLength(100)
  tenVaiTro: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  moTa?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  maQuyen?: string[];
}
