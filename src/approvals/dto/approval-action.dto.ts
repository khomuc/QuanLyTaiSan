import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApprovalActionDto {
  @IsIn(['DA_KY', 'TU_CHOI'])
  trangThaiKy: 'DA_KY' | 'TU_CHOI';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lyDoTuChoi?: string;
}
