# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-05

### 🎉 Major Changes

#### Migrated to React Router DOM
Complete migration from state-based navigation to React Router DOM v6 for better UX and maintainability.

### Added
- **Router Configuration** (`src/router/index.tsx`)
  - Centralized route definitions
  - Protected routes with `ProtectedRoute` component
  - URL-based navigation (9 main routes)
  - Type-safe route matching

- **Router Hooks Usage**
  - `useNavigate()` in AppLayout for programmatic navigation
  - `useLocation()` for current route detection
  - `<Outlet />` for nested route rendering

- **Documentation**
  - `MIGRATION_GUIDE.md` - Detailed migration guide
  - `DEVELOPMENT_NOTES.md` - Project architecture & decisions
  - `CHANGELOG.md` - This file

### Changed
- **App.tsx**
  - Wrapped with `<BrowserRouter>`
  - Removed `view` state management
  - Split into `App` (auth handling) and `AppContent` (routing)
  - Routes now define page rendering instead of conditional logic

- **AppLayout.tsx**
  - Uses `useNavigate()` hook instead of callback
  - Uses `useLocation()` to detect current route
  - Renders `<Outlet />` for nested routes
  - Automatically maps URL path to view label

- **Sidebar.tsx**
  - Updated TypeScript types for optional user prop
  - Navigation still works with router via adapter pattern
  - No breaking changes for component consumers

- **package.json**
  - Added `react-router-dom@^6.20.0` dependency

### Benefits
✅ **URL-based routing** - Users can bookmark and share links
✅ **Browser history** - Back/Forward buttons work correctly
✅ **Browser bookmarks** - Deep linking is possible
✅ **SEO friendly** - Better for search engine crawlers
✅ **Code organization** - Routes defined in one place
✅ **Lazy loading** - Pages load on demand
✅ **Type safety** - Full TypeScript support
✅ **Standard pattern** - Industry-standard routing solution

### Migration Guide
See `MIGRATION_GUIDE.md` for detailed step-by-step migration instructions and comparisons.

### Testing
All routes tested:
- ✅ Direct URL navigation works
- ✅ Sidebar navigation works
- ✅ Browser back/forward buttons work
- ✅ Protected routes redirect correctly
- ✅ Auth state persists across navigation
- ✅ Page refresh maintains routing

### Backwards Compatibility
⚠️ **BREAKING CHANGE**: URL structure changed from state-based to path-based
- Old: Single page app with internal state
- New: `/dashboard`, `/assets`, `/employees`, etc.

Users will need to update bookmarks if they had any.

---

## [0.1.0] - 2026-06-05 (Initial Release)

### Initial Features

#### Core Functionality
- [x] User authentication (Login/Logout)
- [x] Dashboard with asset overview
- [x] Asset management (Create, Read, Update, Delete)
- [x] Employee management (CRUD operations)
- [x] Role & Permission management
- [x] Approval workflow system
- [x] Notification system
- [x] Audit logging
- [x] User profile management
- [x] System settings

#### UI/UX
- [x] Responsive sidebar navigation (collapsible on mobile)
- [x] Top navigation bar with user menu
- [x] Toast notifications
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Keyboard support (Escape to close sidebar)

#### Components
- [x] AppLayout (main layout wrapper)
- [x] Sidebar (collapsible navigation)
- [x] Topbar (header with user profile)
- [x] Toast (notification component)
- [x] EmployeeModal (modal for employee CRUD)
- [x] UI components (EmptyState, Loading, etc.)

#### Pages (9 total)
- [x] LoginScreen
- [x] DashboardPage
- [x] AssetsPage (with filters: search, status, category, department)
- [x] EmployeesPage (with search and CRUD)
- [x] RolesPage (role & permission management)
- [x] ApprovalsPage (approval workflow)
- [x] NotificationsPage
- [x] SettingsPage (system configuration)
- [x] AuditPage (audit logs)
- [x] ProfilePage (user profile + password)

#### State Management
- [x] Centralized state in App.tsx
- [x] Manual view management with useState
- [x] Props drilling for data distribution
- [x] Local storage for auth token
- [x] Demo mode with mock data fallback

#### API Integration
- [x] Custom fetch wrapper (lib/api.ts)
- [x] Mock data (lib/mockData.ts)
- [x] Demo mode support
- [x] JWT token management
- [x] Error handling with fallbacks

#### Authentication
- [x] Login flow
- [x] Token storage (localStorage)
- [x] Permission checks
- [x] Logout functionality
- [x] Protected pages

#### Styling
- [x] CSS modules
- [x] Responsive design
- [x] Sidebar collapse animation
- [x] Modal styling
- [x] Loading skeleton

### Tech Stack
- React 19.0.0
- TypeScript 5.7.3
- Vite 6.0.0
- lucide-react 0.468.0
- CSS (no framework)

### Known Limitations
- Navigation through state (no URLs)
- No browser history support
- No bookmarking capability
- All logic in App.tsx (large component)
- Hard to test routing logic

### Future Improvements
- [ ] Migrate to React Router DOM (✅ DONE in v0.2.0)
- [ ] Add query parameters
- [ ] Implement error boundaries
- [ ] Add breadcrumbs
- [ ] PWA support
- [ ] Offline support

---

## Version Numbering

- **Major (0)**: Framework/architecture changes
- **Minor (1-2)**: Feature additions or significant refactors
- **Patch**: Bug fixes and small improvements

---

## How to Read This Changelog

- 🎉 **Major features**
- ✨ **New features**
- 🔧 **Changes/Improvements**
- 🐛 **Bug fixes**
- ⚠️ **Breaking changes**
- 📚 **Documentation**
- 🚀 **Performance**

---

## Unreleased

### Planned for Next Release
- [ ] Query parameter filtering for assets
- [ ] Breadcrumb navigation
- [ ] Advanced search
- [ ] Export to CSV/PDF
- [ ] Email notifications
- [ ] Real-time updates with WebSocket
- [ ] Dark mode toggle
- [ ] Multi-language support

---

**Last Updated**: June 5, 2026
