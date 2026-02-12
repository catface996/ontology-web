# Test Cases — Auth State Management (Login/Logout/Route Guards)

**AC 来源**: PM 验收标准 14 条
**实现文件**: auth.ts, RequireAuth.tsx, LoginPage.tsx, RegisterPage.tsx, App.tsx, Sidebar.tsx

---

## 登录状态存储 (AC-01 ~ AC-02)

### AUTH-01: localStorage 存储验证 [AC-01]
- **前置**: 清除 localStorage
- **操作**: 在 /login 输入 email + password，点击 Sign In
- **预期**: localStorage 中存在 key `ontology_auth`，值为 JSON: `{ isAuthenticated: true, user: { name: "Admin User", email: "<输入的email>" } }`
- **代码参考**: auth.ts:13-15 login(), LoginPage.tsx:26

### AUTH-02: 登录后跳转到 /domain [AC-02]
- **前置**: 清除 localStorage
- **操作**: 在 /login 输入 email + password，点击 Sign In
- **预期**: localStorage 写入 auth 状态 → URL 变为 `/domain`
- **代码参考**: LoginPage.tsx:27 navigate('/domain')

---

## 路由守卫 — 未登录拦截 (AC-03 ~ AC-08)

### AUTH-03: /knowledge-graph 拦截 [AC-03]
- **前置**: 清除 localStorage (未登录状态)
- **操作**: 直接访问 `http://localhost:5173/knowledge-graph`
- **预期**: 自动重定向到 `/login`
- **代码参考**: App.tsx:70 RequireAuth 包裹 MainLayout

### AUTH-04: /classes 拦截 [AC-04]
- **前置**: 清除 localStorage
- **操作**: 直接访问 `http://localhost:5173/classes`
- **预期**: 自动重定向到 `/login`

### AUTH-05: /domain 拦截 [AC-05]
- **前置**: 清除 localStorage
- **操作**: 直接访问 `http://localhost:5173/domain`
- **预期**: 自动重定向到 `/login`
- **代码参考**: App.tsx:62 RequireAuth 包裹 DomainSelection

### AUTH-06: /agent-chat/bottleneck 拦截 [AC-06]
- **前置**: 清除 localStorage
- **操作**: 直接访问 `http://localhost:5173/agent-chat/bottleneck`
- **预期**: 自动重定向到 `/login`
- **代码参考**: App.tsx:63 RequireAuth 包裹

### AUTH-07: /login 正常访问 [AC-07]
- **前置**: 清除 localStorage
- **操作**: 访问 `http://localhost:5173/login`
- **预期**: 正常显示登录页, 包含 "Welcome Back"、Email/Password 表单
- **代码参考**: App.tsx:60 无 RequireAuth

### AUTH-08: /register 正常访问 [AC-08]
- **前置**: 清除 localStorage
- **操作**: 访问 `http://localhost:5173/register`
- **预期**: 正常显示注册页, 包含 "Create Account"、Full Name/Email/Password 表单
- **代码参考**: App.tsx:61 无 RequireAuth

---

## 已登录用户访问公开页面 (AC-09 ~ AC-10)

### AUTH-09: 已登录访问 /login [AC-09]
- **前置**: localStorage 中有有效 auth 状态
- **操作**: 访问 `http://localhost:5173/login`
- **预期**: 重定向到 `/knowledge-graph`（不显示登录页）
- **代码参考**: LoginPage.tsx:19-21 isAuthenticated() → Navigate

### AUTH-10: 已登录访问 /register [AC-10]
- **前置**: localStorage 中有有效 auth 状态
- **操作**: 访问 `http://localhost:5173/register`
- **预期**: 重定向到 `/knowledge-graph`（不显示注册页）
- **代码参考**: RegisterPage.tsx:22-24 isAuthenticated() → Navigate

---

## 登出 (AC-11 ~ AC-12)

### AUTH-11: Log out 清除状态并跳转 [AC-11]
- **前置**: 已登录状态
- **操作**: 打开 Sidebar User Menu → 点击 "Log out"
- **预期**: localStorage 中 `ontology_auth` 被移除 → URL 变为 `/login`
- **代码参考**: Sidebar.tsx:304 logout(); navigate('/login'), auth.ts:17-19 logout()

### AUTH-12: 登出后路由守卫生效 [AC-12]
- **前置**: 刚完成 AUTH-11 登出
- **操作**: 直接访问 `http://localhost:5173/knowledge-graph`
- **预期**: 被重定向到 `/login`（确认 auth 状态已清除）

---

## 刷新持久化 (AC-13)

### AUTH-13: 刷新页面保持登录态 [AC-13]
- **前置**: 已登录状态, 当前在 /knowledge-graph
- **操作**: 刷新页面 (F5 / reload)
- **预期**: 仍停留在 /knowledge-graph, 不跳转到 /login
- **代码参考**: auth.ts:21-28 getAuth() 从 localStorage 恢复

---

## 全局覆盖 (AC-14)

### AUTH-14: RequireAuth 覆盖所有受保护路由 [AC-14]
- **操作**: 代码审查 App.tsx 路由配置
- **预期**: 以下路由均由 RequireAuth 包裹:
  - `/domain` (line 62)
  - `/agent-chat/*` 所有独立页面 (lines 63-69)
  - `/` MainLayout 及所有子路由 (line 70)
- **仅 `/login` (line 60) 和 `/register` (line 61) 为公开路由**

---

## 测试用例汇总

| AC | 测试用例 | 类型 |
|----|----------|------|
| AC-01 | AUTH-01 | 功能 |
| AC-02 | AUTH-02 | 功能 |
| AC-03 | AUTH-03 | 路由 |
| AC-04 | AUTH-04 | 路由 |
| AC-05 | AUTH-05 | 路由 |
| AC-06 | AUTH-06 | 路由 |
| AC-07 | AUTH-07 | 路由 |
| AC-08 | AUTH-08 | 路由 |
| AC-09 | AUTH-09 | 路由 |
| AC-10 | AUTH-10 | 路由 |
| AC-11 | AUTH-11 | 功能 |
| AC-12 | AUTH-12 | 路由 |
| AC-13 | AUTH-13 | 功能 |
| AC-14 | AUTH-14 | 代码审查 |

**总计: 14 条测试用例覆盖 14 条 AC**
