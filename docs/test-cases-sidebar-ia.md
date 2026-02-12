# Test Cases — Sidebar IA Restructuring

**AC 来源**: PM 验收标准 28 条 (7组→5组 + Header Notifications)
**实现文件**: Sidebar.tsx, MainLayout.tsx

---

## 分组结构验证 (AC-01 ~ AC-05)

### SIA-01: 5 组分组名称正确 [AC-01]
- **操作**: 查看侧边栏所有分组标题
- **预期**: DOMAINS, ONTOLOGY, TOOLS, AI AGENT, DATA, ADMIN

### SIA-02: ONTOLOGY 组内容 [AC-02]
- **操作**: 展开 ONTOLOGY 组
- **预期**: Knowledge Graph, Classes, Relations, Properties, Instances (5 项)

### SIA-03: TOOLS 组内容 [AC-03]
- **操作**: 展开 TOOLS 组
- **预期**: Global Search, SPARQL Query, Reasoning, Reasoning Graph, Validation, Reports, Version History (7 项)

### SIA-04: DATA 组内容 [AC-04]
- **操作**: 展开 DATA 组
- **预期**: Data Sources, Connectors, Field Mapping, Import/Export (4 项)

### SIA-05: ADMIN 组内容 [AC-05]
- **操作**: 展开 ADMIN 组
- **预期**: User Management, Roles, Namespaces, System Settings, Change Log, API Keys, Audit Logs (7 项)
- **注意**: Notifications 不在此组中

---

## AI AGENT 特殊结构 (AC-06 ~ AC-09)

### SIA-06: AI AGENT 组上半部分 [AC-06]
- **操作**: 展开 AI AGENT 组
- **预期**: Agent Chat, Task History

### SIA-07: AI AGENT "Flow Agents" 分隔线 [AC-07]
- **操作**: 查看 Agent Chat/Task History 下方
- **预期**: 水平 Divider + "Flow Agents" 文字标签

### SIA-08: AI AGENT 组下半部分 (Flow Agents) [AC-08]
- **操作**: 查看 "Flow Agents" 下方
- **预期**: Bottleneck, What-if, Forward, Backward, Constraint, Diff, Pattern (7 项)

### SIA-09: AI AGENT 所有项在同一折叠组 [AC-09]
- **操作**: 折叠/展开 AI AGENT
- **预期**: Agent Chat + Flow Agents 一起展开/收起

---

## 默认展开策略 (AC-10 ~ AC-12)

### SIA-10: 默认展开 DOMAINS + ONTOLOGY + TOOLS [AC-10]
- **操作**: 首次加载页面
- **预期**: DOMAINS, ONTOLOGY, TOOLS 三组默认展开

### SIA-11: 默认收起 AI AGENT + DATA + ADMIN [AC-11]
- **操作**: 首次加载页面
- **预期**: AI AGENT, DATA, ADMIN 三组默认收起

### SIA-12: 展开/收起可切换 [AC-12]
- **操作**: 点击各组标题
- **预期**: 展开↔收起 切换正常

---

## 菜单项迁移验证 (AC-13 ~ AC-19)

### SIA-13: Version History 迁移到 TOOLS [AC-13]
- **操作**: 展开 TOOLS，查找 Version History
- **预期**: Version History 在 TOOLS 组中（原在 ONTOLOGIES）

### SIA-14: Validation 迁移到 TOOLS [AC-14]
- **操作**: 展开 TOOLS，查找 Validation
- **预期**: Validation 在 TOOLS 组中（原在 ONTOLOGIES）

### SIA-15: Import/Export 迁移到 DATA [AC-15]
- **操作**: 展开 DATA，查找 Import/Export
- **预期**: Import/Export 在 DATA 组中（原在 TOOLS）

### SIA-16: AGENT + AGENT FLOWS 合并为 AI AGENT [AC-16]
- **操作**: 查看侧边栏
- **预期**: 无单独的 "AGENT" 或 "AGENT FLOWS" 组，统一为 "AI AGENT"

### SIA-17: INTEGRATIONS 改名为 DATA [AC-17]
- **操作**: 查看侧边栏
- **预期**: 无 "INTEGRATIONS" 组，改为 "DATA"

### SIA-18: SETTINGS 改名为 ADMIN [AC-18]
- **操作**: 查看侧边栏
- **预期**: 无 "SETTINGS" 组，改为 "ADMIN"

### SIA-19: Notifications 从侧边栏移除 [AC-19]
- **操作**: 展开 ADMIN，搜索所有组
- **预期**: 侧边栏中无 "Notifications" 项

---

## Header Bell 图标 (AC-20 ~ AC-22)

### SIA-20: Bell 图标存在于 Header [AC-20]
- **操作**: 查看页面 Header 右上角
- **预期**: Bell 图标按钮可见

### SIA-21: Bell 图标导航到 /notifications [AC-21]
- **操作**: 点击 Bell 图标
- **预期**: 导航到 /notifications, 显示 Notification Center

### SIA-22: Bell 图标在所有 MainLayout 页面可见 [AC-22]
- **操作**: 在不同页面检查 Header
- **预期**: 所有 MainLayout 子页面均有 Bell 图标

---

## 导航功能 (AC-23 ~ AC-28)

### SIA-23: ONTOLOGY 组导航正常 [AC-23]
- **操作**: 依次点击 ONTOLOGY 组各项
- **预期**: 正确导航到对应路由

### SIA-24: TOOLS 组导航正常 [AC-24]
- **操作**: 依次点击 TOOLS 组各项
- **预期**: 正确导航到对应路由

### SIA-25: AI AGENT 组导航正常 [AC-25]
- **操作**: 点击 Agent Chat, Task History
- **预期**: 正确导航；Flow Agents 在新标签页打开

### SIA-26: DATA 组导航正常 [AC-26]
- **操作**: 依次点击 DATA 组各项
- **预期**: Data Sources → /data-sources, Connectors → /connectors, etc.

### SIA-27: ADMIN 组导航正常 [AC-27]
- **操作**: 依次点击 ADMIN 组各项
- **预期**: 正确导航到对应路由

### SIA-28: DOMAINS 选择正常 [AC-28]
- **操作**: 点击不同 Domain
- **预期**: 选中态切换正常

---

## 测试用例汇总

| AC 范围 | 测试用例 | 类型 |
|---------|----------|------|
| AC-01~05 | SIA-01~05 | 结构 |
| AC-06~09 | SIA-06~09 | 结构 |
| AC-10~12 | SIA-10~12 | 交互 |
| AC-13~19 | SIA-13~19 | 迁移 |
| AC-20~22 | SIA-20~22 | 功能 |
| AC-23~28 | SIA-23~28 | 导航 |

**总计: 28 条测试用例覆盖 28 条 AC**
