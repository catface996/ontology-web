import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Divider, Flex } from 'antd';
import {
  Share2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Check,
  Globe,
  Plug,
  GitFork,
  GitMerge,
  Boxes,
  ArrowLeftRight,
  List,
  Database,
  Search,
  Upload,
  MessageCircle,
  ListChecks,
  Users,
  Shield,
  Key,
  Activity,
  FileText,
  Brain,
  FlaskConical,
  CircleCheck,
  History,
  Settings,
  ScrollText,
  LayoutDashboard,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  GitCompare,
  ScanLine,
  Building2,
} from 'lucide-react';
import { useThemeColor, THEME_COLORS } from '../contexts/ThemeColorContext';
import { useCurrentOntology } from '../contexts/OntologyContext';

const drawerWidth = 280;

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  iconColor?: string;
  openInNewTab?: boolean;
}

const ontologyItems: NavItem[] = [
  { icon: <GitFork size={20} />, label: 'Topology', path: '/topology', iconColor: '#a78bfa' },
  { icon: <Boxes size={20} />, label: 'Classes', path: '/classes', iconColor: '#818cf8' },
  { icon: <ArrowLeftRight size={20} />, label: 'Relations', path: '/relations', iconColor: '#22d3ee' },
  { icon: <List size={20} />, label: 'Properties', path: '/properties', iconColor: '#f59e0b' },
  { icon: <Database size={20} />, label: 'Instances', path: '/instances', iconColor: '#4ade80' },
];

const toolsItems: NavItem[] = [
  { icon: <Search size={20} />, label: 'Global Search', path: '/search', iconColor: '#60a5fa' },
  { icon: <Search size={20} />, label: 'SPARQL Query', path: '/sparql-query', iconColor: '#c4b5fd' },
  { icon: <Brain size={20} />, label: 'Reasoning', path: '/reasoning', iconColor: '#f472b6' },
  { icon: <GitFork size={20} />, label: 'Reasoning Graph', path: '/reasoning-graph', iconColor: '#a78bfa' },
  { icon: <CircleCheck size={20} />, label: 'Validation', path: '/validation', iconColor: '#4ade80' },
  { icon: <FileText size={20} />, label: 'Reports', path: '/report-management', iconColor: '#fbbf24' },
  { icon: <History size={20} />, label: 'Version History', path: '/version-history', iconColor: '#94a3b8' },
];

const aiAgentItems: NavItem[] = [
  { icon: <MessageCircle size={20} />, label: 'Agent Chat', path: '/agent-chat', iconColor: '#22d3ee' },
  { icon: <ListChecks size={20} />, label: 'Task History', path: '/task-history', iconColor: '#94a3b8' },
];

const aiAgentFlowItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Bottleneck', path: '/agent-chat/bottleneck', iconColor: 'var(--primary-color)', openInNewTab: true },
  { icon: <FlaskConical size={20} />, label: 'What-if', path: '/agent-chat/what-if', iconColor: '#f59e0b', openInNewTab: true },
  { icon: <ArrowRight size={20} />, label: 'Forward', path: '/agent-chat/forward', iconColor: '#06b6d4', openInNewTab: true },
  { icon: <ArrowLeft size={20} />, label: 'Backward', path: '/agent-chat/backward', iconColor: '#a855f7', openInNewTab: true },
  { icon: <ShieldCheck size={20} />, label: 'Constraint', path: '/agent-chat/constraint', iconColor: '#6366f1', openInNewTab: true },
  { icon: <GitCompare size={20} />, label: 'Diff', path: '/agent-chat/diff', iconColor: '#10b981', openInNewTab: true },
  { icon: <ScanLine size={20} />, label: 'Pattern', path: '/agent-chat/pattern', iconColor: '#ec4899', openInNewTab: true },
];

const dataItems: NavItem[] = [
  { icon: <Database size={20} />, label: 'Data Sources', path: '/data-sources', iconColor: '#60a5fa' },
  { icon: <Plug size={20} />, label: 'Connectors', path: '/connectors', iconColor: '#4ade80' },
  { icon: <GitMerge size={20} />, label: 'Field Mapping', path: '/field-mapping-list', iconColor: '#c4b5fd' },
  { icon: <Upload size={20} />, label: 'Import/Export', path: '/import-export', iconColor: '#fbbf24' },
];

const adminItems: NavItem[] = [
  { icon: <Users size={20} />, label: 'User Management', path: '/user-management', iconColor: '#60a5fa' },
  { icon: <Shield size={20} />, label: 'Roles', path: '/roles-permissions', iconColor: '#f59e0b' },
  { icon: <Globe size={20} />, label: 'Namespaces', path: '/namespaces', iconColor: '#22d3ee' },
  { icon: <Settings size={20} />, label: 'System Settings', path: '/system-settings', iconColor: '#94a3b8' },
  { icon: <ScrollText size={20} />, label: 'Change Log', path: '/change-log', iconColor: '#a78bfa' },
  { icon: <Key size={20} />, label: 'API Keys', path: '/api-keys', iconColor: '#fbbf24' },
  { icon: <Activity size={20} />, label: 'Audit Logs', path: '/audit-logs', iconColor: '#4ade80' },
];

type SectionKey = 'ontology' | 'tools' | 'aiAgent' | 'data' | 'admin';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor, setPrimaryColor } = useThemeColor();
  const { currentOntology } = useCurrentOntology();
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    ontology: true,
    tools: true,
    aiAgent: false,
    data: false,
    admin: false,
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSelected = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavItems = (items: NavItem[]) => (
    <div style={{ padding: '0 4px' }}>
      {items.map((item) => (
        <Flex
          key={item.label}
          align="center"
          gap={12}
          onClick={() => item.openInNewTab ? window.open(item.path, '_blank') : navigate(item.path)}
          style={{
            padding: '8px 16px',
            borderRadius: 100,
            cursor: 'pointer',
            background: isSelected(item.path) ? 'rgba(var(--primary-rgb), 0.12)' : 'transparent',
            color: isSelected(item.path) ? '#f4f4f5' : '#a1a1aa',
            marginBottom: 2,
          }}
        >
          <span style={{ fontSize: 18, display: 'flex', alignItems: 'center', color: item.iconColor || 'inherit', filter: isSelected(item.path) ? 'brightness(1.4) drop-shadow(0 0 4px currentColor)' : 'none' }}>
            {item.icon}
          </span>
          <Typography.Text style={{ fontSize: 14, color: 'inherit' }}>{item.label}</Typography.Text>
        </Flex>
      ))}
    </div>
  );

  const renderSection = (title: string, key: SectionKey, items: NavItem[]) => (
    <div>
      <Flex
        align="center"
        onClick={() => toggleSection(key)}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        <Typography.Text style={{ flex: 1, fontSize: 12, color: '#a1a1aa', letterSpacing: 0.5 }}>
          {title}
        </Typography.Text>
        {openSections[key] ? <ChevronDown size={14} color="#a1a1aa" /> : <ChevronRight size={14} color="#a1a1aa" />}
      </Flex>
      {openSections[key] && renderNavItems(items)}
    </div>
  );

  return (
    <Layout.Sider
      width={drawerWidth}
      style={{
        background: '#0d0d14',
        borderRight: '1px solid #1e1e2a',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Flex align="center" justify="center" gap={8} style={{ height: 64, flexShrink: 0, borderBottom: '1px solid #1e1e2a' }}>
        <Share2 size={28} color="#e4e4e7" />
        <Typography.Text style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e4e4e7' }}>Ontology</Typography.Text>
      </Flex>

      {/* Ontology Selector */}
      {currentOntology && currentOntology.name && (
        <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid #1e1e2a', flexShrink: 0 }}>
          <Typography.Text style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
            CURRENT ONTOLOGY
          </Typography.Text>
          <Flex
            align="center"
            justify="space-between"
            onClick={() => navigate('/select-ontology')}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
            }}
          >
            <Flex align="center" gap={10}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8b5cf620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} color="var(--primary-color)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography.Text style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>
                  {currentOntology.name}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 10, color: '#a1a1aa' }}>
                  {[currentOntology.version, currentOntology.status].filter(Boolean).join(' · ')}
                </Typography.Text>
              </div>
            </Flex>
            <ChevronsUpDown size={16} color="#a1a1aa" />
          </Flex>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 8px' }}>
        {renderSection('ONTOLOGY', 'ontology', ontologyItems)}
        {renderSection('TOOLS', 'tools', toolsItems)}

        {/* AI AGENT — custom render with internal divider */}
        <div>
          <Flex
            align="center"
            onClick={() => toggleSection('aiAgent')}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            <Typography.Text style={{ flex: 1, fontSize: 12, color: '#a1a1aa', letterSpacing: 0.5 }}>
              AI AGENT
            </Typography.Text>
            {openSections.aiAgent ? <ChevronDown size={14} color="#a1a1aa" /> : <ChevronRight size={14} color="#a1a1aa" />}
          </Flex>
          {openSections.aiAgent && (
            <>
              {renderNavItems(aiAgentItems)}
              <Divider style={{ margin: '8px 16px' }}>
                <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>Flow Agents</Typography.Text>
              </Divider>
              {renderNavItems(aiAgentFlowItems)}
            </>
          )}
        </div>

        {renderSection('DATA', 'data', dataItems)}
        {renderSection('ADMIN', 'admin', adminItems)}
      </div>

      {/* Theme Color Picker */}
      <Divider style={{ margin: 0 }} />
      <Flex wrap="wrap" gap={6} justify="center" style={{ padding: '12px 16px', flexShrink: 0 }}>
        {THEME_COLORS.map((c) => (
          <div
            key={c}
            onClick={() => setPrimaryColor(c)}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: c,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: primaryColor === c ? '2px solid #fff' : 'none',
              outlineOffset: 2,
            }}
          >
            {primaryColor === c && <Check size={10} color="#fff" />}
          </div>
        ))}
      </Flex>
      </div>
    </Layout.Sider>
  );
}
