import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAssetsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  maLoai?: string;

  @IsOptional()
  @IsString()
  maPhongBan?: string;

  @IsOptional()
  @IsIn([
    'HOAT_DONG',
    'BAO_TRI',
    'HONG',
    'DANG_LUAN_CHUYEN',
    'DANG_SU_DUNG',
    'THANH_LY',
  ])
  trangThai?:
    | 'HOAT_DONG'
    | 'BAO_TRI'
    | 'HONG'
    | 'DANG_LUAN_CHUYEN'
    | 'DANG_SU_DUNG'
    | 'THANH_LY';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
