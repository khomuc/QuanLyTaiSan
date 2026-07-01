import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ApprovalsModule } from './approvals/approvals.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database.module';
import { EmployeesModule } from './employees/employees.module';
import { MailerModule } from './mailer/mailer.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL ?? 60000), // 60 seconds
        limit: Number(process.env.THROTTLE_LIMIT ?? 100), // 100 requests per minute
      },
    ]),
    DatabaseModule,
    AuthModule,
    AssetsModule,
    EmployeesModule,
    RolesModule,
    DashboardModule,
    ApprovalsModule,
    NotificationsModule,
    SettingsModule,
    AuditLogsModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
