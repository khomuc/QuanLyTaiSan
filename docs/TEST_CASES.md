# 🧪 Test Cases — Hệ Thống Quản Lý Tài Sản QR

**Cập nhật:** 2025-06-01

---

## 📊 Summary

| Test Suite | Số Test | Pass | Fail | Pending | Coverage |
|---|---|---|---|---|---|
| RBAC | 3 | 0 | 0 | 3 | ⬜ Pending |
| Profile | 4 | 0 | 0 | 4 | ⬜ Pending |
| Email | 2 | 0 | 0 | 2 | ⬜ Pending |
| Employees | 3 | 0 | 0 | 3 | ⬜ Pending |
| Assets | 1 | 0 | 0 | 1 | ⬜ Pending |
| Approvals | 2 | 0 | 0 | 2 | ⬜ Pending |
| Audit | 1 | 0 | 0 | 1 | ⬜ Pending |
| **TOTAL** | **16** | **0** | **0** | **16** | **⬜ Pending** |

---

## I. 🛡️ Test RBAC (Role-Based Access Control)

### TC-001 — Employee Role: Restricted Access

> **Mục đích:** Kiểm thử nhân viên thường không được phép truy cập trang admin

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Login với tài khoản `EMP001` (NHAN_VIEN role) | Login thành công | ⬜ |
| 2 | Kiểm tra Navigation menu | Chỉ thấy: Dashboard, Assets, Profile | ⬜ |
| 3 | Truy cập `/roles` (direct URL) | Hiển thị: "Tài khoản không có quyền truy cập trang này" | ⬜ |
| 4 | Truy cập `/settings` | Hiển thị: "Tài khoản không có quyền truy cập trang này" | ⬜ |
| 5 | Truy cập `/audit` | Hiển thị: "Tài khoản không có quyền truy cập trang này" | ⬜ |

> 📝 Kiểm tra RBAC middleware đang block request đúng cách

---

### TC-002 — Admin Role: Full Access

> **Mục đích:** Kiểm thử admin có quyền truy cập tất cả trang

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Login với tài khoản `ADMIN` (ADMIN role) | Login thành công | ⬜ |
| 2 | Kiểm tra Navigation menu | Thấy đủ: Dashboard, Assets, Employees, Roles, Approvals, Notifications, Settings, Audit, Profile | ⬜ |
| 3 | Truy cập `/roles` | Trang Roles hiển thị đúng, có nút Save | ⬜ |
| 4 | Truy cập `/settings` | Trang Settings hiển thị đúng | ⬜ |
| 5 | Truy cập `/audit` | Trang Audit Log hiển thị đúng | ⬜ |

---

### TC-003 — Manager Role: Partial Access

> **Mục đích:** Kiểm thử manager có quyền riêng

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Login với tài khoản Manager | Login thành công | ⬜ |
| 2 | Kiểm tra Navigation menu | Thấy: Dashboard, Assets, Employees, Approvals, Profile | ⬜ |
| 3 | Truy cập `/roles` | Không có quyền | ⬜ |
| 4 | Kiểm tra Permission: `STAFF_CREATE` | Menu Employees có nút Create | ⬜ |

---

## II. 👤 Test Chức Năng Profile Update

### TC-004 — Update Profile Information

> **Mục đích:** Kiểm thử cập nhật thông tin cá nhân

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Login thành công | Vào được Profile page | ⬜ |
| 2 | Click "Cập nhật thông tin" | Form hiển thị với data hiện tại | ⬜ |
| 3 | Thay đổi: Họ tên = "Nguyễn Văn B" | Save button enable | ⬜ |
| 4 | Thay đổi: Số điện thoại = "0909123456" | Save button enable | ⬜ |
| 5 | Thay đổi: Phòng ban = "IT Department" | Save button enable | ⬜ |
| 6 | Click Save | Toast: "Đã cập nhật thông tin cá nhân" | ⬜ |
| 7 | Reload page | Dữ liệu được lưu lại đúng | ⬜ |

---

### TC-005 — Change Password: Success

> **Mục đích:** Kiểm thử đổi mật khẩu thành công

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Login thành công | Vào được Profile page | ⬜ |
| 2 | Scroll đến "Đổi mật khẩu" | Form có 2 input: Mật khẩu cũ, Mật khẩu mới | ⬜ |
| 3 | Nhập Mật khẩu cũ = `123456` | Input nhận | ⬜ |
| 4 | Nhập Mật khẩu mới = `newPass123!` | Input nhận | ⬜ |
| 5 | Click "Cập nhật mật khẩu" | Toast: "Đã đổi mật khẩu" | ⬜ |
| 6 | Logout → Login với mật khẩu mới | Login thành công | ⬜ |

---

### TC-006 — Change Password: Wrong Old Password

> **Mục đích:** Kiểm thử đổi mật khẩu với mật khẩu cũ sai

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Vào Profile page | Hiển thị form | ⬜ |
| 2 | Nhập Mật khẩu cũ = `wrongPass123` | Input nhận | ⬜ |
| 3 | Nhập Mật khẩu mới = `newPass123!` | Input nhận | ⬜ |
| 4 | Click "Cập nhật mật khẩu" | Toast lỗi: "Mật khẩu cũ không đúng" | ⬜ |

---

### TC-007 — Change Password: Validation

> **Mục đích:** Kiểm thử validation mật khẩu mới

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Vào Profile page | Hiển thị form | ⬜ |
| 2 | Nhập Mật khẩu mới < 6 ký tự | Button disabled | ⬜ |
| 3 | Nhập Mật khẩu mới = `12345` (5 ký tự) | Button disabled | ⬜ |
| 4 | Nhập Mật khẩu mới = `123456` (6 ký tự) | Button enabled | ⬜ |

---

## III. 📧 Test Email Notification

### TC-008 — Send Approval Reminder Email

> **Mục đích:** Kiểm thử gửi email nhắc nhở ký duyệt

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Tạo Phiếu Điều Chuyển trong hệ thống | Phiếu tạo thành công | ⬜ |
| 2 | Gán người ký duyệt = `manager1@company.com` | Gán thành công | ⬜ |
| 3 | Click "Gửi nhắc nhở" | Toast: "Email gửi thành công" | ⬜ |
| 4 | Kiểm tra inbox `manager1@company.com` | Email nhận được với tiêu đề chứa mã phiếu | ⬜ |
| 5 | Kiểm tra nội dung email | Có link "Truy cập hệ thống" | ⬜ |

---

### TC-009 — Email Approval Notification

> **Mục đích:** Kiểm thử gửi email thông báo kết quả ký duyệt

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Manager ký duyệt phiếu | Phiếu được cập nhật | ⬜ |
| 2 | Hệ thống gửi email tới người lập phiếu | Email gửi đi | ⬜ |
| 3 | Kiểm tra email nhận được | Tiêu đề: "Phiếu ... đã được ký duyệt" | ⬜ |

---

## IV. 👥 Test Employee Management

### TC-010 — Create Employee

> **Mục đích:** Kiểm thử tạo nhân viên mới

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Login với ADMIN role | Login thành công | ⬜ |
| 2 | Vào Employees page | Hiển thị danh sách | ⬜ |
| 3 | Click "Tạo nhân viên mới" | Modal form hiển thị | ⬜ |
| 4 | Nhập: Mã = `EMP999`, Tên = `Test User` | Input nhận | ⬜ |
| 5 | Nhập: Email = `test@company.com` | Input nhận | ⬜ |
| 6 | Click Save | Toast: "Đã lưu nhân viên" | ⬜ |
| 7 | Kiểm tra danh sách | EMP999 xuất hiện ở đầu danh sách | ⬜ |

---

### TC-011 — Edit Employee

> **Mục đích:** Kiểm thử chỉnh sửa thông tin nhân viên

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Vào Employees page | Hiển thị danh sách | ⬜ |
| 2 | Click Edit trên nhân viên bất kỳ | Modal form hiển thị với dữ liệu hiện tại | ⬜ |
| 3 | Thay đổi Số điện thoại | Input nhận | ⬜ |
| 4 | Click Save | Toast: "Đã lưu nhân viên" | ⬜ |
| 5 | Reload page | Dữ liệu được cập nhật | ⬜ |

---

### TC-012 — Deactivate Employee

> **Mục đích:** Kiểm thử vô hiệu hóa tài khoản nhân viên

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Vào Employees page | Hiển thị danh sách | ⬜ |
| 2 | Click Deactivate trên nhân viên | Dialog xác nhận hiển thị | ⬜ |
| 3 | Click Confirm | Toast: "Đã khóa tài khoản nhân viên" | ⬜ |
| 4 | Kiểm tra danh sách | Status nhân viên = `INACTIVE` | ⬜ |
| 5 | Nhân viên cố đăng nhập | Login thất bại | ⬜ |

---

## V. 📦 Test Assets Management

### TC-013 — View Assets with Filters

> **Mục đích:** Kiểm thử xem danh sách tài sản và lọc

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Vào Assets page | Hiển thị danh sách tài sản | ⬜ |
| 2 | Filter: Status = `HOAT_DONG` | Danh sách được lọc | ⬜ |
| 3 | Filter: Category = `Computer` | Danh sách được lọc | ⬜ |
| 4 | Filter: Department = `IT` | Danh sách được lọc | ⬜ |
| 5 | Search: Tên = `Laptop` | Danh sách được lọc | ⬜ |

---

## VI. ✅ Test Approval Workflow

### TC-014 — Sign Approval

> **Mục đích:** Kiểm thử ký duyệt phiếu

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Vào Approvals page | Hiển thị danh sách phiếu chờ | ⬜ |
| 2 | Click "Ký duyệt" trên phiếu | Modal xác nhận hiển thị | ⬜ |
| 3 | Click Confirm | Toast: "Đã ký duyệt" | ⬜ |
| 4 | Kiểm tra danh sách | Phiếu không còn trong danh sách | ⬜ |

---

### TC-015 — Reject Approval

> **Mục đích:** Kiểm thử từ chối phiếu

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Vào Approvals page | Hiển thị danh sách phiếu chờ | ⬜ |
| 2 | Click "Từ chối" trên phiếu | Modal xác nhận hiển thị | ⬜ |
| 3 | Click Confirm | Toast: "Đã từ chối" | ⬜ |
| 4 | Kiểm tra danh sách | Phiếu được đánh dấu từ chối | ⬜ |

---

## VII. 📋 Test Audit Logging

### TC-016 — Audit Log Recording

> **Mục đích:** Kiểm thử ghi nhận tất cả hành động vào audit log

| # | Hành động | Kỳ vọng | Kết quả |
|---|---|---|---|
| 1 | Thực hiện: Tạo nhân viên | Hành động thực hiện thành công | ⬜ |
| 2 | Vào Audit page | Hiển thị audit logs | ⬜ |
| 3 | Kiểm tra log mới nhất | Hiển thị: Người dùng, Hành động, Đối tượng, Thời gian | ⬜ |
| 4 | Thực hiện: Sửa phòng ban | Hành động thực hiện thành công | ⬜ |
| 5 | Kiểm tra audit log | Log mới được tạo | ⬜ |
