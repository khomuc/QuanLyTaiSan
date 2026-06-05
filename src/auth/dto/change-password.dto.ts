import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  matKhauCu: string;

  @IsString()
  @MinLength(6)
  matKhauMoi: string;
}
