import { IsIn, IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ApprovalTransferDto {
  @IsString()
  @IsNotEmpty()
  maNhanVien: string;

  @IsString()
  @IsIn(['DA_KY', 'TU_CHOI'])
  hanhDong: 'DA_KY' | 'TU_CHOI';

  @IsOptional()
  @IsString()
  lyDoTuChoi?: string;

  @IsOptional()
  @IsInt()
  vongKy?: number;

  @IsOptional()
  @IsString()
  tenVaiTro?: string;
}