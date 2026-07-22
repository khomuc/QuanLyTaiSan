# TEST REPORT - MODULE QUAN LY TAI SAN

## 1. Thong tin chung

| Noi dung | Gia tri |
|---|---|
| Module kiem thu | Quan ly tai san |
| Du an | He thong quan ly tai san QR |
| Backend | NestJS + MySQL |
| Frontend | React + Vite |
| Database | Google Cloud SQL MySQL |
| Nguoi thuc hien | Nguyen Minh Khoi |
| Tuan thuc tap | Tuan 11 |

## 2. Pham vi kiem thu

Kiem thu cac chuc nang da hoan thanh cua module tai san:

- Xem danh sach tai san
- Tim kiem va loc tai san
- Them tai san
- Sua tai san
- Xem chi tiet tai san
- Tu dong tao va quet ma QR tai san
- Ghi nhan lich su thay doi bang audit log
- Dua tai san vao muc thanh ly
- Hoan tat thanh ly nhung van giu ban ghi tai san trong database
- Import Excel
- Export Excel
- Bao cao thong ke tai san

## 3. Moi truong kiem thu

| Thanh phan | Gia tri |
|---|---|
| Backend URL | http://localhost:3000/api |
| Frontend URL | http://localhost:5173 |
| Database | quan_ly_tai_san_qr |
| Trinh duyet | Chrome/Edge |
| Tai khoan test | Tai khoan co quyen ADMIN hoac co cac quyen ASSET_VIEW, ASSET_CREATE, ASSET_EDIT, ASSET_DELETE, ASSET_EXPORT, REPORT_VIEW |

## 4. Checklist API

| STT | Chuc nang | API | Du lieu test | Ket qua mong doi | Trang thai |
|---|---|---|---|---|---|
| 1 | Lay danh sach tai san | GET /api/assets | Co JWT hop le | Tra ve danh sach tai san va meta phan trang | Chua test |
| 2 | Loc theo loai | GET /api/assets?maLoai=LT001 | MaLoai ton tai | Chi tra ve tai san thuoc loai LT001 | Chua test |
| 3 | Loc theo phong ban | GET /api/assets?maPhongBan=PB01 | MaPhongBan ton tai | Chi tra ve tai san thuoc PB01 | Chua test |
| 4 | Loc theo trang thai | GET /api/assets?trangThai=HOAT_DONG | Trang thai hop le | Chi tra ve tai san dang hoat dong | Chua test |
| 5 | Lay chi tiet tai san | GET /api/assets/:maTaiSan | MaTaiSan ton tai | Tra ve day du thong tin tai san | Chua test |
| 6 | Tim tai san bang QR | GET /api/assets/lookup/:code | QR-TS0007 | Tra ve dung tai san co MaQR hoac MaTaiSan tuong ung | Chua test |
| 7 | Them tai san | POST /api/assets | Du lieu hop le, co the bo trong MaQR | Them moi thanh cong, tu tao MaQR neu bo trong, co audit log ASSET_CREATE | Chua test |
| 8 | Them tai san trung ma | POST /api/assets | MaTaiSan hoac MaQR da ton tai | Tra ve loi trung du lieu | Chua test |
| 9 | Sua tai san | PATCH /api/assets/:maTaiSan | Doi GhiChu/TrangThai | Cap nhat DB thanh cong, co audit log ASSET_EDIT | Chua test |
| 10 | Dua vao thanh ly | DELETE /api/assets/:maTaiSan | Tai san ton tai | TrangThai doi thanh THANH_LY | Chua test |
| 11 | Hoan tat thanh ly | DELETE /api/assets/:maTaiSan/finalize | Tai san TrangThai=THANH_LY | Ghi audit log hoan tat, van giu ban ghi trong TAI_SAN | Chua test |
| 12 | Lay lich su tai san | GET /api/assets/history/:maTaiSan | Tai san da tung sua | Tra ve danh sach audit log lien quan | Chua test |
| 13 | Tai file mau Excel | GET /api/assets/import-template | Co JWT hop le | Tai file mau .xlsx | Chua test |
| 14 | Import Excel | POST /api/assets/import | File Excel hop le | Import thanh cong, tu tao MaQR neu cot MaQR bo trong | Chua test |
| 15 | Export Excel | GET /api/assets/export | Co JWT hop le | Tai file danh-sach-tai-san.xlsx | Chua test |
| 16 | Bao cao tai san | GET /api/assets/report | Co JWT hop le | Tra ve summary, byCategory, byDepartment, byStatus | Chua test |

## 5. Checklist giao dien

| STT | Chuc nang | Buoc thuc hien | Ket qua mong doi | Trang thai |
|---|---|---|---|---|
| 1 | Mo trang tai san | Vao menu Tai san | Hien danh sach tai san | Chua test |
| 2 | Tim kiem tai san | Nhap tu khoa va bam Ap dung | Danh sach loc theo tu khoa | Chua test |
| 3 | Loc theo loai | Chon loai tai san | Chi hien tai san thuoc loai da chon | Chua test |
| 4 | Loc theo phong ban | Chon phong ban | Chi hien tai san thuoc phong ban da chon | Chua test |
| 5 | Loc theo trang thai | Chon trang thai | Chi hien tai san dung trang thai | Chua test |
| 6 | Them tai san | Bam Them tai san, nhap form, luu | Tai san moi xuat hien trong danh sach | Chua test |
| 7 | Sua tai san | Bam icon sua, doi ghi chu, luu, refresh | Du lieu van giu sau refresh | Chua test |
| 8 | Chi tiet tai san | Bam icon xem chi tiet | Modal hien thong tin day du va QR preview | Chua test |
| 9 | Quet QR tai san | Bam Quet QR, quet QR hoac nhap ma QR | Mo dung modal chi tiet tai san | Chua test |
| 10 | Audit log tai san | Sua tai san roi mo chi tiet | Lich su thay doi co ASSET_EDIT | Chua test |
| 11 | Dua vao thanh ly | Bam nut xoa o danh sach chinh | Tai san chuyen xuong muc Tai san thanh ly | Chua test |
| 12 | Hoan tat thanh ly | Bam Da ban / Hoan tat trong muc thanh ly | Ghi log hoan tat va van giu ban ghi DB | Chua test |
| 13 | Tai file mau | Bam Tai mau Excel | Tai file mau import | Chua test |
| 14 | Import Excel | Chon file import hop le | Them tai san tu file Excel | Chua test |
| 15 | Export Excel | Bam Export Excel | Tai file Excel danh sach tai san | Chua test |
| 16 | Bao cao tai san | Vao menu Bao cao tai san | Hien KPI va thong ke theo loai/phong ban/trang thai | Chua test |

## 6. Du lieu test de xuat

### 6.1. Tai san them thu cong

| Truong | Gia tri |
|---|---|
| MaTaiSan | TS-TEST-001 |
| MaQR | Bo trong de he thong tu tao QR-TS-TEST-001 |
| TenTaiSan | May tinh test |
| Serial | SN-TEST-001 |
| Model | TEST-MODEL |
| MaLoai | LT001 |
| NguyenGia | 10000000 |
| HaoMonLuyKe (%) | 10 |
| NgayNhap | 2026-06-03 |
| MaPhongBanHienTai | PB01 |
| TrangThai | HOAT_DONG |
| SoHieuTSCD | TSCD-TEST-001 |
| GhiChu | Du lieu kiem thu |

### 6.2. Du lieu import Excel

Su dung file mau da tao:

```text
import_5_tai_san_mau.xlsx
```

Yeu cau:

- MaLoai phai thuoc LT001, LT002, LT003, LT004, LT005
- MaPhongBanHienTai phai thuoc PB01 den PB06
- TrangThai nhan HOAT_DONG, BAO_TRI, HONG, DANG_LUAN_CHUYEN, DANG_SU_DUNG, THANH_LY
- HaoMonLuyKe(%) nhap dang phan tram, vi du 10, 20, 30
- MaQR co the bo trong, backend se tu tao theo quy tac QR-<MaTaiSan>

## 7. Loi da phat hien va xu ly

| STT | Loi | Nguyen nhan | Huong xu ly | Trang thai |
|---|---|---|---|---|
| 1 | Sửa tài sản xong refresh bị quay lại dữ liệu cũ | Frontend gửi `maTaiSan` trong body khi PATCH, backend reject do validation | Loai `maTaiSan` khoi payload update | Da xu ly |
| 2 | Lich su thay doi khong hien | Route history bi nhap nhang voi route `:maTaiSan` | Doi endpoint thanh `/assets/history/:maTaiSan` | Da xu ly |
| 3 | Xoa tai san sau thanh ly bi loi foreign key | Tai san con du lieu trong chi tiet dieu chuyen/kiem ke | Doi sang co che hoan tat thanh ly, ghi log va khong xoa cung TAI_SAN | Da xu ly |
| 4 | Import Excel thanh cong 0, loi nhieu dong | Sai MaLoai/MaPhongBan/TrangThai hoac trung ma | Tao file Excel mau dung schema | Da xu ly |
| 5 | Quet QR doc duoc ma nhung khong mo chi tiet | Frontend chi tim qua danh sach/search nen co the khong khop route/API | Them API `/api/assets/lookup/:code` va fallback tim trong danh sach hien tai | Da xu ly |

## 8. Ket qua tong hop

| Nhom chuc nang | Ket qua |
|---|---|
| CRUD tai san | Chua test day du |
| Import/Export Excel | Chua test day du |
| Thanh ly tai san | Chua test day du |
| Quet QR tai san | Chua test day du |
| Chi tiet va audit log | Chua test day du |
| Bao cao tai san | Chua test day du |

## 9. Ket luan

Module Quan ly tai san da co day du cac chuc nang chinh theo pham vi Asset Management:

- Quan ly danh sach tai san
- Them, sua, thanh ly, hoan tat thanh ly
- Tao va quet QR tai san
- Import/export Excel
- Chi tiet tai san va lich su thay doi
- Bao cao thong ke tai san

Can thuc hien checklist kiem thu tren moi truong that va cap nhat cot Trang thai thanh `Pass` hoac `Fail` theo ket qua kiem thu.
