import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MailerModule } from '../mailer/mailer.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [AuthModule, MailerModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // thêm dòng này
})
export class NotificationsModule {}