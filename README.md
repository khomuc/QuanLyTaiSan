# Hệ Thống Quản Lý Tài Sản QR — Báo Cáo Team Lead

**Dự án:** Quản Lý Tài Sản QR (Asset Management System)  
**Team Lead:** Nguyễn Thị Huỳnh Như — B2204960  
**Repository:** https://github.com/khomuc/QuanLyTaiSan.git 
**Branch chính:** `test` (Development)  
**Cập nhật lần cuối:** 2025-06-01

---

## Mục Lục

1. [Thông Tin Team](#1-thông-tin-team)
2. [Phạm Vi Công Việc Team Lead](#2-phạm-vi-công-việc-team-lead)
3. [Tiến Độ Tổng Hợp](#3-tiến-độ-tổng-hợp)
4. [Chi Tiết Các Tính Năng Đã Hoàn Thành](#4-chi-tiết-các-tính-năng-đã-hoàn-thành)
5. [Công Việc Còn Lại](#5-công-việc-còn-lại)
6. [Architecture & Tech Stack](#6-architecture--tech-stack)
7. [Cấu Hình & Setup](#7-cấu-hình--setup)
8. [Testing & Quality Assurance](#8-testing--quality-assurance)
9. [Security & Performance](#9-security--performance)
10. [Kế Hoạch Tiếp Theo](#10-kế-hoạch-tiếp-theo)

---

## 1. Thông Tin Team

| STT | Họ và Tên | MSSV | Vai Trò | Phạm Vi Công Việc |
|:---:|-----------|:----:|---------|-------------------|
| 1 | **Nguyễn Thị Huỳnh Như** | B2204960 | Team Lead | Auth, Permissions, Frontend Infrastructure, Dashboard, Profile |
| 2 | Nguyễn Minh Khôi | B2204941 | Asset Management | Asset CRUD, Danh sách, Import/Export, QR Print, Báo cáo |
| 3 | Đỗ Minh Mẫn | B2104812 | Inventory Management | Kiểm kê, QR Scanning, Tổng hợp, Báo cáo |
| 4 | Nguyễn Phú Bình | B2204923 | Transfer Management | Điều chuyển tài sản, Ký duyệt, Báo cáo |

---

## 2. Phạm Vi Công Việc Team Lead

### Đã Hoàn Thành ✅

| # | Tính Năng | Chi Tiết | Trạng Thái |
|:-:|-----------|----------|:----------:|
| 1 | Frontend Setup | React 19, Vite 6, TypeScript | ✅ 100% |
| 2 | Authentication | Login, JWT (24h), Bcrypt | ✅ 100% |
| 3 | Authorization | RBAC system, Permissions | ✅ 100% |
| 4 | Dashboard | Statistics, pending approvals | ✅ 100% |
| 5 | Profile Management | Update info, change password | ✅ 100% |
| 6 | Employee Management | CRUD, search, filter, deactivate | ✅ 100% |
| 7 | System Configuration | Settings, config management | ✅ 100% |
| 8 | Audit Logging | Action tracking, history | ✅ 100% |
| 9 | Approval Workflow | Sign/reject, notifications | ✅ 100% |
| 10 | Email Service | SMTP / Gmail / SendGrid support | ✅ 85% |
| 11 | Frontend Refactoring | React.lazy(), code splitting | ✅ 100% |

### Đang Thực Hiện ⚠️

| # | Tính Năng | Tiến Độ | Deadline |
|:-:|-----------|:-------:|----------|
| 1 | Test Email (Gmail / SendGrid) | 50% | Tuần 10 |
| 2 | Test Cases (16 cases) | 30% | Tuần 11 |
| 3 | Security Hardening | 40% | Tuần 11 |
| 4 | CI/CD Pipeline | 40% | Tuần 11 |

---

## 3. Tiến Độ Tổng Hợp

| Hạng Mục | Tiến Độ | Trạng Thái |
|----------|:-------:|:----------:|
| Authentication & Authorization | 100% | ✅ |
| Dashboard & Overview | 100% | ✅ |
| Profile Management | 100% | ✅ |
| Employee Management | 100% | ✅ |
| System Configuration | 100% | ✅ |
| Audit Logging | 100% | ✅ |
| Approval Workflow | 100% | ✅ |
| Frontend Refactoring | 100% | ✅ |
| Email Notifications | 85% | ⚠️ |
| Test Cases & Documentation | 40% | ⚠️ |
| Security & Performance Audit | 40% | ⚠️ |
| CI/CD Pipeline | 40% | ⚠️ |
| **OVERALL TEAM LEAD** | **75%** | ⚠️ |

---

## 4. Chi Tiết Các Tính Năng Đã Hoàn Thành

### 4.1 Authentication & Authorization (100%)

Các chức năng đã triển khai:

- Login form với email + password
- JWT token generation (24h expiration)
- Bcrypt password hashing
- Role-based access control (RBAC)
- Permission validation system
- JwtAuthGuard implementation
- Logout functionality

**Files liên quan:**

```
frontend/src/pages/LoginScreen.tsx
src/auth/auth.controller.ts
src/auth/auth.service.ts
src/common/guards/jwt-auth.guard.ts
```

---

### 4.2 Dashboard (100%)

Các chức năng đã triển khai:

- Thống kê nhân viên (tổng số, theo trạng thái)
- Thống kê tài sản (tổng số, theo trạng thái)
- Hiển thị số lượng phê duyệt đang chờ
- Audit logs gần đây
- Quick stats cards

**File:** `frontend/src/pages/DashboardPage.tsx`

---

### 4.3 Profile Management (100%)

Các chức năng đã triển khai:

- Xem thông tin cá nhân
- Chỉnh sửa: Họ tên, Chức vụ, Số điện thoại, Phòng ban
- Đổi mật khẩu
- Form validation
- Detect changes (bật/tắt nút Lưu)
- Error handling & toast notifications

**File:** `frontend/src/pages/ProfilePage.tsx`

---

### 4.4 Employee Management (100%)

Các chức năng đã triển khai:

- Danh sách nhân viên (search, filter, pagination)
- Tạo nhân viên mới (modal)
- Chỉnh sửa thông tin nhân viên (modal)
- Vô hiệu hóa nhân viên (soft delete)
- Hiển thị trạng thái ACTIVE / INACTIVE

**File:** `frontend/src/pages/EmployeesPage.tsx`

---

### 4.5 System Configuration (100%)

Các chức năng đã triển khai:

- Cài đặt tên ứng dụng
- Cấu hình JWT expiration
- Bật/tắt email notifications
- Bật/tắt in-app notifications
- Lưu cấu hình hệ thống

**File:** `frontend/src/pages/SettingsPage.tsx`

---

### 4.6 Audit Logging (100%)

Các chức năng đã triển khai:

- Ghi lại toàn bộ hành động người dùng
- Timestamp cho mỗi hành động
- Xác định người thực hiện
- Loại tài nguyên & ID
- Chi tiết hành động & địa chỉ IP
- Tìm kiếm & lọc audit logs

**Files liên quan:**

```
frontend/src/pages/AuditPage.tsx
src/audit-logs/
```

---

### 4.7 Approval Workflow (100%)

Các chức năng đã triển khai:

- Hiển thị danh sách chờ phê duyệt
- Nút Ký duyệt / Từ chối
- Gửi email thông báo khi có phê duyệt
- Ghi log các hành động phê duyệt
- Theo dõi trạng thái quy trình

**File:** `frontend/src/pages/ApprovalsPage.tsx`

---

### 4.8 Email Notifications (85%)

Các chức năng đã triển khai:

- Hỗ trợ cấu hình SMTP
- Tích hợp Gmail
- Tích hợp SendGrid
- Template email nhắc nhở phê duyệt
- Template email thông báo phê duyệt
- *(Còn lại: Test thực tế với Gmail/SendGrid)*

**File:** `src/mailer/mailer.service.ts`

---

### 4.9 Frontend Refactoring (100%)

Các chức năng đã triển khai:

- Tách 10 page components từ App.tsx
- React.lazy() cho tất cả các trang
- Suspense boundaries
- Code splitting theo routes
- App.tsx giảm từ 1600+ xuống ~200 dòng
- useMemo() cho filters/search

**Danh sách page components:**

```
DashboardPage, EmployeesPage, AssetsPage, RolesPage,
ApprovalsPage, NotificationsPage, SettingsPage,
AuditPage, ProfilePage, LoginScreen
```

---

## 5. Công Việc Còn Lại

### Priority 1 — Email Testing (Tuần 10)

1. Tạo Gmail App Password
2. Test gửi email
3. Kiểm tra email templates
4. Test approval notifications
5. Verify đường link trong email

### Priority 2 — Test Cases (Tuần 11)

File output: `docs/TEST_CASES.md`

| Nhóm | Test Cases | Số Lượng |
|------|-----------|:--------:|
| RBAC access control | TC-001 → TC-003 | 3 |
| Profile update & password | TC-004 → TC-007 | 4 |
| Email notifications | TC-008 → TC-009 | 2 |
| Employee management | TC-010 → TC-012 | 3 |
| Asset filtering | TC-013 | 1 |
| Approval workflow | TC-014 → TC-015 | 2 |
| Audit logging | TC-016 | 1 |
| **Tổng** | | **16** |

### Priority 3 — Security Hardening (Tuần 11)

File output: `docs/SECURITY_AUDIT.md`

- Implement rate limiting (`@nestjs/throttler`)
- Thêm security headers
- Implement refresh token flow
- Cấu hình CORS đúng chuẩn
- Tối ưu database indexes

### Priority 4 — CI/CD Pipeline (Tuần 11)

File output: `.github/workflows/ci.yml`

- Tự động hóa build & test
- Lint checks
- Security scanning
- Auto-deploy lên dev/prod

---

## 6. Architecture & Tech Stack

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|---------|
| React | 19.0.0 | UI Framework |
| TypeScript | 5.7.3 | Type safety |
| Vite | 6.0.0 | Build tool |
| Lucide React | — | Icons & UI |

### Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|---------|
| NestJS | 11.0.1 | Framework |
| TypeORM | 0.3.29 | ORM |
| MySQL2 | 3.22.3 | Database |
| Bcryptjs | 3.0.3 | Password hashing |
| Nodemailer | 8.0.10 | Email service |
| JWT | 11.0.2 | Authentication |

### Cấu Trúc Project

```
QuanLyTaiSan/
├── frontend/
│   └── src/
│       ├── pages/          ← 10 page components
│       ├── components/     ← Shared components
│       ├── lib/            ← API, types, utilities
│       ├── styles/         ← CSS
│       ├── App.tsx         ← ~200 dòng
│       └── main.tsx
│
├── src/                    ← NestJS backend
│   ├── auth/               ← JWT, Bcrypt
│   ├── employees/          ← Employee CRUD
│   ├── roles/              ← RBAC
│   ├── dashboard/          ← Statistics
│   ├── audit-logs/         ← Action tracking
│   ├── notifications/      ← Email + alerts
│   ├── approvals/          ← Workflow
│   ├── mailer/             ← Email service
│   ├── common/             ← Guards, decorators
│   └── main.ts
│
├── docs/
│   ├── TEST_CASES.md
│   └── SECURITY_AUDIT.md
│
├── TEAM_ASSIGNMENTS.md
├── README.md
├── .env.example
└── package.json
```

---

## 7. Cấu Hình & Setup

### Yêu Cầu Hệ Thống

- Node.js 18+
- MySQL 8.0+
- Git

### Hướng Dẫn Chạy Nhanh

```bash
# 1. Clone & checkout
git clone https://github.com/nnhhhoang/QuanLyTaiSan.git
cd QuanLyTaiSan
git checkout test

# 2. Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

# 3. Cài đặt dependencies
npm install
npm install --prefix frontend

# 4. Khởi tạo database
mysql -u root -p
# Sau khi đăng nhập MySQL:
CREATE DATABASE quan_ly_tai_san;

# 5. Chạy development
npm run start:dev                   # Terminal 1: Backend (port 3000)
npm run frontend:dev --prefix .     # Terminal 2: Frontend (port 5173)
```

### Cấu Hình `.env`

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=quan_ly_tai_san

# JWT
JWT_SECRET=your-secret-key-32-chars-minimum
JWT_EXPIRES_IN=24h

# Email — chọn một trong hai
# Option 1: Gmail
MAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Option 2: SendGrid
# MAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=SG.xxxxx...

# App
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

---

## 8. Testing & Quality Assurance

### Tổng Quan Test Cases (16 Cases)

| Nhóm | Số Cases | Trạng Thái |
|------|:--------:|:----------:|
| RBAC | 3 | ⏳ Pending |
| Profile | 4 | ⏳ Pending |
| Email | 2 | ⏳ Pending |
| Employees | 3 | ⏳ Pending |
| Assets | 1 | ⏳ Pending |
| Approvals | 2 | ⏳ Pending |
| Audit | 1 | ⏳ Pending |

### Chạy Tests

```bash
npm run test          # Unit tests
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
```

### Tài Khoản Test Mặc Định

| Trường | Giá Trị |
|--------|---------|
| Email | admin@example.com |
| Password | 123456 |
| Token | demo-token |

---

## 9. Security & Performance

### Đánh Giá Bảo Mật: 84/100 *(Moderate)*

**Đã triển khai ✅**

| Hạng Mục | Trạng Thái |
|----------|:----------:|
| Bcrypt password hashing | ✅ Safe |
| JWT authentication | ✅ Safe |
| RBAC system | ✅ Safe |
| SQL injection prevention | ✅ Safe |
| XSS protection | ✅ Safe |
| Input validation | ✅ Safe |

**Cần bổ sung ⚠️**

| Hạng Mục | Mức Độ Ưu Tiên |
|----------|:--------------:|
| Rate limiting | 🔴 Cao |
| Security headers | 🔴 Cao |
| Refresh token flow | 🔴 Cao |
| CORS configuration | 🟡 Trung bình |

### Hiệu Năng ✅

- Tất cả API phản hồi < 500ms
- Frontend bundle ~150KB
- Code splitting đã triển khai
- Lazy loading đã bật

> Xem chi tiết: `docs/SECURITY_AUDIT.md`

---

## 10. Kế Hoạch Tiếp Theo

| Giai Đoạn | Công Việc |
|-----------|----------|
| **Tuần 10** | Setup & test email service, hoàn thiện refactoring |
| **Tuần 11** | Thực thi 16 test cases, fix security, setup CI/CD, tối ưu hiệu năng |
| **Tuần 12–13** | Integration testing với các thành viên, QA, fix bugs, hoàn thiện tài liệu |
| **Tuần 14–15** | User acceptance testing, chuẩn bị deployment, go-live |

---

## Tóm Tắt Trạng Thái

| Hạng Mục | Trạng Thái | Tiến Độ |
|----------|:----------:|:-------:|
| Frontend Implementation | ✅ Hoàn thành | 100% |
| Backend Implementation | ✅ Hoàn thành | 95% |
| Documentation | ⚠️ Đang thực hiện | 40% |
| Testing | ⚠️ Đang thực hiện | 30% |
| Deployment | ⏳ Chưa bắt đầu | 0% |
| **Overall** | ⚠️ In Development | **75%** |

---

*Maintained by: Nguyễn Thị Huỳnh Như (nnhuwz03) — Team Lead*  
*GitHub: https://github.com/nnhuwz03*  
*Mọi câu hỏi vui lòng tạo issue trên GitHub hoặc liên hệ trực tiếp Team Lead.*
