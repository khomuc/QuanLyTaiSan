# Bug Fix: Quyền nhân viên không được lưu

## Root cause

Có **5 lỗi liên kết nhau** tạo thành một chain hoàn toàn broken:

```
[StaffManagementPage] handleSave() ← STUB, chỉ setTimeout 600ms, không gọi API
[api.ts]                           ← thiếu hàm overrideEmployeePermissions
[employees.controller.ts]          ← thiếu route PUT /employees/:id/permissions
[employees.service.ts]             ← thiếu method overridePermissions()
[auth.service.ts getPermissions()] ← chỉ đọc VAI_TRO_QUYEN, bỏ qua NHAN_VIEN_QUYEN
[Database]                         ← thiếu bảng NHAN_VIEN_QUYEN
```

---

## Các thay đổi cần thực hiện (theo thứ tự)

### 1. Database — chạy migration SQL

**File:** `001_add_nhan_vien_quyen.sql`

Tạo bảng `NHAN_VIEN_QUYEN` để lưu quyền riêng của từng nhân viên:

```sql
CREATE TABLE IF NOT EXISTS NHAN_VIEN_QUYEN (
  MaNhanVien VARCHAR(50)  NOT NULL,
  MaQuyen    VARCHAR(100) NOT NULL,
  PRIMARY KEY (MaNhanVien, MaQuyen),
  FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien) ON DELETE CASCADE,
  FOREIGN KEY (MaQuyen)    REFERENCES QUYEN(MaQuyen)         ON DELETE CASCADE
);
```

---

### 2. Backend — `src/auth/auth.service.ts`

**File patch:** `auth.service.getPermissions.patch.ts`

Thay `getPermissions()` hiện tại bằng version mới có thêm tham số `maNhanVien?`.
Sau đó cập nhật 3 call site trong cùng file:

| Nơi gọi | Trước | Sau |
|---------|-------|-----|
| `login()` | `getPermissions(employee.MaVaiTro)` | `getPermissions(employee.MaVaiTro, employee.MaNhanVien)` |
| `refresh()` | `getPermissions(employee.MaVaiTro)` | `getPermissions(employee.MaVaiTro, employee.MaNhanVien)` |
| `getProfile()` | `getPermissions(employee.MaVaiTro)` | `getPermissions(employee.MaVaiTro, employee.MaNhanVien)` |

---

### 3. Backend — `src/employees/employees.service.ts`

**File:** `employees.service.ts` (toàn bộ)

Thêm method `overridePermissions()` — xóa old rows trong `NHAN_VIEN_QUYEN` và insert set mới, trong 1 transaction.

---

### 4. Backend — `src/employees/employees.controller.ts`

**File:** `employees.controller.ts` (toàn bộ)

Thêm route:
```
PUT /employees/:maNhanVien/permissions
Body: { maQuyen: string[] }
Guard: STAFF_MANAGE hoặc ROLE_MANAGE
```

---

### 5. Frontend — `frontend/src/lib/api.ts`

**File patch:** `api.ts.patch.ts`

Thêm vào object `api`:
```typescript
overrideEmployeePermissions(maNhanVien: string, maQuyen: string[]) {
  return request<{ message: string; count: number }>(
    `/employees/${encodeURIComponent(maNhanVien)}/permissions`,
    { method: 'PUT', body: JSON.stringify({ maQuyen }) },
  );
},
```

---

### 6. Frontend — `frontend/src/pages/StaffManagementPage.tsx`

**File patch:** `StaffManagementPage.handleSave.patch.ts`

Thay `handleSave()` hiện tại (chỉ có `setTimeout`) bằng:
```typescript
async function handleSave() {
  if (!selectedEmployee) return;
  setSaving(true);
  try {
    await api.overrideEmployeePermissions(selectedEmployee.maNhanVien, selectedPerms);
    showToast('Đã cập nhật quyền hạn thành công!', 'success');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    showToast(`Lỗi: Không thể cập nhật quyền hạn — ${msg}`, 'error');
  } finally {
    setSaving(false);
  }
}
```

---

## Cách hoạt động sau khi fix

1. Admin tick/untick quyền trong `StaffManagementPage` → bấm **Lưu quyền hạn**
2. Frontend gọi `PUT /api/employees/:id/permissions` với danh sách quyền mới
3. Backend xóa rows cũ trong `NHAN_VIEN_QUYEN`, insert rows mới (trong transaction)
4. Nhân viên login lại → `auth.service.getPermissions()` đọc cả `VAI_TRO_QUYEN` + `NHAN_VIEN_QUYEN` → merge → trả về JWT có quyền đã cập nhật

> **Lưu ý:** Quyền chỉ được áp dụng sau khi nhân viên **logout rồi login lại** (vì JWT cũ vẫn có quyền cũ). Nếu muốn áp dụng ngay lập tức không cần logout, cần thêm logic invalidate token — nhưng đó là improvement riêng, không phải bug.
