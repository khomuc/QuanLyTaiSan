import { Test, TestingModule } from '@nestjs/testing';
import { TransferService } from './transfer.service';

describe('TransferService', () => {
  let service: TransferService;
  let dbConnection: {
    beginTransaction: jest.Mock;
    commit: jest.Mock;
    rollback: jest.Mock;
    execute: jest.Mock;
    query: jest.Mock;
    getConnection: jest.Mock;
  };

  beforeEach(async () => {
    dbConnection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      execute: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
      query: jest.fn(),
      getConnection: jest.fn(),
    };
    (dbConnection as any).release = jest.fn().mockResolvedValue(undefined);
    dbConnection.getConnection.mockResolvedValue(dbConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: 'MYSQL_CONNECTION',
          useValue: dbConnection,
        },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
  });

  it('creates a transfer slip using QR asset lookup', async () => {
    dbConnection.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM TAI_SAN')) {
        return [[{
          MaTaiSan: 'TS0001',
          MaQR: 'QR-TS-0001',
          TenTaiSan: 'Laptop',
          MaPhongBanHienTai: 'PB01',
        }]];
      }

      if (sql.includes('FROM PHIEU_DIEU_CHUYEN p')) {
        return [[{
          SoPhieu: 'DC202605210001',
          NgayDieuChuyen: '2026-05-21',
          TrangThaiDuyet: 'CHO_KY',
          GhiChu: null,
          NgayLap: '2026-05-21 00:00:00',
          NguoiLap: 'NV0001',
          NguoiLapTen: 'Hiệu trưởng',
        }]];
      }

      if (sql.includes('FROM CHI_TIET_PHIEU_DIEU_CHUYEN ct') && sql.includes('INNER JOIN TAI_SAN')) {
        return [[{
          SoPhieu: 'DC202605210001',
          MaTaiSan: 'TS0001',
          MaQR: 'QR-TS-0001',
          TenTaiSan: 'Laptop',
          TuPhongBan: 'PB01',
          TuPhongBanTen: 'Ban Giám hiệu',
          DenPhongBan: 'PB02',
          DenPhongBanTen: 'Khoa Lý luận cơ sở',
          LyDo: 'Chuyen vi tri',
          CreatedAt: '2026-05-21 00:00:00',
        }]];
      }

      if (sql.includes('FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN')) {
        return [[]];
      }

      if (sql.includes('FROM PHONG_BAN')) {
        return [[{ MaPhongBan: 'PB02', TenPhongBan: 'Khoa Lý luận cơ sở' }]];
      }

      if (sql.includes('FROM NHAN_VIEN')) {
        return [[{ MaNhanVien: 'NV0001', HoTen: 'Hiệu trưởng' }]];
      }

      return [[]];
    });

    const result = await service.createSlip({
      nguoiLap: 'NV0001',
      ngayDieuChuyen: '2026-05-21',
      ghiChu: 'Chuyen cong tac',
      danhSachTaiSan: [
        {
          maQR: 'QR-TS-0001',
          denPhongBan: 'PB02',
          lyDo: 'Chuyen vi tri',
        },
      ],
    });

    expect(dbConnection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(dbConnection.commit).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      SoPhieu: 'DC202605210001',
      items: [
        {
          MaTaiSan: 'TS0001',
          DenPhongBan: 'PB02',
        },
      ],
    });
  });

  it('approves a transfer slip and finalizes when no pending signers remain', async () => {
    dbConnection.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM PHIEU_DIEU_CHUYEN p') && sql.includes('LIMIT 1')) {
        return [[{
          SoPhieu: 'DC202605210001',
          NgayDieuChuyen: '2026-05-21',
          TrangThaiDuyet: 'CHO_KY',
          GhiChu: null,
          NgayLap: '2026-05-21 00:00:00',
          NguoiLap: 'NV0001',
          NguoiLapTen: 'Hiệu trưởng',
        }]];
      }

      if (sql.includes('COUNT(*) AS TongPending')) {
        return [[{ TongPending: 0 }]];
      }

      if (sql.includes('FROM CHI_TIET_PHIEU_DIEU_CHUYEN ct') && sql.includes('INNER JOIN TAI_SAN')) {
        return [[{
          SoPhieu: 'DC202605210001',
          MaTaiSan: 'TS0001',
          MaQR: 'QR-TS-0001',
          TenTaiSan: 'Laptop',
          TuPhongBan: 'PB01',
          TuPhongBanTen: 'Ban Giám hiệu',
          DenPhongBan: 'PB02',
          DenPhongBanTen: 'Khoa Lý luận cơ sở',
          LyDo: 'Chuyen vi tri',
          CreatedAt: '2026-05-21 00:00:00',
        }]];
      }

      if (sql.includes('FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN')) {
        return [[{
          SoPhieu: 'DC202605210001',
          MaNhanVien: 'NV0001',
          VongKy: 1,
          TenVaiTro: 'Hiệu trưởng',
          ThoiGianKy: '2026-05-21 00:00:00',
          TrangThaiKy: 'DA_KY',
          LyDoTuChoi: null,
          HoTen: 'Hiệu trưởng',
        }]];
      }

      return [[]];
    });

    const result = await service.approveSlip('DC202605210001', {
      maNhanVien: 'NV0001',
      hanhDong: 'DA_KY',
      tenVaiTro: 'Hiệu trưởng',
    });

    expect(dbConnection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(dbConnection.commit).toHaveBeenCalledTimes(1);
    expect(dbConnection.execute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE PHIEU_DIEU_CHUYEN SET TrangThaiDuyet = 'DA_DUYET'"),
      ['DC202605210001'],
    );
    expect(result.SoPhieu).toBe('DC202605210001');
    expect(result.items).toHaveLength(1);
  });
});