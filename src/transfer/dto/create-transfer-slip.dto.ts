import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateTransferAssetDto {
  @IsOptional()
  @IsString()
  maTaiSan?: string;

  @IsOptional()
  @IsString()
  maQR?: string;

  @IsString()
  @IsNotEmpty()
  denPhongBan: string;

  @IsOptional()
  @IsString()
  lyDo?: string;
}

export class CreateTransferApprovalDto {
  @IsString()
  @IsNotEmpty()
  maNhanVien: string;

  @IsOptional()
  @IsString()
  tenVaiTro?: string;

  @IsOptional()
  @IsInt()
  vongKy?: number;
}

export class CreateTransferSlipDto {
  @IsString()
  @IsNotEmpty()
  nguoiLap: string;

  @IsOptional()
  @IsDateString()
  ngayDieuChuyen?: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferAssetDto)
  danhSachTaiSan: CreateTransferAssetDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferApprovalDto)
  danhSachKyDuyet?: CreateTransferApprovalDto[];
}