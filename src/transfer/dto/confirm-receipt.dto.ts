import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayNotEmpty } from 'class-validator';

export class ReceiptItemDto {
  @IsString()
  @IsNotEmpty()
  maTaiSan: string;

  @IsEnum(['DA_NHAN', 'TU_CHOI'])
  hanhDong: 'DA_NHAN' | 'TU_CHOI';

  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class ConfirmReceiptDto {
  @IsString()
  @IsNotEmpty()
  maNhanVien: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  danhSachTaiSan: ReceiptItemDto[];
}
