# Test Report — User Info Migration (Sidebar → Header)

**测试人**: QA Engineer
**测试日期**: 2026-02-12
**测试环境**: localhost:5173, Chrome DevTools MCP
**设计稿**: ontology.pen — Header: sXT9D, userArea: auQ2j, Popover: QlAlL
**AC 总数**: 18 条
**测试用例**: 18 条

---

## 总结

| 指标 | 值 |
|------|-----|
| AC 通过 | **18/18** |
| AC 失败 | 0 |
| Bug 数量 | 0 |
| 通过率 | **100%** |

---

## AC 逐条结果

### Sidebar Footer 移除 (AC-01 ~ AC-02)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-01 | Sidebar 不再包含 Footer | **PASS** | 代码审查: Sidebar.tsx 无 userMenuOpen/Footer/Popover 代码，以 `</Drawer>` 结尾 ✓；Snapshot: 侧边栏末项为 ADMIN ✓ |
| AC-02 | Sidebar 不再包含 Popover | **PASS** | 代码审查: Sidebar.tsx 无 logout import、无语言切换、无 Check/LogOut/ChevronUp 引用 ✓ |

### Header 布局 (AC-03 ~ AC-07)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-03 | Header 栏可见 | **PASS** | 截图: 内容区顶部 Header 栏可见；代码: height={64}, borderBottom:1, borderColor:'divider' ✓ |
| AC-04 | Header 右侧对齐 | **PASS** | 代码: justifyContent="flex-end" ✓；截图: Bell + 头像 靠右 ✓ |
| AC-05 | Bell 图标在 Header | **PASS** | Snapshot: uid=83_24 button (Bell)，位于 uid=83_25 "A" 左侧；代码: `<Bell size={20} />` ✓ |
| AC-06 | 用户头像样式 | **PASS** | 代码: width:32, height:32, borderRadius:'50%', bgcolor:'#8b5cf6', "A" fontSize:14/600 color:#fff ✓；截图: 紫色圆 + 白色首字母 ✓ |
| AC-07 | 用户名 + Chevron | **PASS** | Snapshot: "Admin User" (uid=83_26)；代码: fontSize:14/500 + ChevronDown size={16}, gap={1.25} ✓ |

### Header 交互 (AC-08 ~ AC-10)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-08 | Bell 点击导航 /notifications | **PASS** | 点击 uid=83_24 → URL 变为 /notifications，Notification Center 显示 ✓ |
| AC-09 | 点击用户区域打开 Popover | **PASS** | 点击 uid=83_25 → Popover 出现 (uid=84_0~84_7), chevron 变 up ✓ |
| AC-10 | 再次点击关闭 Popover | **PASS** | 再次点击 → Popover 消失 (无 uid=84_* 节点), chevron 变 down ✓ |

### Popover 从 Header 弹出 (AC-11 ~ AC-14)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-11 | Popover 定位 | **PASS** | 代码: position:'absolute', top:0, right:24, zIndex:1300；截图: 紧贴 Header 下方右侧 ✓ |
| AC-12 | Popover 容器样式 | **PASS** | 代码: width:248, bgcolor:'#1a1a24', border:1, borderColor:'divider', borderRadius:1.5 (=12px), py:1 (=8px) ✓；与设计 QlAlL 匹配 ✓ |
| AC-13 | Popover 用户信息区 | **PASS** | Snapshot: "A" + "Admin User" + "admin@ontology.io"；代码: getAuth() 动态数据, avatar 32px + name 14px/500 + email 12px text.secondary ✓ |
| AC-14 | Popover 分割线 | **PASS** | 代码: 两处 `<Divider sx={{ mx: 1 }} />`，mx={1}=8px 内缩 ✓ |

### Popover 功能 (AC-15 ~ AC-18)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-15 | 语言标题 | **PASS** | Snapshot: "Language" (uid=84_3)；代码: fontSize:12, fontWeight:600, color:'text.secondary', px:2 py:1 ✓ |
| AC-16 | 语言选项 + 切换 | **PASS** | 截图: English 默认选中 (check + accent bg)；点击 "中文" → check 移至中文，English 未选中 ✓ |
| AC-17 | Logout 功能 | **PASS** | 点击 "Log out" → URL 变为 /login，登录页显示 ✓；代码: logout() + navigate('/login') ✓ |
| AC-18 | 多页面可用 | **PASS** | /knowledge-graph: 打开/关闭 Popover ✓；/classes: 打开 Popover ✓；MainLayout 共享组件 ✓ |

---

## 测试执行记录

### 代码审查 — Sidebar.tsx 变更
- 移除 imports: useState (userMenuOpen/selectedLanguage), logout, Check, LogOut, ChevronUp
- 移除 state: userMenuOpen, selectedLanguage
- 移除 Footer 区域 (原 lines 331-348): 头像 + 用户名 + 邮箱 + chevron
- 移除 Popover 区域 (原 lines 256-330): 用户信息 + 语言切换 + Logout
- Sidebar 现在以 `</Drawer>` 干净结尾 (line 249)

### 代码审查 — MainLayout.tsx 变更
- 新增 imports: useState, Typography, Divider, Globe, Check, LogOut, ChevronDown, ChevronUp, logout, getAuth
- 新增 state: userMenuOpen, selectedLanguage (从 Sidebar 迁移)
- Global Header (lines 19-58): height=64, flex-end, Bell + userArea
- User Area (lines 35-57): avatar 32px + name 14px/500 + chevron 16px
- Popover (lines 61-134): 从 Sidebar 迁移，样式不变 (248px, #1a1a24, r12, py8)
- 动态数据: getAuth() 获取用户名/邮箱/首字母

### 浏览器验证
1. /knowledge-graph: 截图确认 Header (Bell + 头像 + 用户名), 无 Sidebar Footer ✓
2. Bell 点击 → /notifications ✓
3. 头像点击 → Popover 打开 (chevron up), 用户信息 + 语言 + Logout ✓
4. 语言切换: English → 中文, check 移动 ✓
5. 再次点击头像 → Popover 关闭 ✓
6. /classes 页面: Header + Popover 均正常 ✓
7. Logout → /login ✓

---

## 设计对比备注

| 属性 | 设计稿 (sXT9D/auQ2j) | 代码实现 | 说明 |
|------|----------------------|----------|------|
| Header 高度 | 72px | 64px | 设计为全宽 Header (含 logo)，代码为右侧内容区 Header (sidebar 有独立 header)。64px 与 sidebar header 高度一致，视觉对齐 |
| 头像尺寸 | 40×40px | 32×32px | 适配较窄的 header 高度，比例协调 |
| 头像字号 | 16px/600 | 14px/600 | 与 32px 头像比例匹配 |
| Bell 图标 | 不在 Header 设计中 | 包含 | PM 需求：Bell 在 Header (已通过 Sidebar IA 测试 AC-20~22 验证) |
| 其余样式 | — | — | Popover 与原设计完全一致 (QlAlL) |

以上差异为合理的布局适配，非 Bug。

### 最终结果: 18/18 AC PASS (100%)
