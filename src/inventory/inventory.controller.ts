import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
} from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';

interface ScanUpdateDto {
    maKiemKe: string;
    maTaiSan: string;
    viTriHienTai: string;
    ghiChu?: string;
}

interface AssignMemberDto {
    maNhanVien: string;
    tenVaiTro: string;
}

@Controller('inventory')
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService,
    ) { }

    // =====================
    // PHIEU KIEM KE
    // =====================

    @Post()
    createInventory(
        @Body() body: CreateInventoryDto,
    ) {
        return this.inventoryService.createInventory(
            body.ngayKiemKe,
            body.namKiemKe,
            body.nguoiLap,
            body.ghiChu,
        );
    }

    @Get()
    getInventories() {
        return this.inventoryService.getInventories();
    }

    @Get('lookups/departments')
    getDepartments() {
        return this.inventoryService.getDepartments();
    }

    @Post(':maKiemKe/scan-url')
    scanQrUrlInInventory(
        @Param('maKiemKe') maKiemKe: string,
        @Body() body: { qrText: string },
    ) {
        return this.inventoryService.scanQrUrlInInventory(
            maKiemKe,
            body.qrText,
        );
    }

    @Get(':maKiemKe')
    getInventory(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.getInventory(maKiemKe);
    }

    @Delete(':maKiemKe')
    deleteInventory(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.deleteInventory(maKiemKe);
    }

    @Post(':maKiemKe/complete')
    completeInventory(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.completeInventory(maKiemKe);
    }

    // =====================
    // THANH VIEN KIEM KE
    // =====================

    @Post(':maKiemKe/members')
    assignMember(
        @Param('maKiemKe') maKiemKe: string,
        @Body() body: AssignMemberDto,
    ) {
        return this.inventoryService.assignMember(
            maKiemKe,
            body.maNhanVien,
            body.tenVaiTro,
        );
    }

    @Get(':maKiemKe/members')
    getMembers(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.getMembers(maKiemKe);
    }

    @Delete(':maKiemKe/members/:maNhanVien')
    removeMember(
        @Param('maKiemKe') maKiemKe: string,
        @Param('maNhanVien') maNhanVien: string,
    ) {
        return this.inventoryService.removeMember(
            maKiemKe,
            maNhanVien,
        );
    }

    // =====================
    // TAI SAN TRONG PHIEU KIEM KE
    // =====================

    @Get(':maKiemKe/assets')
    getAssets(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.getAssets(maKiemKe);
    }

    @Get(':maKiemKe/scanned-assets')
    getScannedAssets(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.getScannedAssets(maKiemKe);
    }

    @Get(':maKiemKe/missing')
    getMissingAssets(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.getMissingAssets(maKiemKe);
    }

    @Get(':maKiemKe/progress')
    getProgress(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.getProgress(maKiemKe);
    }

    @Get(':maKiemKe/summary')
    getSummary(
        @Param('maKiemKe') maKiemKe: string,
    ) {
        return this.inventoryService.getSummary(maKiemKe);
    }

    // =====================
    // QUET QR
    // =====================

    @Get('scan/:maTaiSan')
    scanAsset(
        @Param('maTaiSan') maTaiSan: string,
    ) {
        return this.inventoryService.scanAsset(maTaiSan);
    }

    @Get(':maKiemKe/scan/:maTaiSan')
    scanAssetInInventory(
        @Param('maKiemKe') maKiemKe: string,
        @Param('maTaiSan') maTaiSan: string,
    ) {
        return this.inventoryService.scanAssetInInventory(
            maKiemKe,
            maTaiSan,
        );
    }

    @Post('scan')
    updateScannedAsset(
        @Body() body: any,
    ) {
        return this.inventoryService.updateAsset(
            body.maKiemKe,
            body.maTaiSan,
            body.viTriHienTai,
            body.ghiChu,
        );
    }

    @Delete(':maKiemKe/scan/:maTaiSan')
    undoScan(
        @Param('maKiemKe') maKiemKe: string,
        @Param('maTaiSan') maTaiSan: string,
    ) {
        return this.inventoryService.undoScan(
            maKiemKe,
            maTaiSan,
        );
    }
}
