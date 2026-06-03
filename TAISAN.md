# Module Quản Lý Tài Sản

Tài liệu này mô tả quá trình xây dựng, cách sử dụng và kế hoạch thực hiện module **Quản lý tài sản** trong hệ thống quản lý tài sản QR.

**Người thực hiện:** Nguyễn Minh Khôi  
**Vai trò:** Asset Management - Quản lý tài sản  
**Dự án:** Hệ thống quản lý tài sản QR  
**Công nghệ:** NestJS, React, Vite, TypeScript, MySQL, Google Cloud SQL  

---

## I. Tổng quan module tài sản

Module Quản lý tài sản dùng để quản lý danh sách tài sản cố định của đơn vị, bao gồm thông tin tài sản, loại tài sản, phòng ban quản lý, nguyên giá, hao mòn, giá trị còn lại, trạng thái sử dụng, import/export Excel, thanh lý tài sản và báo cáo thống kê.

Module này hoạt động theo mô hình:

```text
Frontend React
    ↓ gọi API
Backend NestJS
    ↓ truy vấn SQL
Google Cloud SQL MySQL
```

Địa chỉ chạy hệ thống:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api
Database: quan_ly_tai_san_qr
```

---

## II. Chức năng đã xây dựng

### 1. Danh sách tài sản

Màn hình **Tài sản** hiển thị danh sách tài sản trong hệ thống.

Các thông tin hiển thị:

- Mã tài sản
- Mã QR
- Tên tài sản
- Model
- Serial
- Loại tài sản
- Phòng ban hiện tại
- Nguyên giá
- Hao mòn lũy kế theo phần trăm
- Giá trị còn lại
- Trạng thái
- Thao tác xem, sửa, thanh lý

Các trạng thái tài sản:

| Trạng thái | Ý nghĩa |
|---|---|
| `HOAT_DONG` | Tài sản đang hoạt động |
| `BAO_TRI` | Tài sản đang bảo trì |
| `HONG` | Tài sản hỏng hoặc đã đưa vào mục thanh lý |

### 2. Tìm kiếm và lọc tài sản

Người dùng có thể lọc danh sách tài sản theo:

- Từ khóa tìm kiếm
- Loại tài sản
- Phòng ban
- Trạng thái

Từ khóa tìm kiếm áp dụng cho:

- Mã tài sản
- Mã QR
- Tên tài sản
- Serial
- Số hiệu tài sản cố định

### 3. Thêm tài sản

Người dùng bấm nút **Thêm tài sản** để mở form thêm mới.

Các trường dữ liệu:

- Mã tài sản
- Tên tài sản
- Mã QR
- Số hiệu TSCD
- Loại tài sản
- Phòng ban
- Serial
- Model
- Nguyên giá
- Hao mòn lũy kế (%)
- Giá trị còn lại
- Ngày nhập
- Trạng thái
- Ghi chú

Giá trị còn lại được tính theo công thức:

```text
HaoMonLuyKe = NguyenGia * HaoMonPhanTram / 100
GiaTriConLai = NguyenGia - HaoMonLuyKe
```

Ví dụ:

```text
NguyenGia = 10,000,000
HaoMonLuyKe (%) = 10
HaoMonLuyKe lưu DB = 1,000,000
GiaTriConLai = 9,000,000
```

### 4. Sửa tài sản

Người dùng có thể sửa thông tin tài sản đã có.

Khi sửa thành công:

- Dữ liệu được cập nhật trong bảng `TAI_SAN`
- Hệ thống ghi log `ASSET_EDIT` vào bảng `AUDIT_LOG`
- Sau khi refresh trang, dữ liệu vẫn giữ nguyên nếu đã lưu thành công

### 5. Xem chi tiết tài sản

Người dùng bấm biểu tượng xem chi tiết để mở modal chi tiết tài sản.

Màn hình chi tiết hiển thị:

- Mã tài sản
- Tên tài sản
- Loại tài sản
- Phòng ban
- Mã QR
- Serial
- Model
- Số hiệu TSCD
- Ngày nhập
- Nguyên giá
- Hao mòn
- Giá trị còn lại
- Trạng thái
- Ghi chú
- QR preview
- Lịch sử thay đổi

### 6. Lịch sử thay đổi tài sản

Lịch sử thay đổi được lấy từ bảng:

```text
AUDIT_LOG
```

Điều kiện lọc:

```sql
DoiTuong = 'TAI_SAN'
DoiTuongId = MaTaiSan
```

Các hành động được ghi nhận:

| Hành động | Ý nghĩa |
|---|---|
| `ASSET_CREATE` | Tạo tài sản |
| `ASSET_EDIT` | Sửa tài sản |
| `ASSET_DELETE` | Đưa tài sản vào mục thanh lý |
| `ASSET_FINAL_DELETE` | Xóa tài sản sau khi bán/thanh lý |

### 7. Thanh lý tài sản

Quy trình thanh lý gồm 2 bước:

1. **Đưa vào mục thanh lý**
   - Người dùng bấm nút xóa ở danh sách tài sản chính
   - Hệ thống cập nhật `TrangThai = 'HONG'`
   - Tài sản biến khỏi danh sách đang sử dụng
   - Tài sản xuất hiện trong mục **Tài sản thanh lý**

2. **Đã bán / Xóa**
   - Người dùng bấm nút **Đã bán / Xóa**
   - Hệ thống xóa dữ liệu liên quan trong chi tiết phiếu điều chuyển/kiểm kê nếu có
   - Sau đó xóa tài sản khỏi bảng `TAI_SAN`

Các bảng liên quan khi xóa sau thanh lý:

```text
CHI_TIET_PHIEU_DIEU_CHUYEN
CHI_TIET_PHIEU_KIEM_KE
TAI_SAN
```

### 8. Import Excel

Chức năng import Excel cho phép thêm nhiều tài sản cùng lúc.

Các bước sử dụng:

1. Vào màn hình **Tài sản**
2. Bấm **Tải mẫu Excel**
3. Nhập dữ liệu theo file mẫu
4. Bấm **Import Excel**
5. Chọn file `.xlsx`
6. Kiểm tra thông báo số dòng thành công và số dòng lỗi

Các cột trong file Excel:

| Cột | Ý nghĩa |
|---|---|
| `MaTaiSan` | Mã tài sản |
| `MaQR` | Mã QR |
| `TenTaiSan` | Tên tài sản |
| `Serial` | Serial |
| `Model` | Model |
| `MaLoai` | Mã loại tài sản |
| `NguyenGia` | Nguyên giá |
| `HaoMonLuyKe(%)` | Hao mòn theo phần trăm |
| `GiaTriConLai` | Giá trị còn lại, có thể để trống |
| `NgayNhap` | Ngày nhập |
| `MaPhongBanHienTai` | Mã phòng ban |
| `TrangThai` | Trạng thái |
| `SoHieuTSCD` | Số hiệu tài sản cố định |
| `GhiChu` | Ghi chú |

Giá trị hợp lệ:

```text
MaLoai: LT001, LT002, LT003, LT004, LT005
MaPhongBanHienTai: PB01, PB02, PB03, PB04, PB05, PB06
TrangThai: HOAT_DONG, BAO_TRI, HONG
```

### 9. Export Excel

Người dùng bấm **Export Excel** để tải danh sách tài sản hiện tại.

File export bao gồm:

- Mã tài sản
- Mã QR
- Tên tài sản
- Serial
- Model
- Loại tài sản
- Nguyên giá
- Hao mòn theo phần trăm
- Giá trị còn lại
- Ngày nhập
- Phòng ban
- Trạng thái
- Số hiệu TSCD
- Ghi chú

### 10. Báo cáo tài sản

Màn hình **Báo cáo tài sản** dùng API:

```text
GET /api/assets/report
```

Báo cáo hiển thị:

- Tổng số tài sản
- Số tài sản đang sử dụng
- Số tài sản thanh lý
- Tổng nguyên giá
- Tổng hao mòn
- Tổng giá trị còn lại
- Thống kê theo loại tài sản
- Thống kê theo phòng ban
- Thống kê theo trạng thái

Báo cáo hỗ trợ lọc theo:

- Từ khóa
- Loại tài sản
- Phòng ban
- Trạng thái

---

## III. API của module tài sản

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/assets` | Lấy danh sách tài sản |
| GET | `/api/assets/:maTaiSan` | Lấy chi tiết tài sản |
| GET | `/api/assets/history/:maTaiSan` | Lấy lịch sử thay đổi tài sản |
| POST | `/api/assets` | Thêm tài sản |
| PATCH | `/api/assets/:maTaiSan` | Sửa tài sản |
| DELETE | `/api/assets/:maTaiSan` | Đưa tài sản vào mục thanh lý |
| DELETE | `/api/assets/:maTaiSan/finalize` | Xóa tài sản sau khi bán/thanh lý |
| GET | `/api/assets/meta/categories` | Lấy danh sách loại tài sản |
| GET | `/api/assets/import-template` | Tải file Excel mẫu |
| POST | `/api/assets/import` | Import tài sản từ Excel |
| GET | `/api/assets/export` | Export tài sản ra Excel |
| GET | `/api/assets/report` | Báo cáo thống kê tài sản |

---

## IV. Cấu trúc database liên quan

### 1. Bảng `TAI_SAN`

Lưu thông tin chính của tài sản.

Các cột quan trọng:

- `MaTaiSan`
- `MaQR`
- `TenTaiSan`
- `Serial`
- `Model`
- `MaLoai`
- `NguyenGia`
- `HaoMonLuyKe`
- `GiaTriConLai`
- `NgayNhap`
- `MaPhongBanHienTai`
- `TrangThai`
- `SoHieuTSCD`
- `GhiChu`

### 2. Bảng `LOAI_TAI_SAN`

Lưu danh mục loại tài sản.

### 3. Bảng `PHONG_BAN`

Lưu danh sách phòng ban quản lý tài sản.

### 4. Bảng `AUDIT_LOG`

Lưu lịch sử thao tác trên tài sản.

### 5. Các bảng liên quan khi thanh lý

- `CHI_TIET_PHIEU_DIEU_CHUYEN`
- `CHI_TIET_PHIEU_KIEM_KE`

---

## V. Cách chạy dự án

### 1. Cài dependency

Tại thư mục gốc dự án:

```powershell
npm.cmd install
npm.cmd install --prefix frontend
```

### 2. Chạy backend

```powershell
npm.cmd run start:dev
```

Backend chạy tại:

```text
http://localhost:3000/api
```

### 3. Chạy frontend

Mở terminal thứ hai:

```powershell
npm.cmd run frontend:dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

### 4. Kiểm tra build

```powershell
npx.cmd tsc --noEmit --incremental false -p tsconfig.json
npx.cmd tsc --noEmit -p frontend\tsconfig.json
npm.cmd test -- --runInBand
```

---

## VI. Công việc thực hiện trong 12 tuần

### Tuần 1: Khảo sát nghiệp vụ quản lý tài sản

Nội dung thực hiện:

- Tìm hiểu quy trình quản lý tài sản trong đơn vị
- Xác định các thông tin cần quản lý cho mỗi tài sản
- Tìm hiểu nhu cầu theo dõi trạng thái tài sản
- Tìm hiểu nhu cầu import/export dữ liệu tài sản
- Tìm hiểu nhu cầu báo cáo tài sản theo phòng ban, loại tài sản và trạng thái

Đầu ra:

- Xác định được phạm vi module Asset Management
- Xác định các trường dữ liệu chính của tài sản
- Xác định các nghiệp vụ chính: thêm, sửa, xem, thanh lý, import, export, báo cáo

### Tuần 2: Thiết kế database và API

Nội dung thực hiện:

- Thiết kế các bảng liên quan đến tài sản
- Xác định quan hệ giữa `TAI_SAN`, `LOAI_TAI_SAN`, `PHONG_BAN`
- Thiết kế danh sách API cho module tài sản
- Nghiên cứu thư viện ExcelJS phục vụ import/export Excel
- Nghiên cứu hướng triển khai QR code

Đầu ra:

- File SQL khởi tạo database
- Danh sách API tài sản
- Xác định thư viện `exceljs` để xử lý Excel

### Tuần 3: Cài đặt database và validation

Nội dung thực hiện:

- Import database lên Google Cloud SQL
- Kết nối backend NestJS với MySQL
- Kiểm tra bảng `TAI_SAN`, `LOAI_TAI_SAN`, `PHONG_BAN`, `AUDIT_LOG`
- Tạo DTO validate dữ liệu thêm/sửa tài sản
- Kiểm tra source khớp với file SQL

Đầu ra:

- Database hoạt động trên Google Cloud SQL
- Backend kết nối database thành công
- DTO `CreateAssetDto` và `UpdateAssetDto`

### Tuần 4: Xây dựng API CRUD tài sản

Nội dung thực hiện:

- Xây dựng API lấy danh sách tài sản
- Xây dựng API lấy chi tiết tài sản
- Xây dựng API thêm tài sản
- Xây dựng API sửa tài sản
- Xây dựng API đưa tài sản vào mục thanh lý
- Xây dựng API xóa tài sản sau khi bán/thanh lý
- Ghi audit log cho thao tác tạo, sửa, thanh lý, xóa

Đầu ra:

- API CRUD tài sản hoạt động
- Service xử lý nghiệp vụ tài sản
- Audit log cho module tài sản

### Tuần 5: Xây dựng trang danh sách tài sản

Nội dung thực hiện:

- Xây dựng giao diện danh sách tài sản bằng React
- Hiển thị các cột thông tin chính
- Thêm tìm kiếm và bộ lọc
- Tích hợp API danh sách tài sản
- Hiển thị nguyên giá, hao mòn phần trăm, giá trị còn lại

Đầu ra:

- Trang **Tài sản** hoạt động trên frontend
- Danh sách tài sản lấy từ API thật

### Tuần 6: Xây dựng chi tiết tài sản và form thêm/sửa

Nội dung thực hiện:

- Xây dựng form thêm tài sản
- Xây dựng form sửa tài sản
- Tính hao mòn theo phần trăm
- Tự động tính giá trị còn lại
- Xây dựng modal chi tiết tài sản
- Hiển thị QR preview
- Hiển thị lịch sử thay đổi tài sản từ audit log

Đầu ra:

- Form thêm/sửa tài sản hoạt động
- Chi tiết tài sản hiển thị đầy đủ thông tin
- Lịch sử thay đổi lấy từ bảng `AUDIT_LOG`

### Tuần 7: Import/Export Excel và thanh lý tài sản

Nội dung thực hiện:

- Cài đặt thư viện `exceljs`
- Xây dựng API tải file mẫu Excel
- Xây dựng API import Excel
- Validate dữ liệu import
- Xây dựng API export Excel
- Tạo file Excel mẫu để import thử
- Xây dựng quy trình thanh lý tài sản
- Xóa tài sản sau khi đã bán/thanh lý

Đầu ra:

- Import Excel hoạt động
- Export Excel hoạt động
- Tài sản có thể đưa vào mục thanh lý
- Tài sản có thể xóa sau khi bán

### Tuần 8: QR code generation và in tem QR

Ghi chú:

- Tuần này được tạm bỏ qua theo điều chỉnh tiến độ
- Hệ thống hiện có QR preview trong chi tiết tài sản
- Chưa triển khai in tem QR hàng loạt hoặc export QR ra PDF/ảnh

Trạng thái:

```text
Chưa hoàn thiện
```

### Tuần 9: API báo cáo thống kê tài sản

Nội dung thực hiện:

- Xây dựng API báo cáo:

```text
GET /api/assets/report
```

- Tính tổng số tài sản
- Tính tổng nguyên giá
- Tính tổng hao mòn
- Tính tổng giá trị còn lại
- Thống kê theo loại tài sản
- Thống kê theo phòng ban
- Thống kê theo trạng thái
- Hỗ trợ lọc báo cáo theo từ khóa, loại, phòng ban, trạng thái

Đầu ra:

- API báo cáo tài sản hoạt động
- Frontend có hàm `api.assetReport()` để gọi báo cáo

### Tuần 10: Trang báo cáo tài sản

Nội dung thực hiện:

- Thêm menu **Báo cáo tài sản** vào sidebar
- Xây dựng trang báo cáo tài sản
- Hiển thị KPI báo cáo:
  - Tổng tài sản
  - Đang sử dụng
  - Thanh lý
  - Tổng nguyên giá
  - Tổng hao mòn
  - Giá trị còn lại
- Hiển thị thống kê theo loại tài sản
- Hiển thị thống kê theo phòng ban
- Hiển thị thống kê theo trạng thái
- Thêm bộ lọc báo cáo

Đầu ra:

- Trang **Báo cáo tài sản** hoạt động trên frontend
- Báo cáo lấy dữ liệu từ API `/api/assets/report`

### Tuần 11: Kiểm thử module tài sản

Nội dung thực hiện:

- Tạo file test report cho module tài sản
- Lập checklist kiểm thử API
- Lập checklist kiểm thử giao diện
- Kiểm thử các chức năng:
  - CRUD tài sản
  - Import/export Excel
  - Thanh lý tài sản
  - Xóa sau bán
  - Chi tiết tài sản
  - Audit log
  - Báo cáo tài sản
- Ghi nhận các lỗi đã phát hiện và hướng xử lý

Đầu ra:

```text
TEST_REPORT_ASSET_MODULE.md
```

### Tuần 12: Tài liệu hướng dẫn và tổng kết

Nội dung thực hiện:

- Viết tài liệu hướng dẫn sử dụng module tài sản
- Tổng hợp các chức năng đã làm
- Trình bày tiến độ 12 tuần
- Chuẩn bị tài liệu phục vụ báo cáo thực tập

Đầu ra:

```text
TAISAN.md
```

---

## VII. Kết quả đạt được

Module Quản lý tài sản đã hoàn thành các chức năng chính:

- Quản lý danh sách tài sản
- Tìm kiếm và lọc tài sản
- Thêm tài sản
- Sửa tài sản
- Xem chi tiết tài sản
- Ghi nhận lịch sử thay đổi
- Import Excel
- Export Excel
- Thanh lý tài sản
- Xóa sau khi bán/thanh lý
- Báo cáo thống kê tài sản

Các chức năng có thể phát triển tiếp:

- Sinh QR code nội bộ không phụ thuộc dịch vụ bên ngoài
- In tem QR hàng loạt
- Export báo cáo ra PDF
- Thêm biểu đồ bằng Chart.js hoặc Recharts
- Viết thêm unit test chi tiết cho `AssetsService`

---

## VIII. Kết luận

Trong quá trình thực hiện, module Quản lý tài sản đã được xây dựng từ bước khảo sát, thiết kế database, phát triển API, xây dựng giao diện, import/export Excel, thanh lý tài sản, báo cáo thống kê và kiểm thử.

Kết quả đáp ứng được các nghiệp vụ chính của quản lý tài sản trong hệ thống:

- Theo dõi thông tin tài sản
- Quản lý giá trị tài sản và hao mòn
- Theo dõi tài sản theo phòng ban và loại tài sản
- Hỗ trợ nhập/xuất dữ liệu bằng Excel
- Hỗ trợ thanh lý tài sản
- Cung cấp báo cáo phục vụ quản lý

**Người thực hiện:** Nguyễn Minh Khôi
