import { IsIn, IsString, MaxLength } from 'class-validator';

export class SendApprovalReminderDto {
  @IsIn(['TRANSFER', 'INVENTORY'])
  loaiPhieu: 'TRANSFER' | 'INVENTORY';

  @IsString()
  @MaxLength(30)
  maPhieu: string;

  @IsString()
  @MaxLength(20)
  maNhanVien: string;
}
