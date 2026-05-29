# Hệ Thống Quản Lý Tài Sản QR

Ứng dụng fullstack quản lý tài sản cố định, điều chuyển và kiểm kê trong môi trường tổ chức/trường đại học. Backend xây dựng bằng **NestJS**, frontend bằng **React + Vite + TypeScript**, cơ sở dữ liệu **MySQL**.

---

## Thành viên & Đóng góp

| Tài khoản | Email | Commit |
|---|---|---|
| Minh Khoi | muckho230@gmail.com | Khởi tạo dự án NestJS, kết nối MySQL |
| **nnhuwz03** | nhu83838@gmail.com | **Toàn bộ frontend React + các module backend** |

## Transfer Management (Module Điều chuyển Tài sản)

Module điều chuyển tài sản đã được tích hợp hoàn chỉnh cả ở **Backend NestJS** (quản lý giao dịch, tuyến phê duyệt) và **Frontend React SPA** (giao diện kéo thả lập phiếu hiện đại).

### 1. Phân hệ Giao diện React SPA (`/frontend`)
Giao diện điều chuyển đã được tích hợp thành phân hệ chính thức trên Sidebar của React console (`http://localhost:5173/`), sở hữu giao diện Tab phân chia thông minh:
* **Lập phiếu điều chuyển (Create)**:
  * Cho phép chọn người lập và **Phòng ban nguồn**. Khi chọn phòng ban nguồn, danh sách tài sản để chọn sẽ tự động lọc chỉ hiển thị các tài sản thực tế đang nằm tại phòng đó.
  * Hỗ trợ thêm/xóa/nhân bản nhiều tài sản điều chuyển cùng lúc, nhập lý do riêng và phòng ban nhận riêng biệt cho từng dòng.
  * Hỗ trợ thiết lập tuyến ký duyệt gồm nhiều người ký, chỉ định vai trò ký và thứ tự vòng ký tương thích với cơ chế phê duyệt của hệ thống.
  * Tích hợp nút **"Load mẫu"** giúp điền nhanh dữ liệu mô phỏng để kiểm thử.
* **Lịch sử phiếu (History)**:
  * Danh sách toàn bộ phiếu điều chuyển đang chờ ký duyệt, đã duyệt, hoặc bị từ chối kèm ngày lập và số tài sản.
* **Thống kê luân chuyển (Reports)**:
  * Tổng hợp trực quan luồng di chuyển tài sản tích lũy dạng thẻ lưu lượng: `[PHÒNG BAN NGUỒN] ➜ [PHÒNG BAN ĐÍCH]`.
  * Nhật ký chi tiết của từng lượt điều chuyển tài sản đã được phê duyệt thành công.

### 2. Phân hệ Giao diện Tĩnh (`/public`)
* Ngoài React SPA, giao diện tĩnh truyền thống của phân hệ Điều chuyển cũng được phục vụ trực tiếp tại địa chỉ gốc của Backend: **`http://localhost:3000/`**.
* Đã được cấu hình lại để tự động gọi API NestJS thông qua tiền tố `/api` chuẩn xác.

### 3. Backend APIs (`/api/transfer/...`)
Các endpoints điều chuyển được bảo vệ và cấu hình global prefix `/api`:
- `POST /api/transfer/slips` — Tạo phiếu điều chuyển mới (kèm tự sinh mã số phiếu dạng `DCYYYYMMDDxxxx` và chạy SQL Transaction).
- `POST /api/transfer/slips/scan` — Tạo phiếu từ mã QR.
- `GET /api/transfer/slips` — Danh sách phiếu điều chuyển (hỗ trợ lọc trạng thái, ngày tháng, phòng ban).
- `GET /api/transfer/slips/:soPhieu` — Chi tiết phiếu điều chuyển kèm chi tiết tài sản và tuyến ký duyệt tương ứng.
- `PATCH /api/transfer/slips/:soPhieu` — Chỉnh sửa thông tin phiếu (chỉ áp dụng cho phiếu trạng thái `CHO_KY`).
- `DELETE /api/transfer/slips/:soPhieu` — Xóa phiếu điều chuyển (chỉ áp dụng cho phiếu trạng thái `CHO_KY`).
- `POST /api/transfer/slips/:soPhieu/approval` — Ký duyệt / Từ chối phiếu (khi toàn bộ tuyến ký duyệt hoàn tất, hệ thống tự động cập nhật lại phòng ban hiện tại của tài sản trong bảng `TAI_SAN`).
- `GET /api/transfer/reports/history` — Báo cáo thống kê luồng điều chuyển.

### 4. Dữ liệu mẫu & Scripts Seed nhanh
- Cơ sở dữ liệu mẫu đã có sẵn trong file `init.sql`.
- Hoặc bạn có thể chạy các script seed dữ liệu độc lập:
```powershell
# Chạy từ thư mục QuanLyTaiSan
node scripts/insert_nhan_vien.js
node scripts/insert_tai_san.js
```
- Các mã QR tài sản mẫu: `QR-TS-0001` đến `QR-TS-0006`.

### 5. Lệnh chạy kiểm thử dự án
```bash
npm run build         # Biên dịch Backend NestJS
npm run test          # Chạy toàn bộ Unit tests (bao gồm TransferService spec)
npm run test:e2e      # Chạy kiểm thử End-to-End
```

## Project setup
---

## Đóng góp của nnhuwz03

> **Commit:** `Update project` — push ngày **25/05/2026**  
> **Phạm vi:** 72 files, +8.328 dòng code

`nnhuwz03` chịu trách nhiệm xây dựng **toàn bộ giao diện người dùng** (chạy tại `http://localhost:5173/`) cùng với **8 module backend NestJS** hoàn chỉnh. Dưới đây là mô tả chi tiết từng phần.

---

## I. Frontend — React + Vite (`/frontend`)

> **Công nghệ:** React 19, TypeScript 5.7, Vite 6, Lucide React (icon)  
> **Khởi chạy:** `http://localhost:5173/`

### Cấu trúc thư mục frontend

```
frontend/
├── index.html
├── vite.config.ts          # Proxy /api → localhost:3000
├── src/
│   ├── main.tsx            # Entry point React
│   ├── App.tsx             # Toàn bộ UI (1.670 dòng), SPA một file
│   ├── styles/index.css    # Custom CSS vars, layout, components
│   └── lib/
│       ├── api.ts          # HTTP client gọi REST API backend
│       ├── types.ts        # TypeScript interfaces toàn hệ thống
│       └── mockData.ts     # Dữ liệu demo (chạy không cần backend)
```

### Chế độ hoạt động

Ứng dụng hỗ trợ hai chế độ chuyển đổi được trong UI:

- **API Mode** (`api`): Gọi thực tế đến backend NestJS tại `http://localhost:3000/api`
- **Demo Mode** (`demo`): Dùng `mockData.ts` — chạy hoàn toàn offline, không cần kết nối DB

### Các màn hình giao diện

#### 1. Màn hình Đăng nhập (`LoginScreen`)
- Form đăng nhập với email & mật khẩu
- Nút ẩn/hiện mật khẩu
- Lưu JWT token vào `localStorage` (key: `qlts_access_token`)
- Tự động load lại thông tin người dùng nếu đã có token

#### 2. Dashboard — Tổng quan (`DashboardPage`)
- **KPI tiles:** Tổng nhân viên, Tổng tài sản, Phiếu chờ duyệt
- **Bảng trạng thái tài sản:** Hiển thị phân bổ theo trạng thái (Hoạt động / Bảo trì / Hỏng)
- **Log gần đây:** Danh sách 5 hoạt động audit log mới nhất

#### 3. Tài sản (`AssetsPage`)
- Thanh công cụ tìm kiếm + bộ lọc theo **Loại tài sản**, **Phòng ban**, **Trạng thái**
- Bảng danh sách tài sản: Mã QR, Tên, Serial, Model, Loại, Nguyên giá, Hao mòn, Giá trị còn lại, Trạng thái
- Nút **Làm mới** dữ liệu
- Hiển thị số liệu tổng hợp: tổng tài sản, bảo trì, hỏng
- Badge trạng thái màu: `HOAT_DONG` (xanh), `BAO_TRI` (vàng), `HONG` (đỏ)

#### 4. Nhân viên (`EmployeesPage`)
- Danh sách nhân viên với tìm kiếm theo tên/mã/email
- Các cột: Mã NV, Họ tên, Chức vụ, Email, SĐT, Phòng ban, Vai trò, Trạng thái
- **Thêm nhân viên** (modal `EmployeeModal`): form đầy đủ gồm mã NV, họ tên, chức vụ, email, SĐT, phòng ban, vai trò, mật khẩu, trạng thái
- **Sửa nhân viên**: mở lại modal với dữ liệu hiện tại
- **Vô hiệu hoá** nhân viên (chuyển trạng thái sang `INACTIVE`)
- Phân quyền: chỉ hiện nút thêm/sửa/xoá nếu user có quyền `STAFF_CREATE`, `STAFF_EDIT`, `STAFF_DELETE`

#### 5. Vai trò & Phân quyền (`RolesPage`)
- **Cột trái:** Danh sách vai trò, click để chọn vai trò cần phân quyền
- **Cột phải:** Danh sách quyền nhóm theo module (AUTH, STAFF, ROLE, APPROVAL, NOTIFICATION, AUDIT)
- Checkbox bật/tắt từng quyền cho vai trò đang chọn
- Nút **Lưu phân quyền** gọi API `PUT /api/roles/:maVaiTro/permissions`

#### 6. Ký duyệt (`ApprovalsPage`)
- Danh sách các phiếu đang chờ ký của người dùng hiện tại
- Hiển thị: Loại phiếu (Điều chuyển / Kiểm kê), Mã phiếu, Ngày, Người lập, Vòng ký, Vai trò
- Hai nút hành động: **Ký duyệt** (`DA_KY`) và **Từ chối** (`TU_CHOI`)
- Tự động reload danh sách sau khi ký

#### 7. Thông báo (`NotificationsPage`)
- Danh sách thông báo phê duyệt liên quan đến người dùng hiện tại
- Phân loại: `TRANSFER` (Điều chuyển) / `INVENTORY` (Kiểm kê)
- Hiển thị nội dung thông báo, ngày, trạng thái

#### 8. Cấu hình hệ thống (`SettingsPage`)
- Xem và chỉnh sửa tên ứng dụng (`appName`)
- Bật/tắt thông báo email, thông báo trong ứng dụng (toggle switches)
- Thông tin database (host, tên DB) — chỉ xem
- Thông tin bảo mật: thời hạn JWT
- Danh sách module đang hoạt động
- Nút **Lưu cấu hình** gọi `PATCH /api/settings`

#### 9. Giám sát Log — Audit (`AuditPage`)
- Bảng audit log toàn hệ thống với tìm kiếm
- Các cột: ID, Nhân viên, Hành động, Đối tượng, Mã đối tượng, Trạng thái, Thời gian
- Lọc theo từ khoá (tìm trong hành động, đối tượng, chi tiết)

#### 10. Tài khoản cá nhân (`ProfilePage`)
- Hiển thị thông tin hồ sơ: họ tên, email, phòng ban, vai trò, trạng thái, ngày tạo
- Danh sách quyền của tài khoản hiện tại (badges)
- Form **đổi mật khẩu**: nhập mật khẩu cũ → mật khẩu mới → xác nhận

### Sidebar & Layout
- Sidebar thu/mở (`collapse`) bằng icon
- Navigation highlight item đang active
- Responsive với CSS custom properties
- Toast notification (thông báo nhanh) cho thành công/lỗi
- Loading bar khi đang fetch dữ liệu

### HTTP Client (`lib/api.ts`)

Tất cả request đều gắn `Authorization: Bearer <token>`. Các endpoint:

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập, lấy JWT |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |
| PATCH | `/api/auth/password` | Đổi mật khẩu |
| GET | `/api/dashboard/overview` | Dữ liệu tổng quan dashboard |
| GET | `/api/assets` | Danh sách tài sản (filter) |
| GET | `/api/assets/meta/categories` | Danh mục loại tài sản |
| GET | `/api/employees` | Danh sách nhân viên |
| GET | `/api/employees/meta/departments` | Danh sách phòng ban |
| POST | `/api/employees` | Tạo nhân viên mới |
| PATCH | `/api/employees/:id` | Cập nhật nhân viên |
| DELETE | `/api/employees/:id` | Xoá nhân viên |
| GET | `/api/roles` | Danh sách vai trò |
| GET | `/api/roles/permissions` | Danh sách quyền |
| POST | `/api/roles` | Tạo vai trò |
| PATCH | `/api/roles/:id` | Cập nhật vai trò |
| PUT | `/api/roles/:id/permissions` | Phân quyền cho vai trò |
| GET | `/api/approvals/pending` | Phiếu chờ ký của user |
| POST | `/api/approvals/transfer/:id/sign` | Ký phiếu điều chuyển |
| POST | `/api/approvals/inventory/:id/sign` | Ký phiếu kiểm kê |
| GET | `/api/notifications` | Thông báo của user |
| GET | `/api/settings` | Đọc cấu hình hệ thống |
| PATCH | `/api/settings` | Cập nhật cấu hình |
| GET | `/api/audit-logs` | Danh sách audit log |

---

## II. Backend — NestJS Modules (`/src`)

> **Công nghệ:** NestJS 11, TypeScript, MySQL2 (raw queries), JWT (HS256), Bcryptjs  
> **Cổng mặc định:** `3000` | **Global prefix:** `/api`

### Kiến trúc tổng thể

```
src/
├── main.ts                  # Bootstrap, CORS, ValidationPipe, prefix /api
├── app.module.ts            # Root module, import tất cả module con
├── database.module.ts       # Kết nối MySQL Pool toàn cục
├── auth/                    # Xác thực JWT
├── employees/               # Quản lý nhân viên
├── assets/                  # Quản lý tài sản
├── roles/                   # Vai trò & phân quyền
├── dashboard/               # Số liệu tổng quan
├── approvals/               # Quy trình ký duyệt
├── notifications/           # Thông báo phê duyệt
├── settings/                # Cấu hình hệ thống
├── audit-logs/              # Giám sát log
└── common/
    ├── constants.ts         # MYSQL_CONNECTION token
    ├── decorators/          # @CurrentUser(), @Permissions()
    ├── guards/              # JwtAuthGuard, PermissionsGuard
    └── interfaces/          # AuthUser interface
```

### Module 1: Auth (`/api/auth`)

**File:** `src/auth/auth.service.ts`, `auth.controller.ts`, `auth.module.ts`

| Endpoint | Mô tả |
|---|---|
| `POST /api/auth/login` | Xác thực email + mật khẩu, trả JWT + thông tin user |
| `GET /api/auth/me` | Lấy profile người dùng hiện tại (cần JWT) |
| `PATCH /api/auth/password` | Đổi mật khẩu (xác minh mật khẩu cũ trước) |

**Chi tiết:**
- Hỗ trợ mật khẩu plaintext (cũ) lẫn bcrypt hash — tự phát hiện qua tiền tố `$2a$`/`$2b$`
- JWT ký bằng secret env `JWT_SECRET` (mặc định `quan-ly-tai-san-secret`), hạn `JWT_EXPIRES_IN` (mặc định `8h`)
- Ghi `AUDIT_LOG` cho hành động `LOGIN` và `CHANGE_PASSWORD`
- Join `NHAN_VIEN` ↔ `PHONG_BAN` ↔ `VAI_TRO` để lấy đủ thông tin

### Module 2: Employees (`/api/employees`)

**File:** `src/employees/employees.service.ts`, `employees.controller.ts`

| Endpoint | Quyền | Mô tả |
|---|---|---|
| `GET /api/employees` | `STAFF_VIEW` | Danh sách nhân viên (tìm kiếm, lọc, phân trang) |
| `GET /api/employees/meta/departments` | `STAFF_VIEW` | Danh sách phòng ban |
| `GET /api/employees/:id` | `STAFF_VIEW` | Chi tiết một nhân viên |
| `POST /api/employees` | `STAFF_CREATE` | Tạo nhân viên mới |
| `PATCH /api/employees/:id` | `STAFF_EDIT` | Cập nhật nhân viên |
| `DELETE /api/employees/:id` | `STAFF_DELETE` | Xoá/vô hiệu hoá nhân viên |

**Chi tiết:**
- Lọc theo: `search` (tên/mã/email), `maPhongBan`, `maVaiTro`, `trangThai`
- Phân trang: `page`, `limit` (mặc định 20/trang)
- Mật khẩu tự động hash bcrypt (salt 10) khi tạo/cập nhật
- Kiểm tra trùng `maNhanVien` và `email` trước khi tạo
- Ghi audit log cho `CREATE_EMPLOYEE`, `UPDATE_EMPLOYEE`, `DELETE_EMPLOYEE`

### Module 3: Assets (`/api/assets`)

**File:** `src/assets/assets.service.ts`, `assets.controller.ts`

| Endpoint | Mô tả |
|---|---|
| `GET /api/assets` | Danh sách tài sản (tìm kiếm theo mã, QR, tên, serial, số hiệu TSCD) |
| `GET /api/assets/meta/categories` | Danh mục loại tài sản |

**Chi tiết:**
- Lọc theo: `search`, `maLoai`, `maPhongBan`, `trangThai`
- Trường tài sản: `maTaiSan`, `maQR`, `tenTaiSan`, `serial`, `model`, `nguyenGia`, `haoMonLuyKe`, `giaTriConLai`, `ngayNhap`, `soHieuTSCD`, `trangThai`
- Trạng thái: `HOAT_DONG`, `BAO_TRI`, `HONG`

### Module 4: Roles & Permissions (`/api/roles`)

**File:** `src/roles/roles.service.ts`, `roles.controller.ts`

| Endpoint | Quyền | Mô tả |
|---|---|---|
| `GET /api/roles` | `ROLE_MANAGE` | Danh sách vai trò kèm quyền |
| `POST /api/roles` | `ROLE_MANAGE` | Tạo vai trò mới |
| `PATCH /api/roles/:id` | `ROLE_MANAGE` | Cập nhật vai trò |
| `DELETE /api/roles/:id` | `ROLE_MANAGE` | Xoá vai trò |
| `GET /api/roles/permissions` | `ROLE_MANAGE` | Danh sách tất cả quyền |
| `POST /api/roles/permissions` | `ROLE_MANAGE` | Tạo quyền mới |
| `PATCH /api/roles/permissions/:id` | `ROLE_MANAGE` | Cập nhật quyền |
| `PUT /api/roles/:id/permissions` | `ROLE_MANAGE` | Gán danh sách quyền cho vai trò |

**Chi tiết:**
- Sử dụng transaction khi tạo/cập nhật để đảm bảo tính toàn vẹn
- `GROUP_CONCAT` để lấy danh sách quyền của vai trò trong 1 query
- Ghi audit log cho các thay đổi vai trò

### Module 5: Dashboard (`/api/dashboard`)

**File:** `src/dashboard/dashboard.service.ts`, `dashboard.controller.ts`

| Endpoint | Mô tả |
|---|---|
| `GET /api/dashboard/overview` | Tổng hợp số liệu toàn hệ thống |

**Dữ liệu trả về:**
```json
{
  "employees": { "total": 120, "byStatus": [...] },
  "assets": { "total": 450, "byStatus": [...] },
  "approvals": {
    "pendingTransfers": 5,
    "pendingInventories": 3,
    "totalPending": 8
  },
  "recentLogs": [...]
}
```
- Sử dụng `Promise.all` để chạy song song 7 query, tối ưu thời gian phản hồi

### Module 6: Approvals (`/api/approvals`)

**File:** `src/approvals/approvals.service.ts`, `approvals.controller.ts`

| Endpoint | Quyền | Mô tả |
|---|---|---|
| `GET /api/approvals/pending` | JWT | Phiếu chờ ký của user hiện tại |
| `POST /api/approvals/transfer/:id/sign` | `TRANSFER_APPROVE` | Ký phiếu điều chuyển |
| `POST /api/approvals/inventory/:id/sign` | `INVENTORY_APPROVE` | Ký phiếu kiểm kê |
| `GET /api/approvals/transfer/:id/approvers` | JWT | Danh sách người ký phiếu điều chuyển |
| `GET /api/approvals/inventory/:id/approvers` | JWT | Danh sách người ký phiếu kiểm kê |
| `POST /api/approvals/transfer/:id/assign` | JWT | Gán người phê duyệt điều chuyển |
| `POST /api/approvals/inventory/:id/assign` | JWT | Gán người phê duyệt kiểm kê |

**Chi tiết:**
- Phiếu chờ ký lấy từ `PHIEU_DIEU_CHUYEN_NHAN_VIEN` và `PHIEU_KIEM_KE_NHAN_VIEN`
- Hành động ký: `DA_KY` (chấp nhận) hoặc `TU_CHOI` (từ chối, kèm lý do)
- Ghi audit log cho từng hành động ký duyệt

### Module 7: Notifications (`/api/notifications`)

**File:** `src/notifications/notifications.service.ts`, `notifications.controller.ts`

| Endpoint | Mô tả |
|---|---|
| `GET /api/notifications` | Thông báo phê duyệt của user hiện tại |
| `POST /api/notifications/remind` | Gửi nhắc nhở phê duyệt qua email |

**Chi tiết:**
- Lấy từ cả `PHIEU_DIEU_CHUYEN_NHAN_VIEN` và `PHIEU_KIEM_KE_NHAN_VIEN` có `TrangThaiKy = 'CHO_KY'`
- Trả về danh sách sắp xếp theo thời gian mới nhất
- Ghi audit log `SEND_NOTIFICATION` khi gửi nhắc nhở

### Module 8: Settings (`/api/settings`)

**File:** `src/settings/settings.service.ts`, `settings.controller.ts`

| Endpoint | Quyền | Mô tả |
|---|---|---|
| `GET /api/settings` | JWT | Đọc cấu hình hiện tại |
| `PATCH /api/settings` | `CONFIG_SYSTEM` | Cập nhật cấu hình runtime |

**Cấu hình quản lý:**
- `appName`: Tên ứng dụng
- `jwtExpiresIn`: Thời hạn JWT
- `emailNotificationsEnabled`: Bật/tắt email
- `inAppNotificationsEnabled`: Bật/tắt thông báo trong app
- Database info và danh sách module (chỉ đọc)

### Module 9: Audit Logs (`/api/audit-logs`)

**File:** `src/audit-logs/audit-logs.service.ts`, `audit-logs.controller.ts`

| Endpoint | Quyền | Mô tả |
|---|---|---|
| `GET /api/audit-logs` | `AUDIT_VIEW` | Danh sách audit log (tìm kiếm, lọc, phân trang) |

**Lọc theo:** `search`, `maNhanVien`, `hanhDong`, `doiTuong`, `trangThai`, `fromDate`, `toDate`

### Bảo mật — Guards & Decorators

**`JwtAuthGuard`** (`src/common/guards/jwt-auth.guard.ts`):
- Tự động kiểm tra `Authorization: Bearer <token>` ở header
- Verify JWT với secret, gắn thông tin user vào `request.user`
- Throw `UnauthorizedException` nếu token sai hoặc hết hạn

**`PermissionsGuard`** (`src/common/guards/permissions.guard.ts`):
- Đọc metadata từ decorator `@Permissions('STAFF_VIEW', ...)`
- Kiểm tra `user.permissions` có chứa quyền yêu cầu không
- Throw `ForbiddenException` nếu không đủ quyền

**`@CurrentUser()`** — custom decorator lấy `request.user` trong controller

---

## III. Hướng dẫn Cài đặt & Chạy dự án

### Yêu cầu hệ thống

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

### 1. Clone dự án

```bash
git clone https://github.com/khomuc/QuanLyTaiSan.git
cd QuanLyTaiSan
```

### 2. Cài đặt dependencies

```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 3. Cấu hình môi trường

Tạo file `.env` ở thư mục gốc:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=quan_ly_tai_san_qr

JWT_SECRET=quan-ly-tai-san-secret
JWT_EXPIRES_IN=8h

PORT=3000
```

### 4. Khởi chạy

```bash
# Chạy backend (cổng 3000)
npm run start:dev

# Chạy frontend (cổng 5173) — terminal mới
npm run frontend:dev
```

Truy cập ứng dụng tại: **`http://localhost:5173/`**

> **Lưu ý:** Nếu chưa có database, có thể dùng chế độ **Demo** ngay trên giao diện để xem toàn bộ tính năng mà không cần kết nối DB.

### 5. Build production

```bash
# Build backend
npm run build

# Build frontend
npm run frontend:build

# Chạy production
npm run start:prod
```

---

## IV. Cấu trúc Database (MySQL)

Các bảng chính hệ thống sử dụng:

| Bảng | Mô tả |
|---|---|
| `NHAN_VIEN` | Nhân viên (mã, họ tên, email, mật khẩu, phòng ban, vai trò, trạng thái) |
| `PHONG_BAN` | Phòng ban |
| `VAI_TRO` | Vai trò hệ thống |
| `QUYEN` | Định nghĩa quyền |
| `VAI_TRO_QUYEN` | Mapping vai trò ↔ quyền |
| `TAI_SAN` | Tài sản cố định |
| `LOAI_TAI_SAN` | Danh mục loại tài sản |
| `PHIEU_DIEU_CHUYEN` | Phiếu điều chuyển tài sản |
| `PHIEU_DIEU_CHUYEN_NHAN_VIEN` | Người ký phiếu điều chuyển |
| `PHIEU_KIEM_KE` | Phiếu kiểm kê |
| `PHIEU_KIEM_KE_NHAN_VIEN` | Người ký phiếu kiểm kê |
| `AUDIT_LOG` | Log hoạt động toàn hệ thống |

---

## V. Danh sách Quyền Hệ thống

| Mã quyền | Mô tả |
|---|---|
| `STAFF_VIEW` | Xem danh sách nhân viên |
| `STAFF_CREATE` | Tạo nhân viên mới |
| `STAFF_EDIT` | Chỉnh sửa nhân viên |
| `STAFF_DELETE` | Xoá nhân viên |
| `ROLE_MANAGE` | Quản lý vai trò & phân quyền |
| `TRANSFER_APPROVE` | Ký duyệt phiếu điều chuyển |
| `INVENTORY_APPROVE` | Ký duyệt phiếu kiểm kê |
| `CONFIG_SYSTEM` | Cấu hình hệ thống |
| `AUDIT_VIEW` | Xem audit log |

---

## VI. Scripts hữu ích

```bash
npm run start:dev         # Chạy backend watch mode
npm run frontend:dev      # Chạy frontend dev server
npm run frontend:build    # Build frontend
npm run lint              # Kiểm tra lint
npm run test              # Chạy unit test
npm run test:e2e          # Chạy e2e test
npm run test:cov          # Test coverage
```

---
