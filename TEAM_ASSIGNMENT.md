# Phân Công Công Việc — Dự Án Quản Lý Tài Sản QR

**Giai đoạn:** Tuần 9–11 — Hoàn Thiện Hệ Thống  
**Người cập nhật:** nnhuwz03  
**Cập nhật lần cuối:** 2025-06-01

---

## Mục Lục

1. [Tổng Quan Nhiệm Vụ](#1-tổng-quan-nhiệm-vụ)
2. [Tiến Độ Tổng Hợp](#2-tiến-độ-tổng-hợp)
3. [Chi Tiết Từng Nhiệm Vụ](#3-chi-tiết-từng-nhiệm-vụ)

---

## 1. Tổng Quan Nhiệm Vụ

| # | Nhiệm Vụ | Người Đảm Nhiệm | Deadline | Trạng Thái |
|:-:|----------|:--------------:|:--------:|:----------:|
| 1 | Frontend Refactoring | nnhuwz03 | Tuần 10 | ✅ Hoàn thành |
| 2 | Profile Update Form | nnhuwz03 | Tuần 9 | ✅ Hoàn thành |
| 3 | Email Service | nnhuwz03 | Tuần 10 | ⚠️ 85% |
| 4 | Test Cases & RBAC | nnhuwz03 | Tuần 11 | ⚠️ Đang tạo tài liệu |
| 5 | Security & Performance | nnhuwz03 | Tuần 11 | ⚠️ Đang tạo tài liệu |
| 6 | CI/CD Pipeline | nnhuwz03 | Tuần 11 | ⚠️ Đang tạo workflow |

---

## 2. Tiến Độ Tổng Hợp

| Nhiệm Vụ | Tiến Độ | Trạng Thái |
|----------|:-------:|:----------:|
| Frontend Refactoring | 100% | ✅ |
| Profile Update Form | 100% | ✅ |
| Email Service | 85% | ⚠️ |
| Test Cases | 40% | ⚠️ |
| Security Audit | 40% | ⚠️ |
| CI/CD Pipeline | 40% | ⚠️ |
| **Overall** | **55%** | ⚠️ |

---

## 3. Chi Tiết Từng Nhiệm Vụ

### 3.1 Frontend Refactoring ✅ *(Tuần 10)*

**Mô tả:** Tách App.tsx thành các page components độc lập, áp dụng React.lazy() và Suspense.

**Checklist:**

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
- [x] Áp dụng `useMemo()` cho filter/search

**Kết quả đầu ra:** App.tsx ≤ 200 dòng, các page components độc lập, lazy loading hoạt động đúng.

---

### 3.2 Profile Update Form ✅ *(Tuần 9)*

**Mô tả:** Xây dựng form chỉnh sửa thông tin cá nhân và đổi mật khẩu.

**Checklist:**

- [x] Form chỉnh sửa: Họ tên, Chức vụ, Số điện thoại, Phòng ban
- [x] Detect changes — bật/tắt nút Lưu tự động
- [x] Chức năng đổi mật khẩu (mật khẩu cũ → mới)
- [x] Backend API: `PATCH /auth/me`
- [x] Error handling & toast notification

**Kết quả đầu ra:** ProfilePage hoàn chỉnh, hỗ trợ cập nhật đầy đủ thông tin cá nhân.

---

### 3.3 Email Service ⚠️ *(Tuần 10 — 85%)*

**Mô tả:** Cấu hình dịch vụ email để gửi thông báo tự động khi có phiếu chờ ký duyệt.

**Checklist:**

- [x] `MailerService` hỗ trợ Gmail, SendGrid, SMTP
- [x] Template HTML: nhắc nhở phê duyệt
- [x] Template HTML: thông báo phê duyệt
- [x] Tích hợp với `NotificationsService`
- [x] Ghi log vào `AUDIT_LOG`
- [x] Cấu hình `.env` hoàn chỉnh
- [ ] Test thực tế với Gmail / SendGrid *(đang thực hiện)*

**Kết quả đầu ra:** Email tự động gửi khi có phiếu điều chuyển / kiểm kê chờ ký.

**Hướng dẫn cấu hình:**

*Option 1 — Gmail (Khuyến nghị):*

```bash
# Bước 1: Bật 2FA trong tài khoản Gmail
# Bước 2: Tạo App Password tại https://myaccount.google.com/apppasswords
# Bước 3: Thêm vào .env
MAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

*Option 2 — SendGrid:*

```bash
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx...
```

---

### 3.4 Test Cases & RBAC ⚠️ *(Tuần 11 — 40%)*

**Mô tả:** Viết và thực thi 16 test cases kiểm thử toàn bộ hệ thống.  
**File output:** `docs/TEST_CASES.md`

**Danh sách test cases:**

| Mã | Nhóm | Số Cases | Trạng Thái |
|:--:|------|:--------:|:----------:|
| TC-001 → TC-003 | RBAC (Employee, Admin, Manager roles) | 3 | ⏳ Pending |
| TC-004 → TC-007 | Profile Update (thông tin & đổi mật khẩu) | 4 | ⏳ Pending |
| TC-008 → TC-009 | Email Notifications | 2 | ⏳ Pending |
| TC-010 → TC-012 | Employee Management | 3 | ⏳ Pending |
| TC-013 | Assets Filtering | 1 | ⏳ Pending |
| TC-014 → TC-015 | Approval Workflow | 2 | ⏳ Pending |
| TC-016 | Audit Logging | 1 | ⏳ Pending |
| | **Tổng** | **16** | |

---

### 3.5 Security & Performance Assessment ⚠️ *(Tuần 11 — 40%)*

**Mô tả:** Đánh giá toàn diện bảo mật và hiệu năng hệ thống.  
**File output:** `docs/SECURITY_AUDIT.md`

**Kết quả đánh giá hiện tại:**

| Hạng Mục | Trạng Thái | Ghi Chú |
|----------|:----------:|---------|
| Bcrypt password hashing | ✅ Safe | Đã triển khai |
| SQL Injection prevention | ✅ Safe | Đã triển khai |
| XSS protection | ✅ Safe | Đã triển khai |
| Authentication & Authorization | ✅ Safe | Đã triển khai |
| JWT token security | ⚠️ Moderate Risk | Thiếu refresh token |
| CORS configuration | ⚠️ Cần cấu hình | Chưa hoàn chỉnh |
| Rate Limiting | ❌ Missing | Ưu tiên cao |
| API Response Time | ✅ Excellent | Tất cả < 500ms |

**Điểm tổng thể: 84/100 — Moderate**

**Các việc cần làm:**

- [ ] Implement rate limiting (`@nestjs/throttler`) — 🔴 Ưu tiên cao
- [ ] Thêm security headers — 🔴 Ưu tiên cao
- [ ] Implement refresh token flow — 🔴 Ưu tiên cao
- [ ] Cấu hình CORS đúng chuẩn — 🟡 Trung bình

---

### 3.6 CI/CD Pipeline ⚠️ *(Tuần 11 — 40%)*

**Mô tả:** Thiết lập GitHub Actions để tự động hóa build, test và deploy.  
**File output:** `.github/workflows/ci.yml`

**Cấu trúc các jobs:**

| Job | Mô Tả | Trigger |
|-----|-------|---------|
| `build-and-test` | Lint, test, build backend & frontend | Mỗi push |
| `security-scan` | npm audit + OWASP dependency check | Mỗi push |
| `deploy-dev` | Auto deploy lên môi trường dev | Push to `test` branch |
| `deploy-prod` | Auto deploy lên môi trường production | Push to `main` branch |

**Checklist:**

- [ ] Build & test automation
- [ ] Lint checks
- [ ] Security scanning
- [ ] Auto-deploy to dev (branch `test`)
- [ ] Auto-deploy to prod (branch `main`)

---

*Maintained by: nnhuwz03 — Team Lead*
