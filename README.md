# 🗂️ Hệ Thống Quản Lý Tài Sản QR

> **Asset Management System** — Quản lý tài sản tổ chức bằng mã QR, phân quyền RBAC, quy trình phê duyệt và kiểm kê tự động.

**Repository:** <https://github.com/khomuc/QuanLyTaiSan>  
**Branch đang phát triển:** `test`  
**Cập nhật lần cuối:** 2025-06-08

---

## 📋 Mục Lục

1. [Giới Thiệu Dự Án](#1-giới-thiệu-dự-án)
2. [Thông Tin Team](#2-thông-tin-team)
3. [Tech Stack](#3-tech-stack)
4. [Cấu Trúc Project](#4-cấu-trúc-project)
5. [Hướng Dẫn Cài Đặt & Chạy](#5-hướng-dẫn-cài-đặt--chạy)
6. [Cấu Hình Môi Trường](#6-cấu-hình-môi-trường)
7. [Tính Năng Hệ Thống](#7-tính-năng-hệ-thống)
8. [API Endpoints](#8-api-endpoints)
9. [Kiểm Thử](#9-kiểm-thử)
10. [Bảo Mật](#10-bảo-mật)
11. [Tiến Độ Phát Triển](#11-tiến-độ-phát-triển)
12. [Tài Liệu Liên Quan](#12-tài-liệu-liên-quan)

---

## 1. Giới Thiệu Dự Án

Hệ thống **Quản Lý Tài Sản QR** là ứng dụng web full-stack giúp tổ chức:

- **Quản lý tài sản** bằng mã QR — tạo, in, quét và tra cứu nhanh.
- **Kiểm kê định kỳ** với QR scanning thực tế.
- **Điều chuyển tài sản** giữa các phòng ban kèm ký duyệt.
- **Phân quyền RBAC** — Admin / Manager / Accountant / Staff.
- **Ghi đè quyền (Permission Override)** cấp độ từng nhân viên.
- **Audit logging** toàn bộ hành động người dùng.
- **Email notifications** cho các luồng phê duyệt.
- **Demo mode** — tự động fallback sang dữ liệu mẫu khi backend chưa sẵn sàng.

---

## 2. Thông Tin Team

| STT | Họ và Tên                | MSSV     | Vai Trò              | Phạm Vi Công Việc                                              |
| --- | ------------------------ | -------- | -------------------- | -------------------------------------------------------------- |
| 1   | **Nguyễn Thị Huỳnh Như** | B2204960 | Team Lead            | Auth, RBAC, Frontend Infrastructure, Dashboard, Profile, Email |
| 2   | Nguyễn Minh Khôi         | B2204941 | Asset Management     | Asset CRUD, Danh sách, Import/Export, QR Print, Báo cáo        |
| 3   | Đỗ Minh Mẫn              | B2104812 | Inventory Management | Kiểm kê, QR Scanning, Tổng hợp, Báo cáo                        |
| 4   | Nguyễn Phú Bình          | B2204923 | Transfer Management  | Điều chuyển tài sản, Ký duyệt, Báo cáo                         |

> **Liên hệ Team Lead:** [@nnhuwz03](https://github.com/nnhuwz03) — hoặc tạo issue trên GitHub.

---

## 3. Tech Stack

### Frontend

| Công nghệ        | Phiên bản | Mục đích                |
| ---------------- | --------- | ----------------------- |
| React            | 19.0.0    | UI Framework            |
| TypeScript       | 5.7.3     | Type safety             |
| Vite             | 6.0.0     | Build tool & Dev server |
| React Router DOM | 6.20.0    | Client-side routing     |
| Lucide React     | 0.468.0   | Icons                   |

### Backend

| Công nghệ       | Phiên bản | Mục đích          |
| --------------- | --------- | ----------------- |
| NestJS          | 11.0.1    | Backend Framework |
| TypeORM         | 0.3.29    | ORM               |
| MySQL2          | 3.22.3    | Cơ sở dữ liệu     |
| @nestjs/jwt     | 11.0.2    | JSON Web Token    |
| Bcryptjs        | 3.0.3     | Mã hóa mật khẩu   |
| Nodemailer      | 8.0.10    | Gửi email         |
| class-validator | 0.15.1    | Validation DTO    |

---

## 4. Cấu Trúc Project

```
QuanLyTaiSan/
├── frontend/                         ← React + Vite frontend
│   └── src/
│       ├── main.tsx                  ← Entry point: BrowserRouter > AuthProvider > App
│       ├── App.tsx                   ← Slim router (~30 dòng): auth-gate + delegate AppContent
│       │
│       ├── contexts/                 ← React Context providers
│       │   └── AuthContext.tsx       ← AuthProvider, useAuth hook
│       │                               (user, token, loading, initialized, apiMode,
│       │                                login, logout, loginSuccess, reloadProfile)
│       │
│       ├── components/               ← Shared UI components
│       │   ├── AppContent.tsx        ← Orchestrator: toàn bộ state, data loading,
│       │   │                           CRUD handlers và <Routes> con
│       │   ├── AppLayout.tsx         ← Layout shell: Sidebar + Topbar + <Outlet />
│       │   ├── Sidebar.tsx           ← Collapsible nav sidebar (desktop/mobile)
│       │   ├── EmployeeModal.tsx     ← Modal tạo/chỉnh sửa nhân viên
│       │   └── Toast.tsx             ← Thông báo thành công/lỗi
│       │
│       ├── pages/                    ← 11 page components (lazy-loaded)
│       │   ├── LoginScreen.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── AssetsPage.tsx
│       │   ├── EmployeesPage.tsx
│       │   ├── StaffManagementPage.tsx  ← MỚI: quản lý quyền theo từng nhân viên
│       │   ├── RolesPage.tsx
│       │   ├── ApprovalsPage.tsx
│       │   ├── NotificationsPage.tsx
│       │   ├── SettingsPage.tsx
│       │   ├── AuditPage.tsx
│       │   └── ProfilePage.tsx
│       │
│       ├── lib/                      ← Utilities & shared logic
│       │   ├── api.ts                ← Fetch client (Bearer token, tất cả endpoints)
│       │   ├── types.ts              ← TypeScript interfaces & types
│       │   ├── navigation.ts         ← Nav items + getVisibleNavItems(user)
│       │   └── mockData.ts           ← Dữ liệu demo fallback
│       │
│       └── styles/
│           └── index.css
│
├── src/                              ← NestJS backend
│   ├── auth/                         ← Login, JWT, Bcrypt, /auth/me, /auth/password
│   ├── employees/                    ← Employee CRUD & quản lý
│   ├── roles/                        ← RBAC, permissions, assignPermissions
│   ├── assets/                       ← Asset CRUD, categories
│   ├── dashboard/                    ← Thống kê tổng quan
│   ├── audit-logs/                   ← Ghi lịch sử hành động
│   ├── notifications/                ← Email + in-app alerts
│   ├── approvals/                    ← Workflow ký duyệt (transfer + inventory)
│   ├── settings/                     ← Cấu hình hệ thống
│   ├── mailer/                       ← Email service (SMTP / Gmail / SendGrid)
│   ├── common/                       ← Guards, decorators, interceptors
│   ├── database.module.ts
│   └── main.ts
│
├── docs/
│   ├── LOGIN_GUIDE.md                ← Hướng dẫn đăng nhập & phân quyền
│   ├── TEST_CASES.md                 ← 16 test cases
│   └── SECURITY_AUDIT.md
│
├── .env.example                      ← Template cấu hình môi trường
├── package.json                      ← Backend dependencies & scripts
└── README.md
```

---

## 5. Hướng Dẫn Cài Đặt & Chạy

### Yêu Cầu Hệ Thống

- **Node.js** 18 trở lên
- **MySQL** 8.0 trở lên
- **Git**

### Bước 1 — Clone & Checkout Branch

```bash
git clone https://github.com/khomuc/QuanLyTaiSan.git
cd QuanLyTaiSan
git checkout test
```

### Bước 2 — Cấu Hình Môi Trường

```bash
cp .env.example .env
# Mở file .env và điền thông tin thực tế của bạn
```

Xem chi tiết các biến cần thiết ở [mục 6](#6-cấu-hình-môi-trường).

### Bước 3 — Cài Đặt Dependencies

```bash
# Backend
npm install

# Frontend
npm install --prefix frontend
```

### Bước 4 — Khởi Tạo Database

```bash
mysql -u root -p
```

Sau khi đăng nhập MySQL:

```sql
CREATE DATABASE quan_ly_tai_san CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

TypeORM sẽ tự tạo bảng khi ứng dụng khởi động lần đầu (`synchronize: true` trong dev mode).

### Bước 5 — Chạy Development

Mở **hai terminal** song song:

```bash
# Terminal 1 — Backend (http://localhost:3000)
npm run start:dev

# Terminal 2 — Frontend (http://localhost:5173)
npm run frontend:dev
```

> **Lưu ý:** Nếu backend chưa sẵn sàng, frontend sẽ tự động chuyển sang **Demo mode** (fallback `mockData`). Thanh trạng thái góc trên hiển thị `API` hoặc `DEMO` để phân biệt.

### Chạy Production

```bash
# Build backend
npm run build
npm run start:prod

# Build frontend
npm run frontend:build
```

---

## 6. Cấu Hình Môi Trường

File `.env` (tạo từ `.env.example`):

```env
# ── Database ─────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quan_ly_tai_san

# ── JWT ──────────────────────────────────────
JWT_SECRET=your-secret-key-at-least-32-characters
JWT_EXPIRES_IN=24h

# ── Email — chọn một trong các provider ──────
MAIL_PROVIDER=smtp          # smtp | gmail | sendgrid
MAIL_FROM=noreply@quanlytaisan.local

# Option 1: SMTP chung
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Option 2: Gmail (App Password)
# MAIL_PROVIDER=gmail
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Option 3: SendGrid
# MAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=SG.xxxxx...

# ── App ──────────────────────────────────────
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

> **Tạo Gmail App Password:** Tài khoản Google → Bảo mật → Xác minh 2 bước → App Passwords.

---

## 7. Tính Năng Hệ Thống

### Authentication & Authorization

- Đăng nhập bằng email + mật khẩu.
- JWT token có thời hạn 24 giờ, lưu trong `localStorage` (key: `qlts_access_token`).
- Mật khẩu được mã hóa bằng Bcrypt.
- RBAC với 4 vai trò: `ADMIN`, `MANAGER`, `ACCOUNTANT`, `STAFF`.
- `JwtAuthGuard` bảo vệ toàn bộ API endpoints.
- **`AuthContext`** quản lý trạng thái xác thực toàn cục:
  - `initialized` — đã kiểm tra token lưu trữ lần đầu chưa.
  - `apiMode: 'api' | 'demo'` — cho biết đang dùng backend thật hay dữ liệu demo.
  - `loginSuccess(result)` — cập nhật state sau khi login thành công từ `LoginScreen`.
  - `reloadProfile()` — làm mới thông tin user hiện tại.

### Demo Mode (Offline Fallback)

Khi backend không phản hồi, `AppContent` tự động fallback về `mockData`:
- Tất cả thao tác CRUD vẫn hoạt động trên dữ liệu local.
- Pill `DEMO` màu cam xuất hiện trên topbar.
- Pill `API` màu xanh khi kết nối backend thành công.

### Điều Hướng Theo Quyền

`getVisibleNavItems(user)` trong `lib/navigation.ts` lọc menu theo `user.permissions`:
- User có `permissions: ['*']` (Admin/Demo) thấy tất cả 10 mục.
- Các mục có `requiredPermissions` chỉ hiện khi user có ít nhất một quyền phù hợp.

| Nav item            | Route              | Quyền yêu cầu                        |
| ------------------- | ------------------ | ------------------------------------- |
| Tổng quan           | `/dashboard`       | *(luôn hiển thị)*                     |
| Tài sản             | `/assets`          | `ASSET_VIEW`                          |
| Nhân viên           | `/employees`       | `STAFF_VIEW`                          |
| Quản lý nhân viên   | `/staff-management`| `STAFF_MANAGE` hoặc `ROLE_MANAGE`     |
| Vai trò & quyền     | `/roles`           | `ROLE_MANAGE`                         |
| Ký duyệt            | `/approvals`       | `APPROVAL_VIEW`                       |
| Thông báo           | `/notifications`   | *(luôn hiển thị)*                     |
| Cấu hình            | `/settings`        | `SETTINGS_MANAGE`                     |
| Giám sát log        | `/audit`           | `AUDIT_VIEW`                          |
| Tài khoản           | `/profile`         | *(luôn hiển thị)*                     |

### Dashboard

- Thống kê tổng số nhân viên, tài sản theo trạng thái.
- Số lượng phê duyệt đang chờ xử lý (transfer + inventory).
- Audit logs hoạt động gần đây.
- Quick stats cards theo vai trò người dùng.

### Quản Lý Nhân Viên

- Danh sách có tìm kiếm, lọc theo phòng ban / vai trò / trạng thái.
- Tạo, chỉnh sửa thông tin nhân viên qua `EmployeeModal`.
- Vô hiệu hóa tài khoản (soft delete — `trangThai: 'INACTIVE'`).

### Quản Lý Quyền Nhân Viên (`StaffManagementPage`) *(MỚI)*

- Chọn nhân viên từ danh sách (lọc theo phòng ban / vai trò / trạng thái / tìm kiếm).
- Xem quyền theo **module** (Tài sản, Nhân viên, Vai trò, Ký duyệt, Cấu hình, Log).
- Tích/bỏ tích từng quyền và lưu **Permission Override** trực tiếp cho nhân viên đó.
- Hiển thị avatar initials, thông tin phòng ban và vai trò.

### Quản Lý Tài Sản *(Nguyễn Minh Khôi)*

- CRUD tài sản đầy đủ.
- Sinh mã QR và in nhãn.
- Import/Export danh sách tài sản.
- Lọc nâng cao: loại tài sản, phòng ban, trạng thái.
- Báo cáo tài sản theo phòng ban / trạng thái.

### Kiểm Kê *(Đỗ Minh Mẫn)*

- Tạo phiếu kiểm kê định kỳ.
- Quét QR bằng camera để xác nhận tài sản.
- Tổng hợp kết quả kiểm kê.
- Báo cáo chênh lệch.

### Điều Chuyển Tài Sản *(Nguyễn Phú Bình)*

- Lập phiếu điều chuyển giữa các phòng ban.
- Quy trình ký duyệt nhiều cấp.
- Báo cáo lịch sử điều chuyển.

### Phê Duyệt & Thông Báo

- Danh sách chờ phê duyệt tập trung (transfer + inventory).
- Ký duyệt / Từ chối kèm ghi chú lý do.
- Gửi email thông báo tự động khi có phê duyệt mới.
- In-app notifications.

### Audit Logging

- Ghi lại: ai, làm gì, khi nào, từ IP nào.
- Tìm kiếm và lọc theo loại tài nguyên, người dùng, thời gian.

### Cấu Hình Hệ Thống *(Admin only)*

- Đặt tên ứng dụng.
- Cấu hình thời hạn JWT.
- Bật/tắt email và in-app notifications.

---

## 8. API Endpoints

Base URL: `http://localhost:3000/api`

> Tất cả endpoints (trừ `/auth/login`) yêu cầu header:
> ```
> Authorization: Bearer <jwt_token>
> ```

### Auth

```
POST   /auth/login            Đăng nhập → { accessToken, user }
GET    /auth/me               Lấy thông tin user hiện tại
PATCH  /auth/me               Cập nhật thông tin cá nhân (ProfileUpdatePayload)
PATCH  /auth/password         Đổi mật khẩu { matKhauCu, matKhauMoi }
GET    /auth/departments      Danh sách phòng ban (dùng cho Profile)
```

### Employees

```
GET    /employees                        Danh sách (?search=)
GET    /employees/meta/departments       Danh sách phòng ban
POST   /employees                        Tạo nhân viên mới
PATCH  /employees/:maNhanVien            Cập nhật thông tin
DELETE /employees/:maNhanVien            Vô hiệu hóa tài khoản
```

### Assets

```
GET    /assets                           Danh sách (?search, ?maLoai, ?maPhongBan, ?trangThai)
GET    /assets/meta/categories           Danh sách loại tài sản
```

### Roles & Permissions

```
GET    /roles                            Danh sách vai trò
GET    /roles/permissions                Danh sách tất cả quyền
POST   /roles                            Tạo vai trò mới
PATCH  /roles/:maVaiTro                  Cập nhật vai trò
PUT    /roles/:maVaiTro/permissions      Cập nhật quyền cho vai trò { maQuyen[] }
```

### Approvals

```
GET    /approvals/pending                              Danh sách chờ phê duyệt
POST   /approvals/transfer/:maPhieu/sign               Ký/từ chối phiếu điều chuyển
POST   /approvals/inventory/:maPhieu/sign              Ký/từ chối phiếu kiểm kê
```

### Các Module Khác

```
GET    /dashboard/overview               Thống kê tổng quan
GET    /notifications                    Danh sách thông báo
GET    /settings                         Cấu hình hệ thống
PATCH  /settings                         Cập nhật cấu hình
GET    /audit-logs                       Lịch sử hành động (?search=)
```

---

## 9. Kiểm Thử

### Chạy Test

```bash
npm run test          # Unit tests
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
```

### Tài Khoản Test Sẵn Có

| Email                    | Mật khẩu | Vai trò    | Quyền hạn             |
| ------------------------ | -------- | ---------- | --------------------- |
| admin@example.com        | 123456   | ADMIN      | Toàn quyền (`*`)      |
| manager@example.com      | 123456   | MANAGER    | Quản lý phòng ban     |
| accountant@example.com   | 123456   | ACCOUNTANT | Xem & báo cáo tài sản |
| staff@example.com        | 123456   | STAFF      | Nhân viên cơ bản      |

> Đăng nhập bằng tài khoản Demo: chọn nút **"Dùng Demo"** trên màn hình Login để vào ngay với quyền Admin, không cần backend.

> Xem chi tiết 16 test cases tại [`docs/TEST_CASES.md`](https://github.com/khomuc/QuanLyTaiSan/blob/test/docs/TEST_CASES.md).

---

## 10. Bảo Mật

### Đã Triển Khai ✅

| Hạng Mục                 | Chi Tiết                             |
| ------------------------ | ------------------------------------ |
| Bcrypt password hashing  | Salt rounds mặc định                 |
| JWT authentication       | HS256, 24h expiry                    |
| RBAC system              | Guard + Decorator trên mọi endpoint  |
| SQL injection prevention | TypeORM parameterized queries        |
| XSS protection           | Input validation với class-validator |
| Input sanitization       | DTO validation toàn bộ request body  |

### Cần Bổ Sung ⚠️

| Hạng Mục                            | Ưu tiên      |
| ----------------------------------- | ------------ |
| Rate limiting (`@nestjs/throttler`) | 🔴 Cao        |
| Security headers (Helmet)           | 🔴 Cao        |
| Refresh token flow                  | 🔴 Cao        |
| CORS configuration chính xác        | 🟡 Trung bình |
| Database indexes tối ưu             | 🟡 Trung bình |

> **Đánh giá bảo mật hiện tại: 84/100** — Xem chi tiết tại `docs/SECURITY_AUDIT.md`.

---

## 11. Tiến Độ Phát Triển

### Team Lead (Nguyễn Thị Huỳnh Như)

| Tính Năng                                               | Tiến Độ     |
| ------------------------------------------------------- | ----------- |
| Frontend Setup (React 19 + Vite 6 + TypeScript)         | ✅ 100%      |
| Authentication & JWT (`AuthContext`)                    | ✅ 100%      |
| RBAC & Permissions                                      | ✅ 100%      |
| Dashboard                                               | ✅ 100%      |
| Profile Management                                      | ✅ 100%      |
| Employee Management                                     | ✅ 100%      |
| Staff Permission Override (`StaffManagementPage`)       | ✅ 100%      |
| System Configuration                                    | ✅ 100%      |
| Audit Logging                                           | ✅ 100%      |
| Approval Workflow                                       | ✅ 100%      |
| Frontend Refactoring (AppContent, Sidebar, AppLayout)   | ✅ 100%      |
| Demo Mode (offline fallback + apiMode indicator)        | ✅ 100%      |
| Email Service (SMTP/Gmail/SendGrid)                     | ⚠️ 85%      |
| Test Cases (16 cases)                                   | ⚠️ 30%      |
| Security Hardening                                      | ⚠️ 40%      |
| CI/CD Pipeline                                          | ⚠️ 40%      |
| **OVERALL**                                             | **⚠️ ~78%** |

### Hiệu Năng Frontend

- Bundle size: ~150 KB (sau code splitting)
- `React.lazy()` + `Suspense` cho tất cả 11 trang
- `useMemo()` cho filter/search nặng
- Sidebar trạng thái persist trong `localStorage` (`sidebar-collapsed`)
- Tất cả API phản hồi < 500 ms

---

## 12. Tài Liệu Liên Quan

| Tài liệu                                                                                          | Mô tả                                            |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [`docs/LOGIN_GUIDE.md`](https://github.com/khomuc/QuanLyTaiSan/blob/test/docs/LOGIN_GUIDE.md)    | Hướng dẫn đăng nhập, phân quyền, troubleshooting |
| [`docs/TEST_CASES.md`](https://github.com/khomuc/QuanLyTaiSan/blob/test/docs/TEST_CASES.md)      | 16 test cases theo nhóm chức năng                |
| [`docs/SECURITY_AUDIT.md`](https://github.com/khomuc/QuanLyTaiSan/blob/test/docs/SECURITY_AUDIT.md) | Đánh giá bảo mật chi tiết                     |
| [`.env.example`](https://github.com/khomuc/QuanLyTaiSan/blob/test/.env.example)                  | Template cấu hình môi trường                     |

---

*Maintained by: **Nguyễn Thị Huỳnh Như** ([@nnhuwz03](https://github.com/nnhuwz03)) — Team Lead*  
*Mọi câu hỏi vui lòng tạo Issue trên GitHub.*
