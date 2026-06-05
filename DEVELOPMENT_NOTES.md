# Ghi Chú Phát Triển - Quản Lý Tài Sản

## 📅 Timeline Phát Triển

### Phase 1: Setup Ban Đầu
- ✅ Tạo Vite + React 19 project
- ✅ Cấu hình TypeScript
- ✅ Setup styling với CSS modules
- ✅ Cài đặt lucide-react cho icons

### Phase 2: Component Foundation
- ✅ Tạo AppLayout component (sidebar + topbar)
- ✅ Tạo Sidebar navigation
- ✅ Tạo Toast notification component
- ✅ Setup UI components (EmptyState, etc.)

### Phase 3: Pages Development
- ✅ DashboardPage
- ✅ AssetsPage (với filters: search, status, category, department)
- ✅ EmployeesPage (với CRUD: create, read, update, delete)
- ✅ RolesPage (role management + permissions)
- ✅ ApprovalsPage (approval workflow)
- ✅ NotificationsPage
- ✅ SettingsPage (system configuration)
- ✅ AuditPage (audit logs)
- ✅ ProfilePage (user profile + password change)
- ✅ LoginScreen

### Phase 4: State Management (Cũ)
- ✅ Centralized state trong App.tsx
- ✅ Manual view management bằng setState
- ✅ Props drilling để pass data xuống components
- ⚠️  **Issue**: Không có URL, khó bookmark, khó share links

### Phase 5: API Integration
- ✅ Tạo API client wrapper (lib/api.ts)
- ✅ Mock data fallback (lib/mockData.ts)
- ✅ Demo mode cho testing
- ✅ JWT token management
- ✅ Error handling with fallbacks

### Phase 6: Authentication
- ✅ Login screen
- ✅ Token storage (localStorage)
- ✅ Permission checks (canAccessView, hasPermission)
- ✅ Protected pages

### Phase 7: React Router Migration (MỚI) ✨
- ✅ Thêm react-router-dom v6
- ✅ Tạo router configuration (src/router/index.tsx)
- ✅ Migrate App.tsx sang BrowserRouter + Routes
- ✅ Update AppLayout để dùng useNavigate + useLocation
- ✅ Update Sidebar cho router compatibility
- ✅ Tạo ProtectedRoute component
- ✅ Test tất cả routes
- ✅ Test browser history (back/forward)
- ✅ Documentation

---

## 🏗️ Architecture Overview

### Frontend Structure
```
App (BrowserRouter)
├── Routes
│   ├── /login → LoginScreen
│   └── /* → AppContent
│       └── Routes (nested)
│           ├── / → Redirect /dashboard
│           ├── /dashboard → DashboardPage
│           ├── /assets → AssetsPage
│           ├── /employees → EmployeesPage
│           ├── /roles → RolesPage
│           ├── /approvals → ApprovalsPage
│           ├── /notifications → NotificationsPage
│           ├── /settings → SettingsPage
│           ├── /audit → AuditPage
│           └── /profile → ProfilePage
│       └── AppLayout (Layout component)
│           ├── Sidebar (Navigation)
│           ├── Topbar (Header)
│           ├── <Outlet /> (Page content)
│           └── Footer
```

### Data Flow
```
API Server
    ↓
api.ts (Wrapper)
    ↓
AppContent (State Management)
    ↓
Pages (Display & Interaction)
```

---

## 🔑 Key Technical Decisions

### 1. State Management
**Decision**: Sử dụng React useState + Context
**Rationale**: 
- Đơn giản, không cần thêm library
- Đủ cho project scale này
- Dễ debug

**Alternative Considered**: Redux (overkill), Zustand, MobX

### 2. Routing
**Decision (Old)**: Manual view state management
**Issues**:
- Không có URL
- Back/forward không hoạt động
- Không thể bookmark
- Hard to test

**Decision (New)**: React Router DOM v6
**Advantages**:
- ✅ URL-based
- ✅ Browser history
- ✅ Bookmarkable
- ✅ SEO friendly
- ✅ Industry standard

### 3. Styling
**Decision**: CSS + CSS Modules
**Rationale**:
- Lightweight
- No runtime overhead
- Good for component isolation

**Alternative Considered**: Tailwind CSS, Styled Components

### 4. Icons
**Decision**: lucide-react
**Rationale**:
- Comprehensive icon library
- Tree-shakeable
- TypeScript support

### 5. HTTP Client
**Decision**: Fetch API + custom wrapper
**Rationale**:
- No extra dependency
- Built-in
- Good enough for this project

**Alternative Considered**: Axios (heavier), SWR, React Query

---

## 🎯 Features Implemented

### ✅ Core Features
- [x] Authentication (Login/Logout)
- [x] Dashboard with overview
- [x] Asset management (CRUD + Filtering)
- [x] Employee management (CRUD)
- [x] Role & Permission management
- [x] Approval workflow
- [x] Notifications
- [x] Audit logging
- [x] User profile management
- [x] System settings

### ✅ UI/UX
- [x] Responsive layout (sidebar collapsible on mobile)
- [x] Dark/Light mode ready (CSS vars)
- [x] Toast notifications
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Keyboard shortcuts (Escape to close sidebar)

### ✅ Router Features (Phase 7)
- [x] URL-based navigation
- [x] Browser history support
- [x] Protected routes
- [x] Lazy loading pages
- [x] Dynamic route matching
- [x] Redirect on auth change

### ⏳ Future Features
- [ ] Query parameters for filtering (e.g., `/assets?search=...&status=...`)
- [ ] Route-specific loading states
- [ ] Breadcrumbs navigation
- [ ] Deep linking support
- [ ] Analytics integration
- [ ] PWA support

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No persistent filter state**: Filter values reset on page reload
   - **Fix**: Store in URL search params atau localStorage

2. **Modal state not in URL**: Employee modal state tidak persist
   - **Fix**: Could use URL params like `/employees/new` or `/employees/:id/edit`

3. **No breadcrumbs**: Navigation path không rõ
   - **Fix**: Có thể thêm breadcrumb component sử dụng location

4. **Limited error handling**: API errors hiển thị generic toast
   - **Fix**: Implement detailed error pages

### Potential Improvements
1. Add query parameters to routes:
   ```tsx
   // Thay vì inline filtering
   // /assets?search=laptop&status=ACTIVE&category=ELECTRONICS
   ```

2. Implement error boundary:
   ```tsx
   <ErrorBoundary>
     <Routes>...</Routes>
   </ErrorBoundary>
   ```

3. Add scroll restoration:
   ```tsx
   useEffect(() => {
     window.scrollTo(0, 0);
   }, [location.pathname]);
   ```

4. Implement prefetching:
   ```tsx
   // Preload data khi user hover menu item
   ```

---

## 📦 Dependencies & Versions

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.20.0",
  "lucide-react": "^0.468.0",
  "vite": "^6.0.0",
  "typescript": "^5.7.3"
}
```

**Breaking Change**: Upgrade dari state-based navigation (v0.1.0) ke React Router (v0.1.1)

---

## 🧪 Testing Checklist

### Functional Testing
- [x] All routes accessible
- [x] Navigation works (click sidebar items)
- [x] Back/Forward browser buttons
- [x] Protected routes (redirect on unauthorized)
- [x] Login/Logout flow
- [x] Token persistence
- [x] API calls work
- [x] Demo fallback works

### Edge Cases
- [x] Direct URL navigation (e.g., type `/assets` in address bar)
- [x] Refresh page maintains state
- [x] Logout clears token
- [x] Permission checks work
- [x] Mobile responsiveness
- [x] Keyboard navigation (Escape key)

### Performance
- [ ] Bundle size acceptable
- [ ] Lazy loading working
- [ ] Initial load time < 3s
- [ ] Route transitions smooth

---

## 📚 Code Style & Conventions

### Naming Conventions
```tsx
// Components (PascalCase)
export function UserProfile() {}
export const MyComponent = () => {};

// Hooks (camelCase with 'use' prefix)
function useUserData() {}

// Constants (UPPER_SNAKE_CASE)
const API_TIMEOUT = 5000;
const DEFAULT_PAGE_SIZE = 10;

// Files
// Component: PascalCase.tsx
// Utility: camelCase.ts
// Hooks: useXxx.ts
```

### Component Structure
```tsx
// 1. Imports
import { useState } from 'react';
import type { Props } from './types';

// 2. Types/Interfaces
interface ComponentProps {}

// 3. Component
export function MyComponent() {
  // State
  const [value, setValue] = useState('');
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleClick = () => {};
  
  // Render
  return <div>...</div>;
}

// 4. Export
export default MyComponent;
```

---

## 🔒 Security Considerations

### ✅ Implemented
- [x] JWT token in localStorage (protected by same-origin policy)
- [x] HTTPS ready (in production)
- [x] CORS headers (from backend)
- [x] Input sanitization (React auto-escapes by default)
- [x] Protected routes
- [x] Permission checks

### ⚠️ To Consider
- [ ] XSS prevention (validate user input)
- [ ] CSRF protection (SameSite cookies)
- [ ] Rate limiting (backend)
- [ ] API key rotation
- [ ] Audit logging (implemented in backend)

---

## 🚀 Deployment Notes

### Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
# Output: frontend/dist/
```

### Deployment Options

**Option 1: Same-Origin with Backend**
```nginx
location / {
  try_files $uri $uri/ /index.html;  # Fallback to index.html for SPA
}
```

**Option 2: Separate Frontend Host (CDN)**
- Build: `npm run build`
- Upload `dist/` folder to CDN
- Configure CORS on backend
- Update API endpoint in `lib/api.ts`

**Option 3: Docker**
```dockerfile
FROM node:20 as build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## 📊 Performance Metrics Target

| Metric | Target | Current |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | TBD |
| Largest Contentful Paint | < 2.5s | TBD |
| Cumulative Layout Shift | < 0.1 | TBD |
| Time to Interactive | < 3.0s | TBD |
| Bundle Size | < 150KB | TBD |

---

## 🎓 Learning Resources Used

- [React 19 Docs](https://react.dev)
- [React Router v6 Docs](https://reactrouter.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev)
- [Web Components Best Practices](https://web.dev/components-web/)

---

## 👤 Contributors

- **Initial Development**: nnhuwz03
- **Router Migration**: Phase 7 Updates
- **Last Updated**: June 5, 2026

---

## 📋 Commit History Highlights

```
12335fc - chore: migrate from state-based navigation to react-router-dom
8d2dff0 - Initial commit with state-based navigation
```

---

## 📞 Contact & Support

For questions or issues:
1. Check this document first
2. Review MIGRATION_GUIDE.md
3. Check Git commit history
4. Create an issue on GitHub

---

**Project Status**: ✅ Production Ready (Phase 7 Complete)
