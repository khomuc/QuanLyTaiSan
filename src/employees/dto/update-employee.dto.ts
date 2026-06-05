import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hoTen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  chucVu?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  soDienThoai?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  maPhongBan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  maVaiTro?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  matKhau?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  trangThai?: 'ACTIVE' | 'INACTIVE';
}
