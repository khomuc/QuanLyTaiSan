# 🔐 Hướng Dẫn Đăng Nhập — Hệ Thống Quản Lý Tài Sản QR

> Tài liệu này giải thích cách đăng nhập, phân quyền theo vai trò, quản lý quyền hạn và xử lý các sự cố thường gặp.

---

## 📋 Mục Lục

1. [Tài Khoản Test Nhanh](#1-tài-khoản-test-nhanh)
2. [Quy Trình Đăng Nhập](#2-quy-trình-đăng-nhập)
3. [Phân Quyền Theo Vai Trò](#3-phân-quyền-theo-vai-trò)
4. [Menu Sidebar Theo Vai Trò](#4-menu-sidebar-theo-vai-trò)
5. [JWT Token & Phiên Đăng Nhập](#5-jwt-token--phiên-đăng-nhập)
6. [Permission Override — Cấp Quyền Tạm Thời](#6-permission-override--cấp-quyền-tạm-thời)
7. [Quản Lý Nhân Viên & Lọc Tài Khoản](#7-quản-lý-nhân-viên--lọc-tài-khoản)
8. [API Xác Thực](#8-api-xác-thực)
9. [Xử Lý Sự Cố](#9-xử-lý-sự-cố)

---

## 1. Tài Khoản Test Nhanh

Dùng các tài khoản dưới đây để chạy thử hệ thống ngay sau khi cài đặt:

| Email | Mật khẩu | Vai Trò | Dùng để test |
|-------|----------|---------|-------------|
| admin@example.com | `123456` | ADMIN | Toàn bộ chức năng hệ thống |
| manager@example.com | `123456` | MANAGER | Quản lý phòng ban, phê duyệt |
| accountant@example.com | `123456` | ACCOUNTANT | Xem & xuất báo cáo tài sản |
| staff@example.com | `123456` | STAFF | Chức năng nhân viên cơ bản |

> ⚠️ **Thay đổi mật khẩu mặc định** trước khi triển khai lên môi trường thực tế.

---

## 2. Quy Trình Đăng Nhập

### Bước 1 — Truy cập trang đăng nhập

```
http://localhost:5173/login
```

*(Hoặc domain thực tế nếu đã deploy)*

### Bước 2 — Nhập thông tin

1. Nhập **Email** — ví dụ: `admin@example.com`
2. Nhập **Mật khẩu** — ví dụ: `123456`
3. Bấm nút **Đăng nhập**

### Bước 3 — Hệ thống xác thực

Khi thông tin đúng, hệ thống sẽ:

1. Kiểm tra email & mật khẩu (Bcrypt).
2. Tạo JWT token thời hạn 24 giờ.
3. Lưu token vào `localStorage` với key `qlts_access_token`.
4. Chuyển hướng đến trang **Dashboard**.

### Bước 4 — Giao diện sau đăng nhập

```
┌─────────────────────────────────────────────────┐
│  🗂️ Quản Lý Tài Sản QR          [Nguyễn Văn A] │
│─────────────────────────────────────────────────│
│  Sidebar        │        Main Content           │
│  ─────────────  │                               │
│  📊 Dashboard   │  Dashboard                    │
│  👥 Nhân Viên   │  • 120 nhân viên             │
│  💰 Tài Sản     │  • 350 tài sản               │
│  📋 Phê Duyệt   │  • 5 yêu cầu chờ duyệt      │
│  🔔 Thông Báo   │  • Hoạt động gần đây         │
│  ⚙️ Cấu Hình    │                               │
│  📑 Audit Log   │                               │
│─────────────────────────────────────────────────│
│  [Đăng xuất]                                    │
└─────────────────────────────────────────────────┘
```

---

## 3. Phân Quyền Theo Vai Trò

### 👑 ADMIN — Quản Trị Viên

**Thông tin mặc định:**

| Trường | Giá trị |
|--------|---------|
| Email | admin@example.com |
| Mật khẩu | 123456 |
| Mã nhân viên | NV001 |
| Token Demo | demo-token |

**Quyền hạn:**

- ✅ Toàn quyền quản lý nhân viên (tạo, sửa, khóa tài khoản)
- ✅ Quản lý vai trò và phân quyền
- ✅ Cấu hình hệ thống (tên app, JWT, email)
- ✅ Xem audit logs chi tiết toàn hệ thống
- ✅ Phê duyệt / từ chối mọi yêu cầu
- ✅ Cấp quyền ghi đè (Permission Override) cho nhân viên khác
- ✅ Xem tất cả thông báo và email hệ thống

**Trách nhiệm chính:** Cấu hình & duy trì hệ thống, quản lý tài khoản, kiểm soát audit logs.

---

### 🏢 MANAGER — Trưởng Phòng

**Thông tin mặc định:**

| Trường | Giá trị |
|--------|---------|
| Email | manager@example.com |
| Mật khẩu | 123456 |
| Mã nhân viên | NV002 |

**Quyền hạn:**

- ✅ Xem danh sách nhân viên trong phòng ban của mình
- ✅ Phê duyệt tài sản và điều chuyển trong phòng
- ✅ Xem và xuất báo cáo
- ✅ Quản lý tài sản của phòng
- ❌ Không quản lý nhân viên phòng khác
- ❌ Không thay đổi vai trò hệ thống

**Trách nhiệm chính:** Giám sát tài sản phòng ban, phê duyệt điều chuyển, báo cáo định kỳ.

---

### 📊 ACCOUNTANT — Nhân Viên Kế Toán

**Thông tin mặc định:**

| Trường | Giá trị |
|--------|---------|
| Email | accountant@example.com |
| Mật khẩu | 123456 |
| Mã nhân viên | NV003 |

**Quyền hạn:**

- ✅ Xem danh sách và chi tiết toàn bộ tài sản
- ✅ Xuất báo cáo tài sản (Excel, PDF)
- ✅ Lọc và tìm kiếm nâng cao
- ❌ Không sửa / xóa tài sản
- ❌ Không phê duyệt yêu cầu
- ❌ Không quản lý nhân viên

**Trách nhiệm chính:** Báo cáo & thống kê tài sản, kiểm tra giá trị, tổng hợp dữ liệu kế toán.

---

### 👤 STAFF — Nhân Viên Thường

**Thông tin mặc định:**

| Trường | Giá trị |
|--------|---------|
| Email | staff@example.com |
| Mật khẩu | 123456 |
| Mã nhân viên | NV004 |

**Quyền hạn:**

- ✅ Xem và cập nhật thông tin cá nhân
- ✅ Đổi mật khẩu
- ✅ Xem thông báo được gửi đến
- ✅ Xem tài sản được giao cho bản thân
- ❌ Không sửa / xóa tài sản
- ❌ Không phê duyệt bất kỳ yêu cầu nào
- ❌ Không quản lý nhân viên hoặc vai trò

**Trách nhiệm chính:** Quản lý tài sản được giao, cập nhật hồ sơ cá nhân, theo dõi thông báo.

---

## 4. Menu Sidebar Theo Vai Trò

| Menu Item | ADMIN | MANAGER | ACCOUNTANT | STAFF |
|-----------|:-----:|:-------:|:----------:|:-----:|
| 📊 Dashboard | ✅ | ✅ | ✅ | ✅ |
| 👥 Nhân Viên | ✅ (toàn hệ thống) | ✅ (phòng ban) | ❌ | ❌ |
| 💰 Tài Sản | ✅ | ✅ | ✅ (xem/báo cáo) | ✅ (tài sản được giao) |
| 🔐 Vai Trò & Phân Quyền | ✅ | ❌ | ❌ | ❌ |
| 📋 Phê Duyệt | ✅ | ✅ | ❌ | ❌ |
| 🔔 Thông Báo | ✅ | ✅ | ✅ | ✅ |
| ⚙️ Cấu Hình Hệ Thống | ✅ | ❌ | ❌ | ❌ |
| 📑 Audit Log | ✅ | ❌ | ❌ | ❌ |
| 👤 Hồ Sơ Cá Nhân | ✅ | ✅ | ✅ | ✅ |

---

## 5. JWT Token & Phiên Đăng Nhập

### Lưu Trữ Token

Token được lưu trong `localStorage` của trình duyệt:

```
Key:   qlts_access_token
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Thời Hạn

| Cấu hình | Giá trị mặc định |
|----------|:----------------:|
| Thời hạn token | 24 giờ |
| Biến môi trường | `JWT_EXPIRES_IN=24h` |

### Xóa Token — Đăng Xuất

Khi bấm **Đăng xuất:**

1. Token bị xóa khỏi `localStorage`.
2. Session hết hiệu lực ngay lập tức.
3. Người dùng được chuyển về trang đăng nhập.

### Sắp Ra Mắt: Refresh Token

```
POST /api/auth/refresh
→ Tự động làm mới token mà không cần đăng nhập lại
```

---

## 6. Permission Override — Cấp Quyền Tạm Thời

Chức năng dành riêng cho **ADMIN**, cho phép cấp quyền đặc biệt tạm thời cho nhân viên mà không cần thay đổi vai trò chính thức của họ.

### Khi Nào Dùng?

Ví dụ: Nhân viên cần phê duyệt một đợt kiểm kê trong khi Manager đang vắng. Admin có thể cấp tạm quyền phê duyệt cho người đó mà không cần nâng cấp toàn bộ vai trò.

### Các Quyền Có Thể Ghi Đè

- Phê duyệt tài sản
- Quản lý phòng ban
- Xem audit logs
- Cấu hình hệ thống

### Cách Thực Hiện

**1. Vào trang Quản Lý Nhân Viên:**

```
Sidebar → Nhân Viên
```

**2. Tìm và chọn nhân viên cần cấp quyền:**

- Dùng thanh tìm kiếm (theo tên, email, mã nhân viên).
- Lọc theo phòng ban / vai trò nếu cần.
- Bấm vào tên nhân viên để mở chi tiết.

**3. Cấp quyền ở bảng bên phải:**

```
Quyền hạn ghi đè:
☐ Phê duyệt tài sản
☐ Quản lý phòng ban
☐ Xem audit logs
☐ Cấu hình hệ thống
...
```

**4. Lưu thay đổi:**

- Tick vào quyền cần cấp.
- Bấm nút **Lưu Quyền Hạn**.
- Xác nhận qua thông báo toast.

### Lưu Ý Quan Trọng

- Ghi đè **chỉ mang tính tạm thời** — Admin có thể thu hồi bất kỳ lúc nào.
- Mọi thao tác ghi đè đều **được ghi vào Audit Log**.
- Không ảnh hưởng đến vai trò gốc của nhân viên.

---

## 7. Quản Lý Nhân Viên & Lọc Tài Khoản

### Truy Cập

```
Sidebar → Nhân Viên
```

*(Yêu cầu vai trò ADMIN hoặc MANAGER)*

### Tìm Kiếm

| Tìm theo | Ví dụ |
|----------|-------|
| Mã nhân viên | NV001, NV002 |
| Họ tên | Nguyễn Văn A |
| Email | user@example.com |
| Phòng ban | Kế toán, IT, Kho vận |

### Bộ Lọc

```
Phòng ban:   [Tất cả] | Văn phòng | Kế toán | Bán hàng | Kho vận | ...
Vai trò:     [Tất cả] | ADMIN | MANAGER | ACCOUNTANT | STAFF
Trạng thái:  [Tất cả] | ACTIVE | INACTIVE
```

### Ví Dụ Thực Tế

**Tìm tất cả quản lý đang hoạt động:**
```
Phòng ban: [Tất cả] | Vai trò: MANAGER | Trạng thái: ACTIVE
→ Danh sách tất cả Manager đang hoạt động
```

**Kiểm tra tài khoản bị khóa:**
```
Phòng ban: [Tất cả] | Vai trò: [Tất cả] | Trạng thái: INACTIVE
→ Danh sách toàn bộ tài khoản đã vô hiệu hóa
```

**Xem nhân viên phòng Kế toán:**
```
Phòng ban: Kế toán | Vai trò: [Tất cả] | Trạng thái: ACTIVE
→ Danh sách nhân viên Kế toán đang hoạt động
```

---

## 8. API Xác Thực

Base URL: `http://localhost:3000/api`

### Đăng Nhập

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "matKhau": "123456"
}
```

**Response thành công:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "maNhanVien": "NV001",
    "hoTen": "Nguyễn Văn A",
    "email": "admin@example.com",
    "maVaiTro": "ADMIN"
  }
}
```

### Lấy Thông Tin User Hiện Tại

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Đổi Mật Khẩu

```http
PATCH /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "matKhauCu": "123456",
  "matKhauMoi": "new_password"
}
```

### Reset Mật Khẩu *(Sắp có)*

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
→ Gửi link reset đến email
```

---

## 9. Xử Lý Sự Cố

### ❌ Đăng nhập không thành công

**Kiểm tra lần lượt:**

1. Email nhập đúng chính xác (phân biệt chữ thường/hoa).
2. Mật khẩu đúng (mặc định `123456` cho tài khoản test).
3. Tài khoản đang ở trạng thái **ACTIVE** (liên hệ Admin nếu bị khóa).
4. Backend đang chạy tại `http://localhost:3000`.
5. Database đã được khởi tạo và có dữ liệu seed.

---

### ❌ Token hết hạn / "Invalid Token"

**Nguyên nhân:**

- Token tồn tại quá 24 giờ.
- Đăng xuất trên một tab khác.
- Token bị xóa khỏi `localStorage`.

**Giải pháp:**

1. Tải lại trang — hệ thống tự phát hiện token hết hạn và chuyển về login.
2. Đăng nhập lại để lấy token mới.
3. *(Sắp có)* Refresh token tự động.

---

### ❌ Không có quyền truy cập trang

**Triệu chứng:** Thấy thông báo *"Tài khoản không có quyền truy cập trang này"*.

**Kiểm tra:**

1. Vai trò hiện tại có đủ quyền với trang đó không? (Xem [mục 4](#4-menu-sidebar-theo-vai-trò))
2. Tài khoản có được cấp Permission Override không?
3. Tài khoản đang ở trạng thái ACTIVE?

**Nếu cần quyền thêm:** Liên hệ Admin để được cấp Permission Override.

---

### ❌ Quên mật khẩu

**Hiện tại:**

1. Liên hệ Admin hệ thống.
2. Admin truy cập trang Quản Lý Nhân Viên → Chọn nhân viên → Reset mật khẩu.

**Sắp có:** Tự reset qua email (link đặt lại mật khẩu gửi vào hộp thư).

---

### ❌ Không nhận được email thông báo

**Kiểm tra theo thứ tự:**

1. File `.env` — biến `MAIL_PROVIDER`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` đã điền chính xác chưa?
2. Gmail — đã bật xác minh 2 bước và tạo App Password chưa? *(Không dùng mật khẩu Gmail thông thường)*
3. Thư mục **Spam / Junk** trong hộp thư nhận.
4. Log backend (`npm run start:dev`) để xem lỗi gửi mail cụ thể.

---

### ❌ Lỗi kết nối database

**Kiểm tra:**

1. MySQL đang chạy: `mysql -u root -p`
2. Database `quan_ly_tai_san` đã tồn tại: `SHOW DATABASES;`
3. Thông tin `.env` khớp: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
4. Restart backend: `npm run start:dev`.

---

## 📞 Liên Hệ Hỗ Trợ

| Kênh | Thông tin |
|------|-----------|
| GitHub Issues | [khomuc/QuanLyTaiSan/issues](https://github.com/khomuc/QuanLyTaiSan/issues) |
| Team Lead | [@nnhuwz03](https://github.com/nnhuwz03) |
| Email | support@example.com |

---

*Phiên bản: 1.0 — Cập nhật: 2025-06-08*  
*Dành cho: Toàn bộ người dùng và developer của hệ thống*
