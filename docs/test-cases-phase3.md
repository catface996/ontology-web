# Phase 3 测试用例 — 图查询 & 推理图谱

**编写人员**: QA Engineer
**编写日期**: 2026-02-12
**设计稿来源**: ontology.pen (Graph Query: mYLir, Reasoning Graph: H1ngK)

---

## 一、测试范围

| # | 页面 | 设计稿 ID | 预期路由 |
|---|------|-----------|----------|
| 1 | Graph Query Page | `mYLir` | `/graph-query` 或 `/sparql-query` |
| 2 | Reasoning Graph Page | `H1ngK` | `/reasoning` 或 `/reasoning-graph` |

---

## 二、优先级定义

| 级别 | 说明 |
|------|------|
| P0 | 页面无法加载或核心功能不可用 |
| P1 | 主要功能缺陷或明显的 UI 与设计稿不一致 |
| P2 | 次要 UI 差异、样式微调、交互体验 |
| P3 | 文案/数据微调、增强建议 |

---

## 三、Graph Query Page 测试用例

### 3.1 页面结构与路由 (GQ-001 ~ GQ-005)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| GQ-001 | P0 | 路由可访问 | 访问对应路由，页面正常渲染无白屏 |
| GQ-002 | P1 | 面包屑 | 显示 "Tools > Graph Query"，分隔符为 ChevronRight 图标 |
| GQ-003 | P1 | 页面整体布局 | 上下分栏：Query Editor (320px 高) + Graph Results (填充剩余) |
| GQ-004 | P1 | 侧边栏高亮 | 侧边栏 "SPARQL Query" 或对应菜单项处于选中状态 |
| GQ-005 | P2 | 内容区内边距 | 内容区 padding: 24px，两个卡片间距 gap: 20px |

### 3.2 Header 区域 (GQ-006 ~ GQ-010)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| GQ-006 | P1 | Header 高度 | 64px，底部 1px 分隔线 |
| GQ-007 | P1 | 搜索框 | 显示搜索图标 + "Search queries..." placeholder，宽度 200px，圆角 8px，填充色 $--secondary |
| GQ-008 | P1 | Run Query 按钮 | 紫色填充 ($--primary)，Play 图标 + "Run Query" 文本，gap: 6px，padding: 10px 16px |
| GQ-009 | P2 | Run Query 按钮阴影 | blur: 12, color: #8B5CF640, offset: (0, 4) |
| GQ-010 | P2 | 面包屑字体 | "Tools" 使用 muted-foreground/normal，"Graph Query" 使用 foreground/500 weight |

### 3.3 Query Editor 区域 (GQ-011 ~ GQ-022)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| GQ-011 | P1 | Editor 卡片 | 圆角 12px，border 1px $--border，高度 320px |
| GQ-012 | P1 | Editor Header | 高度 48px，填充色 $--secondary，底部 1px 分隔线 |
| GQ-013 | P1 | Editor 标题 | 左侧: Code 图标 (紫色) + "Query Editor" (fontWeight: 600, fontSize: 14) |
| GQ-014 | P1 | 工具按钮 — Templates | 右侧按钮: Bookmark 图标 + "Templates"，圆角 6px，border 1px |
| GQ-015 | P1 | 工具按钮 — Format | Sparkles 图标 + "Format"，圆角 6px，border 1px |
| GQ-016 | P1 | 工具按钮 — Clear | Trash2 图标 + "Clear"，圆角 6px，border 1px |
| GQ-017 | P1 | 代码行号区域 | 左侧行号列 width: 40px，显示 1-9 行号，JetBrains Mono 13px，右对齐，muted-foreground 色 |
| GQ-018 | P1 | 代码区域内容 | 显示 SPARQL 查询代码 9 行，JetBrains Mono 13px，padding: 20px |
| GQ-019 | P1 | 代码语法高亮 | PREFIX 行为 muted-foreground 色；SELECT/WHERE/} 为 $--primary 紫色；triple 行为 foreground 白色 |
| GQ-020 | P2 | 代码内容第1行 | `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>` |
| GQ-021 | P2 | 代码内容第4行 | `SELECT ?person ?name ?org` (紫色) |
| GQ-022 | P2 | 代码区间距 | 行号与代码内容之间 paddingLeft: 16px，行间距 gap: 6px |

### 3.4 Graph Results 区域 (GQ-023 ~ GQ-035)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| GQ-023 | P1 | Result 卡片 | 圆角 12px，border 1px，填充剩余高度 |
| GQ-024 | P1 | Result Header | 高度 48px，底部分隔线，padding: 0 16px |
| GQ-025 | P1 | Result 标题 | Share2 图标 (紫色) + "Graph Results" (fontWeight: 600) |
| GQ-026 | P1 | 结果统计 badge | "8 nodes" 绿色 badge，圆角 100px，填充 $--color-success，文字 $--color-success-foreground |
| GQ-027 | P2 | 执行时间 | "Executed in 0.042s"，muted-foreground，fontSize: 12 |
| GQ-028 | P1 | 导出按钮 — Export PNG | Image 图标 + "Export PNG"，圆角 6px，border 1px |
| GQ-029 | P1 | 导出按钮 — SVG | FileCode 图标 + "SVG"，圆角 6px，border 1px |
| GQ-030 | P1 | 图画布背景 | 填充色 $--secondary |
| GQ-031 | P1 | 组织节点样式 | 圆形 (cornerRadius: 40)，80x80px，building-2 图标，边框 3px |
| GQ-032 | P1 | 组织节点数据 | 3 个组织: Acme (#22D3EE 青), TechStart (#F472B6 粉), Innovate (#4ADE80 绿) |
| GQ-033 | P1 | 人物节点样式 | 圆形 (cornerRadius: 35)，70x70px，user 图标，边框 2px #A78BFA 紫 |
| GQ-034 | P1 | 人物节点数据 | 5 个人: John, Bob (关联 Acme), Jane, David (关联 TechStart), Alice (关联 Innovate) |
| GQ-035 | P2 | 连接线 | 节点间有彩色连接线，高 3px，宽 30px，颜色与对应组织节点一致 |

---

## 四、Reasoning Graph Page 测试用例

### 4.1 页面结构与路由 (RG-001 ~ RG-005)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| RG-001 | P0 | 路由可访问 | 访问对应路由，页面正常渲染无白屏 |
| RG-002 | P1 | 面包屑 | 显示 "Tools > Reasoning Graph"，分隔符为 ChevronRight 图标 |
| RG-003 | P1 | 页面整体布局 | 左右分栏: Config Panel (320px) + Graph Canvas (填充剩余) |
| RG-004 | P1 | 侧边栏高亮 | 侧边栏 "Reasoning" 菜单项处于选中状态 |
| RG-005 | P2 | 内容区内边距 | padding: 20px，两栏间距 gap: 20px |

### 4.2 Header 区域 (RG-006 ~ RG-012)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| RG-006 | P1 | Header 高度 | 64px，底部 1px 分隔线 |
| RG-007 | P1 | View Toggle | 切换组: "List" (List 图标) + "Graph" (GitFork 图标)，圆角 8px，填充 $--secondary，gap: 4px，padding: 4px |
| RG-008 | P1 | View Toggle 选中态 | "Graph" 按钮为选中态: 填充 $--background，文字/图标 $--foreground；"List" 为非选中: muted-foreground |
| RG-009 | P1 | Run Inference 按钮 | 紫色填充 ($--primary)，Play 图标 + "Run Inference" 文本 |
| RG-010 | P2 | Toggle 按钮圆角 | 内部按钮圆角 6px，外部容器圆角 8px |
| RG-011 | P2 | 面包屑字体 | "Tools" 使用 muted-foreground，"Reasoning Graph" 使用 foreground/500 weight |
| RG-012 | P2 | Run Inference 按钮样式 | 圆角 8px，gap: 6px，padding: 10px 16px |

### 4.3 Config Panel (RG-013 ~ RG-028)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| RG-013 | P1 | Config Panel 宽度 | 320px，圆角 12px，border 1px |
| RG-014 | P1 | Config Header | Settings2 图标 (紫色) + "Reasoning Configuration" (fontWeight: 600, fontSize: 14)，padding: 16px 20px，底部分隔线 |
| RG-015 | P1 | Config Body padding | 20px，内部各 section 间距 gap: 20px |
| RG-016 | P1 | Reasoning Type label | "Reasoning Type"，fontSize: 12，fontWeight: 600，muted-foreground |
| RG-017 | P1 | Reasoning Type 下拉框 | 显示 "Production Scheduling"，圆角 8px，填充 $--secondary，右侧 ChevronDown 图标 |
| RG-018 | P1 | Source Ontology label | "Source Ontology"，fontSize: 12，fontWeight: 600 |
| RG-019 | P1 | Source Ontology 下拉框 | 显示 "Supply Chain Ontology"，圆角 8px，填充 $--secondary，右侧 ChevronDown 图标 |
| RG-020 | P1 | Inference Rules label | "Inference Rules"，fontSize: 12，fontWeight: 600 |
| RG-021 | P1 | Rule 1 — Capacity Constraints | 已勾选 (checkbox 紫色填充 + check 图标)，文本 "Capacity Constraints"，fontSize: 13 |
| RG-022 | P1 | Rule 2 — Resource Availability | 已勾选，文本 "Resource Availability" |
| RG-023 | P1 | Rule 3 — Priority Ordering | 未勾选 (checkbox 仅 border 2px $--border)，文本 "Priority Ordering" |
| RG-024 | P1 | Rule 4 — Dependency Chain | 已勾选，文本 "Dependency Chain" |
| RG-025 | P2 | Rule 行样式 | 每行: 圆角 8px，填充 $--secondary，gap: 10px，padding: 10px 12px |
| RG-026 | P2 | Section 内部间距 | Label 与内容 gap: 10px |
| RG-027 | P2 | Checkbox 尺寸 | 18x18px，圆角 4px |
| RG-028 | P2 | 下拉框 padding | 10px 12px |

### 4.4 Graph Canvas — 推理流程图 (RG-029 ~ RG-048)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| RG-029 | P1 | Graph Canvas 卡片 | 圆角 12px，填充 $--card，border 1px，居中对齐，padding: 40px |
| RG-030 | P1 | 流程图整体结构 | 纵向流程: Input → 检查节点 → 产线节点 → 结果节点，4 行布局 |
| RG-031 | P1 | Row 1 — Input Node | "Order #1024"，Package 图标，紫色 (#8B5CF6) 填充，140x70px，圆角 12px |
| RG-032 | P1 | Input Node 文本样式 | 标签: fontSize 12, fontWeight 600, $--primary-foreground 白色 |
| RG-033 | P1 | Arrow 1 | 紫色 (#8B5CF6) 竖线，2px 宽，30px 高 |
| RG-034 | P1 | Row 2 — 三个检查节点 | 水平排列，gap: 40px |
| RG-035 | P1 | Capacity 节点 | Gauge 图标 + "Capacity" + "60% ✓" (绿色)，110x55px，圆角 10px，背景 #1e1e3f，边框 2px #8B5CF6 |
| RG-036 | P1 | Resources 节点 | CPU 图标 + "Resources" + "M1,M2 ✓" (绿色)，110x55px，圆角 10px，边框 #8B5CF6 |
| RG-037 | P1 | Depends 节点 | GitBranch 图标 + "Depends" + "None ✓" (绿色)，110x55px，圆角 10px，边框 #8B5CF6 |
| RG-038 | P2 | 检查节点文本样式 | 标签: fontSize 10, fontWeight 500；状态: fontSize 9, 绿色 #22C55E |
| RG-039 | P1 | Arrow 2 | 紫色 (#8B5CF6) 竖线，2px 宽，30px 高 |
| RG-040 | P1 | Row 3 — Production Line A 节点 | Factory 图标 (绿色 #22C55E) + "Production Line A" + "800 units/day" (绿色)，140x60px，圆角 10px，背景 #1e1e3f，边框 2px #22C55E |
| RG-041 | P2 | Production Line 文本 | 标签: fontSize 11, fontWeight 500；状态: fontSize 9, #22C55E |
| RG-042 | P1 | Arrow 3 | 绿色 (#22C55E) 竖线，2px 宽，30px 高 |
| RG-043 | P1 | Row 4 — Result Node | CircleCheck 图标 + "Assigned" + "98% confidence"，160x70px，圆角 12px，绿色 (#22C55E) 填充 |
| RG-044 | P1 | Result Node 文本样式 | 标签: fontSize 13, fontWeight 600, $--primary-foreground；副文本: fontSize 10, #FFFFFF90 |
| RG-045 | P2 | 检查节点图标 | Capacity=Gauge, Resources=CPU, Depends=GitBranch，颜色 #8B5CF6 |
| RG-046 | P2 | 流程箭头颜色变化 | Arrow 1-2 为紫色 (#8B5CF6)，Arrow 3 为绿色 (#22C55E) — 表示推理链从输入到通过的状态转换 |
| RG-047 | P2 | 节点间距 | Row 间距 gap: 24px (通过 layout="vertical" gap 控制) |
| RG-048 | P2 | Canvas 居中 | justifyContent: center + alignItems: center，图谱在画布中垂直水平居中 |

---

## 五、跨页面一致性测试 (CP-001 ~ CP-006)

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| CP-001 | P1 | Sidebar 宽度 | 两个页面侧边栏均为 280px，右侧 1px 分隔线 |
| CP-002 | P1 | Header 一致性 | 两个页面 Header 均为 64px 高，底部分隔线，左侧面包屑 + 右侧操作按钮 |
| CP-003 | P1 | 主按钮样式 | "Run Query" 和 "Run Inference" 均为紫色填充 + Play 图标 + 相同按钮样式 |
| CP-004 | P1 | 卡片圆角 | 两个页面所有卡片/面板均使用圆角 12px |
| CP-005 | P2 | 字体一致性 | 标题使用 $--font-primary fontWeight 600，正文使用 $--font-secondary，代码使用 JetBrains Mono |
| CP-006 | P2 | 颜色系统一致性 | 紫色 #8B5CF6/$--primary，绿色 #22C55E/#4ADE80，背景色 $--card/$--secondary 使用一致 |

---

## 六、测试用例统计

| 页面 | 用例数 | P0 | P1 | P2 | P3 |
|------|--------|----|----|----|----|
| Graph Query | 35 | 1 | 22 | 12 | 0 |
| Reasoning Graph | 51 | 1 | 32 | 18 | 0 |
| 跨页面 | 6 | 0 | 4 | 2 | 0 |
| **总计** | **92** | **2** | **58** | **32** | **0** |

---

## 七、验收标准追溯矩阵

PM 提供 30 条验收标准 (AC-01 ~ AC-30)，追溯至测试用例如下:

### Graph Query Page (AC-01 ~ AC-19)

| AC | 描述 | 测试用例 | 状态 |
|----|------|----------|------|
| AC-01 | Header 64px + 面包屑 "Tools > Graph Query" | GQ-002, GQ-006, GQ-010 | ✅ 已覆盖 |
| AC-02 | 搜索框 200px + "Run Query" 紫色按钮 (play图标+阴影) | GQ-007, GQ-008, GQ-009 | ✅ 已覆盖 |
| AC-03 | 搜索框 $--secondary 背景，圆角 8px，search 图标 | GQ-007 | ✅ 已覆盖 |
| AC-04 | Editor Section 320px 高，圆角 12px | GQ-011 | ✅ 已覆盖 |
| AC-05 | Editor Header 48px，$--secondary，code 图标 + "Query Editor" | GQ-012, GQ-013 | ✅ 已覆盖 |
| AC-06 | 右侧 3 按钮: Templates/Format/Clear | GQ-014, GQ-015, GQ-016 | ✅ 已覆盖 |
| AC-07 | JetBrains Mono 13px | GQ-017, GQ-018 | ✅ 已覆盖 |
| AC-08 | 行号: muted 色，右对齐，40px 宽 | GQ-017 | ✅ 已覆盖 |
| AC-09 | 语法着色: PREFIX=muted, SELECT/WHERE=primary, 普通=foreground | GQ-019 | ✅ 已覆盖 |
| AC-10 | 示例代码含 PREFIX/SELECT/WHERE 查询 person/name/org | GQ-020, GQ-021 | ✅ 已覆盖 |
| AC-11 | Result Section 占剩余空间，圆角 12px | GQ-023 | ✅ 已覆盖 |
| AC-12 | share-2 图标 + "Graph Results" + "8 nodes" badge + 执行时间 | GQ-025, GQ-026, GQ-027 | ✅ 已覆盖 |
| AC-13 | "Export PNG" + "SVG" 导出按钮 | GQ-028, GQ-029 | ✅ 已覆盖 |
| AC-14 | Canvas 背景 $--secondary，居中展示 | GQ-030 | ✅ 已覆盖 |
| AC-15 | 3 组织节点: Acme(#22D3EE), TechStart(#F472B6), Innovate(#4ADE80)，80x80 圆形 | GQ-031, GQ-032 | ✅ 已覆盖 |
| AC-16 | 5 人物节点(70x70, #A78BFA, user图标) | GQ-033, GQ-034 | ⚠️ 人名差异 (见下方说明) |
| AC-17 | 节点间彩色连线 | GQ-035 | ✅ 已覆盖 |
| AC-18 | Sidebar TOOLS 区 "Graph Query" 菜单项 | GQ-004 | ✅ 已覆盖 |
| AC-19 | 路由 `/graph-query` 正确渲染 | GQ-001 | ✅ 已覆盖 |

### Reasoning Graph Page (AC-20 ~ AC-30)

| AC | 描述 | 测试用例 | 状态 |
|----|------|----------|------|
| AC-20 | 面包屑: Graph 视图="Tools > Reasoning Graph"，List 视图="Tools > Reasoning" | RG-002 | ✅ 已覆盖 |
| AC-21 | View Toggle: Graph 选中态=foreground+$--background，List=muted | RG-007, RG-008 | ✅ 已覆盖 |
| AC-22 | "Run Inference" 紫色按钮 + play 图标 | RG-009 | ✅ 已覆盖 |
| AC-23 | Config Panel 320px，圆角 12px，透明背景+border | RG-013 | ✅ 已覆盖 |
| AC-24 | Config Header: settings-2 图标 + "Reasoning Configuration" | RG-014 | ✅ 已覆盖 |
| AC-25 | 3 个表单区域: Reasoning Type/Source Ontology/Inference Rules | RG-016~RG-024 | ✅ 已覆盖 |
| AC-26 | 默认值: "Production Scheduling" + "Supply Chain Ontology" | RG-017, RG-019 | ✅ 已覆盖 |
| AC-27 | 4 条规则: Capacity(✅), Resource(✅), Priority(☐), Dependency(✅) | RG-021~RG-024 | ✅ 已覆盖 |
| AC-28 | Graph Canvas 垂直流程图，4 行节点+连线 | RG-029, RG-030 | ✅ 已覆盖 |
| AC-29 | 完整流程: Input→Check(3)→Line→Result 含具体数据 | RG-031~RG-044 | ✅ 已覆盖 |
| AC-30 | View Toggle 切换 List/Graph 视图 | RG-007, RG-008 | ⚠️ 需补充切换测试 |

### 覆盖统计: 29/30 已覆盖，1 项需补充

---

## 八、差异说明与待确认项

### ⚠️ AC-16 人名差异

| PM 验收标准 | 设计稿 (ontology.pen) |
|------------|----------------------|
| John, **Sarah**, **Mike**, **Lisa**, Alice | John, **Bob**, **Jane**, **David**, Alice |

**建议**: 以设计稿为准 (John, Bob, Jane, David, Alice)。已在测试用例 GQ-034 中按设计稿数据编写。请 PM 确认。

### ⚠️ AC-30 View Toggle 切换功能补充

AC-30 要求 List/Graph 视图切换时内容区域正确变化。已有 RG-007/RG-008 覆盖 Toggle 的视觉状态，需补充以下测试:

| ID | 优先级 | 测试项 | 预期结果 |
|----|--------|--------|----------|
| RG-049 | P1 | View Toggle — 点击 List | 切换到 List 视图，显示原有 ReasoningPage 内容 |
| RG-050 | P1 | View Toggle — 点击 Graph | 切换回 Graph 视图，显示推理流程图 + Config Panel |
| RG-051 | P1 | View Toggle — 面包屑联动 | List 视图面包屑为 "Tools > Reasoning"，Graph 视图为 "Tools > Reasoning Graph" |

补充后总用例数: **92 条** (89 + 3)，AC 覆盖: **30/30**

---

## 九、关键验证点

### Graph Query Page 关键点:
1. SPARQL 代码编辑器带行号显示和语法高亮
2. 工具栏三个按钮: Templates / Format / Clear
3. 图结果区: 3 个组织节点 (不同颜色) + 5 个人物节点 + 连接线
4. 结果统计: "8 nodes" badge + 执行时间
5. 导出功能: Export PNG / SVG 两个按钮
6. 新增侧边栏菜单项 "Graph Query" + 路由 `/graph-query`

### Reasoning Graph Page 关键点:
1. 左侧配置面板: 2 个下拉框 + 4 个 checkbox 规则
2. 推理流程图: 4 行纵向流程 (Input → Check → Line → Result)
3. 状态颜色系统: 紫色 (进行中/输入) → 绿色 (通过/结果)
4. View Toggle: List / Graph 切换，Graph 为选中态
5. 所有检查节点显示绿色 "✓" 通过状态
6. 切换视图时面包屑和内容区域同步变化
