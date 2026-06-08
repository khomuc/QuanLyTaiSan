# 📖 Hướng Dẫn Đăng Nhập Hệ Thống Quản Lý Tài Sản

## 🎯 Mục Đích

Tài liệu này hướng dẫn cách đăng nhập hệ thống với các vai trò khác nhau, cấp quyền hạn, và quản lý tài khoản nhân viên.

---

## 👥 Vai Trò & Tài Khoản Test

### 1️⃣ Admin (Quản Trị Viên)

| Thông Tin | Giá Trị |
|-----------|--------|
| **Email** | admin@example.com |
| **Mật khẩu** | 123456 |
| **Mã nhân viên** | NV001 |
| **Vai trò** | ADMIN |
| **Token Demo** | demo-token |

**✅ Quyền hạn:**
- ✓ Quản lý toàn bộ nhân viên (CRUD)
- ✓ Quản lý vai trò & phân quyền
- ✓ Cấu hình hệ thống
- ✓ Xem audit logs chi tiết
- ✓ Phê duyệt tài sản & kiểm kê
- ✓ Quản lý quyền hạn vượt quá (permission override)
- ✓ Quản lý bộ phận & phòng ban
- ✓ Xem tất cả thông báo & email

**📋 Trách nhiệm:**
- Cấu hình & duy trì hệ thống
- Quản lý tài khoản nhân viên
- Phê duyệt các yêu cầu quan trọng
- Kiểm tra lịch sử hoạt động (audit logs)

---

### 2️⃣ Trưởng Phòng (Manager / Quản Lý)

| Thông Tin | Giá Trị |
|-----------|--------|
| **Email** | manager@example.com |
| **Mật khẩu** | 123456 |
| **Mã nhân viên** | NV002 |
| **Vai trò** | MANAGER |

**✅ Quyền hạn:**
- ✓ Xem danh sách nhân viên trong phòng ban
- ✓ Phê duyệt tài sản trong phòng
- ✓ Xem & xuất báo cáo
- ✓ Quản lý tài sản của phòng
- ✗ Không được quản lý nhân viên ở phòng khác
- ✗ Không được thay đổi vai trò

**📋 Trách nhiệm:**
- Giám sát tài sản phòng ban
- Phê duyệt các yêu cầu điều chuyển
- Báo cáo định kỳ cho quản lý cấp trên

---

### 3️⃣ Nhân Viên Kế Toán (Accountant)

| Thông Tin | Giá Trị |
|-----------|--------|
| **Email** | accountant@example.com |
| **Mật khẩu** | 123456 |
| **Mã nhân viên** | NV003 |
| **Vai trò** | ACCOUNTANT |

**✅ Quyền hạn:**
- ✓ Xem danh sách tất cả tài sản
- ✓ Xem thông tin tài sản chi tiết
- ✓ Xuất báo cáo tài sản
- ✓ Lọc & tìm kiếm tài sản
- ✗ Không được sửa/xóa tài sản
- ✗ Không được phê duyệt
- ✗ Không được quản lý nhân viên

**📋 Trách nhiệm:**
- Báo cáo & thống kê tài sản
- Kiểm tra giá trị tài sản
- Tổng hợp dữ liệu cho kế toán

---

### 4️⃣ Nhân Viên Thường (Staff)

| Thông Tin | Giá Trị |
|-----------|--------|
| **Email** | staff@example.com |
| **Mật khẩu** | 123456 |
| **Mã nhân viên** | NV004 |
| **Vai trò** | STAFF |

**✅ Quyền hạn:**
- ✓ Cập nhật thông tin cá nhân
- ✓ Đổi mật khẩu
- ✓ Xem thông báo
- ✓ Xem tài sản được giao
- ✗ Không được sửa/xóa tài sản
- ✗ Không được phê duyệt
- ✗ Không được quản lý

**📋 Trách nhiệm:**
- Quản lý tài sản được giao
- Cập nhật thông tin cá nhân
- Theo dõi thông báo từ hệ thống

---

## 🔐 Quy Trình Đăng Nhập

### Bước 1: Truy Cập Trang Đăng Nhập

```
URL: http://localhost:5173/login
```

### Bước 2: Nhập Thông Tin

1. Nhập **Email** (ví dụ: `admin@example.com`)
2. Nhập **Mật khẩu** (ví dụ: `123456`)
3. Bấm nút **Đăng nhập**

### Bước 3: Xác Thực

Hệ thống sẽ:
- ✓ Kiểm tra email & mật khẩu
- ✓ Tạo JWT token (24 giờ)
- ✓ Lưu token vào localStorage
- ✓ Chuyển hướng tới Dashboard

### Bước 4: Truy Cập Trang Chủ

Bạn sẽ thấy:
- 📊 Dashboard với thống kê
- 📋 Menu sidebar theo vai trò
- 👤 Thông tin người dùng góc trên phải

---

## 🔑 Token & Lưu Trữ

### Vị Trí Lưu Token

```
localStorage: "qlts_access_token"
```

### Định Dạng Token

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Thời Hạn

- **Hiện tại:** 24 giờ
- **Sắp tới:** Refresh token (tự động làm mới)

### Xóa Token

Khi đăng xuất:
- ✓ Token bị xóa từ localStorage
- ✓ Session hết hạn
- ✓ Chuyển hướng tới trang đăng nhập

---

## 🛡️ Permission Override - Ghi Đè Quyền Hạn

### Khi Nào Dùng?

Cho phép tạm thời nhân viên thường được:
- Phê duyệt tài sản
- Quản lý bộ phận
- Truy cập các chức năng đặc biệt

### Cách Thực Hiện

**1. Truy cập Quản Lý Nhân Viên**

```
Sidebar → Nhân Viên → Quản Lý
```

**2. Chọn Nhân Viên**

- Tìm kiếm nhân viên từ danh sách bên trái
- Lọc theo phòng ban / vai trò / trạng thái
- Bấm vào nhân viên để chọn

**3. Cấp Quyền Hạn**

```
Bên phải hiển thị:
□ Phê duyệt tài sản
□ Quản lý phòng ban
□ Xem audit logs
□ Cấu hình hệ thống
... (danh sách quyền hạn)
```

**4. Lưu Thay Đổi**

- Tick các quyền cần cấp
- Bấm nút **Lưu Quyền Hạn**
- Chờ thông báo xác nhận

### ⚠️ Lưu Ý

- ✓ Ghi đè chỉ tạm thời (có thể thu hồi)
- ✓ Được ghi lại trong audit logs
- ✓ Admin có thể xem lịch sử ghi đè
- ✗ Không ảnh hưởng tới quyền mặc định của vai trò

---

## 🔍 Quản Lý Nhân Viên - Lọc & Giám Sát

### Trang Quản Lý Nhân Viên

```
Sidebar → Nhân Viên → Quản Lý
```

### Tìm Kiếm

- **Theo mã:** NV001, NV002, ...
- **Theo tên:** Nguyễn Văn A, Trần Thị B, ...
- **Theo email:** user@example.com
- **Theo phòng ban:** Văn phòng, Kế toán, ...

### Lọc Theo Phòng Ban

```
Phòng ban:
□ Tất cả phòng ban
□ Văn phòng
□ Kế toán
□ Bán hàng
□ Kho vận
...
```

### Lọc Theo Vai Trò

```
Vai trò:
□ Tất cả vai trò
□ ADMIN
□ MANAGER
□ ACCOUNTANT
□ STAFF
```

### Lọc Theo Trạng Thái

```
Trạng thái:
□ Tất cả trạng thái
□ ACTIVE (đang hoạt động)
□ INACTIVE (bị khóa)
```

### Ví Dụ Giám Sát

**Ví dụ 1:** Xem tất cả quản lý

```
Phòng ban: [Tất cả]
Vai trò: [MANAGER]
Trạng thái: [ACTIVE]
→ Hiển thị: Danh sách tất cả quản lý đang hoạt động
```

**Ví dụ 2:** Xem nhân viên phòng Kế toán

```
Phòng ban: [Kế toán]
Vai trò: [Tất cả vai trò]
Trạng thái: [ACTIVE]
→ Hiển thị: Danh sách nhân viên Kế toán
```

**Ví dụ 3:** Xem tài khoản bị khóa

```
Phòng ban: [Tất cả]
Vai trò: [Tất cả vai trò]
Trạng thái: [INACTIVE]
→ Hiển thị: Danh sách tài khoản bị khóa
```

---

## 📱 Màn Hình Chính

### Khi Đăng Nhập Thành Công

```
┌─────────────────────────────────────┐
│  Logo        [Dashboard] [Cấu hình] │
│────────────────────────────────────│
│ Sidebar │       Main Content       │
│ ─────── │ Dashboard               │
│ 📊 Dash │ • Thống kê nhân viên    │
│ 👥 Nhân │ • Thống kê tài sản      │
│ 💰 Tài  │ • Phê duyệt chờ xử lý  │
│ 📋 Kiểm │ • Hoạt động gần đây    │
│ 🔔 Thông│                         │
│ ⚙️ Cấu  │                         │
│────────────────────────────────────│
│ [Đăng xuất]  Tên người dùng        │
└─────────────────────────────────────┘
```

### Sidebar - Menu Theo Vai Trò

**Admin:**
- 📊 Dashboard
- 👥 Nhân Viên
- 💰 Tài Sản
- 🔐 Vai Trò
- 📋 Phê Duyệt
- 🔔 Thông Báo
- ⚙️ Cấu Hình
- 📑 Audit Log

**Manager:**
- 📊 Dashboard
- 👥 Nhân Viên (phòng ban)
- 💰 Tài Sản
- 📋 Phê Duyệt
- 📑 Báo Cáo

**Accountant:**
- 📊 Dashboard
- 💰 Tài Sản
- 📑 Báo Cáo

**Staff:**
- 📊 Dashboard
- 👤 Thông Tin Cá Nhân
- 🔔 Thông Báo

---

## ⚙️ Cấu Hình JWT & Token

### File `.env` Backend

```env
# JWT Configuration
JWT_SECRET=your-secret-key-32-chars-minimum
JWT_EXPIRES_IN=24h

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=quan_ly_tai_san

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Token Refresh (Sắp Tới)

```typescript
// Sắp tới sẽ hỗ trợ:
POST /auth/refresh
```

Sẽ tự động làm mới token mà không cần đăng nhập lại.

---

## 🐛 Troubleshooting

### ❌ Quên Mật Khẩu?

**Giải pháp:**
1. Liên hệ Admin
2. Admin sẽ reset mật khẩu
3. Tương tế reset sẽ gửi qua email (sắp tới)

```
Backend API: POST /auth/reset-password
Email: {email}
→ Gửi link reset đến email
```

### ❌ Token Hết Hạn?

**Xảy ra khi:**
- Vượt quá 24 giờ
- Đăng xuất rồi đăng nhập lại

**Giải pháp:**
- Đăng nhập lại để lấy token mới
- Sắp tới: Tự động làm mới (refresh token)

### ❌ Không Có Quyền Truy Cập?

**Kiểm tra:**
1. Vai trò của tài khoản
2. Quyền hạn ghi đè (nếu có)
3. Trạng thái tài khoản (ACTIVE/INACTIVE)

**Liên hệ:**
- Admin để cập nhật quyền hạn

### ❌ Lỗi "Invalid Token"

**Nguyên nhân:**
- Token hết hạn
- Token bị xóa
- Đăng xuất trong tab khác

**Giải pháp:**
- Tất cả các tab → Tải lại trang
- Đăng nhập lại

### ❌ Không Nhận Email?

**Kiểm tra:**
1. Email được cấu hình đúng?
2. Gmail App Password có đúng?
3. Kiểm tra thư Spam/Junk

---

## 📊 API Endpoints

### Authentication

```bash
# Đăng nhập
POST /api/auth/login
Body: { email, matKhau }
Response: { token, user }

# Lấy thông tin user hiện tại
GET /api/auth/me
Headers: { Authorization: Bearer {token} }

# Đổi mật khẩu
PATCH /api/auth/password
Headers: { Authorization: Bearer {token} }
Body: { matKhauCu, matKhauMoi }
```

### Employees

```bash
# Lấy danh sách nhân viên
GET /api/employees?search=...
GET /api/employees?maPhongBan=...
GET /api/employees?maVaiTro=...

# Lấy phòng ban
GET /api/employees/meta/departments

# Tạo nhân viên
POST /api/employees
Body: { maNhanVien, hoTen, email, maVaiTro, ... }

# Cập nhật nhân viên
PATCH /api/employees/{maNhanVien}
Body: { hoTen, email, ... }

# Khóa nhân viên
DELETE /api/employees/{maNhanVien}
```

---

## 📝 Tài Khoản Test Đầy Đủ

| Email | Mật khẩu | Vai Trò | Mục Đích |
|-------|----------|---------|---------|
| admin@example.com | 123456 | ADMIN | Quản trị hệ thống |
| manager@example.com | 123456 | MANAGER | Quản lý phòng ban |
| accountant@example.com | 123456 | ACCOUNTANT | Báo cáo tài sản |
| staff@example.com | 123456 | STAFF | Nhân viên thường |

---

## 📞 Hỗ Trợ

**Có vấn đề?**

1. 📧 Email: support@example.com
2. 🎫 Tạo issue trên GitHub
3. 💬 Liên hệ Team Lead

---

*Cập nhật lần cuối: 2025-06-08*  
*Phiên bản: 1.0*  
*Dành cho: Toàn bộ người dùng hệ thống*
