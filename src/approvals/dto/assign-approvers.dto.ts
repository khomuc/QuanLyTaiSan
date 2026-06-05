import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ApproverDto {
  @IsString()
  @MaxLength(20)
  maNhanVien: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tenVaiTro?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vongKy?: number;
}

export class AssignApproversDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ApproverDto)
  approvers: ApproverDto[];
}
