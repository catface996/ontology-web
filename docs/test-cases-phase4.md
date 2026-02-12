# Phase 4 测试用例 — 领域管理与字段映射交互

**编写人员**: QA Engineer
**编写日期**: 2026-02-12
**设计稿来源**: ontology.pen (Add Domain: PG73C, Remove Domain: xPJ6a, Field Mapping Add: IXHCv, Field Mapping Delete: RHkKl)
**验收标准**: 36 条 (PM 提供)

---

## 一、测试范围

| # | 功能 | 设计稿 ID | 类型 | 路由 |
|---|------|-----------|------|------|
| 1 | Add Domain（添加领域） | `PG73C` | 独立页面 | `/user-management/:userId/add-domain` |
| 2 | Remove Domain（移除领域） | `xPJ6a` | 独立页面（居中模态框） | 从 User Detail 触发 |
| 3 | Field Mapping Add State（字段映射添加状态） | `IXHCv` | 现有页面交互增强 | 现有 Field Mapping 路由 |
| 4 | Field Mapping Delete State（字段映射删除状态） | `RHkKl` | 现有页面交互增强 | 现有 Field Mapping 路由 |

---

## 二、优先级定义

| 级别 | 说明 |
|------|------|
| P0 | 页面无法加载或核心功能不可用 |
| P1 | 主要功能缺陷或明显的 UI 与设计稿不一致 |
| P2 | 次要 UI 差异、样式微调、交互体验 |
| P3 | 文案/数据微调、增强建议 |

---

## 三、Add Domain Page 测试用例

### 3.1 路由与页面结构

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-001 | P0 | 页面加载 | Add Domain 页面可正常加载，无控制台错误 | AC-03 |
| AD-002 | P0 | 路由渲染 | 路由 `/user-management/:userId/add-domain` 在 MainLayout 内正确渲染 | AC-03 |
| AD-003 | P1 | 面包屑导航 | 显示 "Settings > User Management > John Doe > Add Domain"，ChevronRight 分隔，最后一项 foreground fontWeight 500，其余 muted | AC-01 |
| AD-004 | P1 | 页面标题 | 显示 "Add Domain to User"，字号 24px，fontWeight 600 | AC-04 |
| AD-005 | P1 | 页面副标题 | 显示分配操作描述文本，字号 14px，muted 色 | AC-04 |
| AD-006 | P1 | 整体布局 | 垂直布局，间距 24px，内边距 24px | — |

### 3.2 头部操作栏

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-007 | P1 | Cancel 按钮 | 显示 "Cancel" 文字，secondary + border 样式 | AC-02 |
| AD-008 | P1 | Add Selected 按钮 | 显示 "Add Selected" 文字，含 plus 图标，紫色主题色填充，白色文字 | AC-02 |
| AD-009 | P2 | 按钮位置 | 两个按钮在 Header 右侧，水平排列 | AC-02 |

### 3.3 搜索框

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-010 | P1 | 搜索框显示 | 搜索框存在，宽度 400px，含 search 图标 | AC-05 |
| AD-011 | P1 | 搜索框占位符 | placeholder 为 "Search domains..." | AC-05 |
| AD-012 | P2 | 搜索框样式 | 圆角，背景色与暗色主题一致 | AC-05 |

### 3.4 领域卡片通用样式

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-013 | P1 | 卡片基础样式 | 每个 Domain 卡片圆角 10px，fill=secondary (#1a1a24)，padding 16px | AC-06 |
| AD-014 | P1 | 卡片组成结构 | 卡片包含: 图标容器(40x40) + 名称(15px fontWeight 600) + 描述(13px muted) + Classes/Relations 统计数据 | AC-09 |

### 3.5 领域卡片 — Retail（选中状态）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-015 | P1 | Retail 卡片显示 | 卡片可见，显示 "Retail" 标题(15px 600) | AC-09, AC-10 |
| AD-016 | P1 | 选中状态边框 | 卡片有 2px primary 紫色边框，表示选中状态 | AC-07 |
| AD-017 | P1 | 选中 Checkbox | 显示实心紫色 checkbox（含 check 图标），非空心 | AC-07 |
| AD-018 | P1 | 图标容器 | 显示 shopping-cart 图标，40x40 容器，primary 紫色背景 | AC-09, AC-10 |
| AD-019 | P2 | 统计信息 | 显示 "45 Classes" 和 "89 Relations" | AC-09 |
| AD-020 | P1 | 角色下拉框 | 选中卡片右侧显示 Role 下拉框，当前值 "Editor"，带 ChevronDown | AC-07 |

### 3.6 领域卡片 — Manufacturing（未选中状态）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-021 | P1 | Manufacturing 卡片显示 | 卡片可见，显示 "Manufacturing" 标题 | AC-10 |
| AD-022 | P1 | 未选中状态边框 | 卡片仅有 1px border 边框（非 primary） | AC-08 |
| AD-023 | P1 | 空 Checkbox | 显示空 checkbox（仅 border），非实心 | AC-08 |
| AD-024 | P1 | 图标容器 | 显示 factory 图标，40x40 容器，#22D3EE 青色背景 | AC-09, AC-10 |
| AD-025 | P2 | 统计信息 | 显示 "67 Classes" 和 "134 Relations" | AC-09 |
| AD-026 | P1 | 无角色下拉框 | 未选中状态不显示 Role 下拉框 | AC-08 |

### 3.7 领域卡片 — Logistics（未选中状态）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-027 | P1 | Logistics 卡片显示 | 卡片可见，显示 "Logistics" 标题 | AC-10 |
| AD-028 | P1 | 未选中状态 | 1px border 边框，空 checkbox | AC-08 |
| AD-029 | P1 | 图标容器 | 显示 truck 图标，40x40 容器，#4ADE80 绿色背景 | AC-09, AC-10 |
| AD-030 | P2 | 统计信息 | 显示 "38 Classes" 和 "72 Relations" | AC-09 |

### 3.8 卡片交互

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-031 | P1 | 点击选中 | 点击未选中卡片，切换为选中态（2px primary 边框 + 实心 checkbox + Role 下拉） | AC-07, AC-08 |
| AD-032 | P1 | 点击取消选中 | 点击已选中卡片，切换为未选中态（1px border + 空 checkbox，Role 下拉消失） | AC-07, AC-08 |
| AD-033 | P1 | 选中后显示角色 | 选中卡片后，自动显示 Role 下拉框 | AC-07 |
| AD-034 | P2 | 多选支持 | 可同时选中多个领域卡片 | — |

### 3.9 分页

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| AD-035 | P1 | 分页文字 | 显示 "Showing 1-3 of 12 domains" | AC-11 |
| AD-036 | P1 | 页码按钮 | 显示页码按钮，尺寸 36x36，圆角 8px | AC-11 |
| AD-037 | P1 | 当前页高亮 | 当前页按钮为 primary 填充色（紫色背景） | AC-12 |
| AD-038 | P1 | 非当前页样式 | 其他页码按钮为 secondary + border 样式 | AC-12 |
| AD-039 | P2 | 页码导航 | 点击其他页码可切换页面 | AC-11 |

---

## 四、Remove Domain Page 测试用例

### 4.1 页面结构与布局

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| RD-001 | P0 | 页面加载 | Remove Domain 页面可正常加载 | AC-13 |
| RD-002 | P1 | 面包屑导航 | 显示 "Settings > User Management > John Doe > Remove Domain"，ChevronRight 分隔 | AC-14 |
| RD-003 | P1 | 居中模态框 | 页面在 MainLayout 内居中显示确认模态框 | AC-13 |
| RD-004 | P1 | 模态框尺寸 | 宽度 520px，圆角 16px | AC-13 |
| RD-005 | P2 | 模态框背景 | 模态框背景为 $--card 色值 | AC-13 |

### 4.2 警告图标

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| RD-006 | P1 | 图标容器 | 64x64 圆形容器，背景色 #ef444420 | AC-15 |
| RD-007 | P1 | 警告图标 | 内含 triangle-alert 图标，尺寸 32px，颜色 #ef4444 | AC-15 |
| RD-008 | P2 | 图标位置 | 图标容器在模态框顶部水平居中 | AC-15 |

### 4.3 标题与描述

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| RD-009 | P1 | 标题文本 | 显示 "Remove Domain Access"，字号 20px，fontWeight 600 | AC-16 |
| RD-010 | P1 | 描述文本 | 显示确认描述文字，字号 14px，muted 色，水平居中 | AC-16 |

### 4.4 领域信息卡片

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| RD-011 | P1 | 卡片显示 | 显示被移除领域的信息卡片 | AC-17 |
| RD-012 | P1 | 领域图标 | 显示 building-2 图标，紫色背景，48x48 容器 | AC-17 |
| RD-013 | P1 | 领域名称 | 显示 "Enterprise"，字号 16px，fontWeight 600 | AC-17 |
| RD-014 | P1 | 角色徽章 | 显示 "Owner" 角色 badge，primary 紫色 | AC-17 |
| RD-015 | P2 | 统计信息 | 显示 "24 Classes • 156 Relations" | AC-17 |

### 4.5 警告信息框

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| RD-016 | P1 | 警告框显示 | 显示红色背景警告信息框 | AC-18 |
| RD-017 | P1 | 警告框样式 | 背景色 #ef444410，边框色 #ef444440（红色文字和边框） | AC-18 |
| RD-018 | P1 | 警告图标 | 左侧显示 circle-alert 图标 | AC-18 |
| RD-019 | P1 | 警告文本 | 包含撤销访问警告文字 | AC-18 |

### 4.6 确认输入

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| RD-020 | P1 | 确认提示标签 | 显示 'Type "Enterprise" to confirm removal:' 提示文本 | AC-19 |
| RD-021 | P1 | 输入框显示 | 显示文本输入框，placeholder "Enter domain name..." | AC-19 |
| RD-022 | P1 | 输入验证激活 | 输入 "Enterprise" 后 Remove Access 按钮变为可用状态 | AC-19 |
| RD-023 | P1 | 错误输入 | 输入不匹配文本时 Remove Access 按钮保持禁用 | AC-19 |

### 4.7 操作按钮

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| RD-024 | P1 | Cancel 按钮 | 显示 "Cancel" 按钮，secondary + border 样式 | AC-20 |
| RD-025 | P1 | Remove Access 按钮 | 显示 "Remove Access" 按钮，红色 #ef4444 背景，含 trash-2 图标，白色文字 | AC-20 |
| RD-026 | P1 | 按钮等宽 | Cancel 和 Remove Access 按钮等宽（fill_container） | AC-21 |
| RD-027 | P1 | 初始禁用状态 | Remove Access 按钮在未正确输入确认文本前为禁用状态 | AC-19 |
| RD-028 | P2 | 按钮布局 | Cancel 在左，Remove Access 在右，水平排列 | AC-20 |
| RD-029 | P1 | Cancel 交互 | 点击 Cancel 关闭/返回，不执行删除 | AC-20 |

---

## 五、Field Mapping Add State 测试用例

### 5.1 页面结构与布局

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-A-001 | P0 | 页面加载 | Field Mapping 页面可正常加载，无控制台错误 | AC-22 |
| FM-A-002 | P1 | 面包屑导航 | 显示 "Integrations / Field Mapping"，使用 "/" 分隔符 | AC-23 |
| FM-A-003 | P1 | 三面板布局 | 页面分为 Source Panel(fill) + Mapping Panel(320px) + Target Panel(fill)，水平排列 | AC-22 |
| FM-A-004 | P1 | 面板宽度 | Mapping 面板固定 320px，Source 和 Target 面板自适应 fill | AC-22 |
| FM-A-005 | P2 | 面板间距 | 面板间距 24px，整体内边距 24px | AC-22 |

### 5.2 头部操作栏

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-A-006 | P1 | Auto Mapping 按钮 | 显示 "Auto Mapping"，sparkles 图标，边框样式，pill 形（cornerRadius 999） | AC-23 |
| FM-A-007 | P1 | Save Mapping 按钮 | 显示 "Save Mapping"，save 图标，primary 填充，pill 形（cornerRadius 999） | AC-23 |
| FM-A-008 | P2 | 按钮形状 | 两个按钮均为药丸形（cornerRadius 999） | AC-23 |

### 5.3 Source Panel（源端面板）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-A-009 | P1 | 面板标题 | 显示 database 图标（#336791 色）+ "Source Fields" 标题 | AC-24 |
| FM-A-010 | P1 | 数据源选择器 | 显示下拉 "PostgreSQL / users" | AC-24 |
| FM-A-011 | P1 | 字段 — id | 显示 "id"，key 图标（主键），类型 "INTEGER" | AC-25 |
| FM-A-012 | P1 | 字段 — username | 显示 "username"，类型 "VARCHAR(50)" | AC-25 |
| FM-A-013 | P1 | 字段 — email | 显示 "email"，类型 "VARCHAR(100)" | AC-25 |
| FM-A-014 | P1 | 字段 — created_at | 显示 "created_at"，类型 "TIMESTAMP" | AC-25 |
| FM-A-015 | P1 | 已映射 Connector | id、username、email 右侧有实心紫色 Connector 圆点（12px，fill $--primary） | AC-26 |
| FM-A-016 | P1 | 选中字段高亮 | created_at 处于选中态：1.5px primary 边框 + 淡紫背景 | AC-26 |

### 5.4 Mapping Panel（映射面板）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-A-017 | P1 | 面板标题 | 显示 git-merge 图标（紫色）+ "Field Mappings" 标题 | AC-27 |
| FM-A-018 | P1 | 映射计数 | 显示 "3 of 4 fields mapped" | AC-27 |
| FM-A-019 | P1 | 映射项 1 | 显示 id → personId，arrow-right 图标 + "Direct mapping" + sparkles 图标 | AC-28 |
| FM-A-020 | P1 | 映射项 2 | 显示 username → name，arrow-right 图标 + "Direct mapping" + sparkles 图标 | AC-28 |
| FM-A-021 | P1 | 映射项 3 | 显示 email → email，arrow-right 图标 + "Direct mapping" + sparkles 图标 | AC-28 |
| FM-A-022 | P2 | 映射项箭头 | 每条映射显示紫色 arrow-right 图标连接源与目标 | AC-28 |

### 5.5 Add Mapping 内联表单

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-A-023 | P1 | 表单容器样式 | 圆角 8px，fill=#8B5CF610（淡紫），border 1px primary | AC-29 |
| FM-A-024 | P1 | 表单标题 | 显示 link 图标 + "New Mapping" 标题 | AC-29 |
| FM-A-025 | P1 | Source Field 下拉 | 显示 "Source Field" 标签，下拉值 "created_at" | AC-30 |
| FM-A-026 | P1 | Target Property 下拉 | 显示 "Target Property" 标签，下拉值 "createdDate" | AC-30 |
| FM-A-027 | P1 | Transform 下拉 | 显示 "Transform" 标签，下拉值 "Direct mapping" | AC-30 |
| FM-A-028 | P1 | Cancel 按钮 | 表单底部 "Cancel" 按钮，border 样式 | AC-31 |
| FM-A-029 | P1 | Confirm 按钮 | 表单底部 "Confirm" 按钮，primary 填充，含 check 图标 | AC-31 |

### 5.6 Target Panel（目标面板）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-A-030 | P1 | 面板标题 | 显示 share-2 图标 + "Target Properties" 标题 | AC-32 |
| FM-A-031 | P1 | 目标选择器 | 显示下拉 "Person (Class)" | AC-32 |
| FM-A-032 | P1 | 属性 — personId | 显示 "personId"，类型 "xsd:integer" | AC-33 |
| FM-A-033 | P1 | 属性 — name | 显示 "name"，类型 "xsd:string" | AC-33 |
| FM-A-034 | P1 | 属性 — email | 显示 "email"，类型 "xsd:string" | AC-33 |
| FM-A-035 | P1 | 属性 — createdDate | 显示 "createdDate"，类型 "xsd:dateTime" | AC-33 |
| FM-A-036 | P1 | 属性 — belongsTo | 显示 "belongsTo"，类型 "Organization" | AC-33 |
| FM-A-037 | P1 | 已映射 Connector | personId、name、email 左侧有实心紫色 Connector 圆点（12px） | AC-26 |
| FM-A-038 | P1 | 未映射 Connector | belongsTo 左侧有空心 Connector 圆点（仅边框） | AC-26 |
| FM-A-039 | P1 | 选中属性高亮 | createdDate 处于选中态：1.5px primary 边框 + 淡紫背景 | AC-26 |

### 5.7 Source ↔ Target 联动

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-A-040 | P1 | 选中字段对应 | Source 的 created_at 选中时，Target 的 createdDate 同时高亮 | AC-26 |
| FM-A-041 | P2 | 映射视觉连接 | 已映射字段在三面板间有视觉对应关系 | — |

---

## 六、Field Mapping Delete State 测试用例

### 6.1 页面结构

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-D-001 | P0 | 页面加载 | Field Mapping Delete 状态可正常显示 | AC-34 |
| FM-D-002 | P1 | 三面板布局保持 | 与 Add State 相同的三面板布局不变 | AC-22 |

### 6.2 非删除态映射项（触发入口）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-D-003 | P1 | 删除图标入口 | 非确认态映射卡片行末显示 trash-2 图标（14px，$--destructive 色） | AC-36 |
| FM-D-004 | P1 | 触发删除确认 | 点击 trash-2 图标后，该映射项切换为删除确认态 | AC-36 |

### 6.3 Delete 确认态映射项（id → personId）

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-D-005 | P1 | 红色背景 | 删除确认态映射项 fill=#EF444410（浅红背景） | AC-34 |
| FM-D-006 | P1 | 红色边框 | 映射项 border 1px $--destructive（红色） | AC-34 |
| FM-D-007 | P1 | 箭头颜色变红 | 映射项箭头图标从紫色变为红色（$--destructive） | AC-34 |
| FM-D-008 | P1 | 警告图标 | 确认行显示 triangle-alert 图标（12px，红色） | AC-35 |
| FM-D-009 | P1 | 确认文本 | 显示 "Remove this mapping?" 红色文本（$--destructive） | AC-35 |

### 6.4 Delete 确认操作按钮

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-D-010 | P1 | Keep 按钮 | 显示 "Keep" 按钮，border 样式，muted 文字 | AC-35 |
| FM-D-011 | P1 | Remove 按钮 | 显示 "Remove" 按钮，$--destructive 红色背景，trash-2 图标，白色文字 | AC-35 |
| FM-D-012 | P1 | 按钮布局 | Keep 在左，Remove 在右 | AC-35 |
| FM-D-013 | P1 | Keep 交互 | 点击 Keep 取消删除，恢复映射项正常紫色状态 | AC-35 |
| FM-D-014 | P1 | Remove 交互 | 点击 Remove 删除该映射项 | AC-35 |

### 6.5 其他映射项状态

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-D-015 | P1 | 正常映射项保持 | username → name 和 email → email 保持正常紫色样式 | AC-34 |
| FM-D-016 | P1 | 视觉区分 | 正常映射项与删除确认态有明显视觉区分（紫色 vs 红色） | AC-34 |
| FM-D-017 | P2 | 箭头颜色对比 | 正常项箭头紫色（$--primary），删除项箭头红色（$--destructive） | AC-34 |

### 6.6 Add Mapping 按钮

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| FM-D-018 | P1 | 按钮显示 | 映射列表底部显示 "Add Mapping" 按钮 | — |
| FM-D-019 | P1 | 按钮样式 | plus 图标 + "Add Mapping" 文字，border 样式，居中对齐 | — |
| FM-D-020 | P2 | 按钮交互 | 点击切换到添加映射表单 | — |

---

## 七、跨功能测试用例

| ID | 优先级 | 测试项 | 预期结果 | AC |
|----|--------|--------|----------|----|
| CF-001 | P0 | Add Domain 路由 | `/user-management/:userId/add-domain` 在 MainLayout 内正确渲染 | AC-03 |
| CF-002 | P0 | Remove Domain 路由 | Remove Domain 页面在 MainLayout 内正确渲染 | AC-13 |
| CF-003 | P1 | 暗色主题一致性 | 所有页面遵循暗色主题：背景 #0a0a0f，卡片 #1a1a24 | — |
| CF-004 | P1 | 颜色语义一致性 | 紫色用于主操作/选中态，红色用于破坏性操作/警告 | — |
| CF-005 | P2 | 字体一致性 | 使用 Inter 字体族，各层级字号符合设计规范 | — |
| CF-006 | P1 | 图标库一致性 | 所有图标均使用 lucide-react 图标库 | — |
| CF-007 | P2 | 响应式适配 | 各面板/卡片在不同窗口尺寸下无溢出或截断 | — |

---

## 八、AC → 测试用例追溯矩阵

| AC | 描述 | 测试用例 |
|----|------|----------|
| AC-01 | Breadcrumb — Add Domain | AD-003 |
| AC-02 | Header 按钮 — Cancel + Add Selected | AD-007, AD-008, AD-009 |
| AC-03 | 路由渲染 — MainLayout | AD-001, AD-002, CF-001 |
| AC-04 | 页面标题 + 副标题 | AD-004, AD-005 |
| AC-05 | 搜索框 400px | AD-010, AD-011, AD-012 |
| AC-06 | Domain 卡片基础样式 | AD-013 |
| AC-07 | 选中态 — 2px border + checkbox + Role | AD-016, AD-017, AD-020, AD-031, AD-033 |
| AC-08 | 未选中态 — 1px border + 空 checkbox | AD-022, AD-023, AD-026, AD-028, AD-032 |
| AC-09 | 卡片组成结构 — icon 40x40 + 文字 + stats | AD-014, AD-015, AD-018, AD-019, AD-024, AD-025, AD-029, AD-030 |
| AC-10 | Domain 数据 — 名称 + 图标颜色 | AD-015, AD-018, AD-021, AD-024, AD-027, AD-029 |
| AC-11 | 分页 — 文字 + 按钮尺寸 | AD-035, AD-036, AD-039 |
| AC-12 | 分页 — 当前页 primary，其他 secondary | AD-037, AD-038 |
| AC-13 | 居中模态框 520px | RD-001, RD-003, RD-004, RD-005, CF-002 |
| AC-14 | Breadcrumb — Remove Domain | RD-002 |
| AC-15 | 红色警告图标 64x64 | RD-006, RD-007, RD-008 |
| AC-16 | 标题 + 描述文字 | RD-009, RD-010 |
| AC-17 | Domain 信息卡 — Enterprise + Owner | RD-011, RD-012, RD-013, RD-014, RD-015 |
| AC-18 | 红色警告框 — circle-alert | RD-016, RD-017, RD-018, RD-019 |
| AC-19 | 确认输入 — 输入 Enterprise 激活 | RD-020, RD-021, RD-022, RD-023, RD-027 |
| AC-20 | 按钮 — Cancel + Remove Access | RD-024, RD-025, RD-028, RD-029 |
| AC-21 | 按钮等宽 fill_container | RD-026 |
| AC-22 | 三栏布局 — Source + Mapping + Target | FM-A-001, FM-A-003, FM-A-004, FM-A-005, FM-D-002 |
| AC-23 | Header — breadcrumb + pill 按钮 | FM-A-002, FM-A-006, FM-A-007, FM-A-008 |
| AC-24 | Source Panel header | FM-A-009, FM-A-010 |
| AC-25 | Source 字段列表 | FM-A-011, FM-A-012, FM-A-013, FM-A-014 |
| AC-26 | Connector 圆点 12px + 选中态 | FM-A-015, FM-A-016, FM-A-037, FM-A-038, FM-A-039, FM-A-040 |
| AC-27 | Mapping header + 计数 | FM-A-017, FM-A-018 |
| AC-28 | 已有映射 3 条 + arrow-right | FM-A-019, FM-A-020, FM-A-021, FM-A-022 |
| AC-29 | Add Mapping Form 容器样式 | FM-A-023, FM-A-024 |
| AC-30 | Form 3 个下拉 | FM-A-025, FM-A-026, FM-A-027 |
| AC-31 | Form 按钮 — Cancel + Confirm | FM-A-028, FM-A-029 |
| AC-32 | Target Panel header | FM-A-030, FM-A-031 |
| AC-33 | Target 字段列表 | FM-A-032, FM-A-033, FM-A-034, FM-A-035, FM-A-036 |
| AC-34 | Delete 确认态 — 红色样式 | FM-D-005, FM-D-006, FM-D-007, FM-D-015, FM-D-016, FM-D-017 |
| AC-35 | Delete 确认行 — triangle-alert + Keep/Remove | FM-D-008, FM-D-009, FM-D-010, FM-D-011, FM-D-012, FM-D-013, FM-D-014 |
| AC-36 | 非确认态 — trash-2 图标入口 | FM-D-003, FM-D-004 |

---

## 九、测试用例统计

| 功能模块 | 用例数 |
|----------|--------|
| Add Domain（AD） | 39 |
| Remove Domain（RD） | 29 |
| Field Mapping Add State（FM-A） | 41 |
| Field Mapping Delete State（FM-D） | 20 |
| 跨功能（CF） | 7 |
| **合计** | **136** |

**AC 覆盖率**: 36/36 (100%)

---

## 十、设计稿关键色值参考

| 用途 | 色值 |
|------|------|
| 主色/选中态 ($--primary) | #8b5cf6 (紫色) |
| 成功/通过 | #22C55E / #4ADE80 (绿色) |
| 破坏性/警告 ($--destructive) | #ef4444 (红色) |
| 信息/青色 | #22D3EE |
| 页面背景 | #0a0a0f |
| 卡片/面板背景 (secondary) | #1a1a24 |
| 次要文字 (muted) | #a1a1aa |
| 主要文字 (foreground) | #f4f4f5 |
| 红色警告框背景 | #ef444410 |
| 红色警告框边框 | #ef444440 |
| 红色图标容器背景 | #ef444420 |
| 删除确认态背景 | #EF444410 |
| Add Form 背景 | #8B5CF610 |
| Source 数据库图标 | #336791 |

---

## 十一、注意事项

1. **Add Domain / Remove Domain** 是独立新页面，从 User Detail 触发
2. **Field Mapping Add/Delete State** 是现有 FieldMappingPage 的交互增强，不需要新路由
3. **Remove Domain 确认输入**需要用户输入 domain 名称才能激活 Remove Access 按钮（重点验证交互）
4. **Domain 卡片选中/未选中态切换**是重点验证项（checkbox 实心 vs 空心、border 2px vs 1px、Role 下拉显隐）
5. **Connector 圆点** 12px 尺寸、实心 vs 空心区分已映射/未映射状态
6. **Delete 状态**关注紫→红色变化（背景、边框、箭头图标全部变色）
