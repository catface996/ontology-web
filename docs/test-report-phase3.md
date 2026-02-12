# Phase 3 测试报告 — 图查询 & 推理图谱

**测试人员**: QA Engineer
**测试日期**: 2026-02-12
**测试环境**: localhost:5173 (Vite dev server)
**测试方法**: 代码审查 + 浏览器功能测试 + 设计稿对比验证
**测试依据**: ontology.pen 设计稿 + 32条验收标准 (AC-01~AC-32) + 92条测试用例 (test-cases-phase3.md)
**最终状态**: **全部通过** — 回归测试于 2026-02-12 完成，5/5 Bug 修复验证通过

---

## 一、测试范围

| # | 页面 | 路由 | 源文件 |
|---|------|------|--------|
| 1 | Graph Query | `/graph-query` | `GraphQueryPage.tsx` |
| 2 | Reasoning Graph | `/reasoning-graph` | `ReasoningGraphPage.tsx` |

---

## 二、测试结果总览

| 页面 | 初测状态 | Bug 数量 | 回归状态 |
|------|----------|----------|----------|
| Graph Query | FAIL | 2 (2L) | **PASS** ✅ |
| Reasoning Graph | FAIL | 3 (3L) | **PASS** ✅ |
| **总计** | — | **5 (5L)** | **2/2 PASS** ✅ |

---

## 三、Bug 清单

### BUG-P3-001 [Low] Graph Query — 节点图标使用 emoji 而非 lucide 图标

- **文件**: `GraphQueryPage.tsx:126`
- **现象**: 组织节点使用 `🏢` emoji，人物节点使用 `👤` emoji
- **期望**: 设计稿使用 lucide 图标: 组织节点为 `building-2` (24x24)，人物节点为 `user` (20x20)
- **影响**: 视觉风格与设计稿不一致，emoji 在不同平台渲染差异大

```tsx
// 当前 (错误)
node.append('text')
  .text((d: any) => d.type === 'org' ? '🏢' : '👤');

// 期望: 使用 SVG path 或 foreignObject 渲染 lucide building-2/user 图标
```

---

### BUG-P3-002 [Low] Graph Query — 连接线颜色为深灰色而非组织匹配色

- **文件**: `GraphQueryPage.tsx:91-92`
- **现象**: 所有连接线使用 `#27273a` 深灰色，`stroke-width: 2`
- **期望**: 设计稿中连接线颜色与对应组织节点颜色一致:
  - Acme 连线: `#22D3EE` (青色)
  - TechStart 连线: `#F472B6` (粉色)
  - Innovate 连线: `#4ADE80` (绿色)
  - 线条高度 3px
- **影响**: 图谱视觉层次感不足，无法通过颜色快速区分不同组织的关联

```tsx
// 当前 (错误)
.attr('stroke', '#27273a')
.attr('stroke-width', 2);

// 期望: 根据 source 节点颜色设置 stroke
// .attr('stroke', (d: any) => d.source.color || '#27273a')
// .attr('stroke-width', 3);
```

---

### BUG-P3-003 [Low] Reasoning Graph — 流程图节点缺少图标

- **文件**: `ReasoningGraphPage.tsx:103-141`
- **现象**: 流程图节点仅渲染文本标签 (label + sublabel)，无图标显示
- **期望**: 设计稿中每个节点包含对应图标:
  - Input: `package` (20x20)
  - Capacity: `gauge` (16x16, #8B5CF6)
  - Resources: `cpu` (16x16, #8B5CF6)
  - Depends: `git-branch` (16x16, #8B5CF6)
  - Production Line A: `factory` (18x18, #22C55E)
  - Result: `circle-check` (22x22)
- **影响**: 节点类型不够直观，缺少视觉辨识度
- **备注**: FlowNode 类型中已定义 `icon` 属性 (line 23)，节点数据也包含 icon 值 (line 31-38)，但 D3 绘制代码未使用该属性

---

### BUG-P3-004 [Low] Reasoning Graph — Arrow 3 颜色应为绿色

- **文件**: `ReasoningGraphPage.tsx:93-101`
- **现象**: 所有箭头/连线统一使用 `#8B5CF6` 紫色
- **期望**: 设计稿中:
  - Arrow 1 (Input → Row 2): `#8B5CF6` 紫色 ✅
  - Arrow 2 (Row 2 → LineA): `#8B5CF6` 紫色 ✅
  - Arrow 3 (LineA → Result): `#22C55E` **绿色** ❌
- **影响**: 无法通过颜色变化展示推理链从 "检查中" 到 "通过" 的状态转换

```tsx
// 当前 (错误) — 所有边统一颜色
g.append('line')
  .attr('stroke', '#8B5CF6')

// 期望: lineA→result 的边使用绿色
// const edgeColor = (e.from === 'lineA' || e.to === 'result') ? '#22C55E' : '#8B5CF6';
```

---

### BUG-P3-005 [Low] Reasoning Graph — 流程图节点尺寸统一而非分级

- **文件**: `ReasoningGraphPage.tsx:71-72`
- **现象**: 所有节点使用统一尺寸 `nodeW=140, nodeH=60`
- **期望**: 设计稿中不同节点有不同尺寸:

| 节点 | 设计稿尺寸 | 代码当前尺寸 | 圆角 |
|------|-----------|-------------|------|
| Input (Order #1024) | 140×70 | 140×60 ❌ | 12 ✅ |
| Check nodes (×3) | 110×55 | 140×60 ❌ | 10 (代码 12) ❌ |
| Production Line A | 140×60 | 140×60 ✅ | 10 (代码 12) ❌ |
| Result (Assigned) | 160×70 | 140×60 ❌ | 12 ✅ |

- **影响**: 节点层级关系不够清晰，输入/结果节点应比检查节点更大以突出重要性

---

## 四、验收标准覆盖情况

### Graph Query Page (AC-01 ~ AC-19)

| AC | 描述 | 结果 | 说明 |
|----|------|------|------|
| AC-01 | Header 64px + 面包屑 "Tools > Graph Query" | ✅ PASS | |
| AC-02 | 搜索框 200px + "Run Query" 紫色按钮 | ✅ PASS | |
| AC-03 | 搜索框 $--secondary 背景，圆角 8px | ✅ PASS | |
| AC-04 | Editor Section 320px 高，圆角 12px | ✅ PASS | |
| AC-05 | Editor Header 48px，code 图标 + "Query Editor" | ✅ PASS | |
| AC-06 | 右侧 3 按钮: Templates/Format/Clear | ✅ PASS | |
| AC-07 | JetBrains Mono 13px | ✅ PASS | |
| AC-08 | 行号: muted 色，右对齐，40px | ✅ PASS | |
| AC-09 | 语法着色: PREFIX=muted, SELECT/WHERE=primary | ✅ PASS | |
| AC-10 | 示例代码含 PREFIX/SELECT/WHERE | ✅ PASS | |
| AC-11 | Result Section 占剩余空间，圆角 12px | ✅ PASS | |
| AC-12 | share-2 + "Graph Results" + "8 nodes" + 执行时间 | ✅ PASS | |
| AC-13 | "Export PNG" + "SVG" 导出按钮 | ✅ PASS | |
| AC-14 | Canvas 背景 $--secondary | ✅ PASS | |
| AC-15 | 3 组织节点 (Acme/TechStart/Innovate + 颜色) | ✅ PASS | 尺寸/颜色正确 |
| AC-16 | 5 人物节点 (70x70, #A78BFA, user 图标) | ✅ PASS | 回归: lucide `user` SVG 图标 (BUG-P3-001 已修复) |
| AC-17 | 节点间彩色连线 | ✅ PASS | 回归: 连线颜色匹配源组织节点 (BUG-P3-002 已修复) |
| AC-18 | Sidebar TOOLS 区 "Graph Query" 菜单项 | ✅ PASS | |
| AC-19 | 路由 `/graph-query` 正确渲染 | ✅ PASS | |

**Graph Query 结果: 19/19 PASS** ✅

### Reasoning Graph Page (AC-20 ~ AC-32)

| AC | 描述 | 结果 | 说明 |
|----|------|------|------|
| AC-20 | 面包屑固定显示 "Tools > Reasoning Graph" | ✅ PASS | (PM 最终版: 独立路由不再区分 List/Graph 面包屑) |
| AC-21 | View Toggle: Graph 选中态/List 非选中态 | ✅ PASS | |
| AC-22 | "Run Inference" 紫色按钮 + play 图标 | ✅ PASS | |
| AC-23 | Config Panel 320px，圆角 12px | ✅ PASS | |
| AC-24 | Config Header: settings-2 + "Reasoning Configuration" | ✅ PASS | |
| AC-25 | 3 个表单区域 | ✅ PASS | |
| AC-26 | 默认值 "Production Scheduling" + "Supply Chain Ontology" | ✅ PASS | |
| AC-27 | 4 条规则 (3✅ + 1☐) | ✅ PASS | checkbox 交互功能正常 |
| AC-28 | Graph Canvas 垂直流程图 4 行 | ✅ PASS | |
| AC-29 | 完整流程含具体数据 | ✅ PASS | 回归: 图标已添加 (BUG-P3-003)、节点尺寸分级 (BUG-P3-005) 已修复 |
| AC-30 | View Toggle 双向导航: List→/reasoning, Graph→/reasoning-graph | ✅ PASS | 两页面均有 Toggle，双向切换功能完整 |
| AC-31 | Sidebar TOOLS 区 "Reasoning Graph" 菜单项 (git-fork 图标) | ✅ PASS | Sidebar.tsx:89 确认 GitFork 图标，点击导航正确 |
| AC-32 | 路由 `/reasoning-graph` 在 MainLayout 内渲染 | ✅ PASS | App.tsx:97 路由注册，MainLayout 内正常渲染 |

**Reasoning Graph 结果: 13/13 PASS** ✅

### 总体 AC 覆盖

| 范围 | 通过 | 部分 | 失败 | 合计 |
|------|------|------|------|------|
| Graph Query (AC-01~19) | 19 | 0 | 0 | 19 |
| Reasoning Graph (AC-20~32) | 13 | 0 | 0 | 13 |
| **总计** | **32** | **0** | **0** | **32** |

**最终通过率: 32/32 PASS (100%)** ✅

---

## 五、通过项详情

### Graph Query 页面 — 主要通过项

- [x] 路由 `/graph-query` 可访问，页面正常渲染
- [x] 面包屑: "Tools > Graph Query"，ChevronRight 分隔符
- [x] 搜索框: Search 图标 + "Search queries..." placeholder，200px 宽
- [x] "Run Query" 按钮: 紫色填充，Play 图标
- [x] Editor Section: 320px 高，圆角 12px，border 1px
- [x] Editor Header: 48px，Code 紫色图标 + "Query Editor" (fontWeight 600)
- [x] 工具按钮: Templates (Bookmark) / Format (Sparkles) / Clear (Trash2)
- [x] 行号 1-9: JetBrains Mono 13px，右对齐，muted-foreground
- [x] 代码内容: 9 行 SPARQL 查询，JetBrains Mono 13px
- [x] 语法高亮: PREFIX=muted，SELECT/WHERE/}=紫色，triples=foreground
- [x] Graph Results Header: Share2 图标 + "Graph Results" + "8 nodes" 绿色 badge + "Executed in 0.042s"
- [x] 导出按钮: "Export PNG" (Image) + "SVG" (FileCode)
- [x] Canvas 背景: $--secondary (#1a1a24)
- [x] 8 个节点: 3 组织 (Acme/#22D3EE, TechStart/#F472B6, Innovate/#4ADE80) + 5 人物 (John, Bob, Jane, David, Alice / #A78BFA)
- [x] D3 力导向图: 可拖拽节点、可缩放画布
- [x] 侧边栏 TOOLS 区 "Graph Query" 菜单项存在

### Reasoning Graph 页面 — 主要通过项

- [x] 路由 `/reasoning-graph` 可访问，页面正常渲染
- [x] 面包屑: "Tools > Reasoning Graph"，ChevronRight 分隔符
- [x] View Toggle: List (muted) / Graph (选中态 #0a0a0f bg)
- [x] View Toggle 功能: 点击 List → `/reasoning` (面包屑 "Reasoning")，点击 Graph → `/reasoning-graph`
- [x] "Run Inference" 按钮: 紫色填充，Play 图标
- [x] Config Panel: 320px 宽，圆角 12px，border 1px
- [x] Config Header: Settings2 紫色图标 + "Reasoning Configuration" (fontWeight 600)
- [x] Reasoning Type: "Production Scheduling" + ChevronDown
- [x] Source Ontology: "Supply Chain Ontology" + ChevronDown
- [x] Inference Rules: 4 条 (Capacity ✅, Resource ✅, Priority ☐, Dependency ✅)
- [x] Checkbox 交互: 点击可切换选中/未选中状态
- [x] Flow Graph: 4 行纵向流程
- [x] 节点数据正确: Order #1024 → Capacity 60%✓ / Resources M1,M2✓ / Depends None✓ → Production Line A 800 units/day → Assigned 98% confidence
- [x] D3 可缩放画布

---

## 六、建议修复优先级

所有 5 个 Bug 均为 Low 级别 (纯视觉与设计稿差异，无功能性缺陷)。建议按以下顺序修复:

1. **BUG-P3-002**: 连接线颜色 — 影响图查询页视觉效果最大
2. **BUG-P3-003**: 流程图节点图标 — 影响推理图谱可读性
3. **BUG-P3-001**: 节点 emoji → lucide 图标 — 跨平台一致性
4. **BUG-P3-004**: Arrow 3 颜色 — 状态转换视觉提示
5. **BUG-P3-005**: 节点尺寸分级 — 层级视觉区分

---

## 七、测试方法详情

### 代码审查

| 文件 | 行数 | 审查重点 |
|------|------|----------|
| `GraphQueryPage.tsx` | 280 | D3 力导向图、节点样式、语法高亮、布局结构 |
| `ReasoningGraphPage.tsx` | 255 | D3 流程图、配置面板、View Toggle、checkbox 交互 |
| `ReasoningPage.tsx` | 800+ | View Toggle 联动 (navigate to /reasoning-graph) |
| `Sidebar.tsx` | — | 侧边栏菜单项: line 89 (Reasoning Graph + GitFork) |
| `App.tsx` | 109 | 路由注册: line 96-97 |

### 浏览器功能测试

| 测试项 | 方法 | 结果 |
|--------|------|------|
| `/graph-query` 页面渲染 | Screenshot + Snapshot | ✅ |
| 8 个节点全部可见 | Snapshot 文本验证 | ✅ |
| `/reasoning-graph` 页面渲染 | Screenshot + Snapshot | ✅ |
| 6 个流程节点全部可见 | Snapshot 文本验证 | ✅ |
| Checkbox 交互 | 点击 Priority Ordering checkbox | ✅ 成功切换 |
| View Toggle List→Graph | 点击 List → /reasoning | ✅ 导航成功 |
| View Toggle Graph→List | 点击 Graph → /reasoning-graph | ✅ 导航成功 |
| 面包屑联动 | 切换视图后验证面包屑文本 | ✅ "Reasoning" ↔ "Reasoning Graph" |
| Sidebar "Reasoning Graph" | 点击侧边栏菜单项 | ✅ 从 /graph-query 导航到 /reasoning-graph |

### 设计稿对比

| 设计稿节点 | 对比范围 |
|------------|----------|
| `mYLir` (Graph Query) | 整体结构、Header、Editor、Graph Canvas |
| `H1ngK` (Reasoning Graph) | 整体结构、Header、Config Panel、Flow Graph |
| `31QYL` (Graph Canvas 详情) | 节点颜色/尺寸/图标/连线 |
| `Fw0sU` (Reasoning 内容区) | 流程节点尺寸/颜色/图标/箭头 |

---

## 八、总结

Phase 3 共测试 2 个页面，初测发现 5 个 Bug (均为 Low)，回归测试全部修复验证通过。

- **Graph Query Page**: SPARQL 编辑器、语法高亮、D3 力导向图等核心功能完整。初测 2 个 Bug (emoji 图标 + 连线颜色) 已修复。
- **Reasoning Graph Page**: 配置面板、View Toggle 导航、checkbox 交互等功能完整。初测 3 个 Bug (缺少图标、箭头颜色、节点尺寸) 已修复。
- **无功能性缺陷或崩溃**，所有页面加载正常，交互功能完备
- View Toggle 通过路由导航实现 (`/reasoning` ↔ `/reasoning-graph`)，面包屑联动正确
- 所有 Bug 均为 D3 SVG 可视化层面的视觉差异，无功能性问题
- **最终验收标准: 32/32 通过 (100%)**

Phase 3 验收完毕。

**最终 AC 通过率: 32/32 PASS (100%)** ✅

---

## 九、回归测试结果

**回归日期**: 2026-02-12
**回归结果**: 5/5 Bug 修复全部通过

| Bug ID | 修复验证 |
|--------|----------|
| BUG-P3-001 | ✅ 节点图标: emoji → lucide SVG 路径 (building-2/user)，截图确认 |
| BUG-P3-002 | ✅ 连接线颜色: #27273a → 源组织匹配色 (Acme=#22D3EE, TechStart=#F472B6, Innovate=#4ADE80)，3px，截图确认 |
| BUG-P3-003 | ✅ 流程节点图标: 新增 SVG 图标渲染 (package/gauge/cpu/git-branch/factory/circle-check)，截图确认 |
| BUG-P3-004 | ✅ Arrow 3 颜色: lineA→result 边 #8B5CF6 → #22C55E 绿色，截图确认 |
| BUG-P3-005 | ✅ 节点尺寸分级: Input 140×70/rx12, Check 110×55/rx10, LineA 140×60/rx10, Result 160×70/rx12，代码+截图确认 |

### 代码变更验证

| 文件 | 修改行 | 验证内容 |
|------|--------|----------|
| `GraphQueryPage.tsx` | 86-99 | nodeColorMap + 连线着色逻辑 ✅ |
| `GraphQueryPage.tsx` | 127-155 | lucide SVG path 图标渲染 ✅ |
| `ReasoningGraphPage.tsx` | 28-31, 34-41 | FlowNode 新增 w/h/rx + 分级数据 ✅ |
| `ReasoningGraphPage.tsx` | 43-51 | flowEdges 新增 per-edge color ✅ |
| `ReasoningGraphPage.tsx` | 92-174 | iconPaths 定义 + SVG 图标渲染 + per-node 尺寸 ✅ |

---

## 十、AC 修正说明

根据 PM 最终版 AC 调整 (方案 A — 独立路由):

| AC | 原版 | 最终版 | 影响 |
|----|------|--------|------|
| AC-16 | 人名: "John, Sarah, Mike, Lisa, Alice" | 人名以设计稿为准: **John, Bob, Jane, David, Alice** | PM 确认 PRD 笔误 |
| AC-20 | 面包屑随 List/Graph 切换 | 固定显示 "Tools > Reasoning Graph" | 独立路由不再切换面包屑 |
| AC-30 | 视图内切换 | 双向路由导航 (/reasoning ↔ /reasoning-graph) | 方案 A 实现 |
| AC-31 | (新增) | Sidebar TOOLS 区 "Reasoning Graph" + git-fork 图标 | 新增验证项 |
| AC-32 | (新增) | 路由 `/reasoning-graph` 在 MainLayout 内渲染 | 新增验证项 |
