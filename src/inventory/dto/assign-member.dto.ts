import { IsString } from 'class-validator';

export class AssignMemberDto {
  @IsString()
  maInventory: string;

  @IsString()
  maNhanVien: string;

  @IsString()
  tenVaiTro: string;
}
