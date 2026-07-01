# 🗂️ Hệ Thống Quản Lý Tài Sản QR

> Ứng dụng web full-stack quản lý tài sản tổ chức bằng mã QR, phân quyền RBAC theo vai trò và từng nhân viên, quy trình ký duyệt điều chuyển & kiểm kê tài sản, email notifications, audit logging.

**Repository:** https://github.com/khomuc/QuanLyTaiSan  
**Branch phát triển:** `test`  
**Status:** ✅ **98% HOÀN THIỆN - SẴN SÀNG DEPLOY**

---

## 📋 Mục Lục

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
11. [Security & Performance](#11-security--performance)
12. [Demo Mode](#12-demo-mode)
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
- **Security hardening** — Rate limiting, Security headers (Helmet), CORS, JWT refresh token rotation.
- **Demo mode** — tự động fallback sang dữ liệu mẫu khi backend chưa sẵn sàng.

---

## 2. Thông Tin Team

| STT | Họ và Tên | MSSV | Vai Trò | Phạm Vi |
|:---:|-----------|:----:|---------|---------|
| 1 | **Nguyễn Thị Huỳnh Như** | B2204960 | Team Lead | Auth, RBAC, Frontend infrastructure, Dashboard, Profile, Email service, Security |
| 2 | Nguyễn Minh Khôi | B2204941 | Asset Management | Asset CRUD, danh sách, lọc, QR, báo cáo |
| 3 | Đỗ Minh Mẫn | B2104812 | Inventory | Kiểm kê, phê duyệt kiểm kê, báo cáo |
| 4 | Nguyễn Phú Bình | B2204923 | Transfer | Điều chuyển tài sản, ký duyệt, báo cáo |

---

## 3. Tech Stack

### Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|---------|
| NestJS | 11.0.1 | Framework backend chính |
| MySQL2 | 3.22.3 | Driver kết nối MySQL (raw pool) |
| TypeORM | 0.3.29 | Dependency (support) |
| @nestjs/jwt | 11.0.2 | Access token + Refresh token (JWT HS256) |
| @nestjs/throttler | 6.3.0 | Rate limiting (NEW) |
| Helmet | 7.2.0 | Security headers (NEW) |
| Bcryptjs | 3.0.3 | Hash mật khẩu (12 rounds) |
| Nodemailer | 8.0.10 | Gửi email (SMTP / Gmail / SendGrid) |
| class-validator | 0.15.1 | Validation DTO đầu vào |
| class-transformer | 0.5.1 | Transform query params |

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
│       ├── contexts/
│       │   └── AuthContext.tsx        ← AuthProvider, useAuth()
│       ├── components/
│       │   ├── AppContent.tsx         ← Orchestrator: state, data loading, CRUD
│       │   ├── AppLayout.tsx          ← Shell: Sidebar + Topbar + <Outlet />
│       │   ├── Sidebar.tsx            ← Nav sidebar (collapsible)
│       │   ├── EmployeeModal.tsx      ← Modal tạo/chỉnh sửa nhân viên
│       │   └── Toast.tsx              ← Thông báo toast
│       ├── pages/                     ← 11 page components (React.lazy)
│       │   ├── LoginScreen.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── AssetsPage.tsx
│       │   ├── EmployeesPage.tsx
│       │   ├── StaffManagementPage.tsx
│       │   ├── RolesPage.tsx
│       │   ├── ApprovalsPage.tsx
│       │   ├── NotificationsPage.tsx
│       │   ├── SettingsPage.tsx
│       │   ├── AuditPage.tsx
│       │   └── ProfilePage.tsx
│       └── lib/
│           ├── api.ts                 ← HTTP client (Bearer token, auto-refresh)
│           ├── types.ts               ← TypeScript interfaces
│           ├── navigation.ts          ← Nav items + permissions
│           └── mockData.ts            ← Demo fallback
├── src/                               ← NestJS backend
│   ├── main.ts                        ← Bootstrap: Helmet, CORS, throttler
│   ├── app.module.ts                  ← Root module + ThrottlerModule
│   ├── database.module.ts             ← MySQL connection pool
│   ├── auth/                          ← Login, JWT, refresh token rotation
│   ├── employees/                     ← CRUD + permission override
│   ├── roles/                         ← Vai trò, quyền
│   ├── assets/                        ← Tài sản, danh mục
│   ├── dashboard/                     ← Thống kê tổng quan
│   ├── approvals/                     ← Ký duyệt
│   ├── notifications/                 ← In-app + email
│   ├── settings/                      ← Cấu hình runtime
│   ├── audit-logs/                    ← Lịch sử hành động
│   ├── mailer/                        ← Email service
│   └── common/
│       ├── guards/
│       │   ├── jwt-auth.guard.ts      ← Xác thực JWT
│       │   └── permissions.guard.ts   ← Kiểm tra quyền
│       └── decorators/
├── migrations/
│   ├── 001_add_refresh_token_table.sql
│   └── 002_add_nhan_vien_quyen.sql
├── docs/
│   ├── LOGIN_GUIDE.md
│   ├── TEST_CASES.md (16 test cases)
│   ├── SECURITY_AUDIT.md (94/100 score)
│   ├── IMPLEMENTATION_STATUS.md (Project status)
│   └── BUGFIX_README.md
└── .env.example_v2
```

---

## 5. Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu

- Node.js **18+**
- MySQL **8.0+**
- Git

### Bước 1 — Clone & checkout branch

```bash
git clone https://github.com/bnnbichzzzzz/QuanLyTaiSan.git
cd QuanLyTaiSan
git checkout test
```

### Bước 2 — Cấu hình môi trường

```bash
cp .env.example_v2 .env
# Mở .env và điền thông tin thực tế (xem mục 6)
```

### Bước 3 — Cài đặt dependencies

```bash
# Backend (includes @nestjs/throttler + helmet)
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

Chạy migrations (xem mục 7).

### Bước 5 — Chạy development

```bash
# Terminal 1 — Backend (http://localhost:3000)
npm run start:dev

# Terminal 2 — Frontend (http://localhost:5173)
npm run frontend:dev
```

### Chạy production

```bash
npm run build
npm run start:prod
npm run frontend:build
```

---

## 6. Cấu Hình Môi Trường

Copy `.env.example_v2` → `.env` và điền giá trị:

```dotenv
# ── Database ─────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quan_ly_tai_san

# ── JWT ──────────────────────────────────────────────
JWT_SECRET=your-secret-key-at-least-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# ── Rate Limiting (NEW) ──────────────────────────────
THROTTLE_TTL=60000        # 60 seconds
THROTTLE_LIMIT=100        # 100 requests per minute

# ── Email — chọn một provider ─────────────────────────
MAIL_PROVIDER=gmail       # smtp | gmail | sendgrid

# Option 1: Gmail (Recommended)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Option 2: SendGrid
# MAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=SG.xxxxx...

# Option 3: SMTP
# MAIL_PROVIDER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USER=your-email@gmail.com
# MAIL_PASSWORD=your-app-password

# ── App ──────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
BCRYPT_SALT_ROUNDS=12
```

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords

---

## 7. Database & Migrations

### Migrations bổ sung

Sau khi tạo schema gốc, chạy 2 migration theo thứ tự:

```bash
mysql -u root -p quan_ly_tai_san < migrations/001_add_refresh_token_table.sql
mysql -u root -p quan_ly_tai_san < migrations/002_add_nhan_vien_quyen.sql
```

---

## 8. Tính Năng Chi Tiết

### Authentication

- Đăng nhập bằng `email` + `matKhau`
- Trả về **access token** (JWT HS256, 15 min) + **refresh token** (7 days)
- **Token Rotation**: Mỗi refresh, token cũ bị revoke, cấp token mới
- **Auto-refresh**: 401 trigger auto-refresh, queue pending requests
- **Password change**: Revoke toàn bộ refresh token cũ

### RBAC & Phân Quyền

- 4 vai trò: `ADMIN`, `MANAGER`, `ACCOUNTANT`, `STAFF`
- Override quyền từng nhân viên qua `NHAN_VIEN_QUYEN` table
- `ADMIN` bypass mọi kiểm tra quyền
- Dynamic permissions in JWT payload

### Email Notifications

- Nhắc nhở phê duyệt (HTML template)
- Thông báo kết quả ký duyệt (accepted/rejected)
- Hỗ trợ Gmail, SendGrid, SMTP

### Audit Logging

- Ghi lại toàn bộ hành động quan trọng
- Lọc theo nhân viên, hành động, khoảng thời gian

---

## 9. API Reference

Base URL: `http://localhost:3000/api`

Tất cả endpoints (trừ `/auth/login`, `/auth/refresh`) yêu cầu header:
```
Authorization: Bearer <access_token>
```

Chi tiết xem: `/docs/LOGIN_GUIDE.md`

---

## 10. Phân Quyền & Điều Hướng

- Navigation động theo quyền của user
- Admin → Thấy tất cả menu
- Employee → Chỉ thấy Dashboard, Assets, Profile

---

## 11. Security & Performance

### 🔐 Security (Score: 94/100 - EXCELLENT)

| Component | Status | Details |
|-----------|--------|---------|
| **Rate Limiting** | ✅ NEW | 100 req/min via @nestjs/throttler |
| **Security Headers** | ✅ NEW | Helmet: CSP, HSTS, X-Frame-Options, etc. |
| **CORS** | ✅ | Restricted to FRONTEND_URL env var |
| **JWT Rotation** | ✅ | One-time use refresh tokens |
| **Password Hashing** | ✅ | Bcrypt 12 rounds |
| **Input Validation** | ✅ | class-validator on all DTOs |
| **SQL Injection Prevention** | ✅ | Parameterized queries |
| **XSS Protection** | ✅ | React auto-escaping |

### ⚡ Performance

- API response time: < 500ms (excellent)
- Bundle size: ~150KB (good)
- Lazy loading + code splitting enabled
- Frontend optimizations: useMemo, React.memo

Xem chi tiết: `/docs/SECURITY_AUDIT.md`

---

## 12. Demo Mode

Khi backend offline, ứng dụng tự động fallback:
- Tất cả màn hình hiển thị mock data
- Topbar badge: **DEMO** (cam)
- Không cần backend, test ngay từ login

---

## 13. Tài Khoản Test

Xem danh sách tài khoản test: `/docs/LOGIN_GUIDE.md`

---

## 📚 Tài Liệu Thêm

- **[LOGIN_GUIDE.md](docs/LOGIN_GUIDE.md)** — Hướng dẫn đăng nhập & demo accounts
- **[TEST_CASES.md](docs/TEST_CASES.md)** — 16 manual test cases
- **[SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)** — Security assessment (94/100)
- **[IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** — Project completion status
- **[BUGFIX_README.md](docs/BUGFIX_README.md)** — Bug fixes & known issues

---

## 🚀 Sẵn Sàng Deploy!

**Status: 98% ✅ HOÀN THIỆN**

Xem checklist: `/docs/IMPLEMENTATION_STATUS.md`

---

**Maintained by:** @nnhuwz03 (Team Lead)  
**Last Updated:** 01/07/2026
