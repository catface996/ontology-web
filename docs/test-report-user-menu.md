# Test Report — Sidebar User Menu Popover

**测试人**: QA Engineer
**测试日期**: 2026-02-12
**测试环境**: localhost:5173, Chrome DevTools MCP
**设计稿**: ontology.pen — g0my9 (关闭状态), daJsZ (打开状态)
**AC 总数**: 16 条
**测试用例**: 22 条

---

## 总结

| 指标 | 值 |
|------|-----|
| AC 通过 | **16/16** |
| AC 失败 | 0 |
| Bug 数量 | 2 (已修复) |
| 通过率 | **100%** |

---

## Bug 列表

### BUG-UM-001: Footer 区域样式多处偏差 (AC-01)

**严重程度**: Medium
**文件**: `app/src/components/Sidebar.tsx`
**行号**: 317-332

| 属性 | 代码值 | 设计值 | 说明 |
|------|--------|--------|------|
| Footer padding | `p={2}` = 16px uniform | `padding: [24, 32]` (24px TB, 32px LR) | 间距偏小，视觉差异明显 |
| Username fontWeight | `variant="body2"` = 400 | fontWeight 500 | 文字偏细 |
| Email color | `color="text.disabled"` = #71717a | $--muted-foreground = #a1a1aa | 文字过暗 |
| Chevron size | `size={20}` | 24×24 | 图标偏小 |

**修复建议**:
```tsx
// Line 317-332: 修改 Footer Box
<Box
  px={4}        // 32px left/right
  py={3}        // 24px top/bottom
  display="flex"
  alignItems="center"
  gap={1}
  sx={{ cursor: 'pointer' }}
  onClick={() => setUserMenuOpen((prev) => !prev)}
>
  <Box flex={1}>
    <Typography variant="body2" fontWeight={500}>Admin User</Typography>
    <Typography variant="caption" color="text.secondary">
      admin@ontology.io
    </Typography>
  </Box>
  {userMenuOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
</Box>
```

---

### BUG-UM-002: Popover 容器圆角过大 (AC-05)

**严重程度**: Medium
**文件**: `app/src/components/Sidebar.tsx`
**行号**: 249

| 属性 | 代码值 | 设计值 |
|------|--------|--------|
| borderRadius | `borderRadius: 3` = 3 × 8 = 24px | cornerRadius: 12px |

**原因**: theme.shape.borderRadius = 8, MUI sx 中 `borderRadius: 3` 会乘以 8 = 24px。

**修复建议**:
```tsx
// Line 249: 修改 borderRadius
borderRadius: 1.5,   // 1.5 × 8 = 12px ✓
```

---

## AC 逐条结果

| AC | 描述 | 结果 | 测试用例 | 备注 |
|----|------|------|----------|------|
| AC-01 | Footer 显示用户名、邮箱、chevron-down | **PASS** | UM-01, UM-02, UM-03 | BUG-UM-001 已修复: padding/fontWeight/color/size 全部正确 ✓ |
| AC-02 | Footer 上方 1px 分割线 | PASS | UM-04 | Divider 组件, 全宽 ✓ |
| AC-03 | 点击 Footer 打开 Popover + chevron 变 up | PASS | UM-05, UM-07 | 弹出位置正确, chevron 切换 ✓ |
| AC-04 | 再次点击关闭 Popover | PASS | UM-06 | 状态切换正常 ✓ |
| AC-05 | Popover 容器: 248px, #1a1a24, border, r12, py8 | **PASS** | UM-08 | BUG-UM-002 已修复: borderRadius 1.5 = 12px ✓ |
| AC-06 | 头像: 32×32 圆形, #8b5cf6, 白色 "A" | PASS | UM-09 | 完全匹配 ✓ |
| AC-07 | 用户名 14px/500 + 邮箱 12px, padding [12,16], gap 12 | PASS | UM-10, UM-11 | Popover 内用户信息正确 ✓ |
| AC-08 | 用户信息与语言区分割线, 左右 8px 内缩 | PASS | UM-12 | `mx={1}` = 8px ✓ |
| AC-09 | "Language" 标题 12px/600, padding [8,16] | PASS | UM-14 | 完全匹配 ✓ |
| AC-10 | English 选中态: check + globe + accent bg | PASS | UM-15 | check #8b5cf6, bg #8b5cf620, r8 ✓ |
| AC-11 | 中文/日本語 未选中: spacer + globe, 无背景 | PASS | UM-16, UM-17 | 16×16 spacer, transparent bg ✓ |
| AC-12 | 点击切换语言, 默认 English | PASS | UM-18, UM-19 | 状态正确切换, 默认值正确 ✓ |
| AC-13 | 语言区与 Logout 分割线, 左右 8px 内缩 | PASS | UM-13 | `mx={1}` = 8px ✓ |
| AC-14 | Logout: LogOut icon + "Log out", #f87171 | PASS | UM-20 | 图标 16px, 文字 13px/500 ✓ |
| AC-15 | 点击 Logout 导航到 /login | PASS | UM-21 | navigate('/login') ✓ |
| AC-16 | 多页面可用 (Sidebar 共享组件) | PASS | UM-22 | /knowledge-graph, /classes 均正常 ✓ |

---

## 测试执行记录

### 关闭状态测试 (AC-01, AC-02)
- 导航到 /knowledge-graph, 截图验证 Footer 区域
- 代码审查 Sidebar.tsx:317-332, 与设计节点 BTHC2/K63U3/YxYwn/xZfwu 对比
- 发现 BUG-UM-001: 4 处样式偏差

### 打开/关闭交互测试 (AC-03, AC-04)
- 点击 Footer 打开 Popover → 截图确认弹出 ✓
- 再次点击 Footer → DOM 确认关闭 (无 popover 节点) ✓
- Chevron 在 up/down 间正确切换 ✓

### Popover 容器测试 (AC-05)
- 代码审查 Sidebar.tsx:243-251, 与设计节点 QlAlL 对比
- width: 248 ✓, bgcolor: '#1a1a24' ✓, border: 1px divider (#27273a) ✓
- borderRadius: 3 → 24px ≠ 设计 12px → BUG-UM-002

### 用户信息区测试 (AC-06, AC-07)
- 代码审查 Sidebar.tsx:254-267, 与设计节点 PVtSz/z0T3w/2xJwR/rGyUF 对比
- Avatar: 32×32, 50% radius, #8b5cf6, "A" white 14px 600 ✓
- User Section: px={2}=16px, py={1.5}=12px, gap={1.5}=12px ✓
- Name: 14px 500 ✓, Email: 12px text.secondary ✓

### 分割线测试 (AC-08, AC-13)
- 两处 Divider 均使用 `sx={{ mx: 1 }}` = 8px 内缩 ✓
- 与设计节点 U5KwS/rjonp padding:[0,8] 匹配 ✓

### 语言切换测试 (AC-09 ~ AC-12)
- Language 标题: 12px, 600, text.secondary, padding [8,16] ✓
- English 选中: check #8b5cf6, globe #a1a1aa, bg #8b5cf620, r8, gap 12 ✓
- 中文/日本語 未选中: 16×16 spacer, no bg ✓
- 点击 "中文" → 截图确认选中态切换 ✓
- 导航到 /classes 后重新打开 → 语言选择持久化 ✓
- 默认值: useState('English') ✓

### Logout 测试 (AC-14, AC-15)
- LogOut icon 16px #f87171, "Log out" 13px 500 #f87171 ✓
- 点击后 URL 变为 /login, 显示登录页面 ✓

### 多页面可用性测试 (AC-16)
- /knowledge-graph: Popover 正常打开/关闭 ✓
- /classes: Popover 正常打开/关闭 ✓
- Sidebar 为 MainLayout 共享组件, 所有子路由均可用 ✓

---

## 回归验证记录

### BUG-UM-001 回归验证 (2026-02-12)

**修复内容** (Sidebar.tsx:318-334):
- `px={4}` = 32px (was `p={2}` = 16px) ✓
- `py={3}` = 24px (was part of `p={2}`) ✓
- `fontWeight={500}` added (was default 400) ✓
- `color="text.secondary"` = #a1a1aa (was `text.disabled` = #71717a) ✓
- `size={24}` (was `size={20}`) ✓

**结果**: PASS — Footer 样式完全匹配设计稿 g0my9

### BUG-UM-002 回归验证 (2026-02-12)

**修复内容** (Sidebar.tsx:250):
- `borderRadius: 1.5` = 1.5 × 8 = 12px (was `borderRadius: 3` = 24px) ✓

**结果**: PASS — Popover 圆角匹配设计稿 daJsZ (QlAlL cornerRadius:12)

### 最终结果: 16/16 AC PASS (100%)
