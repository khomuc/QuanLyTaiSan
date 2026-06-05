import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('ROLE_MANAGE')
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @Permissions('ROLE_MANAGE')
  create(@Body() dto: CreateRoleDto, @CurrentUser() user: AuthUser) {
    return this.rolesService.create(dto, user);
  }

  @Get('permissions')
  @Permissions('ROLE_MANAGE')
  listPermissions(@Query('module') module?: string) {
    return this.rolesService.listPermissions(module);
  }

  @Post('permissions')
  @Permissions('ROLE_MANAGE')
  createPermission(
    @Body() dto: CreatePermissionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.createPermission(dto, user);
  }

  @Patch('permissions/:maQuyen')
  @Permissions('ROLE_MANAGE')
  updatePermission(
    @Param('maQuyen') maQuyen: string,
    @Body() dto: UpdatePermissionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.updatePermission(maQuyen, dto, user);
  }

  @Get(':maVaiTro')
  @Permissions('ROLE_MANAGE')
  findOne(@Param('maVaiTro') maVaiTro: string) {
    return this.rolesService.findOne(maVaiTro);
  }

  @Patch(':maVaiTro')
  @Permissions('ROLE_MANAGE')
  update(
    @Param('maVaiTro') maVaiTro: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.update(maVaiTro, dto, user);
  }

  @Put(':maVaiTro/permissions')
  @Permissions('ROLE_MANAGE')
  assignPermissions(
    @Param('maVaiTro') maVaiTro: string,
    @Body() dto: AssignPermissionsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.assignPermissions(maVaiTro, dto, user);
  }

  @Delete(':maVaiTro')
  @Permissions('ROLE_MANAGE')
  remove(@Param('maVaiTro') maVaiTro: string, @CurrentUser() user: AuthUser) {
    return this.rolesService.remove(maVaiTro, user);
  }
}
