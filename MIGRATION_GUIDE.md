# Hướng Dẫn Migrate từ State-Based Navigation sang React Router DOM

## 📋 Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Lý Do Migrate](#lý-do-migrate)
3. [Quá Trình Thay Đổi](#quá-trình-thay-đổi)
4. [Cài Đặt & Setup](#cài-đặt--setup)
5. [Cấu Trúc Mới](#cấu-trúc-mới)
6. [Các Thay Đổi Chi Tiết](#các-thay-đổi-chi-tiết)
7. [Hướng Dẫn Phát Triển](#hướng-dẫn-phát-triển)

---

## 🎯 Giới Thiệu

Dự án **Quản Lý Tài Sản** được xây dựng với React 19 và Vite. Ban đầu, hệ thống điều hướng (navigation) được quản lý hoàn toàn thông qua React state. Tuy nhiên, để cải thiện UX, SEO, và khả năng bảo trì, chúng tôi đã migrate sang **React Router DOM v6** làm khung sườn chính cho frontend.

---

## 💡 Lý Do Migrate

### ❌ Vấn Đề Cũ (State-Based Navigation)
```tsx
// Cách cũ: Quản lý view bằng state
const [view, setView] = useState<ViewKey>('dashboard');

function navigate(nextView: string) {
  setView(nextView as ViewKey);
}

function renderPage() {
  if (view === 'dashboard') return <DashboardPage />;
  if (view === 'assets') return <AssetsPage />;
  // ...
}
```

**Nhược điểm:**
- ❌ Không có URL - người dùng không thể bookmark hoặc chia sẻ link
- ❌ Back/Forward button không hoạt động
- ❌ Khó implement SEO
- ❌ Khó test và debug
- ❌ State quá phức tạp (view + data loading)
- ❌ Tất cả logic điều hướng phải viết thủ công

### ✅ Cách Mới (React Router DOM)
```tsx
// Cách mới: URL-based routing
<BrowserRouter>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/assets" element={<AssetsPage />} />
    {/* ... */}
  </Routes>
</BrowserRouter>
```

**Lợi ích:**
- ✅ URL rõ ràng: `/dashboard`, `/assets`, `/employees`
- ✅ Browser history hoạt động bình thường
- ✅ Người dùng có thể bookmark/chia sẻ links
- ✅ SEO friendly
- ✅ Code cleaner và dễ bảo trì
- ✅ Lazy loading routes tự động
- ✅ Dễ implement protected routes & guards

---

## 🔄 Quá Trình Thay Đổi

### Giai Đoạn 1: Phân Tích (Analysis)
- Xác định tất cả views/pages trong app
- Lập bản đồ views hiện tại:
  - `dashboard` → `/dashboard`
  - `assets` → `/assets`
  - `employees` → `/employees`
  - `roles` → `/roles`
  - `approvals` → `/approvals`
  - `notifications` → `/notifications`
  - `settings` → `/settings`
  - `audit` → `/audit`
  - `profile` → `/profile`

### Giai Đoạn 2: Chuẩn Bị Dependencies
- Thêm `react-router-dom@^6.20.0` vào `package.json`
- Chạy `npm install`

### Giai Đoạn 3: Tạo Router Configuration
- Tạo file `frontend/src/router/index.tsx`
- Định nghĩa routes structure
- Tạo `ProtectedRoute` component cho auth checks

### Giai Đoạn 4: Refactor Components
- Update `App.tsx`:
  - Wrap app với `<BrowserRouter>`
  - Thay `view` state bằng routing
  - Tách login/authenticated routes

- Update `AppLayout.tsx`:
  - Sử dụng `useNavigate()` hook
  - Sử dụng `useLocation()` hook
  - Sử dụng `<Outlet />` cho nested routes

- Update `Sidebar.tsx`:
  - Adapt navigation callback cho router

### Giai Đoạn 5: Testing & Deployment
- Kiểm tra tất cả routes hoạt động
- Test browser back/forward
- Verify protected routes

---

## 🚀 Cài Đặt & Setup

### 1. Cài Đặt Dependencies
```bash
cd frontend
npm install
```

### 2. Chạy Development Server
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5173`

### 3. Build cho Production
```bash
npm run build
```

### 4. Preview Build
```bash
npm run preview
```

---

## 📁 Cấu Trúc Mới

```
frontend/
├── src/
│   ├── router/
│   │   └── index.tsx              ← Router configuration (MỚI)
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── AssetsPage.tsx
│   │   ├── EmployeesPage.tsx
│   │   ├── RolesPage.tsx
│   │   ├── ApprovalsPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── AuditPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── LoginScreen.tsx
│   ├── components/
│   │   ├── AppLayout.tsx           ← Updated
│   │   ├── Sidebar.tsx             ← Updated
│   │   ├── EmployeeModal.tsx
│   │   ├── Toast.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── navigation.ts
│   │   └── mockData.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx                     ← Updated (Router setup)
│   └── main.tsx
├── package.json                   ← Updated (added react-router-dom)
└── vite.config.ts
```

---

## 🔧 Các Thay Đổi Chi Tiết

### 1. package.json - Thêm Dependency

**Trước:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

**Sau:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.20.0"
  }
}
```

### 2. App.tsx - Thêm Router Wrapper

**Trước:**
```tsx
function App() {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState<ViewKey>('dashboard');  // ❌ View state
  // ... hàng tấn state khác
  
  function renderPage() {
    if (view === 'dashboard') return <DashboardPage />;
    // ... hardcode logic
  }
  
  return <AppLayout>...</AppLayout>;
}
```

**Sau:**
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  // ✅ Không còn view state
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 3. AppLayout.tsx - Sử Dụng Router Hooks

**Trước:**
```tsx
interface AppLayoutProps {
  currentView: string;  // ❌ Prop từ parent
  onNavigate: (view: string) => void;
  // ...
}

export function AppLayout({
  currentView,
  onNavigate,
  // ...
}: AppLayoutProps) {
  return (
    <h1>{navItems.find(item => item.key === currentView)?.label}</h1>
  );
}
```

**Sau:**
```tsx
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export function AppLayout() {
  const navigate = useNavigate();      // ✅ Hook
  const location = useLocation();      // ✅ Hook
  
  // Map URL path to view key
  const currentView = routeToKeyMap[location.pathname];
  
  return (
    <div>
      <h1>{navItems.find(item => item.key === currentView)?.label}</h1>
      <Outlet />  {/* ✅ Render nested routes */}
    </div>
  );
}
```

### 4. Sidebar.tsx - Adapter cho Navigation

**Trước:**
```tsx
interface SidebarProps {
  currentView: string;  // ❌ Prop
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <button onClick={() => onNavigate('dashboard')}>
      Dashboard
    </button>
  );
}
```

**Sau:**
```tsx
export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  // ✅ onNavigate vẫn nhận view key, nhưng AppLayout convert sang path
  return (
    <button onClick={() => onNavigate('dashboard')}>
      Dashboard
    </button>
  );
}

// Trong AppLayout:
const handleNavigate = (path: string) => {
  navigate(`/${path}`);  // ✅ Convert view key to URL path
};
```

### 5. Router Configuration - File Mới

**File:** `frontend/src/router/index.tsx`

```tsx
import { lazy, ReactNode } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import type { AuthUser } from '../lib/types';
import { canAccessView } from '../lib/navigation';

// Lazy load pages
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AssetsPage = lazy(() => import('../pages/AssetsPage'));
// ... các pages khác

// Protected route component
export function ProtectedRoute({ children, user, requiredView }: ProtectedRouteProps) {
  if (!user || !canAccessView(user, requiredView as any)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Route definitions
export function createAppRoutes(user: AuthUser | null): RouteObject[] {
  return [
    {
      path: '/',
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute user={user} requiredView="dashboard">
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        // ... các routes khác
      ],
    },
  ];
}
```

---

## 📚 Hướng Dẫn Phát Triển

### Thêm Page Mới

1. **Tạo page component** - `src/pages/MyNewPage.tsx`
```tsx
export default function MyNewPage() {
  return <div>My New Page</div>;
}
```

2. **Thêm route** - trong `App.tsx`
```tsx
<Route
  path="/my-new-page"
  element={
    <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
      <MyNewPage />
    </Suspense>
  }
/>
```

3. **Thêm navigation item** - trong `src/lib/navigation.ts`
```tsx
const navItems: NavItem[] = [
  {
    key: 'my-new-page',
    label: 'My New Page',
    icon: MyIcon,
  },
  // ...
];
```

### Navigate từ Component

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/dashboard');
  };
  
  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### Lấy URL Parameters

```tsx
import { useParams } from 'react-router-dom';

function EmployeeDetailPage() {
  const { employeeId } = useParams();
  
  return <div>Employee: {employeeId}</div>;
}

// Route:
<Route path="/employees/:employeeId" element={<EmployeeDetailPage />} />
```

### Redirect sau khi hành động

```tsx
import { useNavigate } from 'react-router-dom';

function SaveButton() {
  const navigate = useNavigate();
  
  const handleSave = async () => {
    await api.save(data);
    navigate('/success');  // Redirect after save
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

---

## 🧪 Testing

### Test Navigation
```bash
# Mở browser
http://localhost:5173/dashboard
http://localhost:5173/assets
http://localhost:5173/employees

# Test back button - phải hoạt động
# Test forward button - phải hoạt động
```

### Test Protected Routes
```bash
# Logout rồi test
# Truy cập http://localhost:5173/assets
# Phải redirect về login
```

### Test Bookmarks
```bash
# Bookmark http://localhost:5173/employees
# Đóng tab, mở bookmark
# Phải vào trang employees
```

---

## 📖 Tài Liệu Tham Khảo

- [React Router DOM Official Docs](https://reactrouter.com/)
- [React Router v6 Migration Guide](https://reactrouter.com/en/main/guides/upgrading)
- [Nested Routes](https://reactrouter.com/en/main/route/route#children)
- [Protected Routes Pattern](https://reactrouter.com/en/main/guides/protecting-routes)

---

## ❓ FAQ

### Q: Tại sao lại chọn React Router DOM mà không dùng Remix hay Next.js?
**A:** React Router DOM là lightweight, không cần backend changes, và integrate dễ với Vite + React setup hiện tại.

### Q: Có cần thay đổi backend không?
**A:** Không. Backend không biết về frontend routing. Tất cả routing xảy ra client-side.

### Q: Làm sao với query parameters?
**A:** Sử dụng `useSearchParams` hook:
```tsx
const [searchParams] = useSearchParams();
const search = searchParams.get('q');
```

### Q: State management (Redux/Context) vẫn dùng được không?
**A:** Vâng. Router DOM và state management là independent. Có thể dùng Context API hay Redux cùng lúc.

### Q: Làm sao để dynamic route?
**A:** Dùng path parameters:
```tsx
<Route path="/employees/:id" element={<EmployeeDetail />} />
// Access: const { id } = useParams();
```

---

## 📝 Ghi Chú Quan Trọng

1. **URL Structure**: Tất cả URLs bắt đầu với `/` (e.g., `/dashboard`, `/assets`)
2. **Lazy Loading**: Tất cả pages được lazy load để optimize bundle
3. **Protected Routes**: Tất cả routes kiểm tra quyền user trước khi render
4. **Browser History**: Hoạt động tự động, không cần config thêm
5. **Hash Routes**: Nếu deploy trên static host (GitHub Pages), có thể sử dụng `HashRouter` thay `BrowserRouter`

---

## 🤝 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console browser (F12) cho errors
2. Xem network tab để kiểm tra API calls
3. Refer lại documentation trên tài liệu tham khảo
4. Check branch history để xem thay đổi chi tiết

---

**Last Updated**: June 5, 2026
**Maintained By**: homnaytoidilam
