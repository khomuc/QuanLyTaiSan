# Tai Lieu Module Quan Ly Tai San

```text
Nguoi thuc hien: Nguyen Minh Khoi
Vai tro: Asset Management
Du an: He thong quan ly tai san QR
Cong nghe: NestJS, React, Vite, TypeScript, MySQL, Google Cloud SQL
```

## 1. Muc Tieu Module

Module Quan ly tai san duoc xay dung de quan ly tai san co dinh bang ma QR. Moi tai san co ma tai san, ma QR, thong tin thiet bi, phong ban quan ly, nguyen gia, hao mon, gia tri con lai va trang thai su dung.

Luon du lieu:

```text
Frontend React
  -> goi API NestJS
  -> truy van MySQL tren Google Cloud SQL
```

## 2. Chuc Nang Chinh

- Xem danh sach tai san.
- Tim kiem va loc tai san.
- Them tai san.
- Sua tai san.
- Tu dong tao `MaQR` neu nguoi dung khong nhap.
- Hien thi anh QR trong chi tiet tai san.
- Quet QR bang camera de tim tai san.
- Xem chi tiet tai san.
- Xem lich su thay doi tu `AUDIT_LOG`.
- Import Excel de them tai san hang loat.
- Export Excel danh sach tai san.
- Dua tai san vao muc thanh ly.
- Hoan tat thanh ly nhung van giu ban ghi trong `TAI_SAN`.
- Bao cao thong ke tai san.

## 3. Quy Tac Du Lieu Quan Trong

### Ma QR

Cot luu trong DB:

```text
TAI_SAN.MaQR
```

Quy tac:

```text
MaTaiSan = TS0007
MaQR     = QR-TS0007
```

Khi them tai san:

- Neu nguoi dung nhap `MaQR`, he thong dung gia tri do.
- Neu nguoi dung bo trong `MaQR`, backend tu tao `QR-<MaTaiSan>`.
- Anh QR trong popup chi tiet duoc tao tu gia tri `MaQR`.
- Chuc nang quet QR doc gia tri nay va goi API lookup.

### Hao mon luy ke

Trong bang `TAI_SAN`, `HaoMonLuyKe` luu theo so tien.

Vi du:

```text
NguyenGia = 10,000,000
Hao mon tren giao dien = 10%
HaoMonLuyKe luu DB = 1,000,000
GiaTriConLai = 9,000,000
```

Trong bang `CHI_TIET_PHIEU_KIEM_KE`, cot `HaoMonLuyKe` duoc de theo phan tram:

```text
10.00 = 10%
```

### Trang thai tai san

Danh sach trang thai:

```text
HOAT_DONG
BAO_TRI
HONG
DANG_LUAN_CHUYEN
DANG_SU_DUNG
THANH_LY
```

`THANH_LY` duoc dung khi tai san da dua vao muc thanh ly. Khi bam hoan tat thanh ly, he thong ghi audit log va van giu ban ghi tai san trong DB de phuc vu lich su, bao cao va tranh loi khoa ngoai.

## 4. API Da Lam

| Method | Endpoint | Chuc nang |
|---|---|---|
| GET | `/api/assets` | Lay danh sach tai san |
| GET | `/api/assets/:maTaiSan` | Lay chi tiet tai san |
| GET | `/api/assets/lookup/:code` | Tim tai san theo QR/MaTaiSan/SoHieuTSCD |
| GET | `/api/assets/history/:maTaiSan` | Lay lich su tai san |
| POST | `/api/assets` | Them tai san |
| PATCH | `/api/assets/:maTaiSan` | Sua tai san |
| DELETE | `/api/assets/:maTaiSan` | Dua tai san vao thanh ly |
| DELETE | `/api/assets/:maTaiSan/finalize` | Hoan tat thanh ly |
| GET | `/api/assets/report` | Bao cao tai san |
| GET | `/api/assets/import-template` | Tai mau Excel |
| POST | `/api/assets/import` | Import Excel |
| GET | `/api/assets/export` | Export Excel |

## 5. Giao Dien Da Lam

### Trang Tai San

File:

```text
frontend/src/pages/assets/AssetsPage.tsx
```

Chuc nang:

- Bang tai san dang su dung.
- Bang tai san thanh ly.
- Tim kiem va bo loc.
- Nut them tai san.
- Nut quet QR.
- Nut import/export Excel.
- Nut xem, sua, thanh ly, hoan tat thanh ly.

### Popup Them/Sua Tai San

File:

```text
frontend/src/components/assets/AssetModal.tsx
```

Chuc nang:

- Nhap thong tin tai san.
- Goi y `MaQR` tu dong theo `MaTaiSan`.
- Tinh gia tri con lai theo hao mon phan tram.

### Popup Chi Tiet Tai San

File:

```text
frontend/src/components/assets/AssetDetailModal.tsx
```

Chuc nang:

- Hien thong tin chi tiet.
- Hien anh QR.
- Hien lich su thay doi.

### Popup Quet QR

File:

```text
frontend/src/components/QRScannerModal.tsx
```

Chuc nang:

- Mo camera bang `html5-qrcode`.
- Quet QR/Barcode.
- Co o nhap ma thu cong neu camera khong doc duoc.
- Tra ma quet ve trang tai san de tim chi tiet.

## 6. Huong Dan Su Dung Nhanh

### Them tai san

1. Vao menu `Tai san`.
2. Bam `Them tai san`.
3. Nhap `MaTaiSan`, `TenTaiSan`, `Loai`, `Phong ban`, `Nguyen gia`.
4. Co the bo trong `MaQR`, he thong tu tao.
5. Bam `Luu tai san`.

### Quet QR

1. Vao menu `Tai san`.
2. Bam `Quet QR`.
3. Cho phep trinh duyet dung camera.
4. Dua QR da in hoac QR tren dien thoai vao camera.
5. Neu camera kho doc, nhap ma thu cong, vi du `QR-TS0007`.
6. He thong mo chi tiet tai san neu tim thay.

### Import Excel

1. Bam `Tai mau Excel`.
2. Nhap du lieu theo file mau.
3. Cot `HaoMonLuyKe(%)` nhap theo phan tram, vi du `10`.
4. Cot `MaQR` co the bo trong.
5. Bam `Import Excel` va chon file `.xlsx`.

### Thanh ly tai san

1. Tai bang danh muc tai san, bam nut thung rac.
2. Tai san duoc chuyen sang muc `Tai san thanh ly`.
3. Neu da ban xong, bam `Da ban / Hoan tat`.
4. He thong ghi log hoan tat, nhung van giu ban ghi trong `TAI_SAN`.

## 7. Tien Do 12 Tuan

### Tuan 1: Khao sat nghiep vu

- Tim hieu quy trinh quan ly tai san.
- Xac dinh thong tin can quan ly cho moi tai san.
- Xac dinh nhu cau quan ly bang ma QR.

### Tuan 2: Thiet ke database va API

- Thiet ke bang `TAI_SAN`, `LOAI_TAI_SAN`, `PHONG_BAN`, `AUDIT_LOG`.
- Xac dinh API CRUD tai san.
- Chon MySQL/Google Cloud SQL.

### Tuan 3: Cau hinh backend va database

- Ket noi NestJS voi MySQL.
- Tao DTO validate du lieu tai san.
- Kiem tra schema SQL voi source code.

### Tuan 4: Xay dung CRUD tai san

- API danh sach, chi tiet, them, sua tai san.
- Ghi audit log khi them/sua.
- Xu ly trung `MaTaiSan`, `MaQR`, `Serial`, `SoHieuTSCD`.

### Tuan 5: Xay dung trang danh sach tai san

- Hien thi bang tai san.
- Them tim kiem va bo loc.
- Hien nguyen gia, hao mon %, gia tri con lai.

### Tuan 6: Chi tiet tai san va audit log

- Popup chi tiet tai san.
- Popup them/sua tai san.
- Lich su thay doi tu `AUDIT_LOG`.

### Tuan 7: Import/Export Excel va thanh ly

- Tai file mau Excel.
- Import Excel.
- Export Excel.
- Dua tai san vao muc thanh ly.

### Tuan 8: QR code

- Tu dong tao `MaQR`.
- Hien anh QR trong chi tiet tai san.
- Them quet QR bang camera.
- Them API `/api/assets/lookup/:code`.

### Tuan 9: API bao cao tai san

- Xay dung API `/api/assets/report`.
- Tinh tong tai san, tong nguyen gia, tong hao mon, tong gia tri con lai.
- Thong ke theo loai, phong ban, trang thai.

### Tuan 10: Trang bao cao tai san

- Tao trang `Bao cao tai san`.
- Hien KPI va bang thong ke.
- Ho tro loc bao cao.

### Tuan 11: Kiem thu

- Tao file `TEST_REPORT_ASSET_MODULE.md`.
- Kiem tra CRUD, QR, import/export, audit log, thanh ly, bao cao.

### Tuan 12: Tai lieu va tong ket

- Viet `README.md`.
- Viet `TAISAN.md`.
- Tong ket module de chuan bi gop code voi nhom.

## 8. Ket Qua

Module da hoan thanh cac chuc nang chinh cua phan quan ly tai san:

- Quan ly tai san bang QR.
- CRUD tai san.
- Import/export Excel.
- Audit log.
- Thanh ly tai san.
- Bao cao thong ke.
- Tai lieu huong dan va SQL de nguoi khac co the cai dat.
