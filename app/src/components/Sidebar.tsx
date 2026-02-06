import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Share2,
  ChevronDown,
  ChevronRight,
  Globe,
  Building2,
  Wallet,
  Cpu,
  GitBranch,
  Boxes,
  Link as LinkIcon,
  List as ListIcon,
  Database,
  Search,
  Upload,
  MessageCircle,
  ListChecks,
  Plug,
  GitMerge,
  Brain,
  Users,
  Shield,
  Key,
  Activity,
} from 'lucide-react';

const drawerWidth = 280;

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface Domain {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const domains: Domain[] = [
  { icon: <Globe size={18} />, label: 'Enterprise', color: 'inherit' },
  { icon: <Building2 size={18} />, label: 'Healthcare', color: '#22D3EE' },
  { icon: <Wallet size={18} />, label: 'Finance', color: '#F472B6' },
  { icon: <Cpu size={18} />, label: 'IoT & Sensors', color: '#4ADE80' },
];

const ontologyItems: NavItem[] = [
  { icon: <GitBranch size={20} />, label: 'Knowledge Graph', path: '/knowledge-graph' },
  { icon: <Boxes size={20} />, label: 'Classes', path: '/classes' },
  { icon: <LinkIcon size={20} />, label: 'Relations', path: '/relations' },
  { icon: <ListIcon size={20} />, label: 'Properties', path: '/properties' },
  { icon: <Database size={20} />, label: 'Instances', path: '/instances' },
];

const toolsItems: NavItem[] = [
  { icon: <Search size={20} />, label: 'SPARQL Query', path: '/sparql-query' },
  { icon: <Brain size={20} />, label: 'Reasoning', path: '/reasoning' },
  { icon: <Upload size={20} />, label: 'Import/Export', path: '/import-export' },
];

const agentItems: NavItem[] = [
  { icon: <MessageCircle size={20} />, label: 'Agent Chat', path: '/agent-chat' },
  { icon: <ListChecks size={20} />, label: 'Task History', path: '/task-history' },
];

const integrationItems: NavItem[] = [
  { icon: <Database size={20} />, label: 'Data Sources', path: '/data-sources' },
  { icon: <Plug size={20} />, label: 'Connectors', path: '/connectors' },
  { icon: <GitMerge size={20} />, label: 'Field Mapping', path: '/field-mapping' },
];

const settingsItems: NavItem[] = [
  { icon: <Users size={20} />, label: 'User Management', path: '/user-management' },
  { icon: <Shield size={20} />, label: 'Roles & Permissions', path: '/roles-permissions' },
  { icon: <Key size={20} />, label: 'API Keys', path: '/api-keys' },
  { icon: <Activity size={20} />, label: 'Audit Logs', path: '/audit-logs' },
];

type SectionKey = 'domains' | 'ontologies' | 'tools' | 'agent' | 'integrations' | 'settings';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDomain, setActiveDomain] = useState('Enterprise');
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    domains: true,
    ontologies: true,
    tools: true,
    agent: true,
    integrations: true,
    settings: true,
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSelected = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavItems = (items: NavItem[]) => (
    <List disablePadding>
      {items.map((item) => (
        <ListItemButton
          key={item.label}
          selected={isSelected(item.path)}
          onClick={() => navigate(item.path)}
          sx={{ borderRadius: 100 }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  const renderSection = (title: string, key: SectionKey, items: NavItem[]) => (
    <Box>
      <ListItemButton onClick={() => toggleSection(key)} sx={{ py: 1 }}>
        <ListItemText
          primary={title}
          primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
        />
        {openSections[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </ListItemButton>
      <Collapse in={openSections[key]}>{renderNavItems(items)}</Collapse>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{ width: drawerWidth, flexShrink: 0 }}
      PaperProps={{ sx: { width: drawerWidth } }}
    >
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="center" gap={1}>
        <Share2 size={24} />
        <Typography variant="h6">Ontology</Typography>
      </Box>
      <Divider />

      {/* Content */}
      <Box flex={1} overflow="auto" px={1}>
        {/* Domains */}
        <Box py={1}>
          <ListItemButton onClick={() => toggleSection('domains')} sx={{ py: 1 }}>
            <ListItemText
              primary="DOMAINS"
              primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            />
            {openSections.domains ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </ListItemButton>
          <Collapse in={openSections.domains}>
            <List disablePadding>
              {domains.map((d) => (
                <ListItemButton
                  key={d.label}
                  selected={activeDomain === d.label}
                  onClick={() => setActiveDomain(d.label)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ color: activeDomain === d.label ? 'inherit' : d.color }}>
                    {d.icon}
                  </ListItemIcon>
                  <ListItemText primary={d.label} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>
        <Divider />

        {renderSection('ONTOLOGIES', 'ontologies', ontologyItems)}
        {renderSection('TOOLS', 'tools', toolsItems)}
        {renderSection('AGENT', 'agent', agentItems)}
        {renderSection('INTEGRATIONS', 'integrations', integrationItems)}
        {renderSection('SETTINGS', 'settings', settingsItems)}
      </Box>

      {/* Footer */}
      <Divider />
      <Box p={2} display="flex" alignItems="center" gap={1}>
        <Box flex={1}>
          <Typography variant="body2">Admin User</Typography>
          <Typography variant="caption" color="text.disabled">
            admin@ontology.io
          </Typography>
        </Box>
        <ChevronDown size={20} />
      </Box>
    </Drawer>
  );
}
