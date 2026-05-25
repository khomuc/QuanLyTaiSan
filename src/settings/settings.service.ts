import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Pool } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private runtimeSettings: Required<UpdateSettingsDto> = {
    appName: 'Quan Ly Tai San QR',
    jwtExpiresIn: '8h',
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
  };

  constructor(
    private readonly configService: ConfigService,
    @Inject(MYSQL_CONNECTION) private readonly db: Pool,
  ) {}

  getSettings() {
    return {
      ...this.runtimeSettings,
      database: {
        host: this.configService.get<string>('DB_HOST') ?? '34.44.235.59',
        name: this.configService.get<string>('DB_NAME') ?? 'quan_ly_tai_san_qr',
      },
      security: {
        jwtExpiresIn:
          this.configService.get<string>('JWT_EXPIRES_IN') ??
          this.runtimeSettings.jwtExpiresIn,
      },
      modules: ['AUTH', 'STAFF', 'ROLE', 'APPROVAL', 'NOTIFICATION', 'AUDIT'],
    };
  }

  async updateSettings(dto: UpdateSettingsDto, user: AuthUser) {
    this.runtimeSettings = {
      ...this.runtimeSettings,
      ...dto,
    };

    await this.db.execute(
      `INSERT INTO AUDIT_LOG
       (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
       VALUES (?, 'CONFIG_SYSTEM', 'SYSTEM', 'RUNTIME_SETTINGS', 'SUCCESS', ?)`,
      [user.maNhanVien, JSON.stringify(dto)],
    );

    return this.getSettings();
  }
}
