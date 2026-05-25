import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('meta/departments')
  @Permissions('STAFF_VIEW')
  listDepartments() {
    return this.employeesService.listDepartments();
  }

  @Get()
  @Permissions('STAFF_VIEW')
  findAll(@Query() query: QueryEmployeesDto) {
    return this.employeesService.findAll(query);
  }

  @Post()
  @Permissions('STAFF_CREATE')
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: AuthUser) {
    return this.employeesService.create(dto, user);
  }

  @Get(':maNhanVien')
  @Permissions('STAFF_VIEW')
  findOne(@Param('maNhanVien') maNhanVien: string) {
    return this.employeesService.findOne(maNhanVien);
  }

  @Patch(':maNhanVien')
  @Permissions('STAFF_EDIT')
  update(
    @Param('maNhanVien') maNhanVien: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.employeesService.update(maNhanVien, dto, user);
  }

  @Delete(':maNhanVien')
  @Permissions('STAFF_DELETE')
  remove(
    @Param('maNhanVien') maNhanVien: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.employeesService.remove(maNhanVien, user);
  }
}
