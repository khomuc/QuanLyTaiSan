# 📋 Phân Công Công Việc - Dự Án Quản Lý Tài Sản QR

## 🎯 **Tuần 9-11: Hoàn Thiện Hệ Thống**

### Danh Sách Nhiệm Vụ

| # | Nhiệm Vụ | Mô Tả | Trạng Thái | Người Đảm Nhiệm | Deadline |
|---|----------|-------|-----------|-----------------|----------|
| 1 | Frontend Refactoring | Tách App.tsx → DashboardPage, RolesPage, Sidebar... sử dụng React.lazy() | ✅ Hoàn thành | nnhhhoang | Tuần 10 |
| 2 | Profile Update Form | Thêm form chỉnh sửa info (Phone, Department) + đổi mật khẩu | ✅ Hoàn thành | nnhhhoang | Tuần 9 |
| 3 | Email Service | Cấu hình SMTP/Gmail/SendGrid, gửi auto reminder email | ⚠️ 85% | nnhhhoang | Tuần 10 |
| 4 | Test Cases & RBAC | Viết test cases kiểm thử RBAC (role-based access) | ⚠️ Tạo tài liệu | nnhhhoang | Tuần 11 |
| 5 | Security & Performance | Đánh giá Bcrypt, JWT, API response time | ⚠️ Tạo tài liệu | nnhhhoang | Tuần 11 |
| 6 | CI/CD Pipeline | Thiết lập GitHub Actions workflow | ⚠️ Tạo workflow | nnhhhoang | Tuần 11 |

### Chi Tiết Từng Nhiệm Vụ

#### **1️⃣ Frontend Refactoring (Tuần 10)** ✅
- [x] Extract DashboardPage.tsx
- [x] Extract AssetsPage.tsx
- [x] Extract EmployeesPage.tsx
- [x] Extract RolesPage.tsx
- [x] Extract ApprovalsPage.tsx
- [x] Extract NotificationsPage.tsx
- [x] Extract SettingsPage.tsx
- [x] Extract AuditPage.tsx
- [x] Extract ProfilePage.tsx
- [x] Extract LoginScreen.tsx
- [x] Sử dụng React.lazy() + Suspense
- [x] useMemo() cho filter/search

**Đầu ra:** App.tsx ≤ 200 dòng, page components độc lập, lazy loading hoạt động

---

#### **2️⃣ Profile Update Form (Tuần 9)** ✅
- [x] Form chỉnh sửa: Họ tên, Chức vụ, Số điện thoại, Phòng ban
- [x] Detect changes (enable/disable Save button)
- [x] Đổi mật khẩu (old → new password)
- [x] Backend API: PATCH /auth/me
- [x] Error handling & toast notification

**Đầu ra:** ProfilePage hoàn chỉnh, có khả năng cập nhật đầy đủ thông tin

---

#### **3️⃣ Email Service Configuration (Tuần 10)** ⚠️
- [x] MailerService hỗ trợ Gmail, SendGrid, SMTP
- [x] Template HTML approval reminder
- [x] Template HTML approval notification
- [x] Integration với NotificationsService
- [x] Log action trong AUDIT_LOG
- [ ] Test với Gmail/SendGrid thực tế
- [x] Cấu hình .env file hoàn chỉnh

**Đầu ra:** Email tự động gửi khi có phiếu điều chuyển/kiểm kê chờ ký

**Cách setup:**

**Option 1: Gmail (Recommended)**
```bash
# 1. Enable 2FA trong Gmail
# 2. Tạo App Password: https://myaccount.google.com/apppasswords
# 3. Thêm vào .env:
MAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx...

#### **4️⃣ Test Cases & RBAC Kiểm Thử (Tuần 11)** ⚠️
Tài liệu: docs/TEST_CASES.md

Gồm 16 test cases kiểm thử:

TC-001 đến TC-003: RBAC (Employee, Admin, Manager roles)
TC-004 đến TC-007: Profile Update (info, change password)
TC-008 đến TC-009: Email Notifications
TC-010 đến TC-012: Employee Management
TC-013: Assets Filtering
TC-014 đến TC-015: Approval Workflow
TC-016: Audit Logging

#### **5️⃣ Security & Performance Assessment (Tuần 11)** ⚠️
Tài liệu: docs/SECURITY_AUDIT.md

Đánh giá các khía cạnh:

✅ Bcrypt password hashing: SAFE
⚠️ JWT token security: MODERATE RISK (missing refresh token)
✅ SQL Injection prevention: SAFE
✅ XSS protection: SAFE
⚠️ CORS configuration: Need config
✅ Authentication & Authorization: SAFE
❌ Rate Limiting: MISSING (HIGH PRIORITY)
⚠️ API Response Time: EXCELLENT (all < 500ms)
Overall Score: 84/100 (MODERATE)

#### **6️⃣ CI/CD Pipeline Setup (Tuần 11)** ⚠️
File: .github/workflows/ci.yml

Gồm các jobs:

build-and-test: Lint, test, build backend & frontend
security-scan: npm audit + OWASP dependency check
deploy-dev: Auto deploy khi push to test branch
deploy-prod: Auto deploy khi push to main branch

Frontend Refactoring     ████████████████████░ 90%
Profile Update          ██████████████████████ 100%
Email Service           █████████████████░░░░ 85%
Test Cases              ████████░░░░░░░░░░░░░ 40% (Tài liệu tạo)
Security Audit          ████████░░░░░░░░░░░░░ 40% (Tài liệu tạo)
CI/CD Pipeline          ████████░░░░░░░░░░░░░ 40% (Workflow tạo)
────────────────────────────────
Overall:                ██████████░░░░░░░░░░░ 55%

Cập nhật lần cuối: 2025-06-01 | Người cập nhật: nnhuwz03

