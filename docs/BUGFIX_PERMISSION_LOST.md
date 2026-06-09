# 🐛 Báo Cáo & Hướng Dẫn Fix — Lỗi Quyền Bị Mất Khi Reload Trang Admin

## Tóm Tắt Vấn Đề

Admin set quyền cho nhân viên → bấm Lưu → reload trang → chọn lại nhân viên đó → **quyền vừa lưu bị mất, quay về quyền mặc định của vai trò**.

Nguyên nhân là **4 bugs** tạo thành một chuỗi lỗi hoàn chỉnh.

---

## Bug #1 — CRITICAL: `auth.service.ts` — Merge thay vì Override

**File:** `src/auth/auth.service.ts` — hàm `getPermissions()` dòng 302

### Code cũ (lỗi):
```typescript
return Array.from(new Set([...roleCodes, ...empCodes])).sort();
```

### Vấn đề:
Logic hiện tại **cộng dồn** (merge) quyền cá nhân vào quyền vai trò.  
Ví dụ: Vai trò có `[ASSET_VIEW, ASSET_EDIT, STAFF_VIEW]`, admin chỉ cho `[ASSET_VIEW]` → kết quả vẫn là `[ASSET_VIEW, ASSET_EDIT, STAFF_VIEW]`. **Override hoàn toàn vô hiệu!**

### Code mới (fix):
```typescript
// Nếu nhân viên có quyền riêng → dùng TOÀN BỘ những quyền đó (thay thế vai trò)
// Nếu chưa có override → kế thừa từ vai trò như bình thường
if (empCodes.length > 0) {
  return empCodes;
}
return roleCodes;
```

---

## Bug #2 — CRITICAL: `employees.service.ts` — Thiếu method `getEmployeePermissions()`

**File:** `src/employees/employees.service.ts`

### Vấn đề:
Backend có `overridePermissions()` (ghi), nhưng **không có method nào để đọc** quyền cá nhân từ bảng `NHAN_VIEN_QUYEN`. Frontend không thể biết nhân viên đã được cấu hình quyền gì.

### Code thêm vào (sau method `remove()`):
```typescript
async getEmployeePermissions(maNhanVien: string) {
  await this.findOne(maNhanVien); // đảm bảo nhân viên tồn tại

  const [rows] = await this.db.execute<RowDataPacket[]>(
    `SELECT MaQuyen FROM NHAN_VIEN_QUYEN WHERE MaNhanVien = ? ORDER BY MaQuyen`,
    [maNhanVien],
  );

  const permissions = rows.map((row) => String(row.MaQuyen));

  return {
    maNhanVien,
    permissions,
    hasOverride: permissions.length > 0,
  };
}
```

---

## Bug #3 — CRITICAL: `employees.controller.ts` — Thiếu endpoint `GET /:id/permissions`

**File:** `src/employees/employees.controller.ts`

### Vấn đề:
Không có HTTP endpoint nào để frontend gọi GET quyền cá nhân của nhân viên.

### Code thêm vào (ngay sau route `@Get(':maNhanVien')`):
```typescript
@Get(':maNhanVien/permissions')
@Permissions('STAFF_MANAGE', 'ROLE_MANAGE')
getPermissions(@Param('maNhanVien') maNhanVien: string) {
  return this.employeesService.getEmployeePermissions(maNhanVien);
}
```

> ⚠️ **Quan trọng về thứ tự route trong NestJS:** Route `':maNhanVien/permissions'`
> phải được đặt **TRƯỚC hoặc sau** `':maNhanVien'` — NestJS Express phân biệt được
> do path segment khác nhau nên thứ tự ở đây không gây conflict, nhưng để rõ ràng
> nên đặt sau `@Get(':maNhanVien')` và trước `@Patch(':maNhanVien')`.

---

## Bug #4 — CRITICAL: `api.ts` + `StaffManagementPage.tsx` — Frontend không load quyền đã lưu

### 4a. Thiếu hàm trong `frontend/src/lib/api.ts`

**Code thêm vào** (sau `overrideEmployeePermissions`):
```typescript
getEmployeePermissions(maNhanVien: string) {
  return request<{ maNhanVien: string; permissions: string[]; hasOverride: boolean }>(
    `/employees/${encodeURIComponent(maNhanVien)}/permissions`,
  );
},
```

### 4b. `handleSelectEmployee` trong `frontend/src/pages/StaffManagementPage.tsx`

**Code cũ (lỗi):**
```typescript
function handleSelectEmployee(emp: Employee) {
  setSelectedEmployee(emp);
  const role = roles.find((r) => r.maVaiTro === emp.maVaiTro);
  setSelectedPerms(role?.permissions ?? []); // ← LUÔN dùng quyền vai trò, bỏ qua quyền đã save!
}
```

**Vấn đề:** Sau khi reload trang, khi admin click vào nhân viên, hàm này luôn load quyền từ **role** thay vì quyền cá nhân đã lưu trong DB → nên nhìn thấy "mất dữ liệu".

**Code mới (fix):**
```typescript
async function handleSelectEmployee(emp: Employee) {
  setSelectedEmployee(emp);
  // Hiển thị quyền từ vai trò trước (fallback tức thì, không chờ API)
  const role = roles.find((r) => r.maVaiTro === emp.maVaiTro);
  setSelectedPerms(role?.permissions ?? []);

  // Sau đó fetch quyền riêng của nhân viên từ backend
  try {
    const result = await api.getEmployeePermissions(emp.maNhanVien);
    if (result.hasOverride) {
      // Nhân viên đã được cấu hình quyền riêng → dùng những quyền đó
      setSelectedPerms(result.permissions);
    }
    // Nếu !result.hasOverride → giữ nguyên quyền từ vai trò đã set ở trên
  } catch {
    // Nếu API lỗi → giữ quyền từ vai trò (đã set ở trên)
  }
}
```

**Và update call site trong JSX:**
```typescript
// Cũ:
onClick={() => handleSelectEmployee(emp)}
// Mới:
onClick={() => void handleSelectEmployee(emp)}
```

---

## Sơ Đồ Luồng Lỗi

```
Admin click nhân viên
        │
        ▼
handleSelectEmployee(emp)   ← Bug #4b: luôn lấy role.permissions,
        │                              KHÔNG gọi API để lấy quyền cá nhân
        ▼
setSelectedPerms(role.permissions)
        │
        ▼
Admin thấy quyền MẶC ĐỊNH của vai trò
(không phải quyền đã lưu trước đó)

---

Employee login sau khi admin save:
        │
        ▼
auth.service.getPermissions(maVaiTro, maNhanVien)   ← Bug #1: merge thay vì override
        │
        ▼
return [...roleCodes, ...empCodes]   ← nhân viên vẫn giữ TOÀN BỘ quyền vai trò
                                        (không thu hồi được quyền nào)
```

## Luồng Sau Khi Fix

```
Admin click nhân viên
        │
        ▼
handleSelectEmployee(emp) [async]
        ├── setSelectedPerms(role.permissions)   ← fallback tức thì (UX tốt)
        │
        ▼
api.getEmployeePermissions(emp.maNhanVien)   ← GET /employees/:id/permissions [MỚI]
        │
        ├── hasOverride = true  → setSelectedPerms(individualPerms)   ← hiển thị đúng
        └── hasOverride = false → giữ nguyên role.permissions (chưa cấu hình cá nhân)

---

Employee login sau khi admin save:
        │
        ▼
auth.service.getPermissions(maVaiTro, maNhanVien)   [ĐÃ FIX]
        │
        ├── empCodes.length > 0  → return empCodes    ← override thực sự
        └── empCodes.length === 0 → return roleCodes  ← kế thừa vai trò
```

---

## Danh Sách Files Cần Thay Đổi

| File | Loại Thay Đổi |
|------|--------------|
| `src/auth/auth.service.ts` | Sửa logic merge → override |
| `src/employees/employees.service.ts` | Thêm method `getEmployeePermissions()` |
| `src/employees/employees.controller.ts` | Thêm `GET :maNhanVien/permissions` endpoint |
| `frontend/src/lib/api.ts` | Thêm hàm `getEmployeePermissions()` |
| `frontend/src/pages/StaffManagementPage.tsx` | Sửa `handleSelectEmployee` thành async + gọi API |

---

## Cách Apply Fix

```bash
# Dùng patch files đã tạo sẵn:
cd /path/to/QuanLyTaiSan

patch -p1 < fix_auth_service.patch
patch -p1 < fix_employees_service.patch
patch -p1 < fix_employees_controller.patch
patch -p1 < fix_api.patch
patch -p1 < fix_staffpage.patch

# Hoặc copy trực tiếp các file đã sửa
```

---

*Fix được phân tích bởi Claude — June 2026*
