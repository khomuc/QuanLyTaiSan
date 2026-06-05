import { IsString } from "class-validator";

export class ScanAssetDto {
  @IsString()
  maInventory: string;

  @IsString()
  maPhongBan: string;

  @IsString()
  maTaiSan: string;

  @IsString()
  maNhanVien: string;

  @IsString()
  tinhTrangThucTe?: string;

  @IsString()
  viTriHienTai?: string;
}
