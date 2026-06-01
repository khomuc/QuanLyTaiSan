# 📋 Phân Công Công Việc — Dự Án Quản Lý Tài Sản QR

**Tuần 9–11: Hoàn Thiện Hệ Thống** | Cập nhật: 2025-06-01 | Người cập nhật: `nnhuwz03`

---

## 📊 Tổng Quan Nhiệm Vụ

| # | Nhiệm Vụ | Trạng Thái | Người Đảm Nhiệm | Deadline |
|---|---|---|---|---|
| 1 | Frontend Refactoring | ✅ Hoàn thành | nnhuwz03 | Tuần 10 |
| 2 | Profile Update Form | ✅ Hoàn thành | nnhuwz03 | Tuần 9 |
| 3 | Email Service | ⚠️ 85% | nnhuwz03 | Tuần 10 |
| 4 | Test Cases & RBAC | ⚠️ Tạo tài liệu | nnhuwz03 | Tuần 11 |
| 5 | Security & Performance | ⚠️ Tạo tài liệu | nnhuwz03 | Tuần 11 |
| 6 | CI/CD Pipeline | ⚠️ Tạo workflow | nnhuwz03 | Tuần 11 |

---

## Chi Tiết Từng Nhiệm Vụ

### 1️⃣ Frontend Refactoring — Tuần 10 ✅

> Tách `App.tsx` thành các page component độc lập, áp dụng `React.lazy()` và `useMemo()`

**Đầu ra:** `App.tsx` ≤ 200 dòng, page components độc lập, lazy loading hoạt động

- [x] Extract `DashboardPage.tsx`
- [x] Extract `AssetsPage.tsx`
- [x] Extract `EmployeesPage.tsx`
- [x] Extract `RolesPage.tsx`
- [x] Extract `ApprovalsPage.tsx`
- [x] Extract `NotificationsPage.tsx`
- [x] Extract `SettingsPage.tsx`
- [x] Extract `AuditPage.tsx`
- [x] Extract `ProfilePage.tsx`
- [x] Extract `LoginScreen.tsx`
- [x] Sử dụng `React.lazy()` + `Suspense`
- [x] `useMemo()` cho filter/search

---

### 2️⃣ Profile Update Form — Tuần 9 ✅

> Form cập nhật thông tin cá nhân và đổi mật khẩu

**Đầu ra:** ProfilePage hoàn chỉnh, có khả năng cập nhật đầy đủ thông tin

- [x] Form chỉnh sửa: Họ tên, Chức vụ, Số điện thoại, Phòng ban
- [x] Detect changes (enable/disable Save button)
- [x] Đổi mật khẩu (old → new password)
- [x] Backend API: `PATCH /auth/me`
- [x] Error handling & toast notification

---

### 3️⃣ Email Service Configuration — Tuần 10 ⚠️

> Cấu hình SMTP/Gmail/SendGrid, gửi auto reminder email

**Đầu ra:** Email tự động gửi khi có phiếu điều chuyển/kiểm kê chờ ký

- [x] `MailerService` hỗ trợ Gmail, SendGrid, SMTP
- [x] Template HTML approval reminder
- [x] Template HTML approval notification
- [x] Integration với `NotificationsService`
- [x] Log action trong `AUDIT_LOG`
- [x] Cấu hình `.env` file hoàn chỉnh
- [ ] **Test với Gmail/SendGrid thực tế** ← còn lại

**Cách setup:**

**Option 1: Gmail (Recommended)**
```bash
# 1. Enable 2FA trong Gmail
# 2. Tạo App Password: https://myaccount.google.com/apppasswords
# 3. Thêm vào .env:
MAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Option 2: SendGrid**
```bash
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx...
```

---

### 4️⃣ Test Cases & RBAC Kiểm Thử — Tuần 11 ⚠️

> Tài liệu: `docs/TEST_CASES.md`

Gồm **16 test cases** kiểm thử:

| Nhóm | Test Cases | Nội dung |
|---|---|---|
| RBAC | TC-001 → TC-003 | Employee, Admin, Manager roles |
| Profile | TC-004 → TC-007 | Update info, change password |
| Email | TC-008 → TC-009 | Approval notifications |
| Employees | TC-010 → TC-012 | Create, Edit, Deactivate |
| Assets | TC-013 | Filtering |
| Approvals | TC-014 → TC-015 | Sign & Reject workflow |
| Audit | TC-016 | Audit logging |

---

### 5️⃣ Security & Performance Assessment — Tuần 11 ⚠️

> Tài liệu: `docs/SECURITY_AUDIT.md` | Overall Score: **84/100 (MODERATE)**

| Hạng mục | Kết quả |
|---|---|
| Bcrypt password hashing | ✅ SAFE |
| SQL Injection prevention | ✅ SAFE |
| XSS protection | ✅ SAFE |
| Authentication & Authorization | ✅ SAFE |
| JWT token security | ⚠️ MODERATE RISK — missing refresh token |
| CORS configuration | ⚠️ Need config |
| API Response Time | ⚠️ EXCELLENT — all < 500ms |
| Rate Limiting | ❌ MISSING — HIGH PRIORITY |

---

### 6️⃣ CI/CD Pipeline Setup — Tuần 11 ⚠️

> File: `.github/workflows/ci.yml`

| Job | Mô tả |
|---|---|
| `build-and-test` | Lint, test, build backend & frontend |
| `security-scan` | npm audit + OWASP dependency check |
| `deploy-dev` | Auto deploy khi push to `test` branch |
| `deploy-prod` | Auto deploy khi push to `main` branch |
