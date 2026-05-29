# Hướng dẫn sử dụng - QuanLyTaiSan

Tài liệu ngắn để thiết lập, seed dữ liệu mẫu và chạy giao diện frontend tĩnh.

## Yêu cầu
- Node.js (>=16, tốt nhất >=18)
- MySQL server (hoặc dùng MySQL cloud) với database `quan_ly_tai_san_qr`

## Chuẩn bị cơ sở dữ liệu
Có hai cách để khởi tạo dữ liệu mẫu:

1) Import `init.sql` (toàn bộ schema + dữ liệu mẫu)
   - Mở MySQL Workbench, phpMyAdmin hoặc dùng CLI:

```bash
mysql -u root -p < /path/to/init.sql
```

2) Dùng các script tiện lợi (kết nối theo cấu hình `src/database.module.ts`)
   - Nếu bạn muốn chỉ chèn nhanh `NHAN_VIEN` và `TAI_SAN` mẫu, chạy:

```powershell
node scripts/insert_nhan_vien.js
node scripts/insert_tai_san.js
```

> Lưu ý: script kết nối tới host và credentials từ `src/database.module.ts`. Nếu cần thay đổi DB, chỉnh trong file đó hoặc export biến môi trường tương ứng.

## Cài đặt và chạy
1. Cài dependencies:

```bash
npm install
```

2. Build / chạy (dev):

```bash
npm run build   # tùy chọn
npm run start:dev
```

3. Mở giao diện frontend (SPA):
- Truy cập: `http://localhost:3000/`

## Các thao tác mẫu trên giao diện
- Create Transfer: điền `Người lập`, thêm tài sản (hoặc `Load sample`) → Submit.
- Slips: bấm `Reload Slips` để xem danh sách.
- History: bấm `Reload History` để xem báo cáo lịch sử.

## Screenshots (mẫu)

Below are placeholder screenshots to show where UI elements are located. Replace with real screenshots if desired.

### Create Transfer
![Create Transfer form](docs/assets/create_form.svg)

### Slips list
![Slips list](docs/assets/slips_list.svg)

### History report
![History report](docs/assets/history_report.svg)

## API nhanh (kiểm thử)
- Tạo phiếu (POST JSON): `/transfer/slips`
- Lấy danh sách: `GET /transfer/slips`
- Chi tiết: `GET /transfer/slips/:soPhieu`

Ví dụ curl:

```bash
curl -X POST http://localhost:3000/transfer/slips \
  -H "Content-Type: application/json" \
  -d '{"nguoiLap":"NV0001","danhSachTaiSan":[{"maQR":"QR-TS-0001","denPhongBan":"PB02"}]}'
```

## Gỡ lỗi phổ biến
- Lỗi 500 khi tạo phiếu: thường do FK `NguoiLap` hoặc `MaTaiSan` không tồn tại. Kiểm tra bảng `NHAN_VIEN` và `TAI_SAN` đã có dữ liệu mẫu.
- Nếu port 3000 đã dùng: dừng process đang chiếm port hoặc đổi `process.env.PORT`.

## Tiếp theo (đề xuất)
- Thêm QR scanning trên frontend (camera). 
- Thêm UI phê duyệt (signature, audit log). 
- Kích hoạt validation chặt hơn trên frontend.

---
Cần mình cập nhật hướng dẫn chi tiết hơn (hình ảnh, screencast) không?