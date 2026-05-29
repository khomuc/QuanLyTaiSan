import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { ApprovalTransferDto } from './dto/approval-transfer.dto';
import { CreateTransferSlipDto } from './dto/create-transfer-slip.dto';
import { UpdateTransferSlipDto } from './dto/update-transfer-slip.dto';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post('slips')
  createSlip(@Body() dto: CreateTransferSlipDto): Promise<any> {
    return this.transferService.createSlip(dto);
  }

  @Post('slips/scan')
  createSlipFromScan(@Body() dto: CreateTransferSlipDto): Promise<any> {
    return this.transferService.createSlip(dto);
  }

  @Get('assets')
  listAssets(@Query('q') q?: string, @Query('maPhongBanHienTai') maPhongBanHienTai?: string): Promise<any> {
    return this.transferService.listAssets(q, maPhongBanHienTai);
  }

  @Get('departments')
  listDepartments(@Query('q') q?: string): Promise<any> {
    return this.transferService.listDepartments(q);
  }

  @Get('employees')
  listEmployees(@Query('q') q?: string): Promise<any> {
    return this.transferService.listEmployees(q);
  }

  @Get('slips')
  listSlips(
    @Query('trangThai') trangThai?: string,
    @Query('tuNgay') tuNgay?: string,
    @Query('denNgay') denNgay?: string,
    @Query('maPhongBan') maPhongBan?: string,
  ): Promise<any> {
    return this.transferService.listSlips({ trangThai, tuNgay, denNgay, maPhongBan });
  }

  @Get('slips/:soPhieu')
  getSlip(@Param('soPhieu') soPhieu: string): Promise<any> {
    return this.transferService.getSlipDetail(soPhieu);
  }

  @Patch('slips/:soPhieu')
  updateSlip(@Param('soPhieu') soPhieu: string, @Body() dto: UpdateTransferSlipDto): Promise<any> {
    return this.transferService.updateSlip(soPhieu, dto);
  }

  @Delete('slips/:soPhieu')
  deleteSlip(@Param('soPhieu') soPhieu: string): Promise<any> {
    return this.transferService.deleteSlip(soPhieu);
  }

  @Post('slips/:soPhieu/approval')
  approveSlip(@Param('soPhieu') soPhieu: string, @Body() dto: ApprovalTransferDto): Promise<any> {
    return this.transferService.approveSlip(soPhieu, dto);
  }

  @Get('reports/history')
  historyReport(
    @Query('tuNgay') tuNgay?: string,
    @Query('denNgay') denNgay?: string,
    @Query('maPhongBan') maPhongBan?: string,
  ): Promise<any> {
    return this.transferService.historyReport({ tuNgay, denNgay, maPhongBan });
  }
}