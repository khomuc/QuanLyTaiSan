import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(100)
  hoTen: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  chucVu?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  soDienThoai?: string | null;

  @IsString()
  @MaxLength(20)
  maPhongBan: string;
}
