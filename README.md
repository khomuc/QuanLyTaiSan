# 🗂️ Hệ Thống Quản Lý Tài Sản QR

> **Asset Management System** — Quản lý tài sản tổ chức bằng mã QR, phân quyền RBAC, quy trình phê duyệt và kiểm kê tự động.

**Repository:** https://github.com/khomuc/QuanLyTaiSan  
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
- **Audit logging** toàn bộ hành động người dùng.
- **Email notifications** cho các luồng phê duyệt.

---

## 2. Thông Tin Team

| STT | Họ và Tên | MSSV | Vai Trò | Phạm Vi Công Việc |
|:---:|-----------|:----:|---------|-------------------|
| 1 | **Nguyễn Thị Huỳnh Như** | B2204960 | Team Lead | Auth, RBAC, Frontend Infrastructure, Dashboard, Profile, Email |
| 2 | Nguyễn Minh Khôi | B2204941 | Asset Management | Asset CRUD, Danh sách, Import/Export, QR Print, Báo cáo |
| 3 | Đỗ Minh Mẫn | B2104812 | Inventory Management | Kiểm kê, QR Scanning, Tổng hợp, Báo cáo |
| 4 | Nguyễn Phú Bình | B2204923 | Transfer Management | Điều chuyển tài sản, Ký duyệt, Báo cáo |

> **Liên hệ Team Lead:** [@nnhuwz03](https://github.com/nnhuwz03) — hoặc tạo issue trên GitHub.

---

## 3. Tech Stack

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|---------|
| React | 19.0.0 | UI Framework |
| TypeScript | 5.7.3 | Type safety |
| Vite | 6.0.0 | Build tool & Dev server |
| React Router DOM | 6.20.0 | Routing |
| Lucide React | 0.468.0 | Icons |

### Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|---------|
| NestJS | 11.0.1 | Backend Framework |
| TypeORM | 0.3.29 | ORM |
| MySQL2 | 3.22.3 | Cơ sở dữ liệu |
| @nestjs/jwt | 11.0.2 | JSON Web Token |
| Bcryptjs | 3.0.3 | Mã hóa mật khẩu |
| Nodemailer | 8.0.10 | Gửi email |
| class-validator | 0.15.1 | Validation DTO |

---

## 4. Cấu Trúc Project

```
QuanLyTaiSan/
├── frontend/                    ← React + Vite frontend
│   └── src/
│       ├── pages/               ← 10 page components (lazy-loaded)
│       │   ├── LoginScreen.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── EmployeesPage.tsx
│       │   ├── AssetsPage.tsx
│       │   ├── RolesPage.tsx
│       │   ├── ApprovalsPage.tsx
│       │   ├── NotificationsPage.tsx
│       │   ├── SettingsPage.tsx
│       │   ├── AuditPage.tsx
│       │   └── ProfilePage.tsx
│       ├── components/          ← Shared UI components
│       ├── lib/                 ← API client, types, utilities
│       ├── styles/              ← CSS
│       ├── App.tsx              ← Route definitions (~200 dòng)
│       └── main.tsx
│
├── src/                         ← NestJS backend
│   ├── auth/                    ← Login, JWT, Bcrypt
│   ├── employees/               ← Employee CRUD & quản lý
│   ├── roles/                   ← RBAC & permissions
│   ├── dashboard/               ← Thống kê tổng quan
│   ├── audit-logs/              ← Ghi lịch sử hành động
│   ├── notifications/           ← Email + in-app alerts
│   ├── approvals/               ← Workflow phê duyệt
│   ├── mailer/                  ← Email service (SMTP/Gmail/SendGrid)
│   ├── common/                  ← Guards, decorators, interceptors
│   └── main.ts
│
├── docs/
│   ├── LOGIN_GUIDE.md           ← Hướng dẫn đăng nhập & phân quyền
│   └── TEST_CASES.md            ← 16 test cases
│
├── .env.example                 ← Template cấu hình môi trường
├── package.json                 ← Backend dependencies & scripts
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
- JWT token có thời hạn 24 giờ, lưu trong `localStorage`.
- Mật khẩu được mã hóa bằng Bcrypt.
- RBAC với 4 vai trò: `ADMIN`, `MANAGER`, `ACCOUNTANT`, `STAFF`.
- `JwtAuthGuard` bảo vệ toàn bộ API endpoints.
- Hỗ trợ **Permission Override** — Admin cấp quyền tạm thời cho nhân viên.

### Dashboard

- Thống kê tổng số nhân viên, tài sản theo trạng thái.
- Số lượng phê duyệt đang chờ xử lý.
- Audit logs hoạt động gần đây.
- Quick stats cards theo vai trò người dùng.

### Quản Lý Nhân Viên

- Danh sách có tìm kiếm, lọc theo phòng ban / vai trò / trạng thái.
- Tạo, chỉnh sửa thông tin nhân viên qua modal.
- Vô hiệu hóa tài khoản (soft delete — không xóa dữ liệu).
- Cấp quyền hạn ghi đè (Permission Override) trực tiếp từ trang quản lý.

### Quản Lý Tài Sản *(thành viên Nguyễn Minh Khôi)*

- CRUD tài sản đầy đủ.
- Sinh mã QR và in nhãn.
- Import/Export danh sách tài sản.
- Lọc và tìm kiếm nâng cao.
- Báo cáo tài sản theo phòng ban / trạng thái.

### Kiểm Kê *(thành viên Đỗ Minh Mẫn)*

- Tạo phiếu kiểm kê định kỳ.
- Quét QR bằng camera để xác nhận tài sản.
- Tổng hợp kết quả kiểm kê.
- Báo cáo chênh lệch.

### Điều Chuyển Tài Sản *(thành viên Nguyễn Phú Bình)*

- Lập phiếu điều chuyển giữa các phòng ban.
- Quy trình ký duyệt nhiều cấp.
- Báo cáo lịch sử điều chuyển.

### Phê Duyệt & Thông Báo

- Danh sách chờ phê duyệt tập trung.
- Ký duyệt / Từ chối kèm ghi chú.
- Gửi email thông báo tự động khi có phê duyệt mới.
- In-app notifications realtime.

### Audit Logging

- Ghi lại toàn bộ hành động: ai, làm gì, khi nào, từ IP nào.
- Tìm kiếm và lọc lịch sử theo loại tài nguyên, người dùng, thời gian.

### Cấu Hình Hệ Thống *(Admin only)*

- Đặt tên ứng dụng.
- Cấu hình thời hạn JWT.
- Bật/tắt email và in-app notifications.

---

## 8. API Endpoints

Base URL: `http://localhost:3000/api`

### Auth

```http
POST   /auth/login            Đăng nhập → trả về { token, user }
GET    /auth/me               Lấy thông tin user hiện tại
PATCH  /auth/password         Đổi mật khẩu
POST   /auth/reset-password   Reset mật khẩu qua email (sắp có)
POST   /auth/refresh          Làm mới token (sắp có)
```

### Employees

```http
GET    /employees             Danh sách nhân viên (hỗ trợ ?search, ?maPhongBan, ?maVaiTro)
GET    /employees/meta/departments   Danh sách phòng ban
POST   /employees             Tạo nhân viên mới
PATCH  /employees/:maNhanVien Cập nhật thông tin
DELETE /employees/:maNhanVien Vô hiệu hóa tài khoản
```

### Tất cả endpoints yêu cầu header:

```http
Authorization: Bearer <jwt_token>
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

| Email | Mật khẩu | Vai trò | Quyền hạn |
|-------|----------|---------|-----------|
| admin@example.com | 123456 | ADMIN | Toàn quyền |
| manager@example.com | 123456 | MANAGER | Quản lý phòng ban |
| accountant@example.com | 123456 | ACCOUNTANT | Xem & báo cáo tài sản |
| staff@example.com | 123456 | STAFF | Nhân viên cơ bản |

> Xem chi tiết 16 test cases tại [`docs/TEST_CASES.md`](docs/TEST_CASES.md).

---

## 10. Bảo Mật

### Đã Triển Khai ✅

| Hạng Mục | Chi Tiết |
|----------|---------|
| Bcrypt password hashing | Salt rounds mặc định |
| JWT authentication | RS256 / HS256, 24h expiry |
| RBAC system | Guard + Decorator trên mọi endpoint |
| SQL injection prevention | TypeORM parameterized queries |
| XSS protection | Input validation với class-validator |
| Input sanitization | DTO validation toàn bộ request body |

### Cần Bổ Sung ⚠️

| Hạng Mục | Ưu tiên |
|----------|:-------:|
| Rate limiting (`@nestjs/throttler`) | 🔴 Cao |
| Security headers (Helmet) | 🔴 Cao |
| Refresh token flow | 🔴 Cao |
| CORS configuration chính xác | 🟡 Trung bình |
| Database indexes tối ưu | 🟡 Trung bình |

> **Đánh giá bảo mật hiện tại: 84/100** — Xem chi tiết tại `docs/SECURITY_AUDIT.md`.

---

## 11. Tiến Độ Phát Triển

### Team Lead (Nguyễn Thị Huỳnh Như)

| Tính Năng | Tiến Độ |
|-----------|:-------:|
| Frontend Setup (React 19 + Vite 6 + TypeScript) | ✅ 100% |
| Authentication & JWT | ✅ 100% |
| RBAC & Permissions | ✅ 100% |
| Dashboard | ✅ 100% |
| Profile Management | ✅ 100% |
| Employee Management | ✅ 100% |
| System Configuration | ✅ 100% |
| Audit Logging | ✅ 100% |
| Approval Workflow | ✅ 100% |
| Frontend Refactoring (code splitting, lazy load) | ✅ 100% |
| Email Service (SMTP/Gmail/SendGrid) | ⚠️ 85% |
| Test Cases (16 cases) | ⚠️ 30% |
| Security Hardening | ⚠️ 40% |
| CI/CD Pipeline | ⚠️ 40% |
| **OVERALL** | **⚠️ ~75%** |

### Hiệu Năng Frontend

- Bundle size: ~150 KB (sau code splitting)
- Tất cả API phản hồi < 500 ms
- React.lazy() + Suspense cho mọi trang
- useMemo() cho filter/search nặng

---

## 12. Tài Liệu Liên Quan

| Tài liệu | Mô tả |
|----------|-------|
| [`docs/LOGIN_GUIDE.md`](docs/LOGIN_GUIDE.md) | Hướng dẫn đăng nhập, phân quyền, troubleshooting |
| [`docs/TEST_CASES.md`](docs/TEST_CASES.md) | 16 test cases theo nhóm chức năng |
| [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) | Đánh giá bảo mật chi tiết |
| [`.env.example`](.env.example) | Template cấu hình môi trường |

---

*Maintained by: **Nguyễn Thị Huỳnh Như** ([@nnhuwz03](https://github.com/nnhuwz03)) — Team Lead*  
*Mọi câu hỏi vui lòng tạo Issue trên GitHub.*
