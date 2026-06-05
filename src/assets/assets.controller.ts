import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }

  @Get('meta/categories')
  @Permissions('ASSET_VIEW')
  listCategories() {
    return this.assetsService.listCategories();
  }

  @Get('import-template')
  @Permissions('ASSET_VIEW')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async downloadImportTemplate(@Res() res: Response) {
    const buffer = await this.assetsService.buildImportTemplate();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="mau-import-tai-san.xlsx"',
    );
    res.send(buffer);
  }

  @Get('export')
  @Permissions('ASSET_EXPORT')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportAssets(@Query() query: QueryAssetsDto, @Res() res: Response) {
    const buffer = await this.assetsService.exportToExcel(query);
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="danh-sach-tai-san.xlsx"',
    );
    res.send(buffer);
  }

  @Post('import')
  @Permissions('ASSET_CREATE')
  @UseInterceptors(FileInterceptor('file'))
  importAssets(
    @UploadedFile() file: { buffer: Buffer; originalname: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.assetsService.importFromExcel(file, user);
  }

  @Get('report')
  @Permissions('REPORT_VIEW')
  report(@Query() query: QueryAssetsDto) {
    return this.assetsService.report(query);
  }

  @Get()
  @Permissions('ASSET_VIEW')
  findAll(@Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Post()
  @Permissions('ASSET_CREATE')
  create(@Body() dto: CreateAssetDto, @CurrentUser() user: AuthUser) {
    return this.assetsService.create(dto, user);
  }

  @Get('history/:maTaiSan')
  @Permissions('ASSET_VIEW')
  history(@Param('maTaiSan') maTaiSan: string) {
    return this.assetsService.history(maTaiSan);
  }

  @Get(':maTaiSan')
  @Permissions('ASSET_VIEW')
  findOne(@Param('maTaiSan') maTaiSan: string) {
    return this.assetsService.findOne(maTaiSan);
  }

  @Patch(':maTaiSan')
  @Permissions('ASSET_EDIT')
  update(
    @Param('maTaiSan') maTaiSan: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.assetsService.update(maTaiSan, dto, user);
  }

  @Delete(':maTaiSan/finalize')
  @Permissions('ASSET_DELETE')
  finalizeRemove(
    @Param('maTaiSan') maTaiSan: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.assetsService.finalizeRemove(maTaiSan, user);
  }

  @Delete(':maTaiSan')
  @Permissions('ASSET_DELETE')
  remove(@Param('maTaiSan') maTaiSan: string, @CurrentUser() user: AuthUser) {
    return this.assetsService.remove(maTaiSan, user);
  }
}
