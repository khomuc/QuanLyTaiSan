import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { TransferService } from '../transfer/transfer.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly transferService: TransferService,
  ) {}

  @Get('assets')
  async getAssetStats() {
    return this.reportsService.getAssetStats();
  }

  @Get('transfers')
  async getTransferStats(
    @Query('tuNgay') tuNgay?: string,
    @Query('denNgay') denNgay?: string,
    @Query('maPhongBan') maPhongBan?: string,
  ) {
    return this.transferService.historyReport({ tuNgay, denNgay, maPhongBan });
  }

  @Get('inventory')
  async getInventoryStats() {
    return this.reportsService.getInventoryStats();
  }
}
