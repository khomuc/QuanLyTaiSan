# 🗂️ Hệ Thống Quản Lý Tài Sản QR

> Ứng dụng web full-stack quản lý tài sản tổ chức bằng mã QR, phân quyền RBAC theo vai trò và từng nhân viên, quy trình ký duyệt điều chuyển & kiểm kê tài sản, ghi nhật ký audit toàn bộ hành động.

**Repository:** https://github.com/nnttkhiemmdays/QuanLyTaiSan  
**Branch phát triển:** `test`

---

## Mục Lục

1. [Giới Thiệu](#1-giới-thiệu)
2. [Thông Tin Team](#2-thông-tin-team)
3. [Tech Stack](#3-tech-stack)
4. [Cấu Trúc Project](#4-cấu-trúc-project)
5. [Hướng Dẫn Cài Đặt & Chạy](#5-hướng-dẫn-cài-đặt--chạy)
6. [Cấu Hình Môi Trường](#6-cấu-hình-môi-trường)
7. [Database & Migrations](#7-database--migrations)
8. [Tính Năng Chi Tiết](#8-tính-năng-chi-tiết)
9. [API Reference](#9-api-reference)
10. [Phân Quyền & Điều Hướng](#10-phân-quyền--điều-hướng)
11. [Demo Mode](#11-demo-mode)
12. [Bảo Mật](#12-bảo-mật)
13. [Tài Khoản Test](#13-tài-khoản-test)

---

## 1. Giới Thiệu

Hệ thống **Quản Lý Tài Sản QR** là ứng dụng web giúp tổ chức:

- **Quản lý tài sản** bằng mã QR — tạo, tra cứu, lọc theo loại / phòng ban / trạng thái.
- **Điều chuyển tài sản** giữa các phòng ban với quy trình ký duyệt nhiều vòng.
- **Kiểm kê định kỳ** với phiếu kiểm kê và quy trình phê duyệt tương tự.
- **Phân quyền RBAC** — 4 vai trò chuẩn: `ADMIN`, `MANAGER`, `ACCOUNTANT`, `STAFF`.
- **Override quyền từng nhân viên** — cấp thêm hoặc thu hồi quyền riêng lẻ so với vai trò.
- **Audit logging** — ghi lại toàn bộ hành động: ai, làm gì, khi nào.
- **Email notifications** — tự động gửi mail khi có phiếu chờ ký duyệt.
- **Demo mode** — tự động fallback sang dữ liệu mẫu khi backend chưa sẵn sàng.

---

## 2. Thông Tin Team

| STT | Họ và Tên | MSSV | Vai Trò | Phạm Vi |
|:---:|-----------|:----:|---------|---------|
| 1 | **Nguyễn Thị Huỳnh Như** | B2204960 | Team Lead | Auth, RBAC, Frontend infrastructure, Dashboard, Profile, Email service |
| 2 | Nguyễn Minh Khôi | B2204941 | Asset Management | Asset CRUD, danh sách, lọc, QR, báo cáo |
| 3 | Đỗ Minh Mẫn | B2104812 | Inventory | Kiểm kê, phê duyệt kiểm kê, báo cáo |
| 4 | Nguyễn Phú Bình | B2204923 | Transfer | Điều chuyển tài sản, ký duyệt, báo cáo |

---

## 3. Tech Stack

### Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|---------|
| NestJS | 11.0.1 | Framework backend chính |
| MySQL2 | 3.22.3 | Driver kết nối MySQL (raw pool, không dùng ORM) |
| TypeORM | 0.3.29 | Dependency (khai báo nhưng logic dùng mysql2 pool trực tiếp) |
| @nestjs/jwt | 11.0.2 | Access token + Refresh token (JWT HS256) |
| Bcryptjs | 3.0.3 | Hash mật khẩu (12 rounds) |
| Nodemailer | 8.0.10 | Gửi email (SMTP / Gmail / SendGrid) |
| class-validator | 0.15.1 | Validation DTO đầu vào |
| class-transformer | 0.5.1 | Transform query params (số nguyên, v.v.) |

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|---------|
| React | 19.0.0 | UI Framework |
| TypeScript | 5.7.3 | Type safety |
| Vite | 6.0.0 | Build tool & Dev server |
| React Router DOM | 6.20.0 | Client-side routing |
| Lucide React | 0.468.0 | Icon library |

### Infrastructure

| Công nghệ | Mục đích |
|-----------|---------|
| MySQL 8.0+ | Cơ sở dữ liệu chính |
| Node.js 18+ | Runtime |

---

## 4. Cấu Trúc Project

```
QuanLyTaiSan/
├── frontend/                          ← React + Vite frontend
│   └── src/
│       ├── main.tsx                   ← Entry: BrowserRouter > AuthProvider > App
│       ├── App.tsx                    ← Router gốc: auth-gate + AppContent
│       │
│       ├── contexts/
│       │   └── AuthContext.tsx        ← AuthProvider, useAuth()
│       │                                 (user, token, loading, initialized,
│       │                                  apiMode, login, logout, loginSuccess,
│       │                                  reloadProfile)
│       │
│       ├── components/
│       │   ├── AppContent.tsx         ← Orchestrator: state, data loading,
│       │   │                             CRUD handlers, <Routes> con
│       │   ├── AppLayout.tsx          ← Shell: Sidebar + Topbar + <Outlet />
│       │   ├── Sidebar.tsx            ← Nav sidebar (collapsible, persist localStorage)
│       │   ├── EmployeeModal.tsx      ← Modal tạo / chỉnh sửa nhân viên
│       │   ├── EmployeesPage.tsx      ← Component nhân viên (trong components/)
│       │   ├── RolesPage.tsx          ← Component vai trò (trong components/)
│       │   ├── Toast.tsx              ← Thông báo toast
│       │   └── ui.tsx                 ← Shared UI primitives
│       │
│       ├── pages/                     ← 11 page components (React.lazy)
│       │   ├── LoginScreen.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── AssetsPage.tsx
│       │   ├── EmployeesPage.tsx
│       │   ├── StaffManagementPage.tsx  ← Phân quyền từng nhân viên
│       │   ├── RolesPage.tsx
│       │   ├── ApprovalsPage.tsx
│       │   ├── NotificationsPage.tsx
│       │   ├── SettingsPage.tsx
│       │   ├── AuditPage.tsx
│       │   └── ProfilePage.tsx
│       │
│       └── lib/
│           ├── api.ts                 ← HTTP client (Bearer token, auto-refresh)
│           ├── types.ts               ← TypeScript interfaces
│           ├── navigation.ts          ← Nav items + getVisibleNavItems(user)
│           └── mockData.ts            ← Dữ liệu demo fallback
│
├── src/                               ← NestJS backend
│   ├── main.ts                        ← Bootstrap: CORS, prefix /api, ValidationPipe
│   ├── app.module.ts                  ← Root module
│   ├── database.module.ts             ← MySQL connection pool (global)
│   │
│   ├── auth/                          ← Login, JWT, refresh token rotation
│   ├── employees/                     ← Employee CRUD + permission override
│   ├── roles/                         ← Vai trò, quyền, gán quyền
│   ├── assets/                        ← Tài sản, danh mục
│   ├── dashboard/                     ← Thống kê tổng quan
│   ├── approvals/                     ← Ký duyệt điều chuyển + kiểm kê
│   ├── notifications/                 ← In-app + email notifications
│   ├── settings/                      ← Cấu hình runtime hệ thống
│   ├── audit-logs/                    ← Lịch sử hành động
│   ├── mailer/                        ← Email service (SMTP/Gmail/SendGrid)
│   └── common/
│       ├── constants.ts
│       ├── decorators/
│       │   ├── current-user.decorator.ts
│       │   └── permissions.decorator.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts      ← Xác thực JWT
│       │   └── permissions.guard.ts   ← Kiểm tra quyền (ADMIN bypass tất cả)
│       └── interfaces/
│           └── auth-user.interface.ts
│
├── migrations/
│   ├── 001_add_refresh_token_table.sql   ← Bảng REFRESH_TOKEN
│   └── 002_add_nhan_vien_quyen.sql       ← Bảng NHAN_VIEN_QUYEN (override quyền)
│
├── docs/
│   ├── LOGIN_GUIDE.md
│   ├── TEST_CASES.md
│   ├── SECURITY_AUDIT.md
│   └── BUGFIX_README.md
│
├── .env.example
└── package.json
```

---

## 5. Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu

- Node.js **18+**
- MySQL **8.0+**
- Git

### Bước 1 — Clone & checkout branch

```bash
git clone https://github.com/nnttkhiemmdays/QuanLyTaiSan.git
cd QuanLyTaiSan
git checkout test
```

### Bước 2 — Cấu hình môi trường

```bash
cp .env.example .env
# Mở .env và điền thông tin thực tế (xem mục 6)
```

### Bước 3 — Cài đặt dependencies

```bash
# Backend
npm install

# Frontend
npm install --prefix frontend
```

### Bước 4 — Khởi tạo database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE quan_ly_tai_san
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Sau khi tạo DB, chạy migrations (xem mục 7).

### Bước 5 — Chạy development

Mở **hai terminal** song song:

```bash
# Terminal 1 — Backend (http://localhost:3000)
npm run start:dev

# Terminal 2 — Frontend (http://localhost:5173)
npm run frontend:dev
```

Vite proxy tự động forward `/api/*` → `http://localhost:3000`.

### Chạy production

```bash
# Build backend
npm run build
npm run start:prod

# Build frontend
npm run frontend:build
```

---

## 6. Cấu Hình Môi Trường

File `.env.example` (minh họa):

```dotenv
# ── Database ─────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quan_ly_tai_san

# ── JWT ──────────────────────────────────────────────
JWT_SECRET=your-secret-key-at-least-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ── Email — chọn một provider ─────────────────────────
MAIL_PROVIDER=smtp            # smtp | gmail | sendgrid
MAIL_FROM=noreply@quanlytaisan.local

# Option 1: SMTP thông thường
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Option 2: Gmail App Password
# MAIL_PROVIDER=gmail
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Option 3: SendGrid
# MAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=SG.xxxxx...

# ── App ──────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

> **Tạo Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords.

---

## 7. Database & Migrations

### Schema chính

Backend dùng **raw MySQL pool** (`mysql2/promise`), không dùng ORM synchronize. Bảng phải được tạo thủ công từ schema SQL của dự án.

### Migrations bổ sung

Sau khi tạo schema gốc, chạy thêm 2 migration theo thứ tự:

```bash
# Migration 1: Bảng REFRESH_TOKEN (refresh token rotation)
mysql -u root -p quan_ly_tai_san < migrations/001_add_refresh_token_table.sql

# Migration 2: Bảng NHAN_VIEN_QUYEN (override quyền từng nhân viên)
mysql -u root -p quan_ly_tai_san < migrations/002_add_nhan_vien_quyen.sql
```

### Các bảng liên quan đến auth & phân quyền

| Bảng | Mục đích |
|------|---------|
| `NHAN_VIEN` | Thông tin nhân viên + mật khẩu |
| `PHONG_BAN` | Danh sách phòng ban |
| `VAI_TRO` | Danh sách vai trò |
| `QUYEN` | Danh sách tất cả quyền trong hệ thống |
| `VAI_TRO_QUYEN` | Quyền mặc định theo vai trò |
| `NHAN_VIEN_QUYEN` | Override quyền riêng từng nhân viên |
| `REFRESH_TOKEN` | Refresh token (SHA-256 hash, hỗ trợ rotation) |
| `AUDIT_LOG` | Nhật ký hành động |

---

## 8. Tính Năng Chi Tiết

### Authentication

- Đăng nhập bằng `email` + `matKhau`.
- Trả về **access token** (JWT HS256, 24h) và **refresh token** (7d).
- Access token lưu trong `localStorage` (key: `qlts_access_token`).
- Refresh token lưu trong `localStorage` (key: `qlts_refresh_token`), hash SHA-256 lưu DB.
- Auto-refresh token khi API trả về 401 — queues các request đang chờ, rồi retry sau khi refresh xong.
- Token rotation: mỗi lần refresh, refresh token cũ bị revoke ngay, cấp token mới.
- Đổi mật khẩu revoke toàn bộ refresh token cũ (security best practice).

### RBAC & Phân Quyền

**Luồng xác định quyền khi login / gọi `/auth/me`:**

```
1. Đọc quyền của vai trò từ VAI_TRO_QUYEN
2. Kiểm tra NHAN_VIEN_QUYEN có dữ liệu không:
   - Có → dùng TOÀN BỘ quyền cá nhân (override vai trò)
   - Không → dùng quyền của vai trò
3. Nhúng permissions[] vào JWT payload
```

**PermissionsGuard:**
- `ADMIN` role → bypass mọi kiểm tra, luôn được phép.
- Các role khác → phải có ít nhất một trong các permission yêu cầu.

### Quản Lý Nhân Viên

- Danh sách với tìm kiếm + lọc theo phòng ban / vai trò / trạng thái.
- Tạo / chỉnh sửa nhân viên qua modal.
- Soft-delete: set `TrangThai = 'INACTIVE'` (không xóa DB).
- Phân trang (mặc định 20 items/trang, tối đa 100).

### Phân Quyền Từng Nhân Viên (`StaffManagementPage`)

- Admin chọn nhân viên → tải quyền cá nhân từ API (`GET /employees/:id/permissions`).
- Nếu nhân viên chưa có override → hiển thị quyền mặc định của vai trò.
- Tích / bỏ tích từng quyền → nhấn **Lưu quyền hạn** → gọi `PUT /employees/:id/permissions`.
- Override lưu vào bảng `NHAN_VIEN_QUYEN`, có hiệu lực ngay khi nhân viên đăng nhập lại.
- Nút **Đặt lại** → khôi phục về quyền mặc định của vai trò.

### Tài Sản

- Danh sách với tìm kiếm + lọc theo loại tài sản / phòng ban / trạng thái.
- Trạng thái tài sản: `HOAT_DONG`, `BAO_TRI`, `HONG`.
- Phân trang.

### Dashboard

- Tổng số nhân viên theo trạng thái.
- Tổng số tài sản theo trạng thái.
- Số phiếu chờ ký duyệt (điều chuyển + kiểm kê).
- 10 audit log gần nhất.

### Ký Duyệt

- Danh sách phiếu chờ ký của người dùng hiện tại.
- Hỗ trợ 2 loại: **điều chuyển tài sản** và **kiểm kê**.
- Ký duyệt hoặc từ chối kèm ghi chú lý do.
- Gán người phê duyệt cho từng vòng ký.

### Thông Báo

- Danh sách phiếu chờ ký của người dùng.
- Gửi email nhắc nhở phê duyệt (cần quyền `TRANSFER_APPROVE` hoặc `INVENTORY_APPROVE`).

### Email Service

Hỗ trợ 3 provider cấu hình qua biến môi trường:
- `smtp` — SMTP server tùy chỉnh.
- `gmail` — Gmail App Password.
- `sendgrid` — SendGrid API Key.

### Audit Logging

- Ghi lại tất cả hành động quan trọng: đăng nhập, tạo/sửa/xóa nhân viên, phân quyền, thay đổi cấu hình, ký duyệt.
- Lọc theo nhân viên, hành động, đối tượng, trạng thái, khoảng thời gian.
- Phân trang.

### Cấu Hình Hệ Thống (Admin only)

Lưu runtime (reset khi restart server):
- `appName` — tên ứng dụng.
- `jwtExpiresIn` — thời hạn JWT.
- `emailNotificationsEnabled` — bật/tắt gửi email.
- `inAppNotificationsEnabled` — bật/tắt thông báo in-app.

### Demo Mode

Khi backend không phản hồi, `AuthContext` và `AppContent` tự động fallback về `mockData.ts`:
- Tất cả màn hình hiển thị với dữ liệu mẫu.
- Topbar hiển thị badge **DEMO** (cam) hoặc **API** (xanh).
- Bấm "Dùng Demo" trên màn hình login → vào ngay với quyền Admin, không cần backend.

---

## 9. API Reference

Base URL: `http://localhost:3000/api`

> Tất cả endpoints (trừ `/auth/login`, `/auth/refresh`) yêu cầu header:
> ```
> Authorization: Bearer <access_token>
> ```

### Auth

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| POST | `/auth/login` | Public | Đăng nhập → `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | Public | Refresh token → cặp token mới (token rotation) |
| POST | `/auth/logout` | Logged in | Revoke refresh token |
| GET | `/auth/me` | Logged in | Thông tin + quyền người dùng hiện tại |
| PATCH | `/auth/me` | Logged in | Cập nhật thông tin cá nhân |
| PATCH | `/auth/password` | Logged in | Đổi mật khẩu `{ matKhauCu, matKhauMoi }` |
| GET | `/auth/departments` | Logged in | Danh sách phòng ban (dùng cho form profile) |

### Employees

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/employees` | `STAFF_VIEW` | Danh sách nhân viên (query: `search`, `maPhongBan`, `maVaiTro`, `trangThai`, `page`, `limit`) |
| GET | `/employees/meta/departments` | `STAFF_VIEW` | Danh sách phòng ban |
| GET | `/employees/:maNhanVien` | `STAFF_VIEW` | Chi tiết một nhân viên |
| GET | `/employees/:maNhanVien/permissions` | `STAFF_MANAGE` \| `ROLE_MANAGE` | Quyền cá nhân đã override của nhân viên |
| POST | `/employees` | `STAFF_CREATE` | Tạo nhân viên mới |
| PATCH | `/employees/:maNhanVien` | `STAFF_EDIT` | Cập nhật thông tin nhân viên |
| DELETE | `/employees/:maNhanVien` | `STAFF_DELETE` | Vô hiệu hóa nhân viên (soft-delete) |
| PUT | `/employees/:maNhanVien/permissions` | `STAFF_MANAGE` \| `ROLE_MANAGE` | Lưu override quyền cá nhân `{ maQuyen: string[] }` |

### Assets

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/assets` | `ASSET_VIEW` | Danh sách tài sản (query: `search`, `maLoai`, `maPhongBan`, `trangThai`, `page`, `limit`) |
| GET | `/assets/meta/categories` | `ASSET_VIEW` | Danh sách loại tài sản |
| GET | `/assets/:maTaiSan` | `ASSET_VIEW` | Chi tiết một tài sản |

### Roles & Permissions

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/roles` | `ROLE_MANAGE` | Danh sách vai trò kèm quyền |
| POST | `/roles` | `ROLE_MANAGE` | Tạo vai trò mới |
| GET | `/roles/permissions` | `ROLE_MANAGE` | Danh sách tất cả quyền (query: `module`) |
| POST | `/roles/permissions` | `ROLE_MANAGE` | Tạo quyền mới |
| PATCH | `/roles/permissions/:maQuyen` | `ROLE_MANAGE` | Cập nhật thông tin quyền |
| GET | `/roles/:maVaiTro` | `ROLE_MANAGE` | Chi tiết một vai trò |
| PATCH | `/roles/:maVaiTro` | `ROLE_MANAGE` | Cập nhật vai trò |
| PUT | `/roles/:maVaiTro/permissions` | `ROLE_MANAGE` | Gán quyền cho vai trò `{ maQuyen: string[] }` |
| DELETE | `/roles/:maVaiTro` | `ROLE_MANAGE` | Xóa vai trò (trừ ADMIN, NHAN_VIEN, GUEST) |

### Dashboard

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/dashboard/overview` | Logged in | Thống kê tổng quan |

### Approvals

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/approvals/pending` | Logged in | Phiếu chờ ký của user hiện tại |
| GET | `/approvals/transfer/:soPhieu/approvers` | `TRANSFER_APPROVE` | Danh sách người ký duyệt phiếu điều chuyển |
| PUT | `/approvals/transfer/:soPhieu/approvers` | `TRANSFER_APPROVE` | Gán người ký duyệt |
| POST | `/approvals/transfer/:soPhieu/sign` | `TRANSFER_APPROVE` | Ký / từ chối phiếu điều chuyển |
| GET | `/approvals/inventory/:maKiemKe/approvers` | `INVENTORY_APPROVE` | Danh sách người ký duyệt phiếu kiểm kê |
| PUT | `/approvals/inventory/:maKiemKe/approvers` | `INVENTORY_APPROVE` | Gán người ký duyệt |
| POST | `/approvals/inventory/:maKiemKe/sign` | `INVENTORY_APPROVE` | Ký / từ chối phiếu kiểm kê |

### Notifications

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/notifications` | Logged in | Thông báo phiếu chờ ký của user |
| POST | `/notifications/approval-reminder` | `TRANSFER_APPROVE` \| `INVENTORY_APPROVE` | Gửi email nhắc nhở phê duyệt |

### Settings

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/settings` | `CONFIG_SYSTEM` | Cấu hình hệ thống hiện tại |
| PATCH | `/settings` | `CONFIG_SYSTEM` | Cập nhật cấu hình runtime |

### Audit Logs

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/audit-logs` | `AUDIT_VIEW` | Danh sách log (query: `search`, `maNhanVien`, `hanhDong`, `doiTuong`, `trangThai`, `fromDate`, `toDate`, `page`, `limit`) |
| GET | `/audit-logs/:maLog` | `AUDIT_VIEW` | Chi tiết một log entry |

---

## 10. Phân Quyền & Điều Hướng

### Bảng quyền theo module

| Quyền | Module | Mô tả |
|-------|--------|-------|
| `ASSET_VIEW` | Tài sản | Xem danh sách và chi tiết tài sản |
| `STAFF_VIEW` | Nhân viên | Xem danh sách nhân viên |
| `STAFF_CREATE` | Nhân viên | Tạo nhân viên mới |
| `STAFF_EDIT` | Nhân viên | Chỉnh sửa thông tin nhân viên |
| `STAFF_DELETE` | Nhân viên | Vô hiệu hóa nhân viên |
| `STAFF_MANAGE` | Nhân viên | Override quyền từng nhân viên |
| `ROLE_MANAGE` | Vai trò | Quản lý vai trò và quyền |
| `APPROVAL_VIEW` | Ký duyệt | Xem danh sách phê duyệt |
| `TRANSFER_APPROVE` | Ký duyệt | Ký/từ chối phiếu điều chuyển |
| `INVENTORY_APPROVE` | Ký duyệt | Ký/từ chối phiếu kiểm kê |
| `CONFIG_SYSTEM` | Cấu hình | Quản lý cấu hình hệ thống |
| `AUDIT_VIEW` | Log | Xem audit log |

### Điều hướng frontend

| Mục | Route | Quyền yêu cầu |
|-----|-------|--------------|
| Tổng quan | `/dashboard` | *(luôn hiển thị)* |
| Tài sản | `/assets` | `ASSET_VIEW` |
| Nhân viên | `/employees` | `STAFF_VIEW` |
| Quản lý nhân viên | `/staff-management` | `STAFF_MANAGE` hoặc `ROLE_MANAGE` |
| Vai trò & quyền | `/roles` | `ROLE_MANAGE` |
| Ký duyệt | `/approvals` | `APPROVAL_VIEW` |
| Thông báo | `/notifications` | *(luôn hiển thị)* |
| Cấu hình | `/settings` | `SETTINGS_MANAGE` |
| Giám sát log | `/audit` | `AUDIT_VIEW` |
| Tài khoản | `/profile` | *(luôn hiển thị)* |

> **ADMIN role** bypass tất cả kiểm tra quyền ở backend (`PermissionsGuard`) và thấy toàn bộ menu ở frontend.

---

## 11. Demo Mode

Khi backend không chạy hoặc không kết nối được DB:

- Frontend **tự động** phát hiện lỗi API và dùng `mockData.ts` làm fallback.
- Mọi thao tác CRUD hoạt động trên dữ liệu local trong bộ nhớ.
- Badge **DEMO** màu cam xuất hiện trên topbar.
- Badge **API** màu xanh khi kết nối backend thành công.
- Bấm **"Dùng Demo"** trên màn hình login → vào ngay với quyền Admin, không cần server.

---

## 12. Bảo Mật

### Đã triển khai

| Hạng mục | Chi tiết |
|----------|---------|
| Bcrypt password hashing | 12 salt rounds |
| JWT authentication | HS256, access 24h + refresh 7d |
| Refresh token rotation | One-time use, hash lưu DB, revoke ngay khi dùng |
| RBAC | `PermissionsGuard` trên toàn bộ protected routes |
| SQL injection | Parameterized queries (`mysql2` `execute()`) |
| Input validation | `class-validator` + `ValidationPipe` (whitelist, forbidNonWhitelisted) |
| XSS | Không render HTML từ user input |
| Audit logging | Ghi lại toàn bộ hành động quan trọng |

### Chưa triển khai (cần bổ sung)

| Hạng mục | Ưu tiên |
|----------|:-------:|
| Rate limiting (`@nestjs/throttler`) | 🔴 Cao |
| Security headers (Helmet) | 🔴 Cao |
| CORS cấu hình chính xác (hiện `enableCors()` cho phép tất cả) | 🟡 Trung bình |
| Database indexes tối ưu | 🟡 Trung bình |

---

## 13. Tài Khoản Test

| Email | Mật khẩu | Vai trò | Quyền |
|-------|:--------:|---------|-------|
| `admin@example.com` | `123456` | ADMIN | Toàn quyền |
| `manager@example.com` | `123456` | MANAGER | Quản lý phòng ban |
| `accountant@example.com` | `123456` | ACCOUNTANT | Xem & báo cáo tài sản |
| `staff@example.com` | `123456` | STAFF | Nhân viên cơ bản |

> **Demo nhanh:** Bấm "Dùng Demo" trên màn hình đăng nhập để vào hệ thống với dữ liệu mẫu — không cần backend hay database.

---

## Scripts Tham Khảo

```bash
# Backend
npm run start:dev        # Dev mode (watch)
npm run start:debug      # Debug mode
npm run build            # Build production
npm run start:prod       # Chạy production build
npm run test             # Unit tests
npm run test:cov         # Coverage report
npm run test:e2e         # E2E tests
npm run lint             # ESLint + fix

# Frontend
npm run frontend:dev     # Dev server (port 5173)
npm run frontend:build   # Build production
npm run frontend:preview # Preview production build
```

---

*Maintained by Team Lead: **Nguyễn Thị Huỳnh Như** — [@nnhuwz03](https://github.com/nnhuwz03)*
