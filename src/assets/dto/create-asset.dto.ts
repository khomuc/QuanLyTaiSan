import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @MaxLength(50)
  maTaiSan: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  maQR?: string;

  @IsString()
  @MaxLength(255)
  tenTaiSan: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsString()
  @MaxLength(50)
  maLoai: string;

  @IsNumber()
  @Min(0)
  nguyenGia: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  haoMonLuyKe?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  giaTriConLai?: number;

  @IsDateString()
  ngayNhap: string;

  @IsString()
  @MaxLength(50)
  maPhongBanHienTai: string;

  @IsIn(['HOAT_DONG', 'BAO_TRI', 'HONG'])
  trangThai: 'HOAT_DONG' | 'BAO_TRI' | 'HONG';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  soHieuTSCD?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  ghiChu?: string;
}
