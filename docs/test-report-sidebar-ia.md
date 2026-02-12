# Test Report — Sidebar IA Restructuring

**测试人**: QA Engineer
**测试日期**: 2026-02-12
**测试环境**: localhost:5173, Chrome DevTools MCP
**AC 总数**: 28 条
**测试用例**: 28 条

---

## 总结

| 指标 | 值 |
|------|-----|
| AC 通过 | **28/28** |
| AC 失败 | 0 |
| Bug 数量 | 0 |
| 通过率 | **100%** |

---

## AC 逐条结果

### 分组结构 (AC-01 ~ AC-05)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-01 | 5 组分组名称 | **PASS** | Snapshot: DOMAINS, ONTOLOGY, TOOLS, AI AGENT, DATA, ADMIN ✓ |
| AC-02 | ONTOLOGY 组: 5 项 | **PASS** | Knowledge Graph, Classes, Relations, Properties, Instances ✓ |
| AC-03 | TOOLS 组: 7 项 | **PASS** | Global Search, SPARQL Query, Reasoning, Reasoning Graph, Validation, Reports, Version History ✓ |
| AC-04 | DATA 组: 4 项 | **PASS** | Data Sources, Connectors, Field Mapping, Import/Export ✓ |
| AC-05 | ADMIN 组: 7 项 | **PASS** | User Management, Roles, Namespaces, System Settings, Change Log, API Keys, Audit Logs ✓ |

### AI AGENT 特殊结构 (AC-06 ~ AC-09)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-06 | AI AGENT 上半: Agent Chat, Task History | **PASS** | Snapshot 确认 ✓ |
| AC-07 | "Flow Agents" Divider 标签 | **PASS** | 截图确认 Divider + "Flow Agents" 文字，代码: Sidebar.tsx:244-246 ✓ |
| AC-08 | AI AGENT 下半: 7 个 Flow items | **PASS** | Bottleneck, What-if, Forward, Backward, Constraint, Diff, Pattern ✓ |
| AC-09 | 统一折叠/展开 | **PASS** | 点击 AI AGENT → 全部项目一起展开/收起 ✓ |

### 默认展开策略 (AC-10 ~ AC-12)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-10 | 默认展开 DOMAINS + ONTOLOGY + TOOLS | **PASS** | 首次加载截图: 三组展开 ✓，代码: domains:true, ontology:true, tools:true |
| AC-11 | 默认收起 AI AGENT + DATA + ADMIN | **PASS** | 首次加载: 三组仅显示标题 ✓，代码: aiAgent:false, data:false, admin:false |
| AC-12 | 展开/收起切换 | **PASS** | 点击测试所有组: AI AGENT, DATA, ADMIN 均可展开/收起 ✓ |

### 菜单项迁移 (AC-13 ~ AC-19)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-13 | Version History → TOOLS | **PASS** | TOOLS 组末尾包含 Version History ✓ |
| AC-14 | Validation → TOOLS | **PASS** | TOOLS 组包含 Validation ✓ |
| AC-15 | Import/Export → DATA | **PASS** | DATA 组包含 Import/Export ✓ |
| AC-16 | AGENT + AGENT FLOWS → AI AGENT | **PASS** | 无单独 AGENT/AGENT FLOWS, 统一为 AI AGENT ✓ |
| AC-17 | INTEGRATIONS → DATA | **PASS** | 无 INTEGRATIONS, 改为 DATA ✓ |
| AC-18 | SETTINGS → ADMIN | **PASS** | 无 SETTINGS, 改为 ADMIN ✓ |
| AC-19 | Notifications 从侧边栏移除 | **PASS** | ADMIN 组无 Notifications 项 ✓ |

### Header Bell 图标 (AC-20 ~ AC-22)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-20 | Bell 图标在 Header | **PASS** | uid=76_26 button 可见, 代码: MainLayout.tsx:20-22 Bell icon ✓ |
| AC-21 | Bell → /notifications | **PASS** | 点击 → URL 变为 /notifications, 显示 Notification Center ✓ |
| AC-22 | Bell 在所有页面可见 | **PASS** | MainLayout 共享组件, Outlet 外部渲染 ✓ |

### 导航功能 (AC-23 ~ AC-28)

| AC | 描述 | 结果 | 验证方式 |
|----|------|------|----------|
| AC-23 | ONTOLOGY 导航 | **PASS** | Knowledge Graph → /knowledge-graph ✓ |
| AC-24 | TOOLS 导航 | **PASS** | 代码审查: 所有路由正确 ✓ |
| AC-25 | AI AGENT 导航 | **PASS** | Agent Chat → /agent-chat; Flow items → window.open (新标签) ✓ |
| AC-26 | DATA 导航 | **PASS** | Data Sources → /data-sources ✓ |
| AC-27 | ADMIN 导航 | **PASS** | System Settings → /system-settings ✓ |
| AC-28 | DOMAINS 选择 | **PASS** | 代码审查: activeDomain 状态切换 ✓ |

---

## 测试执行记录

### 结构验证
1. 导航到 /knowledge-graph, 截图 + snapshot 获取完整侧边栏结构
2. 初始状态: DOMAINS/ONTOLOGY/TOOLS 展开, AI AGENT/DATA/ADMIN 收起
3. 依次点击展开 AI AGENT → 确认 Agent Chat, Task History, [Flow Agents divider], 7 个 Flow items
4. 点击展开 DATA → 确认 Data Sources, Connectors, Field Mapping, Import/Export
5. 点击展开 ADMIN → 确认 7 项, 无 Notifications

### Flow Agents Divider 验证
- 截图清晰显示: Task History 下方有水平 Divider + "Flow Agents" 文字标签
- 代码验证 Sidebar.tsx:244-246: `<Divider sx={{ my: 1, mx: 2 }}><Typography variant="caption" color="text.secondary">Flow Agents</Typography></Divider>`

### Header Bell 验证
- 点击 uid=76_26 (Bell button) → URL 变为 /notifications
- Notification Center 页面正确显示（含 filter pills + notification list）
- 代码验证 MainLayout.tsx:20: `<IconButton onClick={() => navigate('/notifications')}><Bell size={20} /></IconButton>`

### 导航验证
- Data Sources (DATA) → /data-sources ✓
- System Settings (ADMIN) → /system-settings ✓
- Knowledge Graph (ONTOLOGY) → /knowledge-graph ✓ (初始页面)
- Bell icon → /notifications ✓

### 代码变更审查

**Sidebar.tsx 变更:**
- SectionKey: 'ontologies'→'ontology', 新增 'aiAgent'/'data', 移除 'agentFlows'/'integrations'/'settings'
- ontologyItems: 移除 Version History, Validation
- toolsItems: 新增 Validation, Reports, Version History
- dataItems: Data Sources + Connectors + Field Mapping + Import/Export
- adminItems: 原 settingsItems 减去 Notifications (Bell)
- AI AGENT: 自定义渲染, 含 Divider + "Flow Agents" 标签
- 默认展开: domains/ontology/tools = true, aiAgent/data/admin = false

**MainLayout.tsx 变更:**
- 新增 Bell import, 绝对定位 top-right
- IconButton → navigate('/notifications')
