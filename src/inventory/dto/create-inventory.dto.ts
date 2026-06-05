import { IsDateString, IsInt, IsString } from "class-validator";

export class CreateInventoryDto {
  @IsInt()
  namKiemKe: number;

  @IsDateString()
  ngayKiemKe: string;

  @IsString()
  nguoiLap: string

  @IsString()
  ghiChu?: string;
}
