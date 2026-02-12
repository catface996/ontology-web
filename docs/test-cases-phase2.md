# Phase 2 测试用例

> 项目：Ontology Hub
> 版本：Phase 2
> 编写人：QA Engineer
> 日期：2026-02-12
> 参考：设计稿 ontology.pen（节点 wWFLW, fLnJT, itPd2, DpILU, P9hBZ）
> 环境：Chrome, localhost:5173, 暗色主题

---

## 一、测试范围

| # | 页面 | 设计节点 | 预期路由 |
|---|------|---------|---------|
| 1 | Ontology Version History | wWFLW | `/version-history` |
| 2 | Ontology Validation Dashboard | fLnJT | `/validation` |
| 3 | Namespace Management | itPd2 | `/namespaces` |
| 4 | Class Logic Page | DpILU | `/classes/:classId/logic` |
| 5 | Relation Logic Page | P9hBZ | `/relations/:relationId/logic` |

---

## 二、测试优先级定义

| 优先级 | 含义 |
|--------|------|
| P0 | 核心功能，阻塞发布 |
| P1 | 重要功能，应在发布前修复 |
| P2 | 锦上添花，可延后 |

---

## 三、测试用例

### 3.1 Ontology Version History (`/version-history`)

#### 3.1.1 页面结构与布局

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| VH-001 | 页面路由正确渲染 | P0 | 访问 `/version-history` | 页面在 MainLayout（Sidebar + Content）中渲染 |
| VH-002 | 面包屑导航 | P0 | 查看页面顶部 | 显示 "Settings > Version History"，Settings 为灰色，Version History 为白色加粗 |
| VH-003 | 操作按钮展示 | P1 | 查看 Header 右侧 | 显示紫色 "Compare Versions" 按钮，带 git-compare 图标 |
| VH-004 | 双面板布局 | P0 | 查看内容区域 | 左侧 "Version List Panel"（420px 宽）+ 右侧 "Version Detail Panel"（自适应），中间有竖线分隔 |

#### 3.1.2 版本列表面板（左侧）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| VH-100 | 列表标题 | P0 | 查看左面板顶部 | 显示 "All Versions" 标题 + "12 versions" badge（圆角、灰色背景） |
| VH-101 | 版本项结构 | P0 | 查看任一版本项 | 每项包含：版本号标签、时间、描述文字、作者、变更统计 |
| VH-102 | 最新版本标识 | P0 | 查看第一个版本项 | 显示 "v2.4.0" 紫色标签 + "Latest" 绿色标签（#4ade80），时间 "2 hours ago" |
| VH-103 | 最新版本描述 | P1 | 查看第一个版本项 | 描述为 "Added disjoint axiom between Person and Organization classes" |
| VH-104 | 版本元信息 | P1 | 查看第一个版本项 | 显示 "Admin User · +3 / -1 changes" |
| VH-105 | 非最新版本样式 | P1 | 查看第二个版本项 (v2.3.0) | 版本标签背景为 $--secondary（非紫色），无 "Latest" 标签 |
| VH-106 | 版本列表数量 | P1 | 查看所有版本项 | Mock 数据至少 4 个版本项：v2.4.0, v2.3.0, v2.2.1, v2.1.0 |
| VH-107 | 选中版本高亮 | P1 | 查看当前选中版本 | 选中的版本项有不同背景色（$--secondary），区分于其他项 |
| VH-108 | 版本点击切换 | P0 | 点击不同版本项 | 右侧详情面板更新为对应版本的信息 |

#### 3.1.3 版本详情面板（右侧）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| VH-200 | 详情头部 | P0 | 查看右面板顶部 | 显示版本号标签 "v2.4.0"（紫色）+ "Version Details" 标题 |
| VH-201 | 操作按钮 | P1 | 查看详情头部右侧 | "Rollback" 按钮（undo-2 图标）+ "Export" 按钮（download 图标），均带边框 |
| VH-202 | 统计卡片行 | P0 | 查看统计区域 | 4 张卡片：Classes Modified (2), Relations Modified (1), Axioms Added (3, 绿色), Axioms Removed (1, 红色) |
| VH-203 | 统计值颜色 | P1 | 查看统计卡片值 | Axioms Added 数值为绿色（#4ade80），Axioms Removed 数值为红色（#f87171），其他为默认色 |
| VH-204 | 变更列表标题 | P0 | 查看变更区域 | "Changes" 标题 + 选项卡（All/其他两个 tab），默认选中 All |
| VH-205 | 变更差异列表 | P0 | 查看变更列表 | 至少 4 条变更：3 条增加（绿色 plus 图标，绿色背景 #131d16）+ 1 条删除（红色 minus 图标，红色背景 #1a1215） |
| VH-206 | 增加项样式 | P1 | 查看增加的变更项 | 绿色 plus 图标 + 绿色背景（#131d16）+ 圆角 8px |
| VH-207 | 删除项样式 | P1 | 查看删除的变更项 | 红色 minus 图标 + 红色背景（#1a1215）+ 圆角 8px |

---

### 3.2 Ontology Validation Dashboard (`/validation`)

#### 3.2.1 页面结构与布局

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| VD-001 | 页面路由正确渲染 | P0 | 访问 `/validation` | 页面在 MainLayout 中渲染 |
| VD-002 | 面包屑导航 | P0 | 查看页面顶部 | 显示 "Ontology > Validation Dashboard" |
| VD-003 | 操作按钮展示 | P0 | 查看 Header 右侧 | 显示紫色 "Run Validation" 按钮，带 play 图标 |

#### 3.2.2 统计卡片行

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| VD-100 | 统计卡片数量 | P0 | 查看统计行 | 4 张卡片横排，等宽分布 |
| VD-101 | Overall Health 卡片 | P0 | 查看第一张卡片 | 标签 "Overall Health" + heart-pulse 图标（绿色 #4ade80），值 "94%"（绿色），副标题 "Good condition" |
| VD-102 | Errors 卡片 | P0 | 查看第二张卡片 | 标签 "Errors" + circle-x 图标（红色 #f87171），值 "2"（红色），副标题 "Require immediate fix" |
| VD-103 | Warnings 卡片 | P0 | 查看第三张卡片 | 标签 "Warnings" + triangle-alert 图标（黄色 #fbbf24），值 "5"（黄色），副标题 "Should be reviewed" |
| VD-104 | Checks Passed 卡片 | P0 | 查看第四张卡片 | 标签 "Checks Passed" + circle-check 图标（绿色），值 "38"，副标题 "Out of 45 total checks" |
| VD-105 | 卡片圆角和背景 | P2 | 查看所有卡片 | 圆角 12px，背景色 $--secondary |

#### 3.2.3 验证结果表格

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| VD-200 | 结果区标题 | P0 | 查看验证结果区域 | "Validation Results" 标题 |
| VD-201 | 筛选选项卡 | P0 | 查看标题右侧 | 4 个选项卡：All（默认选中）、Errors、Warnings、Passed |
| VD-202 | 表头展示 | P0 | 查看表头 | 4 列：Severity (100px)、Check (自适应)、Target (200px)、Status (100px) |
| VD-203 | Error 行展示 | P0 | 查看第一行 | Severity: circle-x 红色图标 + "Error"（红色），Check: "Unsatisfiable Class Detected" + 描述，Target: "TempEmployee"（紫色），Status: "Failed" 红色 badge |
| VD-204 | 第二个 Error 行 | P1 | 查看第二行 | Check: "Cyclic Dependency"，Target: "Manager → Employee"，Status: "Failed" |
| VD-205 | Warning 行展示 | P0 | 查看第三行 | Severity: triangle-alert 黄色图标 + "Warning"（黄色 #fbbf24），Check: "Redundant Axiom"，Target: "Employee ⊑ Person"，Status: "Warning" 琥珀色 badge |
| VD-206 | 第二个 Warning 行 | P1 | 查看第四行 | Check: "Missing Label Annotation"，Target: "hasEmployee"，Status: "Warning" |
| VD-207 | Passed 行展示 | P0 | 查看第五行 | Severity: circle-check 绿色图标 + "Passed"（绿色 #4ade80），Check: "Ontology Consistency"，Target: "Global"，Status: "Passed" 绿色 badge |
| VD-208 | 第二个 Passed 行 | P1 | 查看第六行 | Check: "Property Domain/Range Validity"，Target: "All Properties"，Status: "Passed" |
| VD-209 | 行数量 | P1 | 查看所有行 | 至少 6 条验证结果（2 Error + 2 Warning + 2 Passed） |
| VD-210 | Error 行背景色 | P1 | 对比不同行 | Error 行背景色 #1a1215（红色调），与 Warning 行 #1c1710（黄色调）不同 |
| VD-211 | 选项卡切换 - Errors | P0 | 点击 "Errors" 选项卡 | 仅显示 Severity 为 Error 的行（2 行） |
| VD-212 | 选项卡切换 - Warnings | P0 | 点击 "Warnings" 选项卡 | 仅显示 Severity 为 Warning 的行（2 行） |
| VD-213 | 选项卡切换 - Passed | P0 | 点击 "Passed" 选项卡 | 仅显示 Severity 为 Passed 的行（2 行） |
| VD-214 | 选项卡切换回 All | P0 | 点击 "All" 选项卡 | 恢复显示全部 6 行 |
| VD-215 | Status badge 颜色区分 | P1 | 对比 Status 列 | Failed badge: 红色背景（#9F1D1D）白色文字；Warning badge: 琥珀背景（#33260D）琥珀文字（#FFB443）；Passed badge: 绿色背景（#15382A）绿色文字（#6EE7A0） |
| VD-216 | Target 链接样式 | P2 | 查看 Target 列 | Error/Warning 行的 Target 文字为紫色（$--primary），Passed 行为默认前景色 |

---

### 3.3 Namespace Management (`/namespaces`)

#### 3.3.1 页面结构与布局

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| NS-001 | 页面路由正确渲染 | P0 | 访问 `/namespaces` | 页面在 MainLayout 中渲染 |
| NS-002 | 面包屑导航 | P0 | 查看页面顶部 | 显示 "Settings > Namespace Management" |
| NS-003 | 操作按钮展示 | P0 | 查看 Header 右侧 | 显示紫色 "Add Namespace" 按钮，带 plus 图标 |

#### 3.3.2 命名空间表格

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| NS-100 | 表格标题区 | P0 | 查看表格顶部 | globe 图标（紫色）+ "Registered Namespaces" 标题 + "8 namespaces" badge |
| NS-101 | 搜索框展示 | P0 | 查看标题右侧 | 搜索框，placeholder "Search namespaces..."，宽度 260px，搜索图标 |
| NS-102 | 表头展示 | P0 | 查看表头 | 4 列：Prefix (120px)、URI (自适应)、Type (100px)、Actions (80px) |
| NS-103 | Standard 命名空间 - owl | P0 | 查看第一行 | Prefix: "owl:"（紫色加粗），URI: "http://www.w3.org/2002/07/owl#"，Type: "Standard" badge，Actions: lock 图标 |
| NS-104 | Standard 命名空间 - rdf | P1 | 查看第二行 | Prefix: "rdf:"，URI: "http://www.w3.org/1999/02/22-rdf-syntax-ns#"，Type: "Standard"，Actions: lock |
| NS-105 | Standard 命名空间 - rdfs | P1 | 查看第三行 | Prefix: "rdfs:"，URI: "http://www.w3.org/2000/01/rdf-schema#"，Type: "Standard"，Actions: lock |
| NS-106 | Custom 命名空间 - ent | P0 | 查看第四行 | Prefix: "ent:"，URI: "https://enterprise.ontology.io/schema#"，Type: "Custom" badge（蓝色文字 $--color-info），Actions: pencil + trash 图标 |
| NS-107 | Custom 命名空间 - health | P1 | 查看第五行 | Prefix: "health:"，URI: "https://health.ontology.io/vocab#"，Type: "Custom"，Actions: pencil + trash |
| NS-108 | Custom 命名空间 - geo | P1 | 查看第六行 | Prefix: "geo:"，URI: "https://geo.ontology.io/spatial#"，Type: "Custom"，Actions: pencil + trash |
| NS-109 | 行数量 | P1 | 查看所有行 | 至少 6 个命名空间（3 Standard + 3 Custom） |
| NS-110 | Standard 与 Custom 区分 | P0 | 对比 Standard 和 Custom 行 | Standard: "Standard" badge（灰色背景），lock 图标（只读）；Custom: "Custom" badge（蓝色文字），pencil + trash 图标（可编辑/删除） |
| NS-111 | Prefix 文字样式 | P1 | 查看所有行的 Prefix | 紫色（$--primary）加粗文字 |
| NS-112 | 搜索过滤功能 | P0 | 在搜索框输入 "owl" | 仅显示匹配 "owl" 的命名空间行 |
| NS-113 | 搜索清空恢复 | P1 | 清空搜索框 | 恢复显示全部命名空间 |
| NS-114 | 编辑按钮可点击 | P1 | 点击 Custom 行的 pencil 图标 | 触发编辑操作（打开编辑弹窗或进入编辑模式） |
| NS-115 | 删除按钮可点击 | P1 | 点击 Custom 行的 trash 图标 | 触发删除操作（显示确认弹窗或直接删除） |
| NS-116 | 删除按钮颜色 | P2 | 查看 trash 图标 | 红色（$--destructive） |

---

### 3.4 Class Logic Page (`/classes/:classId/logic`)

#### 3.4.1 页面结构与布局

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| CL-001 | 页面路由正确渲染 | P0 | 访问 `/classes/person/logic`（或类似路由） | 页面在 MainLayout 中渲染 |
| CL-002 | 面包屑导航 | P0 | 查看页面顶部 | 显示 "Classes > Person > Logic Axioms"，Classes 为灰色可点击，Person 和 Logic Axioms 为白色 |
| CL-003 | Header 操作按钮 | P0 | 查看 Header 右侧 | "Cancel" 按钮（边框样式）+ "Add Axiom" 紫色按钮（plus 图标） |
| CL-004 | 双列布局 | P0 | 查看内容区域 | 左列（自适应宽度）+ 右列（360px 固定宽度），间距 24px |

#### 3.4.2 NL Axiom Builder Card（左上）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| CL-100 | 卡片标题 | P0 | 查看卡片头部 | message-square-text 图标（紫色）+ "Natural Language Axiom Builder" 标题 + "AI Powered" 紫色 badge（sparkles 图标） |
| CL-101 | 说明文字 | P1 | 查看标题下方 | "Describe class-level logic axioms in natural language. AI will parse them into OWL formal expressions." |
| CL-102 | 输入区域 | P0 | 查看文本输入区 | 带边框的输入区域，显示示例文字（关于 Person 和 Organization 互斥的描述） |
| CL-103 | 字符计数 | P1 | 查看输入区底部左侧 | 显示 "142 characters" |
| CL-104 | 分析按钮 | P0 | 查看输入区底部右侧 | "Analyze & Create Axiom" 紫色按钮，sparkles 图标 |
| CL-105 | Quick Examples 区域 | P0 | 查看卡片底部 | 标签 "Quick Examples" + 4 个 chip：Disjoint Classes（equal-not 图标）、Equivalent Class（equal 图标）、Union / Intersection（combine 图标）、Closure Axiom（lock 图标） |
| CL-106 | 示例 Chip 样式 | P2 | 查看 chip | 圆角 100（pill 形），边框样式，紫色图标 + 白色文字 |

#### 3.4.3 Active Class Axioms Card（左下）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| CL-200 | 卡片标题 | P0 | 查看卡片头部 | list-checks 图标（紫色）+ "Active Class Axioms" + "3 axioms" badge |
| CL-201 | 公理项数量 | P0 | 查看列表 | 3 个公理项 |
| CL-202 | 公理 1 内容 | P0 | 查看第一个公理 | NL 描述（斜体）：关于 Person 和 Organization 互斥；表达式："Person ⊑ ¬Organization"（紫色） |
| CL-203 | 公理 2 内容 | P1 | 查看第二个公理 | NL 描述：关于 Person = Employee 或 Student；表达式："Person ≡ Employee ⊔ Student" |
| CL-204 | 公理 3 内容 | P1 | 查看第三个公理 | NL 描述：关于 Person 必须有 name；表达式："Person ⊑ ∃ name.xsd:string" |
| CL-205 | 公理项样式 | P1 | 查看任一公理项 | 圆角 10px，$--secondary 背景，含 badge（紫色半透明 #7C3AED20）、NL 描述（斜体灰色）、表达式（紫色）、操作图标 |
| CL-206 | 公理操作按钮 | P1 | 查看公理项底部 | 每项含编辑/删除等操作图标 |

#### 3.4.4 AI Interpretation Card（右上）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| CL-300 | 卡片标题 | P0 | 查看卡片头部 | brain 图标（紫色）+ "AI Interpretation" |
| CL-301 | 置信度分数 | P0 | 查看置信度行 | "Confidence Score" 标签 + "97%" 绿色值，绿色背景行 |
| CL-302 | 解析组件 | P0 | 查看 Parsed Components | 3 项：Axiom Type: Disjointness、Class A: Person、Class B: Organization |
| CL-303 | 解析项样式 | P2 | 查看解析列表 | 每项有紫色图标（target/box）+ 灰色标签 + 白色加粗值，$--secondary 背景 |
| CL-304 | 形式逻辑表达式 | P0 | 查看 Formal Logic Expression | 显示 "Person ⊑ ¬Organization"（紫色文字），带边框代码框 |
| CL-305 | OWL 表示 | P0 | 查看 OWL Representation | 显示 XML 格式的 `<owl:AllDisjointClasses>` 代码块 |

#### 3.4.5 Axiom Validation Card（右下）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| CL-400 | 卡片标题 | P0 | 查看卡片头部 | shield-check 图标（紫色）+ "Axiom Validation" |
| CL-401 | 验证检查数量 | P0 | 查看验证列表 | 4 项验证检查 |
| CL-402 | 验证项 1 | P0 | 查看第一项 | circle-check 绿色图标 + "Syntax Valid" + "Passed"（绿色） |
| CL-403 | 验证项 2 | P1 | 查看第二项 | "No Conflicts" + "Passed" |
| CL-404 | 验证项 3 | P1 | 查看第三项 | "Satisfiability Check" + "Passed" |
| CL-405 | 验证项 4 | P1 | 查看第四项 | "Hierarchy Consistent" + "Passed" |
| CL-406 | 信息提示框 | P0 | 查看列表下方 | 蓝色信息框：info 图标 + "All Checks Passed" + 描述文字，$--color-info 背景 |

---

### 3.5 Relation Logic Page (`/relations/:relationId/logic`)

#### 3.5.1 页面结构与布局

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| RL-001 | 页面路由正确渲染 | P0 | 访问 `/relations/hasEmployee/logic`（或类似路由） | 页面在 MainLayout 中渲染 |
| RL-002 | 面包屑导航 | P0 | 查看页面顶部 | 显示 "Relations > hasEmployee > Logic Rules" |
| RL-003 | Header 操作按钮 | P0 | 查看 Header 右侧 | "Cancel" 按钮（边框样式）+ "Add Rule" 紫色按钮（plus 图标） |
| RL-004 | 双列布局 | P0 | 查看内容区域 | 左列（自适应）+ 右列（360px），与 Class Logic Page 结构一致 |

#### 3.5.2 NL Rule Builder Card（左上）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| RL-100 | 卡片标题 | P0 | 查看卡片头部 | message-square-text 图标 + "Natural Language Rule Builder" + "AI Powered" badge |
| RL-101 | 说明文字 | P1 | 查看标题下方 | "Describe your logic rule in natural language, and AI will automatically parse and generate the corresponding formal logic expression." |
| RL-102 | 输入区域 | P0 | 查看文本输入区 | 显示示例文字（关于 employment 限制的描述） |
| RL-103 | 字符计数 | P1 | 查看输入区底部左侧 | 显示 "128 characters" |
| RL-104 | 分析按钮 | P0 | 查看输入区底部右侧 | "Analyze & Create Rule" 紫色按钮 |
| RL-105 | Quick Examples 区域 | P0 | 查看卡片底部 | 4 个 chip：Cardinality Constraint（hash 图标）、Inverse Relation（repeat 图标）、Transitivity（git-merge 图标）、Domain Validation（shield-check 图标） |

#### 3.5.3 Active Logic Rules Card（左下）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| RL-200 | 卡片标题 | P0 | 查看卡片头部 | list-checks 图标 + "Active Logic Rules" + "4 rules" badge |
| RL-201 | 规则项数量 | P0 | 查看列表 | 4 个规则项 |
| RL-202 | 规则 1 内容 | P0 | 查看第一个规则 | NL：关于每人最多在 3 个组织工作；表达式："Person ⊑ ≤3 hasEmployee.Organization" |
| RL-203 | 规则 2 内容 | P1 | 查看第二个规则 | NL：关于 employs/worksFor 逆关系；表达式："hasEmployee ≡ inverse(worksFor)" |
| RL-204 | 规则 3 内容 | P1 | 查看第三个规则 | NL：关于管理关系传递性；表达式："hasEmployee ∈ TransitiveProperty" |
| RL-205 | 规则 4 内容 | P1 | 查看第四个规则 | NL：关于必须有 start date；表达式："∃ startDate.xsd:date" |
| RL-206 | 规则项样式 | P1 | 查看任一规则项 | 与 Class Logic 的公理项样式一致：圆角 10px，$--secondary 背景，badge + NL 描述（斜体）+ 表达式（紫色） |

#### 3.5.4 AI Interpretation Card（右上）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| RL-300 | 卡片标题 | P0 | 查看卡片头部 | brain 图标 + "AI Interpretation" |
| RL-301 | 置信度分数 | P0 | 查看置信度行 | "Confidence Score" + "94%"（绿色）— 与 Class Logic 的 97% 不同 |
| RL-302 | 解析组件 | P0 | 查看 Parsed Components | 4 项：Subject: Person、Relation: hasEmployee、Object: Organization、Constraint: max 3 |
| RL-303 | 解析项数量差异 | P1 | 对比 Class Logic | Relation Logic 有 4 个解析项（多了 Constraint），Class Logic 有 3 个 |
| RL-304 | 形式逻辑表达式 | P0 | 查看表达式 | "Person ⊑ ≤3 hasEmployee.Organization" |
| RL-305 | OWL 表示 | P0 | 查看 OWL 代码 | 显示 `<owl:Restriction>` + `<owl:maxCardinality>3</owl:maxCardinality>` 代码块 |

#### 3.5.5 Rule Validation Card（右下）

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| RL-400 | 卡片标题 | P0 | 查看卡片头部 | shield-check 图标 + "Rule Validation" |
| RL-401 | 验证检查数量 | P0 | 查看验证列表 | 4 项验证检查 |
| RL-402 | 验证项 1 | P0 | 查看第一项 | "Syntax Valid" + "Passed"（绿色） |
| RL-403 | 验证项 2 | P1 | 查看第二项 | "No Conflicts" + "Passed" |
| RL-404 | 验证项 3 | P1 | 查看第三项 | "Ontology Consistent" + "Passed" — 与 Class Logic 的 "Satisfiability Check" 不同 |
| RL-405 | 验证项 4（Warning） | P0 | 查看第四项 | triangle-alert 黄色图标 + "Performance Impact" + "Warning"（黄色 $--color-warning-foreground）— 与 Class Logic 全 Passed 不同 |
| RL-406 | 警告提示框 | P0 | 查看列表下方 | 黄色警告框：triangle-alert 图标 + "Performance Notice" + "Cardinality constraints may slow queries on large datasets with >100k instances."，$--color-warning 背景 |
| RL-407 | 提示框与 Class Logic 差异 | P1 | 对比两个页面 | Class Logic 显示蓝色 info 框（All Checks Passed），Relation Logic 显示黄色 warning 框（Performance Notice） |

---

## 四、跨页面一致性测试

| 用例 | 名称 | 优先级 | 步骤 | 预期结果 |
|------|------|--------|------|----------|
| X-001 | Sidebar 一致性 | P0 | 在所有 5 个页面检查 Sidebar | 所有页面使用相同 Sidebar（280px），包含 DOMAINS、ONTOLOGIES、TOOLS 等区域 |
| X-002 | Header 高度一致 | P1 | 对比所有页面 Header | 所有页面 Header 高度 64px，底部 border |
| X-003 | 面包屑格式一致 | P1 | 对比所有页面面包屑 | 均使用 chevron-right 分隔符，父级灰色，当前页白色加粗 |
| X-004 | 主操作按钮样式 | P1 | 对比所有页面操作按钮 | 紫色（$--primary）背景，白色文字/图标，圆角 8px，shadow 效果 |
| X-005 | 卡片样式一致 | P1 | 对比 Validation 和 Logic 页面的卡片 | 均使用圆角 12px，border $--border，padding 24px |
| X-006 | Class Logic 与 Relation Logic 结构对称 | P0 | 并排对比两个页面 | 布局结构完全一致（左列 NL Builder + Active Items、右列 AI Interpretation + Validation），仅文案和数据不同 |

---

## 五、测试用例总结

| 页面 | 用例数 | P0 | P1 | P2 |
|------|--------|----|----|-----|
| Version History | 17 | 8 | 8 | 1 |
| Validation Dashboard | 20 | 11 | 7 | 2 |
| Namespace Management | 17 | 7 | 8 | 2 |
| Class Logic Page | 23 | 12 | 9 | 2 |
| Relation Logic Page | 21 | 11 | 8 | 2 |
| 跨页面 | 6 | 2 | 4 | 0 |
| **总计** | **104** | **51** | **44** | **9** |

---

## 六、验收标准追溯矩阵

> 产品经理提供 40 条验收标准，以下映射到对应测试用例。

### 页面 1：Ontology Version History（7 条）

| # | 验收标准 | 映射用例 | 覆盖 |
|---|---------|---------|------|
| 1 | `/version-history` 路由正确渲染 | VH-001 | ✅ |
| 2 | 左右双面板布局，左 420px 右 fill | VH-004 | ✅ |
| 3 | 左侧版本列表至少 4 条 mock 数据 | VH-106 | ✅ |
| 4 | 点击版本列表项切换右侧详情 | VH-108 | ✅ |
| 5 | 右侧统计数据 + diff 内容 | VH-202, VH-204, VH-205 | ✅ |
| 6 | "Compare Versions" 按钮可点击 | VH-003 | ✅ |
| 7 | 面包屑 Settings > Version History | VH-002 | ✅ |

### 页面 2：Ontology Validation Dashboard（7 条）

| # | 验收标准 | 映射用例 | 覆盖 |
|---|---------|---------|------|
| 1 | `/validation` 路由正确渲染 | VD-001 | ✅ |
| 2 | 4 统计卡片数值颜色正确 | VD-100~VD-104 | ✅ |
| 3 | 验证结果表格含表头和至少 6 行 | VD-202, VD-209 | ✅ |
| 4 | 行背景色按 Severity 区分 | VD-210 | ✅ |
| 5 | Tab 切换可交互 | VD-211~VD-214 | ✅ |
| 6 | "Run Validation" 按钮可点击 | VD-003 | ✅ |
| 7 | 面包屑 Ontology > Validation Dashboard | VD-002 | ✅ |

### 页面 3：Namespace Management（7 条）

| # | 验收标准 | 映射用例 | 覆盖 | 备注 |
|---|---------|---------|------|------|
| 1 | `/namespaces` 路由正确渲染 | NS-001 | ✅ | PM 路由为 `/namespaces`（已更新） |
| 2 | 表格含表头和至少 6 行 namespace | NS-102~NS-109 | ✅ | |
| 3 | 列宽 Prefix 120/URI fill/Type 100/Actions 80 | NS-102 | ✅ | |
| 4 | 搜索框 260px 在表格头部右侧 | NS-101 | ✅ | |
| 5 | Standard 行显示锁定图标（只读），Custom 行显示编辑/删除按钮 | NS-110, NS-114, NS-115, NS-116 | ✅ | PM 已确认按设计稿：Standard 只读，Custom 可编辑/删除 |
| 6 | "+ Add Namespace" 按钮可点击 | NS-003 | ✅ | |
| 7 | 面包屑 Settings > Namespace Management | NS-002 | ✅ | |

### 页面 4：Class Logic Page（9 条）

| # | 验收标准 | 映射用例 | 覆盖 |
|---|---------|---------|------|
| 1 | `/classes/:classId/logic` 路由正确渲染 | CL-001 | ✅ |
| 2 | 左右双列，左 fill 右 360px | CL-004 | ✅ |
| 3 | 左侧含 NL Axiom Builder + Active Axioms | CL-100, CL-200 | ✅ |
| 4 | 右侧含 AI Interpretation + Axiom Validation | CL-300, CL-400 | ✅ |
| 5 | 自然语言输入区域可输入文本 | CL-102 | ✅ |
| 6 | AI 解析显示置信度、解析结果、形式化表达 | CL-301~CL-305 | ✅ |
| 7 | Cancel 和 Add Axiom 按钮可点击 | CL-003 | ✅ |
| 8 | 面包屑三级（Classes > 类名 > Logic Axioms） | CL-002 | ✅ |
| 9 | Mock 数据渲染已有公理和 AI 解析 | CL-201~CL-204, CL-302 | ✅ |

### 页面 5：Relation Logic Page（10 条）

| # | 验收标准 | 映射用例 | 覆盖 |
|---|---------|---------|------|
| 1 | `/relations/:relationId/logic` 路由正确渲染 | RL-001 | ✅ |
| 2 | 左右双列，左 fill 右 360px | RL-004 | ✅ |
| 3 | 左侧含 NL Rule Builder + Active Rules | RL-100, RL-200 | ✅ |
| 4 | 右侧含 AI Interpretation + Rule Validation | RL-300, RL-400 | ✅ |
| 5 | 自然语言输入区域可输入文本 | RL-102 | ✅ |
| 6 | AI 解析显示置信度、解析结果、形式化表达 | RL-301~RL-305 | ✅ |
| 7 | **Rule Validation 底部为黄色警告（非蓝色）** | RL-406, RL-407 | ✅ |
| 8 | Cancel 和 Add Rule 按钮可点击 | RL-003 | ✅ |
| 9 | 面包屑三级（Relations > 关系名 > Logic Rules） | RL-002 | ✅ |
| 10 | Mock 数据渲染 | RL-201~RL-205, RL-302 | ✅ |

### 覆盖总结

| 页面 | 验收条数 | 全覆盖 | 需确认 |
|------|---------|--------|--------|
| Version History | 7 | ✅ 7/7 | — |
| Validation Dashboard | 7 | ✅ 7/7 | — |
| Namespace Management | 7 | ✅ 7/7 | — （PM 已确认 #5 按设计稿） |
| Class Logic Page | 9 | ✅ 9/9 | — |
| Relation Logic Page | 10 | ✅ 10/10 | — |
| **总计** | **40** | **40/40** | **无** |

> **已解决**：NS-AC-5 原始描述"每行有编辑/删除操作按钮"已由 PM 修正为"Standard 行显示锁定图标（只读），Custom 行显示编辑/删除按钮"（2026-02-12 确认）。
