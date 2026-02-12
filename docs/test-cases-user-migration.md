# Test Cases — User Info Migration (Sidebar → Header)

**AC 来源**: PM 验收标准 18 条 (Sidebar Footer 移除 + Header 用户区 + Popover 迁移)
**实现文件**: MainLayout.tsx, Sidebar.tsx
**设计稿**: ontology.pen — Header: sXT9D, userArea: auQ2j, avatar: gPg8l, Popover: QlAlL

---

## Sidebar Footer 移除 (AC-01 ~ AC-02)

### UM-01: Sidebar 不再包含 Footer 区域 [AC-01]
- **操作**: 查看侧边栏底部
- **预期**: 无用户名、邮箱、头像、chevron 的 Footer 区域
- **验证**: Sidebar.tsx 中不存在 userMenuOpen / userMenuPopover / Footer 相关代码

### UM-02: Sidebar 不再包含 Popover 菜单 [AC-02]
- **操作**: 查看 Sidebar.tsx 代码
- **预期**: 无语言切换、Logout 的 Popover 菜单代码

---

## Header 布局 (AC-03 ~ AC-07)

### UM-03: Header 栏可见 [AC-03]
- **操作**: 加载任意 MainLayout 页面
- **预期**: 内容区顶部有 Header 栏，height 64px，底部 1px 边框

### UM-04: Header 右侧对齐 [AC-04]
- **操作**: 查看 Header 内容布局
- **预期**: Bell 图标 + 用户区域靠右对齐 (justify-content: flex-end)

### UM-05: Bell 图标在 Header [AC-05]
- **操作**: 查看 Header 右侧
- **预期**: Bell 图标 (20px) 可点击，位于用户头像左侧

### UM-06: 用户头像样式 [AC-06]
- **操作**: 查看 Header 右侧头像
- **预期**: 32×32px 紫色圆 (#8b5cf6)，白色首字母 "A"，14px/600
- **设计参考**: gPg8l (设计 40×40, 16px/600 — 代码按实现尺寸 32px 适配)

### UM-07: 用户名 + Chevron [AC-07]
- **操作**: 查看头像右侧
- **预期**: "Admin User" 14px/500 + chevron-down 16px，gap 10px

---

## Header 交互 (AC-08 ~ AC-10)

### UM-08: Bell 点击导航 [AC-08]
- **操作**: 点击 Bell 图标
- **预期**: 导航到 /notifications

### UM-09: 点击用户区域打开 Popover [AC-09]
- **操作**: 点击头像/用户名区域
- **预期**: Popover 向下弹出，chevron 变为 up

### UM-10: 再次点击关闭 Popover [AC-10]
- **操作**: 再次点击头像/用户名区域
- **预期**: Popover 关闭，chevron 变回 down

---

## Popover 从 Header 弹出 (AC-11 ~ AC-14)

### UM-11: Popover 定位 [AC-11]
- **操作**: 打开 Popover 查看位置
- **预期**: 紧贴 Header 下方，右对齐 (right: 24px)，z-index 1300

### UM-12: Popover 容器样式 [AC-12]
- **操作**: 查看 Popover 外观
- **预期**: 248px 宽，#1a1a24 背景，1px #27273a 边框，12px 圆角，py 8px
- **设计参考**: QlAlL — width:248, fill:$--secondary, cornerRadius:12, border:$--border

### UM-13: Popover 用户信息区 [AC-13]
- **操作**: 查看 Popover 顶部
- **预期**: 头像 (32px 紫圆 + "A") + "Admin User" 14px/500 + 邮箱 12px text.secondary
- **数据来源**: getAuth() 返回的动态用户数据

### UM-14: Popover 分割线 [AC-14]
- **操作**: 查看 Popover 内分割线
- **预期**: 用户信息与语言区之间、语言区与 Logout 之间各一条分割线，mx 8px 内缩

---

## Popover 功能 (AC-15 ~ AC-18)

### UM-15: 语言标题 [AC-15]
- **操作**: 查看语言区域标题
- **预期**: "Language" 12px/600 text.secondary，padding [8,16]

### UM-16: 语言选项 + 切换 [AC-16]
- **操作**: 查看 3 个语言选项，点击切换
- **预期**: English (默认选中, check + globe + accent bg), 中文, 日本語
- **点击 "中文"**: check 移至 "中文"，English 变未选中

### UM-17: Logout 样式 + 功能 [AC-17]
- **操作**: 查看 Logout 行，点击
- **预期**: LogOut 图标 16px #f87171 + "Log out" 13px/500 #f87171
- **点击**: 导航到 /login

### UM-18: 多页面可用 [AC-18]
- **操作**: 在不同页面 (如 /knowledge-graph, /classes) 测试
- **预期**: Header 用户区域 + Popover 在所有 MainLayout 子页面均可用

---

## 测试用例汇总

| AC 范围 | 测试用例 | 类型 |
|---------|----------|------|
| AC-01~02 | UM-01~02 | 移除验证 |
| AC-03~07 | UM-03~07 | 布局/样式 |
| AC-08~10 | UM-08~10 | 交互 |
| AC-11~14 | UM-11~14 | Popover 结构 |
| AC-15~18 | UM-15~18 | Popover 功能 |

**总计: 18 条测试用例覆盖 18 条 AC**
