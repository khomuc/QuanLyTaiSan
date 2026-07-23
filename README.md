# He Thong Quan Ly Tai San QR

Ung dung fullstack quan ly tai san bang ma QR. Backend su dung **NestJS + MySQL**, frontend su dung **React + Vite + TypeScript**.

```text
Branch: feature/asset-management-khoi
Nguoi thuc hien: Nguyen Minh Khoi
Module: Quan ly tai san
```

## 1. Chuc Nang Da Hoan Thanh

- Xem danh sach tai san.
- Tim kiem, loc theo loai tai san, phong ban, trang thai.
- Them tai san.
- Sua thong tin tai san.
- Tu dong tao `MaQR` theo quy tac `QR-<MaTaiSan>` neu nguoi dung khong nhap.
- Hien thi anh QR trong chi tiet tai san.
- Quet QR/Barcode bang camera de tim nhanh tai san.
- Xem chi tiet tai san va lich su thay doi.
- Tinh hao mon luy ke theo phan tram tren giao dien.
- Luu `HaoMonLuyKe` trong bang `TAI_SAN` theo gia tri tien.
- Hien thi nguyen gia va gia tri con lai.
- Dua tai san vao muc thanh ly bang trang thai `THANH_LY`.
- Hoan tat thanh ly nhung van giu ban ghi trong database.
- Import Excel danh sach tai san.
- Export Excel danh sach tai san.
- Tai file mau Excel.
- Bao cao tai san theo tong quan, loai, phong ban, trang thai.

## 2. Cong Nghe Su Dung

Backend:

- NestJS 11
- TypeScript
- MySQL2
- JWT Authentication
- Class Validator
- ExcelJS

Frontend:

- React 19
- Vite 6
- TypeScript
- Lucide React
- Html5 QRCode
- React Router DOM
- CSS trong `frontend/src/styles/index.css`

## 3. Cau Truc Chinh

```text
src/assets
  assets.module.ts
  assets.controller.ts
  assets.service.ts
  dto/create-asset.dto.ts
  dto/update-asset.dto.ts
  dto/query-assets.dto.ts

frontend/src
  App.tsx
  main.tsx
  contexts/AuthContext.tsx
  components/AppContent.tsx
  components/QRScannerModal.tsx
  components/assets/AssetModal.tsx
  components/assets/AssetDetailModal.tsx
  pages/assets/AssetsPage.tsx
  pages/assets/AssetReportPage.tsx
  lib/apis/assetsApi.ts
  lib/format.ts
  lib/types.ts
```

## 4. API Module Tai San

Tat ca API backend co prefix:

```text
/api
```

| Method | Endpoint | Chuc nang |
|---|---|---|
| GET | `/api/assets` | Lay danh sach tai san |
| GET | `/api/assets/:maTaiSan` | Lay chi tiet mot tai san |
| GET | `/api/assets/lookup/:code` | Tim tai san theo MaQR, MaTaiSan, SoHieuTSCD |
| GET | `/api/assets/history/:maTaiSan` | Lay lich su thay doi tai san |
| POST | `/api/assets` | Them tai san moi |
| PATCH | `/api/assets/:maTaiSan` | Cap nhat tai san |
| DELETE | `/api/assets/:maTaiSan` | Dua tai san vao muc thanh ly |
| DELETE | `/api/assets/:maTaiSan/finalize` | Hoan tat thanh ly va ghi audit log |
| GET | `/api/assets/report` | Bao cao tai san |
| GET | `/api/assets/meta/categories` | Lay danh muc loai tai san |
| GET | `/api/assets/import-template` | Tai file mau Excel |
| POST | `/api/assets/import` | Import Excel tai san |
| GET | `/api/assets/export` | Export Excel tai san |

Quyen can co:

```text
ASSET_VIEW
ASSET_CREATE
ASSET_EDIT
ASSET_DELETE
ASSET_EXPORT
REPORT_VIEW
```

## 5. Quy Tac QR

Cot luu ma QR trong database:

```text
TAI_SAN.MaQR
```

Quy tac tao QR:

```text
MaTaiSan = TS0007
MaQR     = QR-TS0007
```

Khi them tai san hoac import Excel:

- Neu co nhap `MaQR`, he thong dung dung gia tri da nhap.
- Neu bo trong `MaQR`, backend tu tao `QR-<MaTaiSan>`.
- Popup chi tiet tai san tao anh QR tu gia tri `MaQR`.
- Khi bam `Quet QR`, camera doc ra `MaQR`, sau do frontend goi `/api/assets/lookup/:code`.
- API lookup tim theo `MaQR`, `MaTaiSan`, `SoHieuTSCD`, va co xu ly `QR-TS0007` thanh `TS0007` de tim du lieu cu.

## 6. Cau Hinh Moi Truong

Tao file `.env` tai thu muc goc du an:

```env
DB_HOST=<DIA_CHI_CLOUD_SQL>
DB_PORT=3306
DB_USER=<USER_MYSQL>
DB_PASSWORD=<PASSWORD_MYSQL>
DB_NAME=quan_ly_tai_san_qr

JWT_SECRET=quanlytaisan-jwt-secret-key-2026-minimum-32-characters
JWT_EXPIRES_IN=24h

MAIL_PROVIDER=smtp
MAIL_FROM=noreply@quanlytaisan.local
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=
MAIL_PASSWORD=

FRONTEND_URL=http://localhost:5173

NODE_ENV=development
PORT=3000
```

Khong nen commit file `.env` len GitHub.

## 7. SQL Tao Database

Neu nguoi khac muon tao database moi tren MySQL hoac Google Cloud SQL, co the chay script duoi day. Script nay tap trung vao cac bang can thiet de module tai san, dang nhap, quyen, audit log va cac bang lien quan khong bi loi khoa ngoai.

```sql
CREATE DATABASE IF NOT EXISTS quan_ly_tai_san_qr
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE quan_ly_tai_san_qr;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS VAI_TRO_QUYEN;
DROP TABLE IF EXISTS AUDIT_LOG;
DROP TABLE IF EXISTS CHI_TIET_PHIEU_KIEM_KE;
DROP TABLE IF EXISTS PHIEU_KIEM_KE;
DROP TABLE IF EXISTS CHI_TIET_PHIEU_DIEU_CHUYEN;
DROP TABLE IF EXISTS PHIEU_DIEU_CHUYEN;
DROP TABLE IF EXISTS TAI_SAN;
DROP TABLE IF EXISTS NHAN_VIEN;
DROP TABLE IF EXISTS QUYEN;
DROP TABLE IF EXISTS VAI_TRO;
DROP TABLE IF EXISTS LOAI_TAI_SAN;
DROP TABLE IF EXISTS PHONG_BAN;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE PHONG_BAN (
  MaPhongBan VARCHAR(10) PRIMARY KEY,
  TenPhongBan VARCHAR(255) NOT NULL UNIQUE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE LOAI_TAI_SAN (
  MaLoai VARCHAR(10) PRIMARY KEY,
  TenLoai VARCHAR(255) NOT NULL UNIQUE,
  MoTa VARCHAR(500),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VAI_TRO (
  MaVaiTro VARCHAR(20) PRIMARY KEY,
  TenVaiTro VARCHAR(100) NOT NULL UNIQUE,
  MoTa VARCHAR(255),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE QUYEN (
  MaQuyen VARCHAR(50) PRIMARY KEY,
  TenQuyen VARCHAR(100) NOT NULL,
  MoTa VARCHAR(255),
  Module VARCHAR(50),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE NHAN_VIEN (
  MaNhanVien VARCHAR(10) PRIMARY KEY,
  HoTen VARCHAR(100) NOT NULL,
  ChucVu VARCHAR(100),
  Email VARCHAR(100) NOT NULL UNIQUE,
  SoDienThoai VARCHAR(20),
  MaPhongBan VARCHAR(10) NOT NULL,
  MaVaiTro VARCHAR(20) NOT NULL DEFAULT 'NHAN_VIEN',
  MatKhau VARCHAR(255) NOT NULL,
  TrangThai ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (MaPhongBan) REFERENCES PHONG_BAN(MaPhongBan),
  FOREIGN KEY (MaVaiTro) REFERENCES VAI_TRO(MaVaiTro),
  INDEX idx_email (Email),
  INDEX idx_phong (MaPhongBan),
  INDEX idx_vai_tro (MaVaiTro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE TAI_SAN (
  MaTaiSan VARCHAR(20) PRIMARY KEY,
  MaQR VARCHAR(50) UNIQUE,
  TenTaiSan VARCHAR(255) NOT NULL,
  Serial VARCHAR(100),
  Model VARCHAR(100),
  MaLoai VARCHAR(10) NOT NULL,
  NguyenGia DECIMAL(15, 0) NOT NULL DEFAULT 0,
  HaoMonLuyKe DECIMAL(15, 0) NOT NULL DEFAULT 0,
  GiaTriConLai DECIMAL(15, 0) NOT NULL DEFAULT 0,
  NgayNhap DATE NOT NULL,
  MaPhongBanHienTai VARCHAR(10) NOT NULL,
  TrangThai ENUM(
    'HOAT_DONG',
    'BAO_TRI',
    'HONG',
    'DANG_LUAN_CHUYEN',
    'DANG_SU_DUNG',
    'THANH_LY'
  ) DEFAULT 'HOAT_DONG',
  SoHieuTSCD VARCHAR(100),
  GhiChu VARCHAR(500),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (MaLoai) REFERENCES LOAI_TAI_SAN(MaLoai),
  FOREIGN KEY (MaPhongBanHienTai) REFERENCES PHONG_BAN(MaPhongBan),
  INDEX idx_ma_qr (MaQR),
  INDEX idx_loai (MaLoai),
  INDEX idx_phong (MaPhongBanHienTai),
  INDEX idx_trang_thai (TrangThai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PHIEU_DIEU_CHUYEN (
  SoPhieu VARCHAR(20) PRIMARY KEY,
  NgayDieuChuyen DATE NOT NULL,
  TrangThaiDuyet ENUM('CHO_KY', 'DA_DUYET', 'TU_CHOI') DEFAULT 'CHO_KY',
  GhiChu VARCHAR(500),
  NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
  NguoiLap VARCHAR(10) NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (NguoiLap) REFERENCES NHAN_VIEN(MaNhanVien),
  INDEX idx_ngay (NgayDieuChuyen),
  INDEX idx_trang_thai (TrangThaiDuyet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE CHI_TIET_PHIEU_DIEU_CHUYEN (
  SoPhieu VARCHAR(20) NOT NULL,
  MaTaiSan VARCHAR(20) NOT NULL,
  TuPhongBan VARCHAR(10) NOT NULL,
  DenPhongBan VARCHAR(10) NOT NULL,
  LyDo VARCHAR(255),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (SoPhieu, MaTaiSan),
  FOREIGN KEY (SoPhieu) REFERENCES PHIEU_DIEU_CHUYEN(SoPhieu) ON DELETE CASCADE,
  FOREIGN KEY (MaTaiSan) REFERENCES TAI_SAN(MaTaiSan),
  FOREIGN KEY (TuPhongBan) REFERENCES PHONG_BAN(MaPhongBan),
  FOREIGN KEY (DenPhongBan) REFERENCES PHONG_BAN(MaPhongBan),
  INDEX idx_tai_san (MaTaiSan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PHIEU_KIEM_KE (
  MaKiemKe VARCHAR(20) PRIMARY KEY,
  NgayKiemKe DATE,
  NamKiemKe INT NOT NULL,
  TrangThai ENUM('CHUA_BAT_DAU', 'DANG_KIEM_KE', 'DA_HOAN_THANH') DEFAULT 'CHUA_BAT_DAU',
  GhiChu VARCHAR(500),
  NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
  NguoiLap VARCHAR(10) NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (NguoiLap) REFERENCES NHAN_VIEN(MaNhanVien),
  INDEX idx_nam (NamKiemKe),
  INDEX idx_trang_thai (TrangThai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE CHI_TIET_PHIEU_KIEM_KE (
  MaKiemKe VARCHAR(20) NOT NULL,
  MaTaiSan VARCHAR(20) NOT NULL,
  ThoiGianQuet DATETIME,
  HaoMonLuyKe DECIMAL(5, 2) NOT NULL DEFAULT 0,
  ViTriHienTai VARCHAR(255),
  GhiChu VARCHAR(500),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (MaKiemKe, MaTaiSan),
  FOREIGN KEY (MaKiemKe) REFERENCES PHIEU_KIEM_KE(MaKiemKe) ON DELETE CASCADE,
  FOREIGN KEY (MaTaiSan) REFERENCES TAI_SAN(MaTaiSan),
  INDEX idx_tai_san (MaTaiSan),
  INDEX idx_thoi_gian (ThoiGianQuet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE AUDIT_LOG (
  MaLog INT AUTO_INCREMENT PRIMARY KEY,
  MaNhanVien VARCHAR(10),
  ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
  HanhDong VARCHAR(100),
  DoiTuong VARCHAR(100),
  DoiTuongId VARCHAR(50),
  TrangThai VARCHAR(50),
  ChiTiet VARCHAR(500),
  IpAddress VARCHAR(45),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien),
  INDEX idx_thoi_gian (ThoiGian),
  INDEX idx_nhan_vien (MaNhanVien),
  INDEX idx_hanh_dong (HanhDong),
  INDEX idx_doi_tuong (DoiTuong, DoiTuongId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VAI_TRO_QUYEN (
  MaVaiTro VARCHAR(20) NOT NULL,
  MaQuyen VARCHAR(50) NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (MaVaiTro, MaQuyen),
  FOREIGN KEY (MaVaiTro) REFERENCES VAI_TRO(MaVaiTro) ON DELETE CASCADE,
  FOREIGN KEY (MaQuyen) REFERENCES QUYEN(MaQuyen) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO PHONG_BAN (MaPhongBan, TenPhongBan) VALUES
('PB01', 'Ban Giam hieu'),
('PB02', 'Khoa Ly luan co so'),
('PB03', 'Khoa Xay dung Dang'),
('PB04', 'Khoa Nha nuoc va phap luat'),
('PB05', 'Phong Quan ly dao tao, boi duong va NCKH'),
('PB06', 'Phong To chuc, hanh chinh, thong tin, tu lieu');

INSERT INTO LOAI_TAI_SAN (MaLoai, TenLoai, MoTa) VALUES
('LT001', 'Thiet bi van phong', 'May tinh, may in, tu, ban, ghe'),
('LT002', 'Thiet bi dien tu', 'Tivi, dieu hoa, quat, den'),
('LT003', 'Thiet bi hoc tap', 'Bang, may chieu, loa, microphone'),
('LT004', 'Phuong tien giao thong', 'Xe o to, xe may'),
('LT005', 'Tai san khac', 'Cac loai tai san khac');

INSERT INTO VAI_TRO (MaVaiTro, TenVaiTro, MoTa) VALUES
('ADMIN', 'Quan tri vien', 'Quan ly toan bo he thong'),
('NHAN_VIEN', 'Nhan vien', 'Nhan vien thuc hien nghiep vu'),
('GUEST', 'Khach', 'Chi xem thong tin');

-- Tai khoan mau:
-- Email: admin@quanlytaisan.local
-- Mat khau: 123456
INSERT INTO NHAN_VIEN
(MaNhanVien, HoTen, ChucVu, Email, SoDienThoai, MaPhongBan, MaVaiTro, MatKhau, TrangThai)
VALUES
('NV001', 'Quan tri vien', 'Admin', 'admin@quanlytaisan.local', '0900000000', 'PB01', 'ADMIN', '$2b$10$M0rWDkjT9uKF31hYPQpOkeH9J2Dlx/4gOwQuMkB7XvLZgUr274meS', 'ACTIVE');

INSERT INTO QUYEN (MaQuyen, TenQuyen, MoTa, Module) VALUES
('ASSET_VIEW', 'Xem tai san', 'Xem danh sach tai san', 'ASSET'),
('ASSET_CREATE', 'Tao tai san', 'Tao tai san moi', 'ASSET'),
('ASSET_EDIT', 'Sua tai san', 'Sua thong tin tai san', 'ASSET'),
('ASSET_DELETE', 'Xoa tai san', 'Thanh ly tai san', 'ASSET'),
('ASSET_EXPORT', 'Xuat tai san', 'Export Excel tai san', 'ASSET'),
('REPORT_VIEW', 'Xem bao cao', 'Xem bao cao thong ke', 'REPORT'),
('AUDIT_VIEW', 'Xem log', 'Xem audit log', 'ADMIN');

INSERT INTO VAI_TRO_QUYEN (MaVaiTro, MaQuyen)
SELECT 'ADMIN', MaQuyen FROM QUYEN;

INSERT INTO VAI_TRO_QUYEN (MaVaiTro, MaQuyen) VALUES
('NHAN_VIEN', 'ASSET_VIEW'),
('NHAN_VIEN', 'ASSET_CREATE'),
('NHAN_VIEN', 'ASSET_EDIT'),
('NHAN_VIEN', 'ASSET_EXPORT'),
('NHAN_VIEN', 'REPORT_VIEW'),
('GUEST', 'ASSET_VIEW'),
('GUEST', 'REPORT_VIEW');

INSERT INTO TAI_SAN
(MaTaiSan, MaQR, TenTaiSan, Serial, Model, MaLoai, NguyenGia, HaoMonLuyKe, GiaTriConLai, NgayNhap, MaPhongBanHienTai, TrangThai, SoHieuTSCD, GhiChu)
VALUES
('TS0001', 'QR-TS0001', 'May tinh Dell Latitude', 'DL7420-001', 'Latitude 7420', 'LT001', 32000000, 8000000, 24000000, '2025-01-10', 'PB01', 'HOAT_DONG', 'TSCD-0001', 'Du lieu mau'),
('TS0002', 'QR-TS0002', 'May chieu Epson', 'EPX06-002', 'EB-X06', 'LT003', 15000000, 3000000, 12000000, '2025-01-12', 'PB02', 'HOAT_DONG', 'TSCD-0002', 'Du lieu mau'),
('TS0003', 'QR-TS0003', 'May in HP', 'HPM404-003', 'M404dn', 'LT001', 9000000, 1500000, 7500000, '2025-01-15', 'PB03', 'BAO_TRI', 'TSCD-0003', 'Du lieu mau'),
('TS0004', 'QR-TS0004', 'Dieu hoa Panasonic', 'PANA18-004', 'CS-XU18', 'LT002', 18000000, 4000000, 14000000, '2025-01-18', 'PB04', 'DANG_LUAN_CHUYEN', 'TSCD-0004', 'Du lieu mau');
```

Neu database da ton tai va chi can cap nhat cho khop code hien tai, chay SQL migrate nay:

```sql
ALTER TABLE TAI_SAN
MODIFY COLUMN TrangThai ENUM(
  'HOAT_DONG',
  'BAO_TRI',
  'HONG',
  'DANG_LUAN_CHUYEN',
  'DANG_SU_DUNG',
  'THANH_LY'
) DEFAULT 'HOAT_DONG';

UPDATE TAI_SAN
SET MaQR = CONCAT('QR-', MaTaiSan)
WHERE MaQR IS NULL OR MaQR = '';

ALTER TABLE CHI_TIET_PHIEU_KIEM_KE
DROP COLUMN TinhTrangThucTe,
ADD COLUMN HaoMonLuyKe DECIMAL(5, 2) NOT NULL DEFAULT 0;
```

Neu lenh cuoi bao loi `Can't DROP TinhTrangThucTe`, nghia la cot do da bi xoa truoc do. Khi do chi can chay:

```sql
ALTER TABLE CHI_TIET_PHIEU_KIEM_KE
ADD COLUMN HaoMonLuyKe DECIMAL(5, 2) NOT NULL DEFAULT 0;
```

## 8. Cach Chay Du An

Mo terminal tai thu muc du an:

```powershell
cd "<thu_muc_du_an>"
```

Cai dependencies:

```powershell
npm.cmd install
npm.cmd install --prefix frontend
```

Chay backend:

```powershell
npm.cmd run start:dev
```

Chay frontend o terminal khac:

```powershell
npm.cmd run frontend:dev
```

Dia chi truy cap:

```text
Backend:  http://localhost:3000/api
Frontend: http://localhost:5173
```

## 9. Cach Test Chuc Nang QR

1. Vao man hinh `Tai san`.
2. Bam icon xem chi tiet mot tai san.
3. Kiem tra dong `Ma QR`, vi du `QR-TS0007`.
4. Mo chuc nang `Quet QR`.
5. Quet QR bang camera, hoac nhap tay `QR-TS0007` vao o tim theo ma.
6. Neu thanh cong, he thong mo popup chi tiet tai san.

Luu y: neu QR dang hien tren chinh man hinh laptop thi camera laptop kho doc duoc. Nen in QR ra giay hoac mo QR tren dien thoai de quet.

## 10. Cach Kiem Tra Code

Kiem tra backend:

```powershell
npx.cmd tsc --noEmit --incremental false -p tsconfig.json
```

Kiem tra frontend:

```powershell
npx.cmd tsc --noEmit -p frontend\tsconfig.json
```

Build frontend:

```powershell
npm.cmd run frontend:build
```

Chay test:

```powershell
npm.cmd test -- --runInBand
```

## 11. Ghi Chu Khi Gop Code Voi Nhom

Nen gop theo module, khong nen copy de toan bo project len branch cua nguoi khac.

Backend can gop:

```text
src/assets
src/assets/assets.controller.ts
src/assets/assets.service.ts
src/assets/dto
```

Frontend can gop:

```text
frontend/src/pages/assets
frontend/src/components/assets
frontend/src/components/QRScannerModal.tsx
frontend/src/lib/apis/assetsApi.ts
frontend/src/lib/format.ts
frontend/src/lib/types.ts
```

File dung chung can can than khi merge:

```text
frontend/src/components/AppContent.tsx
frontend/src/styles/index.css
frontend/package.json
frontend/package-lock.json
package.json
package-lock.json
```

## 12. Trang Thai Hien Tai

Da kiem tra thanh cong:

```powershell
npx.cmd tsc --noEmit -p frontend\tsconfig.json
npx.cmd tsc --noEmit --incremental false -p tsconfig.json
npm.cmd run frontend:build
```

Module quan ly tai san da co CRUD, QR, import/export Excel, audit log, thanh ly va bao cao.
