import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AssetsService } from './assets.service';
import { QueryAssetsDto } from './dto/query-assets.dto';

@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('meta/categories')
  @Permissions('ASSET_VIEW')
  listCategories() {
    return this.assetsService.listCategories();
  }

  @Get()
  @Permissions('ASSET_VIEW')
  findAll(@Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get(':maTaiSan')
  @Permissions('ASSET_VIEW')
  findOne(@Param('maTaiSan') maTaiSan: string) {
    return this.assetsService.findOne(maTaiSan);
  }
}
