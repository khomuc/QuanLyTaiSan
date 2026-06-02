import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(100)
  hoTen: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]*$/, {
    message: 'So dien thoai khong hop le',
  })
  soDienThoai?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  chucVu?: string | null;

  @IsString()
  @MaxLength(50)
  maPhongBan: string;
}
