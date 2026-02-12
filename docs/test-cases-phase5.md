# Phase 5 测试用例 — 系统设置、通知中心、变更日志、趋势图

**编写人**: QA Engineer
**日期**: 2026-02-12
**设计稿**: System Settings (Fz7Zp), Notification Center (pJZMG), Change Log (i5ctK), Trend Chart (t7c7m)

---

## 一、System Settings（设计稿 Fz7Zp）

### 1.1 页面结构与路由

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| SS-01 | 路由 `/settings` 或 `/system-settings` 可访问 | 在 MainLayout 内正常渲染 System Settings 页面 | Fz7Zp |
| SS-02 | 页面整体布局 | 左侧 Sidebar (280px) + 右侧 Main Content (fill) | jcI9Z, 6Q6cD |

### 1.2 Header

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| SS-03 | Header 高度和边框 | 高度 64px, 底部 border 1px divider 色 | yPfMW |
| SS-04 | Breadcrumb | "Settings > System Settings", chevron-right 分隔, "Settings" muted 色, "System Settings" foreground 500 | HcEfL |
| SS-05 | Save Changes 按钮 | save 图标 16px + "Save Changes" 文本 14px 500, primary 填充, cornerRadius 8, shadow(blur 12, #8B5CF640) | Osuo6 |

### 1.3 Reasoner Configuration 卡片

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| SS-06 | 卡片容器样式 | cornerRadius 12, 透明填充, border 1px, padding 24, gap 20 | eYupW |
| SS-07 | 标题 | "Reasoner Configuration" 16px 600 foreground | OGUj2 |
| SS-08 | 描述 | "Configure the OWL reasoner used for consistency checking and inference." 13px muted | sux9t |
| SS-09 | Reasoner Engine 行 | 标签 "Reasoner Engine" 14px 500 + 描述 "Select the reasoning engine for ontology inference" 12px muted | TDSwK |
| SS-10 | Reasoner Engine 下拉框 | 值 "HermiT", 宽度 200px, cornerRadius 8, border 1px, chevron-down 14px | UAiJm |
| SS-11 | Auto-run Consistency Check 行 | 标签 14px 500 + 描述 12px muted | BFaF1 |
| SS-12 | Toggle 1 (ON 状态) | 宽 44px, 高 24px, cornerRadius 100(pill), primary 填充, 白色圆点 20x20 靠右 | ywEt4 |

### 1.4 Default Namespace 卡片

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| SS-13 | 标题 | "Default Namespace" 16px 600 | JUFn3 |
| SS-14 | 描述 | "Set the default namespace URI for new ontology entities." 13px muted | 7amur |
| SS-15 | Base URI 行 | 标签 "Base URI" 14px 500 + "The base URI prefix for all new entities" 12px muted | fnMK7 |
| SS-16 | Base URI 输入框 | 值 "https://enterprise.ontology.io/schema#", 宽度 360px, cornerRadius 8, border 1px | etwz4 |
| SS-17 | Default Prefix 行 | 标签 "Default Prefix" 14px 500 + "Short prefix alias for the base URI" 12px muted | tlDAn |
| SS-18 | Default Prefix 输入框 | 值 "ent:", 宽度 200px, cornerRadius 8, border 1px | bEsLh |

### 1.5 Language & Display 卡片

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| SS-19 | 标题 | "Language & Display" 16px 600 | sJXi4 |
| SS-20 | 描述 | "Configure language preferences and display options for the ontology editor." 13px muted | 29O2d |
| SS-21 | Interface Language 行 | 标签 + 下拉框 "English (en)", 宽度 200px, cornerRadius 8 | B0yl0, QYHSY |
| SS-22 | Show URIs in Editor Toggle (OFF) | 44x24, cornerRadius 100, muted-foreground 填充 (灰色), 圆点靠左 | 9GcoY |
| SS-23 | Dark Mode Toggle (ON) | 44x24, cornerRadius 100, primary 填充 (紫色), 圆点靠右 | 6M3Es |

### 1.6 交互功能

| ID | 测试项 | 预期结果 |
|----|--------|----------|
| SS-24 | Toggle 开关切换 | 点击 toggle 可在 ON/OFF 间切换, ON=primary 填充+圆点右, OFF=muted 填充+圆点左 |
| SS-25 | 下拉框交互 | 点击 Reasoner Engine / Interface Language 下拉框可展开选项 |
| SS-26 | 输入框编辑 | Base URI 和 Default Prefix 输入框可编辑 |
| SS-27 | Save Changes 点击 | 点击 Save Changes 按钮应触发保存操作 |
| SS-28 | 3 张卡片垂直排列 | 卡片间距 gap 24px, 依次为 Reasoner → Namespace → Language | XCH0s |

---

## 二、Notification Center（设计稿 pJZMG）

### 2.1 页面结构与路由

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-01 | 路由可访问 | `/notifications` 在 MainLayout 内渲染 | pJZMG |
| NC-02 | 页面布局 | Sidebar (280px) + Main Content (fill) | dhlae, ta2SG |

### 2.2 Header

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-03 | Header 高度 | 64px, 底部 border 1px | cwxmh |
| NC-04 | Breadcrumb | "System > Notifications", chevron-right 分隔, "System" muted, "Notifications" foreground 500 | rtGEr |
| NC-05 | Mark All Read 按钮 | check-check 图标 16px + "Mark All Read" 14px 500, secondary 填充, cornerRadius 8 | 0cF6T |

### 2.3 Filter 行

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-06 | Filter 行布局 | 水平排列, gap 8px | 0fS9u |
| NC-07 | "All" 按钮 (active) | primary 填充, white 文本 13px 500, cornerRadius 100(pill) | tWmyv |
| NC-08 | "All" 计数 badge | 文本 "8", primary 文本色, white 背景, cornerRadius 100, padding [1,6] | Q3GPT |
| NC-09 | "Unread" 按钮 | border 1px, foreground 文本 13px, cornerRadius 100 | m5pKD |
| NC-10 | "Unread" 计数 badge | 文本 "3", white 文本, destructive (红色) 背景, cornerRadius 100 | 1ZUqz |
| NC-11 | "Import" 按钮 | border 1px, foreground 文本, cornerRadius 100, 无计数 | wb6Ac |
| NC-12 | "Reasoner" 按钮 | border 1px, foreground 文本, cornerRadius 100, 无计数 | jb3Hz |
| NC-13 | "Conflicts" 按钮 | border 1px, foreground 文本, cornerRadius 100, 无计数 | 4XGAf |

### 2.4 通知列表

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-14 | 列表容器 | cornerRadius 12, border 1px, vertical layout | I9Unr |
| NC-15 | 通知项结构 | 每项: 图标圆(36x36) + body(title+desc+badge), gap 12, padding [16,24] | — |

### 2.5 通知 1 — Consistency Check Failed (未读)

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-16 | 未读背景 | fill: secondary (深色背景) | Ucln8 |
| NC-17 | 图标 | triangle-alert, #f87171 色, 圆形容器 36x36, bg #2E1215 | 8sQY1 |
| NC-18 | 标题 | "Consistency Check Failed" 14px **600** (未读加粗) | QQs6q |
| NC-19 | 时间 | "2 min ago" 12px muted, 右对齐 | 1E9Na |
| NC-20 | 描述 | "Reasoner detected an inconsistency: Person and Organization share instance \"AcmeCorp\" violating disjointWith axiom." 13px muted | OzyN9 |
| NC-21 | 类别 badge | "Conflict", #f87171 文本, #2E1215 背景, cornerRadius 6 | MyzRv |

### 2.6 通知 2 — Import Completed Successfully (未读)

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-22 | 未读背景 | fill: secondary | 1aMQw |
| NC-23 | 图标 | circle-check, #4ade80 色, bg #132B1E | TDBlw |
| NC-24 | 标题 | "Import Completed Successfully" 14px **600** | UkVbj |
| NC-25 | 时间 | "15 min ago" | De5GU |
| NC-26 | 描述 | "Successfully imported health: namespace from OWL file. 14 classes, 23 properties, and 8 relations added." | FuoSc |
| NC-27 | badge | "Import", #4ade80 文本, #132B1E bg | mx9fv |

### 2.7 通知 3 — Reasoning Complete (未读)

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-28 | 未读背景 | fill: secondary | AhIMK |
| NC-29 | 图标 | brain, #818cf8 色, bg #191933 | b1Nn2 |
| NC-30 | 标题 | "Reasoning Complete" 14px **600** | 4pjpc |
| NC-31 | 时间 | "1 hour ago" | B2r7U |
| NC-32 | 描述 | "HermiT reasoner completed inference on v2.4.0. 12 new inferred triples generated. No inconsistencies found." | iwVAu |
| NC-33 | badge | "Reasoner", #818cf8 文本, #191933 bg | lEw9S |

### 2.8 通知 4 — Validation Warning (已读)

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-34 | 已读背景 | 无 secondary 填充 (透明/默认背景) | trfdq |
| NC-35 | 图标 | triangle-alert, #fbbf24 色, bg #2E2008 | NpMFe |
| NC-36 | 标题 | "Validation Warning" 14px **500** (已读常规粗细) | Ru8Ud |
| NC-37 | 时间 | "3 hours ago" | NaZ6u |
| NC-38 | 描述 | "Property \"hasAge\" on class Person is missing range restriction. Consider adding xsd:integer range." | L6rsS |
| NC-39 | badge | "Conflict", #fbbf24 文本, #2E2008 bg | a0SmY |

### 2.9 通知 5 — Export Completed (已读)

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| NC-40 | 已读背景 | 无 secondary 填充 | 9yPCK |
| NC-41 | 图标 | circle-check, #4ade80, bg #132B1E | Wnyfg |
| NC-42 | 标题 | "Export Completed" 14px **500** | gKxX3 |
| NC-43 | 时间 | "Yesterday" | D3vR1 |
| NC-44 | 描述 | "Ontology v2.3.0 exported as OWL/XML format. File size: 2.4 MB, 156 classes, 89 relations." | irPmM |
| NC-45 | badge | "Import", #818cf8 文本, #191933 bg | W40vS |

### 2.10 交互功能

| ID | 测试项 | 预期结果 |
|----|--------|----------|
| NC-46 | Filter 切换 | 点击 "Unread" 等筛选按钮, 按钮变为 active 状态 (primary fill), 列表过滤 |
| NC-47 | Mark All Read | 点击后所有通知变为已读状态 (title weight 500, 无 secondary bg) |
| NC-48 | 未读/已读区分 | 未读: secondary bg + fontWeight 600; 已读: 无 bg + fontWeight 500 |
| NC-49 | 通知底部分隔线 | 每条通知之间有 border-bottom 1px (最后一条无) | stroke.bottom |

---

## 三、Change Log（设计稿 i5ctK）

### 3.1 页面结构与路由

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| CL-01 | 路由可访问 | `/change-log` 或 `/audit-logs` 在 MainLayout 内渲染 | i5ctK |
| CL-02 | 页面布局 | Sidebar (280px) + Main Content (fill) | DMQbP, fQZir |

### 3.2 Header

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| CL-03 | Header 高度 | 64px, 底部 border 1px | IcbVK |
| CL-04 | Breadcrumb | "Admin > Change Log", chevron-right 分隔, "Admin" muted, "Change Log" foreground 500 | e7zud |
| CL-05 | Export 按钮 | download 图标 16px + "Export" 14px 500, secondary 填充, cornerRadius 8 | oK4u7 |

### 3.3 Filter 栏

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| CL-06 | Filter 栏布局 | 左右分布 (space-between), 左侧 pill 按钮组, 右侧日期选择器 | 0O0iA |
| CL-07 | "All Changes" (active) | primary 填充, white 文本 13px 500, cornerRadius 100 | VdV9o |
| CL-08 | "Created" 按钮 | border 1px, foreground 文本, cornerRadius 100 | WUTtu |
| CL-09 | "Modified" 按钮 | border 1px, foreground 文本, cornerRadius 100 | nYcfh |
| CL-10 | "Deleted" 按钮 | border 1px, foreground 文本, cornerRadius 100 | 1vdFn |
| CL-11 | Date 选择器 | calendar 图标 16px + "Last 7 days" 13px + chevron-down 14px, cornerRadius 8, border 1px | J3ZHl |

### 3.4 表格结构

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| CL-12 | 表格容器 | cornerRadius 12, border 1px, vertical layout | 6ziVh |
| CL-13 | 表头 | 5 列: Timestamp(160px), User(120px), Action(100px), Description(fill), Entity(80px) | mDrQa |
| CL-14 | 表头样式 | 12px 600 muted 色, padding [12,24], 底部 border 1px | 528Ep 等 |
| CL-15 | 数据行样式 | padding [14,24], 底部 border 1px (最后一行无) | AyePt 等 |

### 3.5 表格数据行

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| CL-16 | Row 1 | "2024-01-15 14:32" (muted 13px), "admin" (foreground 13px 500), **Created** (#4ade80, bg #132B1E), "Added new class \"MedicalRecord\" with 5 properties", **Class** (primary bg, white text) | AyePt |
| CL-17 | Row 2 | "2024-01-15 13:18", "data_eng", **Modified** (#fbbf24, bg #2E2008), "Updated domain of \"hasEmployee\" from Thing to Organization", **Relation** (#4ade80, bg #132B1E) | ULwAE |
| CL-18 | Row 3 | "2024-01-15 11:45", "admin", **Deleted** (#f87171, bg #2E1215), "Removed deprecated property \"legacyId\" from Person class", **Property** (#fbbf24, bg #2E2008) | 1Mbaq |
| CL-19 | Row 4 | "2024-01-14 16:50", "ontologist", **Created** (#4ade80, bg #132B1E), "Added disjointWith axiom between Person and Organization", **Axiom** (foreground, secondary bg) | VicET |
| CL-20 | Row 5 | "2024-01-14 10:22", "data_eng", **Modified** (#fbbf24, bg #2E2008), "Changed cardinality of hasName to maxCardinality=1", **Property** (#fbbf24, bg #2E2008) | fo8wp |
| CL-21 | Row 6 | "2024-01-13 09:05", "admin", **Created** (#4ade80, bg #132B1E), "Imported health: namespace with 14 classes from OWL file", **Import** (#818cf8, bg #191933) | klLkb |

### 3.6 Badge 样式

| ID | 测试项 | 预期结果 |
|----|--------|----------|
| CL-22 | Action badges | Created: #4ade80 文本 + #132B1E bg; Modified: #fbbf24 文本 + #2E2008 bg; Deleted: #f87171 文本 + #2E1215 bg |
| CL-23 | Entity badges | Class: primary bg + white text; Relation: #4ade80 + #132B1E; Property: #fbbf24 + #2E2008; Axiom: foreground + secondary bg; Import: #818cf8 + #191933 |
| CL-24 | Badge 通用样式 | fontSize 11px, fontWeight 500, cornerRadius 6, padding [2,8] |

### 3.7 交互功能

| ID | 测试项 | 预期结果 |
|----|--------|----------|
| CL-25 | Filter 切换 | 点击 Created/Modified/Deleted 过滤对应类型的变更记录 |
| CL-26 | Date 选择器交互 | 点击日期选择器可展开日期范围选项 |
| CL-27 | Export 点击 | 点击 Export 按钮触发导出操作 |
| CL-28 | Timestamp 列排序 | 默认按时间倒序排列 (最新在前) |

---

## 四、Trend Chart Page（设计稿 t7c7m）

### 4.1 页面结构与路由

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| TC-01 | 路由可访问 | 相关路由在 MainLayout 内渲染趋势图页面 | t7c7m |
| TC-02 | 页面布局 | Sidebar (240px, #111118) + Main Area (fill) | xXg73, Gicxd |

### 4.2 Header

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| TC-03 | Header 容器 | 高 56px, fill #111118, border #27273a, padding [0,24] | nLRWo |
| TC-04 | 标题 | "Trend Analysis" 16px 600 #f4f4f5, JetBrains Mono 字体 | K6e78 |
| TC-05 | Time Range 按钮 | calendar 图标 14px #a1a1aa + "Last 12 Months" 13px #a1a1aa, cornerRadius 6, border #27273a | dWeoV |
| TC-06 | Export 按钮 | download 图标 14px white + "Export" 13px 500 white, cornerRadius 6, primary (#8b5cf6) 填充 | 0niFU |

### 4.3 Metrics 卡片行

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| TC-07 | 卡片行布局 | 4 张卡片水平排列, gap 16, 每张 fill_container (等宽) | mjzbm |
| TC-08 | 卡片通用样式 | cornerRadius 12, fill #111118, border #27273a 1px, padding [20,24], gap 8 | eVDmt 等 |
| TC-09 | Card 1 — Total Classes | 标签 "Total Classes" 13px #a1a1aa, 值 "1,284" 28px 700 #f4f4f5 JetBrains Mono, badge "+12.5%" 12px #4ade80 + trending-up 图标 12px, bg #22c55e20, cornerRadius 4 | eVDmt |
| TC-10 | Card 2 — Total Relations | 标签 "Total Relations", 值 "3,567", badge "+8.3%" green trending-up | 6za4A |
| TC-11 | Card 3 — Total Instances | 标签 "Total Instances", 值 "45,892", badge "-2.1%" **#f87171** + **trending-down** 图标, bg **#ef444420** (红色下降) | vTI5h |
| TC-12 | Card 4 — SPARQL Queries | 标签 "SPARQL Queries", 值 "8,241", badge "+24.7%" green trending-up | UEC8Z |

### 4.4 Chart 卡片

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| TC-13 | Chart 卡片容器 | cornerRadius 12, fill #111118, border #27273a, fill_container 高度 | gl3ao |
| TC-14 | Chart 标题 | "Ontology Growth Trend" 15px 600 JetBrains Mono #f4f4f5 | nc3uO |
| TC-15 | Chart 副标题 | "Classes, Relations and Instances over time" 12px Geist #a1a1aa | DC6V2 |
| TC-16 | 标题与图例布局 | 标题左对齐, 图例右对齐, space-between, padding [16,24] | vjTzO |
| TC-17 | 图例 — Classes | 紫色圆点 8px #8b5cf6 + "Classes" 12px #a1a1aa, gap 6 | uEptD |
| TC-18 | 图例 — Relations | 青色圆点 8px #06b6d4 + "Relations" 12px #a1a1aa | rsdeY |
| TC-19 | 图例 — Instances | 琥珀色圆点 8px #f59e0b + "Instances" 12px #a1a1aa | s9t4j |
| TC-20 | 图例间距 | 3 个图例项 gap 16 | L57sY |

### 4.5 Chart 绘图区域

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| TC-21 | 分隔线 | 标题区与图表区之间 1px #27273a 分隔线 | JjywK |
| TC-22 | Y 轴标签 | 6 个标签: 0, 100, 200, 300, 400, 500, 11px #71717a, 右对齐, 宽 45px | PPiaS |
| TC-23 | X 轴标签 | 12 个月: Jan-Dec, 11px #71717a, 均匀分布 (space-between) | 4cHzc |
| TC-24 | 网格线 | 水平网格线 #27273a 或 #1e1e2a, 1px | v4SCn 等 |
| TC-25 | Classes 折线 | #8b5cf6 色, stroke 2.5px | qZiG3 |
| TC-26 | Relations 折线 | #06b6d4 色, stroke 2.5px | WeuP6 |
| TC-27 | Instances 折线 | #f59e0b 色, stroke 2.5px | RsJrm |
| TC-28 | 数据点标记 | 折线端点有圆形标记 10x10, 对应颜色填充, #111118 border 2px | Jrm1R, HpO2y, O0sTd |

### 4.6 Tooltip 与 Hover

| ID | 测试项 | 预期结果 | 设计稿节点 |
|----|--------|----------|-----------|
| TC-29 | Hover 竖线 | 悬停时显示垂直参考线 #71717a40 1px | vFo4c |
| TC-30 | Hover 数据点 | 悬停月份的 3 条线上显示对应颜色的圆形标记 10x10 | 3cDlU, TilPK, px2fa |
| TC-31 | Tooltip 容器 | cornerRadius 8, fill #1a1a24, border #27273a 1px, padding [10,14], gap 6 | 12s5d |
| TC-32 | Tooltip 标题 | 月份 "August 2025" 12px 600 #f4f4f5 | cUFdt |
| TC-33 | Tooltip 数据行 | 每行显示颜色圆点 + 系列名 + 数值, gap 8 | JDcF4 等 |

### 4.7 交互功能

| ID | 测试项 | 预期结果 |
|----|--------|----------|
| TC-34 | Time Range 切换 | 点击 Time Range 按钮可切换时间范围 (如 Last 6 Months / Last 12 Months / All Time) |
| TC-35 | Export 点击 | 点击 Export 按钮触发数据导出 |
| TC-36 | Chart Hover 交互 | 鼠标悬停在图表区域显示 tooltip 和竖线 |
| TC-37 | 图例交互 | 点击图例项可切换对应折线的显示/隐藏 (可选) |
| TC-38 | 指标卡片上下箭头颜色 | 正增长: trending-up #4ade80 + green bg; 负增长: trending-down #f87171 + red bg |

---

## 五、跨功能测试

| ID | 测试项 | 预期结果 |
|----|--------|----------|
| CF-01 | Sidebar 一致性 | 4 个页面的 Sidebar 结构与全局一致 (Logo + Nav + Footer) |
| CF-02 | 深色主题 | 所有页面遵循深色主题: background #0a0a0f, card #111118/#1a1a24, text #f4f4f5 |
| CF-03 | 响应式布局 | Main Content 区域自适应剩余宽度 |
| CF-04 | 路由导航 | 从 Sidebar 菜单点击可正确导航到各页面 |
| CF-05 | Breadcrumb 导航 | 面包屑中的父级项可点击导航返回 |
| CF-06 | 按钮 hover 效果 | 所有可交互按钮有适当的 hover 状态变化 |
| CF-07 | Filter pills 通用样式 | Notification 和 Change Log 的 pill filter 使用相同设计规范: active=primary fill, inactive=border |

---

## 六、测试用例汇总

| 页面 | 测试用例数 |
|------|-----------|
| System Settings | 28 (SS-01 ~ SS-28) |
| Notification Center | 49 (NC-01 ~ NC-49) |
| Change Log | 28 (CL-01 ~ CL-28) |
| Trend Chart Page | 38 (TC-01 ~ TC-38) |
| 跨功能 | 7 (CF-01 ~ CF-07) |
| **合计** | **150** |
