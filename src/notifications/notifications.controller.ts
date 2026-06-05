import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { NotificationsService } from './notifications.service';
import { SendApprovalReminderDto } from './send-approval-reminder.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMine(@CurrentUser() user: AuthUser): Promise<unknown[]> {
    return this.notificationsService.getMyApprovalNotifications(user);
  }

  @Post('approval-reminder')
  @Permissions('TRANSFER_APPROVE', 'INVENTORY_APPROVE')
  sendApprovalReminder(
    @Body() dto: SendApprovalReminderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationsService.sendApprovalReminder(dto, user);
  }
}
