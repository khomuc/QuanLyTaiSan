import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ApprovalsService } from './approvals.service';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { AssignApproversDto } from './dto/assign-approvers.dto';

@Controller('approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('pending')
  findPending(@CurrentUser() user: AuthUser): Promise<unknown[]> {
    return this.approvalsService.findPendingForUser(user);
  }

  @Get('transfer/:soPhieu/approvers')
  @Permissions('TRANSFER_APPROVE')
  findTransferApprovers(@Param('soPhieu') soPhieu: string) {
    return this.approvalsService.findTransferApprovers(soPhieu);
  }

  @Put('transfer/:soPhieu/approvers')
  @Permissions('TRANSFER_APPROVE')
  assignTransferApprovers(
    @Param('soPhieu') soPhieu: string,
    @Body() dto: AssignApproversDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.approvalsService.assignTransferApprovers(soPhieu, dto, user);
  }

  @Post('transfer/:soPhieu/sign')
  @Permissions('TRANSFER_APPROVE')
  signTransfer(
    @Param('soPhieu') soPhieu: string,
    @Body() dto: ApprovalActionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.approvalsService.signTransfer(soPhieu, dto, user);
  }

  @Get('inventory/:maKiemKe/approvers')
  @Permissions('INVENTORY_APPROVE')
  findInventoryApprovers(@Param('maKiemKe') maKiemKe: string) {
    return this.approvalsService.findInventoryApprovers(maKiemKe);
  }

  @Put('inventory/:maKiemKe/approvers')
  @Permissions('INVENTORY_APPROVE')
  assignInventoryApprovers(
    @Param('maKiemKe') maKiemKe: string,
    @Body() dto: AssignApproversDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.approvalsService.assignInventoryApprovers(maKiemKe, dto, user);
  }

  @Post('inventory/:maKiemKe/sign')
  @Permissions('INVENTORY_APPROVE')
  signInventory(
    @Param('maKiemKe') maKiemKe: string,
    @Body() dto: ApprovalActionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.approvalsService.signInventory(maKiemKe, dto, user);
  }
}
