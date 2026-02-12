# Test Cases — Sidebar User Menu Popover

**AC 来源**: PM 验收标准 16 条
**设计稿**: ontology.pen — g0my9 (关闭状态), daJsZ (打开状态)

---

## 关闭状态 (AC-01 ~ AC-02)

### UM-01: Footer 用户名和邮箱显示 [AC-01]
- **操作**: 导航到任意 MainLayout 页面，查看侧边栏底部
- **预期**: "Admin User" (Geist 14px, 500, $--sidebar-foreground) + "admin@ontology.io" (Geist 12px, normal, $--muted-foreground)
- **设计参考**: g0my9 — nameC (K63U3), emailC (YxYwn)

### UM-02: Footer chevron-down 图标 [AC-01]
- **操作**: 查看 Footer 右侧图标
- **预期**: chevron-down 图标, 24×24, $--sidebar-foreground 颜色
- **设计参考**: g0my9 — chevC (xZfwu) keyboard_arrow_down

### UM-03: Footer padding [AC-01]
- **操作**: 检查 Footer 区域间距
- **预期**: padding 24 32 (上下 24, 左右 32)
- **设计参考**: g0my9 — BTHC2 padding [24,32]

### UM-04: Footer 上方分割线 [AC-02]
- **操作**: 查看 Footer 上方
- **预期**: 1px 分割线, $--sidebar-border 颜色, 全宽
- **设计参考**: g0my9 — Divider (LUzyB)

---

## 打开/关闭交互 (AC-03 ~ AC-04)

### UM-05: 点击 Footer 打开 Popover [AC-03]
- **操作**: 点击 Footer 区域（用户名/邮箱/chevron 任意位置）
- **预期**: Popover 菜单出现在 Footer 上方, chevron 从 down 变为 up
- **设计参考**: daJsZ — chevO (kXWdG) keyboard_arrow_up

### UM-06: 再次点击 Footer 关闭 Popover [AC-04]
- **操作**: Popover 打开时，再次点击 Footer 区域
- **预期**: Popover 关闭, chevron 恢复为 down

### UM-07: Popover 出现位置 [AC-03]
- **操作**: 打开 Popover
- **预期**: Popover 出现在 Footer 正上方，不遮挡 Footer 本身

---

## Popover 容器 (AC-05)

### UM-08: Popover 容器尺寸和样式 [AC-05]
- **操作**: 打开 Popover，检查容器
- **预期**: width 248px, bgcolor $--secondary (#1a1a24), border 1px $--border (#27273a), cornerRadius 12, padding 上下 8 左右 0
- **设计参考**: daJsZ — Popover Menu (QlAlL) width:248, cornerRadius:12, fill:$--secondary, stroke:1px $--border, padding:[8,0]

---

## 用户信息区 (AC-06 ~ AC-07)

### UM-09: 头像圆形 [AC-06]
- **操作**: 打开 Popover，查看用户头像
- **预期**: 32×32 圆形 (cornerRadius 16), 背景 $--primary (#8b5cf6), 内含白色 "A" (Geist 14px, 600, #ffffff)
- **设计参考**: daJsZ — Avatar (PVtSz), avText (z0T3w)

### UM-10: 用户名和邮箱 [AC-07]
- **操作**: 查看头像右侧文字
- **预期**: "Admin User" (Geist 14px, 500, $--foreground) + "admin@ontology.io" (Geist 12px, $--muted-foreground), gap 2
- **设计参考**: daJsZ — uName (uTS3x), uEmail (eAIOp), User Info (rGyUF) gap:2

### UM-11: 用户信息区布局 [AC-07]
- **操作**: 检查用户信息区间距
- **预期**: padding 12 16, 头像与文字 gap 12
- **设计参考**: daJsZ — User Section (2xJwR) padding:[12,16], gap:12

---

## 分割线 (AC-08, AC-13)

### UM-12: 用户信息与语言区之间分割线 [AC-08]
- **操作**: 查看用户信息区下方
- **预期**: 1px 分割线, $--border 颜色, 左右内缩 8px (padding 0 8)
- **设计参考**: daJsZ — Divider (U5KwS) padding:[0,8]

### UM-13: 语言区与 Logout 之间分割线 [AC-13]
- **操作**: 查看语言选项下方
- **预期**: 1px 分割线, $--border 颜色, 左右内缩 8px (padding 0 8)
- **设计参考**: daJsZ — Divider 2 (rjonp) padding:[0,8]

---

## 语言切换区 (AC-09 ~ AC-12)

### UM-14: 语言区标题 [AC-09]
- **操作**: 查看分割线下方标题
- **预期**: "Language" (Geist 12px, 600, $--muted-foreground), padding 8 16
- **设计参考**: daJsZ — langLabel (CrgLX), Language Title (hlV0X) padding:[8,16]

### UM-15: English 行选中状态 [AC-10]
- **操作**: 查看 "English" 行（默认选中）
- **预期**: check 图标 (16px, $--primary #8b5cf6) + globe 图标 (16px, $--muted-foreground) + "English" (Geist 13px, $--foreground)。背景 $--sidebar-accent (#8b5cf620), cornerRadius 8, padding 8 16, gap 12
- **设计参考**: daJsZ — English Row (eC6xl), enCheck (82YGu), enGlobe (M3DA7), enText (xRO5q)

### UM-16: 中文行未选中状态 [AC-11]
- **操作**: 查看 "中文" 行
- **预期**: 16×16 空白占位 (无 check) + globe 图标 (16px, $--muted-foreground) + "中文" (Geist 13px, $--foreground)。无背景色, cornerRadius 8, padding 8 16, gap 12
- **设计参考**: daJsZ — Chinese Row (rknkO), Check Spacer (zWvZm) 16×16

### UM-17: 日本語行未选中状态 [AC-11]
- **操作**: 查看 "日本語" 行
- **预期**: 16×16 空白占位 + globe 图标 + "日本語" (Geist 13px, $--foreground)。无背景色
- **设计参考**: daJsZ — Japanese Row (vjPZz), Check Spacer (X5QjC) 16×16

### UM-18: 点击切换语言 [AC-12]
- **操作**: 点击 "中文" 行
- **预期**: "中文" 行变为选中状态 (check 图标 + accent 背景), "English" 行恢复未选中 (无 check, 无背景)

### UM-19: 默认选中语言 [AC-12]
- **操作**: 首次打开 Popover
- **预期**: "English" 为默认选中

---

## Logout (AC-14 ~ AC-15)

### UM-20: Logout 行样式 [AC-14]
- **操作**: 查看 Popover 底部 Logout 行
- **预期**: LogOut 图标 (16px, #f87171) + "Log out" (Geist 13px, 500, #f87171)。cornerRadius 8, padding 8 16, gap 12
- **设计参考**: daJsZ — Logout Row (2UsFh), logoutIcon (5ZhPF), logoutText (AvXX1)

### UM-21: 点击 Logout 跳转 [AC-15]
- **操作**: 点击 "Log out"
- **预期**: 导航到 `/login` 页面

---

## 全局 (AC-16)

### UM-22: 多页面可用性 [AC-16]
- **操作**: 分别在 `/knowledge-graph`, `/classes`, `/notifications` 页面点击 Footer
- **预期**: 所有包含 Sidebar 的页面均可打开 Popover 菜单

---

## 测试用例汇总

| AC | 测试用例 | 类型 |
|----|----------|------|
| AC-01 | UM-01, UM-02, UM-03 | 视觉 |
| AC-02 | UM-04 | 视觉 |
| AC-03 | UM-05, UM-07 | 交互 |
| AC-04 | UM-06 | 交互 |
| AC-05 | UM-08 | 视觉 |
| AC-06 | UM-09 | 视觉 |
| AC-07 | UM-10, UM-11 | 视觉 |
| AC-08 | UM-12 | 视觉 |
| AC-09 | UM-14 | 视觉 |
| AC-10 | UM-15 | 视觉 |
| AC-11 | UM-16, UM-17 | 视觉 |
| AC-12 | UM-18, UM-19 | 交互 |
| AC-13 | UM-13 | 视觉 |
| AC-14 | UM-20 | 视觉 |
| AC-15 | UM-21 | 交互 |
| AC-16 | UM-22 | 功能 |

**总计: 22 条测试用例覆盖 16 条 AC**
