import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayNotEmpty,
  IsNotEmpty,
} from 'class-validator';

class UpdateAssetItemDto {
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

class UpdateApproverItemDto {
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

export class UpdateTransferSlipDto {
  @IsOptional()
  @IsDateString()
  ngayDieuChuyen?: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAssetItemDto)
  danhSachTaiSan?: UpdateAssetItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateApproverItemDto)
  danhSachKyDuyet?: UpdateApproverItemDto[];
}