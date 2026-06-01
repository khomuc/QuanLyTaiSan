import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmailService } from './email.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [EmailService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
