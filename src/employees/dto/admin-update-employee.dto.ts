import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

export class AdminUpdateEmployeeDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email khong hop le' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  chucVu?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  maPhongBan?: string;
}