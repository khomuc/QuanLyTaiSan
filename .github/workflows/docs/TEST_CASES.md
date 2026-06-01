# 🧪 Test Cases - Hệ Thống Quản Lý Tài Sản QR

## I. Test RBAC (Role-Based Access Control)

### TC-001: Employee Role - Restricted Access
**Mục đích:** Kiểm thử nhân viên thường không được phép truy cập trang admin

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Login với tài khoản `EMP001` (NHAN_VIEN role) | ✓ Login thành công | ⬜ Pending |
| 2 | Kiểm tra Navigation menu | Chỉ thấy: Dashboard, Assets, Profile | ⬜ Pending |
| 3 | Cố gắng truy cập `/roles` (direct URL) | Hiển thị: "Tài khoản không có quyền truy cập trang này" | ⬜ Pending |
| 4 | Cố gắng truy cập `/settings` | Hiển thị: "Tài khoản không có quyền truy cập trang này" | ⬜ Pending |
| 5 | Cố gắng truy cập `/audit` | Hiển thị: "Tài khoản không có quyền truy cập trang này" | ⬜ Pending |

**Ghi chú:** Kiểm tra RBAC middleware đang block request đúng cách

---

### TC-002: Admin Role - Full Access
**Mục đích:** Kiểm thử admin có quyền truy cập tất cả trang

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Login với tài khoản `ADMIN` (ADMIN role) | ✓ Login thành công | ⬜ Pending |
| 2 | Kiểm tra Navigation menu | Thấy: Dashboard, Assets, Employees, Roles, Approvals, Notifications, Settings, Audit, Profile | ⬜ Pending |
| 3 | Truy cập `/roles` | Trang Roles hiển thị đúng, có nút Save | ⬜ Pending |
| 4 | Truy cập `/settings` | Trang Settings hiển thị đúng | ⬜ Pending |
| 5 | Truy cập `/audit` | Trang Audit Log hiển thị đúng | ⬜ Pending |

---

### TC-003: Manager Role - Partial Access
**Mục đích:** Kiểm thử manager có quyền riêng

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Login với tài khoản Manager | ✓ Login thành công | ⬜ Pending |
| 2 | Kiểm tra Navigation menu | Thấy: Dashboard, Assets, Employees, Approvals, Profile | ⬜ Pending |
| 3 | Cố gắng vào `/roles` | Không có quyền | ⬜ Pending |
| 4 | Kiểm tra Permission: STAFF_CREATE | Menu Employees có nút Create | ⬜ Pending |

---

## II. Test Chức Năng Profile Update

### TC-004: Update Profile Information
**Mục đích:** Kiểm thử cập nhật thông tin cá nhân

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Login thành công | ✓ Vào được Profile page | ⬜ Pending |
| 2 | Click "Cập nhật thông tin" section | Form hiển thị với data hiện tại | ⬜ Pending |
| 3 | Thay đổi: Họ tên = "Nguyễn Văn B" | Save button enable | ⬜ Pending |
| 4 | Thay đổi: Số điện thoại = "0909123456" | Save button enable | ⬜ Pending |
| 5 | Thay đổi: Phòng ban = "IT Department" | Save button enable | ⬜ Pending |
| 6 | Click Save | Toast: "Đã cập nhật thông tin cá nhân" | ⬜ Pending |
| 7 | Reload page | Dữ liệu được lưu lại đúng | ⬜ Pending |

---

### TC-005: Change Password Success
**Mục đích:** Kiểm thử đổi mật khẩu thành công

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Login thành công | ✓ Vào được Profile page | ⬜ Pending |
| 2 | Scroll đến "Đổi mật khẩu" section | Form có 2 input: Mật khẩu cũ, Mật khẩu mới | ⬜ Pending |
| 3 | Nhập Mật khẩu cũ = "123456" | ✓ Input mặc định | ⬜ Pending |
| 4 | Nhập Mật khẩu mới = "newPass123!" | ✓ Input nhận | ⬜ Pending |
| 5 | Click "Cập nhật mật khẩu" | Toast: "Đã đổi mật khẩu" | ⬜ Pending |
| 6 | Logout & Login với mật khẩu mới | ✓ Login thành công | ⬜ Pending |

---

### TC-006: Change Password - Wrong Old Password
**Mục đích:** Kiểm thử đổi mật khẩu với mật khẩu cũ sai

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Vào Profile page | ✓ Hiển thị form | ⬜ Pending |
| 2 | Nhập Mật khẩu cũ = "wrongPass123" | ✓ Input nhận | ⬜ Pending |
| 3 | Nhập Mật khẩu mới = "newPass123!" | ✓ Input nhận | ⬜ Pending |
| 4 | Click "Cập nhật mật khẩu" | Toast lỗi: "Mật khẩu cũ không đúng" | ⬜ Pending |

---

### TC-007: Change Password - Validation
**Mục đích:** Kiểm thử validation mật khẩu mới

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Vào Profile page | ✓ Hiển thị form | ⬜ Pending |
| 2 | Nhập Mật khẩu mới < 6 ký tự | Button disabled | ⬜ Pending |
| 3 | Nhập Mật khẩu mới = "12345" (5 ký tự) | Button disabled | ⬜ Pending |
| 4 | Nhập Mật khẩu mới = "123456" (6 ký tự) | Button enabled | ⬜ Pending |

---

## III. Test Email Notification

### TC-008: Send Approval Reminder Email
**Mục đích:** Kiểm thử gửi email nhắc nhở ký duyệt

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Tạo Phiếu Điều Chuyển trong hệ thống | ✓ Phiếu tạo thành công | ⬜ Pending |
| 2 | Gán người ký duyệt = "manager1@company.com" | ✓ Gán thành công | ⬜ Pending |
| 3 | Click "Gửi nhắc nhở" | Toast: "Email gửi thành công" | ⬜ Pending |
| 4 | Kiểm tra inbox manager1@company.com | Email nhận được với tiêu đề chứa mã phiếu | ⬜ Pending |
| 5 | Kiểm tra nội dung email | Có link "Truy cập hệ thống" | ⬜ Pending |

---

### TC-009: Email Approval Notification
**Mục đích:** Kiểm thử gửi email thông báo kết quả ký duyệt

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Manager ký duyệt phiếu | ✓ Phiếu được cập nhật | ⬜ Pending |
| 2 | Hệ thống gửi email tới người lập phiếu | ✓ Email gửi đi | ⬜ Pending |
| 3 | Kiểm tra email nhận được | Tiêu đề: "Phiếu ... đã được ký duyệt" | ⬜ Pending |

---

## IV. Test Employee Management

### TC-010: Create Employee
**Mục đích:** Kiểm thử tạo nhân viên mới

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Login với ADMIN role | ✓ Login thành công | ⬜ Pending |
| 2 | Vào Employees page | ✓ Hiển thị danh sách | ⬜ Pending |
| 3 | Click "Tạo nhân viên mới" | Modal form hiển thị | ⬜ Pending |
| 4 | Nhập: Mã = "EMP999", Tên = "Test User" | ✓ Input nhận | ⬜ Pending |
| 5 | Nhập: Email = "test@company.com" | ✓ Input nhận | ⬜ Pending |
| 6 | Click Save | Toast: "Đã lưu nhân viên" | ⬜ Pending |
| 7 | Kiểm tra danh sách | EMP999 xuất hiện ở đầu danh sách | ⬜ Pending |

---

### TC-011: Edit Employee
**Mục đích:** Kiểm thử chỉnh sửa thông tin nhân viên

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Vào Employees page | ✓ Hiển thị danh sách | ⬜ Pending |
| 2 | Click Edit trên nhân viên bất kỳ | Modal form hiển thị với dữ liệu hiện tại | ⬜ Pending |
| 3 | Thay đổi Số điện thoại | ✓ Input nhận | ⬜ Pending |
| 4 | Click Save | Toast: "Đã lưu nhân viên" | ⬜ Pending |
| 5 | Reload page | Dữ liệu được cập nhật | ⬜ Pending |

---

### TC-012: Deactivate Employee
**Mục đích:** Kiểm thử vô hiệu hóa tài khoản nhân viên

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Vào Employees page | ✓ Hiển thị danh sách | ⬜ Pending |
| 2 | Click Delete/Deactivate trên nhân viên | Xác nhận dialog hiển thị | ⬜ Pending |
| 3 | Click Confirm | Toast: "Đã khóa tài khoản nhân viên" | ⬜ Pending |
| 4 | Kiểm tra danh sách | Status nhân viên = INACTIVE | ⬜ Pending |
| 5 | Nhân viên cố đăng nhập | Login thất bại | ⬜ Pending |

---

## V. Test Assets Management

### TC-013: View Assets with Filters
**Mục đích:** Kiểm thử xem danh sách tài sản và lọc

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Vào Assets page | ✓ Hiển thị danh sách tài sản | ⬜ Pending |
| 2 | Filter theo Status = "HOAT_DONG" | ✓ Danh sách được lọc | ⬜ Pending |
| 3 | Filter theo Category = "Computer" | ✓ Danh sách được lọc | ⬜ Pending |
| 4 | Filter theo Department = "IT" | ✓ Danh sách được lọc | ⬜ Pending |
| 5 | Search theo tên = "Laptop" | ✓ Danh sách được lọc | ⬜ Pending |

---

## VI. Test Approval Workflow

### TC-014: Sign/Reject Approval
**Mục đích:** Kiểm thử ký duyệt/từ chối phiếu

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Vào Approvals page | ✓ Hiển thị danh sách phiếu chờ | ⬜ Pending |
| 2 | Click "Ký duyệt" trên phiếu | Modal xác nhận hiển thị | ⬜ Pending |
| 3 | Click Confirm | Toast: "Đã ký duyệt" | ⬜ Pending |
| 4 | Kiểm tra danh sách | Phiếu không còn trong danh sách | ⬜ Pending |

---

### TC-015: Reject Approval
**Mục đích:** Kiểm thử từ chối phiếu

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Vào Approvals page | ✓ Hiển thị danh sách phiếu chờ | ⬜ Pending |
| 2 | Click "Từ chối" trên phiếu | Modal xác nhận hiển thị | ⬜ Pending |
| 3 | Click Confirm | Toast: "Đã từ chối" | ⬜ Pending |
| 4 | Kiểm tra danh sách | Phiếu được đánh dấu từ chối | ⬜ Pending |

---

## VII. Test Audit Logging

### TC-016: Audit Log Recording
**Mục đích:** Kiểm thử ghi nhận tất cả hành động vào audit log

| Bước | Hành động | Kỳ vọng | Kết quả |
|------|----------|---------|--------|
| 1 | Thực hiện hành động: Tạo nhân viên | ✓ Hành động thực hiện | ⬜ Pending |
| 2 | Vào Audit page | ✓ Hiển thị audit logs | ⬜ Pending |
| 3 | Kiểm tra log mới nhất | Hiển thị: Người dùng, Hành động, Đối tượng, Thời gian | ⬜ Pending |
| 4 | Thực hiện hành động: Sửa phòng ban | ✓ Hành động thực hiện | ⬜ Pending |
| 5 | Kiểm tra audit log mới | Log mới được tạo | ⬜ Pending |

---

## ✅ Summary

| Test Suite | Số Test | Pass | Fail | Pending | Coverage |
|-----------|---------|------|------|---------|----------|
| RBAC | 3 | 0 | 0 | 3 | Pending |
| Profile | 4 | 0 | 0 | 4 | Pending |
| Email | 2 | 0 | 0 | 2 | Pending |
| Employees | 3 | 0 | 0 | 3 | Pending |
| Assets | 1 | 0 | 0 | 1 | Pending |
| Approvals | 2 | 0 | 0 | 2 | Pending |
| Audit | 1 | 0 | 0 | 1 | Pending |
| **TOTAL** | **16** | **0** | **0** | **16** | **Pending** |

---

**Cập nhật:** 2025-06-01