# He Thong Quan Ly Tai San QR

Ung dung fullstack quan ly tai san co dinh trong moi truong to chuc/truong hoc. Backend su dung **NestJS + MySQL**, frontend su dung **React + Vite + TypeScript**.

Branch hien tai:

```text
feature/asset-management-khoi
```

Nguoi thuc hien phan quan ly tai san:

```text
Nguyen Minh Khoi
```

---

## 1. Chuc Nang Chinh Cua Module Tai San

Module tai san gom cac chuc nang:

- Xem danh sach tai san
- Tim kiem, loc theo loai tai san, phong ban, trang thai
- Them tai san
- Sua thong tin tai san
- Tinh hao mon luy ke theo phan tram
- Hien thi nguyen gia, gia tri con lai
- Xem chi tiet tai san
- Hien thi QR tai san
- Xem lich su thay doi tai san
- Thanh ly tai san
- Hoan tat thanh ly tai san nhung van giu ban ghi trong database
- Import Excel danh sach tai san
- Export Excel danh sach tai san
- Tai file mau Excel
- Bao cao tai san theo tong quan, loai, phong ban, trang thai

---

## 2. Cong Nghe Su Dung

### Backend

- NestJS 11
- TypeScript
- MySQL2
- JWT Authentication
- Class Validator
- ExcelJS

### Frontend

- React 19
- Vite 6
- TypeScript
- Lucide React
- CSS thu cong trong `frontend/src/styles/index.css`

---

## 3. Cau Truc Backend

Phan backend module tai san nam trong:

```text
src/assets
```

Cac file chinh:

```text
src/assets/assets.module.ts
src/assets/assets.controller.ts
src/assets/assets.service.ts
src/assets/dto/query-assets.dto.ts
src/assets/dto/create-asset.dto.ts
src/assets/dto/update-asset.dto.ts
```

Trong do:

- `assets.controller.ts`: khai bao route API cho tai san
- `assets.service.ts`: xu ly nghiep vu, query database, import/export Excel, audit log
- `create-asset.dto.ts`: validate du lieu khi them tai san
- `update-asset.dto.ts`: validate du lieu khi sua tai san
- `query-assets.dto.ts`: validate query filter danh sach tai san

---

## 4. API Tai San

Tat ca API backend co prefix:

```text
/api
```

Bang API module tai san:

| Method | Endpoint | Chuc nang |
|---|---|---|
| GET | `/api/assets` | Lay danh sach tai san |
| GET | `/api/assets/:maTaiSan` | Lay chi tiet mot tai san |
| POST | `/api/assets` | Them tai san moi |
| PATCH | `/api/assets/:maTaiSan` | Cap nhat tai san |
| DELETE | `/api/assets/:maTaiSan` | Dua tai san vao muc thanh ly |
| DELETE | `/api/assets/:maTaiSan/finalize` | Hoan tat thanh ly, ghi audit log va giu ban ghi tai san |
| GET | `/api/assets/history/:maTaiSan` | Lay lich su thay doi tai san |
| GET | `/api/assets/report` | Bao cao tai san |
| GET | `/api/assets/meta/categories` | Lay danh muc loai tai san |
| GET | `/api/assets/import-template` | Tai file mau Excel |
| POST | `/api/assets/import` | Import Excel tai san |
| GET | `/api/assets/export` | Export Excel tai san |

Quyen lien quan:

```text
ASSET_VIEW
ASSET_CREATE
ASSET_EDIT
ASSET_DELETE
ASSET_EXPORT
REPORT_VIEW
```

---

## 5. Cau Truc Frontend Sau Khi Tach Component

Truoc day, phan lon frontend nam trong:

```text
frontend/src/App.tsx
```

Sau khi refactor, `App.tsx` chi con mo ung dung:

```tsx
import { AppContent } from './components/AppContent';

export default function App() {
  return <AppContent />;
}
```

Cau truc frontend hien tai:

```text
frontend/src
├── App.tsx
├── main.tsx
├── styles
│   └── index.css
├── components
│   ├── AppContent.tsx
│   ├── EmployeeModal.tsx
│   ├── Sidebar.tsx
│   ├── Toast.tsx
│   ├── ui.tsx
│   └── assets
│       ├── AssetModal.tsx
│       └── AssetDetailModal.tsx
├── pages
│   ├── DashboardPage.tsx
│   ├── EmployeesPage.tsx
│   ├── RolesPage.tsx
│   ├── ApprovalsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── SettingsPage.tsx
│   ├── AuditPage.tsx
│   ├── ProfilePage.tsx
│   ├── LoginScreen.tsx
│   └── assets
│       ├── AssetsPage.tsx
│       └── AssetReportPage.tsx
└── lib
    ├── api.ts
    ├── format.ts
    ├── mockData.ts
    ├── types.ts
    └── apis
        └── assetsApi.ts
```

---

## 6. Vai Tro Cua Tung File Frontend

### File dieu phoi

```text
frontend/src/components/AppContent.tsx
```

File nay giu state chung, xu ly dang nhap, load du lieu, dieu huong view va goi cac page tuong ung.

### Module giao dien tai san

```text
frontend/src/pages/assets/AssetsPage.tsx
```

Chua giao dien danh sach tai san:

- Bang tai san dang su dung
- Bang tai san thanh ly
- Loc/tim kiem tai san
- Nut them/sua/thanh ly/hoan tat thanh ly
- Import Excel
- Export Excel
- Tai mau Excel

```text
frontend/src/pages/assets/AssetReportPage.tsx
```

Chua giao dien bao cao tai san:

- Tong so tai san
- Tai san dang hoat dong
- Tai san thanh ly
- Tong nguyen gia
- Tong hao mon
- Tong gia tri con lai
- Thong ke theo loai tai san
- Thong ke theo phong ban
- Thong ke theo trang thai

### Component tai san

```text
frontend/src/components/assets/AssetModal.tsx
```

Form them/sua tai san.

```text
frontend/src/components/assets/AssetDetailModal.tsx
```

Popup xem chi tiet tai san, QR va lich su thay doi.

### API rieng cho tai san

```text
frontend/src/lib/apis/assetsApi.ts
```

Chua toan bo request lien quan den tai san:

- `assetsApi.list`
- `assetsApi.categories`
- `assetsApi.report`
- `assetsApi.history`
- `assetsApi.create`
- `assetsApi.update`
- `assetsApi.liquidate`
- `assetsApi.finalize`
- `assetsApi.importTemplate`
- `assetsApi.exportExcel`
- `assetsApi.importExcel`

### Helper dinh dang

```text
frontend/src/lib/format.ts
```

Chua cac ham:

- `formatDate`
- `formatCurrency`
- `formatCurrencyShort`
- `toDepreciationPercent`

---

## 7. Cau Hinh Moi Truong

Tao file `.env` o thu muc goc:

```text
.env
```

Noi dung mau:

```env
DB_HOST=34.44.235.59
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Ct555_2026
DB_NAME=quan_ly_tai_san_qr

JWT_SECRET=quanlytaisan-jwt-secret-key-2026-minimum-32-characters
JWT_EXPIRES_IN=24h

MAIL_PROVIDER=smtp
MAIL_FROM=noreply@quanlytaisan.local
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=
MAIL_PASSWORD=

FRONTEND_URL=http://localhost:5173

NODE_ENV=development
PORT=3000
```

Khong commit file `.env` len GitHub.

---

## 8. Cai Dat Va Chay Du An

Mo terminal tai thu muc:

```text
E:\Thực tập\KiemKeTS_HT\QuanLyTaiSan-khoi-branch
```

Cai dependencies:

```powershell
npm.cmd install
npm.cmd install --prefix frontend
```

Chay backend:

```powershell
npm.cmd run start:dev
```

Backend chay tai:

```text
http://localhost:3000
```

Chay frontend o terminal khac:

```powershell
npm.cmd run frontend:dev
```

Frontend chay tai:

```text
http://localhost:5173
```

---

## 9. Lenh Kiem Tra

Kiem tra TypeScript backend:

```powershell
npx.cmd tsc --noEmit --incremental false -p tsconfig.json
```

Kiem tra TypeScript frontend:

```powershell
npx.cmd tsc --noEmit -p frontend\tsconfig.json
```

Build frontend:

```powershell
npm.cmd run frontend:build
```

Chay test:

```powershell
npm.cmd test -- --runInBand
```

---

## 10. Database Chinh

Du an dung MySQL/Google Cloud SQL. Cac bang lien quan truc tiep den module tai san:

```text
TAI_SAN
LOAI_TAI_SAN
PHONG_BAN
NHAN_VIEN
AUDIT_LOG
CHI_TIET_PHIEU_DIEU_CHUYEN
CHI_TIET_PHIEU_KIEM_KE
```

Trang thai tai san:

```text
HOAT_DONG
BAO_TRI
HONG
DANG_LUAN_CHUYEN
DANG_SU_DUNG
THANH_LY
```

Trong do `THANH_LY` duoc dung de dua tai san vao muc thanh ly. Khi bam "Da ban / Hoan tat", backend chi ghi audit log hoan tat thanh ly va van giu ban ghi trong `TAI_SAN` de phuc vu lich su, kiem ke, dieu chuyen va bao cao.

---

## 11. Ghi Chu Khi Gop Code Voi Nhom

Khong nen copy de toan bo project len code cua nguoi khac. Nen gop theo module:

Backend:

```text
src/assets
```

Frontend:

```text
frontend/src/pages/assets
frontend/src/components/assets
frontend/src/lib/apis/assetsApi.ts
frontend/src/lib/format.ts
frontend/src/lib/types.ts
```

Can chu y khi gop cac file dung chung:

```text
frontend/src/components/AppContent.tsx
frontend/src/lib/api.ts
frontend/src/lib/types.ts
package.json
package-lock.json
```

Ly do: cac file dung chung co the cung duoc thanh vien khac sua, de xay ra conflict.

---

## 12. Trang Thai Hien Tai

Da kiem tra thanh cong:

```powershell
npx.cmd tsc --noEmit -p frontend\tsconfig.json
npm.cmd run frontend:build
```

Module quan ly tai san da duoc tach frontend theo cau truc ro hon, gan voi cach viet cua cac branch khac trong nhom.
