import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  InputBase,
  Button,
  Breadcrumbs,
  Link,
  Collapse,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
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
  Plus,
  X,
} from 'lucide-react';

const drawerWidth = 280;
const propertiesPanelWidth = 320;

// 主题色
const theme = {
  background: '#0a0a0f',
  sidebar: '#0d0d14',
  sidebarBorder: '#1e1e2a',
  sidebarForeground: '#a1a1aa',
  sidebarAccent: '#8b5cf620',
  sidebarAccentForeground: '#e2e8f0',
  primary: '#8b5cf6',
  primaryForeground: '#ffffff',
  foreground: '#f4f4f5',
  mutedForeground: '#71717a',
  border: '#27273a',
  card: '#111118',
  secondary: '#1e1e2a',
};

const SearchBox = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 8,
  backgroundColor: theme.secondary,
  width: 240,
});

const AddButton = styled(Button)({
  borderRadius: 999,
  backgroundColor: theme.primary,
  color: theme.primaryForeground,
  textTransform: 'none',
  padding: '10px 16px',
  gap: 6,
  boxShadow: `0 4px 12px ${alpha(theme.primary, 0.4)}`,
  '&:hover': {
    backgroundColor: alpha(theme.primary, 0.8),
  },
});

const NavItem = styled(ListItemButton)<{ active?: boolean }>(({ active }) => ({
  borderRadius: 100,
  padding: '12px 16px',
  gap: 16,
  backgroundColor: active ? theme.sidebarAccent : 'transparent',
  '&:hover': {
    backgroundColor: active ? theme.sidebarAccent : alpha(theme.sidebarAccent, 0.5),
  },
}));

const DomainItem = styled(ListItemButton)<{ active?: boolean }>(({ active }) => ({
  borderRadius: 8,
  padding: '10px 12px',
  gap: 10,
  backgroundColor: active ? theme.sidebarAccent : 'transparent',
}));

interface NavItemData {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface DomainData {
  icon: React.ReactNode;
  label: string;
  color: string;
  active?: boolean;
}

export default function OntologyLayout() {
  const [domainsOpen, setDomainsOpen] = useState(true);
  const [selectedNav, setSelectedNav] = useState('Knowledge Graph');

  const domains: DomainData[] = [
    { icon: <Globe size={18} />, label: 'Enterprise', color: theme.sidebarAccentForeground, active: true },
    { icon: <Building2 size={18} />, label: 'Healthcare', color: '#22D3EE' },
    { icon: <Wallet size={18} />, label: 'Finance', color: '#F472B6' },
    { icon: <Cpu size={18} />, label: 'IoT & Sensors', color: '#4ADE80' },
  ];

  const ontologyNavItems: NavItemData[] = [
    { icon: <GitBranch size={24} />, label: 'Knowledge Graph', active: true },
    { icon: <Boxes size={24} />, label: 'Classes' },
    { icon: <LinkIcon size={24} />, label: 'Relations' },
    { icon: <ListIcon size={24} />, label: 'Properties' },
    { icon: <Database size={24} />, label: 'Instances' },
  ];

  const toolsNavItems: NavItemData[] = [
    { icon: <Search size={24} />, label: 'SPARQL Query' },
    { icon: <Upload size={24} />, label: 'Import/Export' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: theme.background }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: theme.sidebar,
            borderRight: `1px solid ${theme.sidebarBorder}`,
          },
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            borderBottom: `1px solid ${theme.sidebarBorder}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Share2 size={24} color={theme.sidebarForeground} />
            <Typography sx={{ color: theme.sidebarForeground, fontWeight: 600, fontSize: 18 }}>
              Ontology
            </Typography>
          </Box>
        </Box>

        {/* Sidebar Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
          {/* Domains Section */}
          <Box sx={{ pb: 1.5, borderBottom: `1px solid ${theme.sidebarBorder}` }}>
            <ListItemButton onClick={() => setDomainsOpen(!domainsOpen)} sx={{ py: 1, px: 0 }}>
              <ListItemText
                primary="DOMAINS"
                primaryTypographyProps={{
                  sx: { color: theme.sidebarForeground, fontSize: 14 },
                }}
              />
              {domainsOpen ? (
                <ChevronDown size={16} color={theme.sidebarForeground} />
              ) : (
                <ChevronRight size={16} color={theme.sidebarForeground} />
              )}
            </ListItemButton>
            <Collapse in={domainsOpen}>
              <List disablePadding>
                {domains.map((domain) => (
                  <DomainItem key={domain.label} active={domain.active}>
                    <ListItemIcon sx={{ minWidth: 'auto', color: domain.active ? theme.sidebarAccentForeground : domain.color }}>
                      {domain.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={domain.label}
                      primaryTypographyProps={{
                        sx: { color: domain.active ? theme.sidebarAccentForeground : theme.sidebarForeground, fontSize: 14 },
                      }}
                    />
                  </DomainItem>
                ))}
              </List>
            </Collapse>
          </Box>

          {/* Ontologies Section */}
          <Box sx={{ py: 2 }}>
            <Typography sx={{ color: theme.sidebarForeground, fontSize: 14, px: 2, py: 1 }}>
              ONTOLOGIES
            </Typography>
            <List disablePadding>
              {ontologyNavItems.map((item) => (
                <NavItem
                  key={item.label}
                  active={selectedNav === item.label}
                  onClick={() => setSelectedNav(item.label)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 'auto',
                      color: selectedNav === item.label ? theme.sidebarAccentForeground : theme.sidebarForeground,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        color: selectedNav === item.label ? theme.sidebarAccentForeground : theme.sidebarForeground,
                        fontSize: 16,
                      },
                    }}
                  />
                </NavItem>
              ))}
            </List>
          </Box>

          {/* Tools Section */}
          <Box sx={{ py: 2 }}>
            <Typography sx={{ color: theme.sidebarForeground, fontSize: 14, px: 2, py: 1 }}>
              TOOLS
            </Typography>
            <List disablePadding>
              {toolsNavItems.map((item) => (
                <NavItem key={item.label} onClick={() => setSelectedNav(item.label)}>
                  <ListItemIcon sx={{ minWidth: 'auto', color: theme.sidebarForeground }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: { color: theme.sidebarForeground, fontSize: 16 },
                    }}
                  />
                </NavItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* Sidebar Footer */}
        <Box sx={{ p: 3, borderTop: `1px solid ${theme.sidebarBorder}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: theme.sidebarForeground, fontSize: 14, fontWeight: 500 }}>
                Admin User
              </Typography>
              <Typography sx={{ color: theme.mutedForeground, fontSize: 12 }}>
                admin@ontology.io
              </Typography>
            </Box>
            <ChevronDown size={24} color={theme.sidebarForeground} />
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          {/* Breadcrumb */}
          <Breadcrumbs separator={<ChevronRight size={14} color={theme.mutedForeground} />}>
            <Link underline="none" sx={{ color: theme.mutedForeground, fontSize: 14 }}>
              Ontologies
            </Link>
            <Typography sx={{ color: theme.foreground, fontSize: 14, fontWeight: 500 }}>
              Knowledge Graph
            </Typography>
          </Breadcrumbs>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SearchBox>
              <Search size={16} color={theme.mutedForeground} />
              <InputBase
                placeholder="Search classes..."
                sx={{ color: theme.mutedForeground, fontSize: 14, flex: 1 }}
              />
            </SearchBox>
            <AddButton startIcon={<Plus size={16} />}>New Class</AddButton>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          {/* Graph View */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            {/* Search Panel */}
            <Box
              sx={{
                width: 280,
                borderRight: `1px solid ${theme.border}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.border}` }}>
                <Typography sx={{ color: theme.foreground, fontSize: 14, fontWeight: 600, mb: 1 }}>
                  Classes
                </Typography>
                <SearchBox sx={{ width: '100%' }}>
                  <Search size={16} color={theme.mutedForeground} />
                  <InputBase
                    placeholder="Filter classes..."
                    sx={{ color: theme.mutedForeground, fontSize: 14, flex: 1 }}
                  />
                </SearchBox>
              </Box>
              <Box sx={{ flex: 1, p: 1.5 }}>
                {['Person', 'Organization', 'Product', 'Event', 'Location'].map((cls) => (
                  <Box
                    key={cls}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: theme.secondary },
                    }}
                  >
                    <Typography sx={{ color: theme.foreground, fontSize: 14 }}>{cls}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Canvas Area */}
            <Box sx={{ flex: 1, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: theme.foreground, fontSize: 16, fontWeight: 600 }}>
                  Graph Canvas
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 'calc(100% - 40px)',
                  borderRadius: 1.5,
                  border: `1px solid ${theme.border}`,
                  bgcolor: theme.background,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: theme.mutedForeground }}>
                  Knowledge Graph Visualization
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Properties Panel */}
          <Box
            sx={{
              width: propertiesPanelWidth,
              borderLeft: `1px solid ${theme.border}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Panel Header */}
            <Box
              sx={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <Typography sx={{ color: theme.foreground, fontSize: 16, fontWeight: 600 }}>
                Class Properties
              </Typography>
              <IconButton size="small">
                <X size={20} color={theme.mutedForeground} />
              </IconButton>
            </Box>

            {/* Panel Content */}
            <Box sx={{ flex: 1, p: 2.5, overflow: 'auto' }}>
              {/* Selected Class */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ color: theme.mutedForeground, fontSize: 12, mb: 1 }}>
                  SELECTED CLASS
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: theme.card,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Typography sx={{ color: theme.foreground, fontSize: 14, fontWeight: 500 }}>
                    Person
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ bgcolor: theme.border, my: 2.5 }} />

              {/* Basic Properties */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ color: theme.mutedForeground, fontSize: 12, mb: 1 }}>
                  BASIC PROPERTIES
                </Typography>
                {['name', 'email', 'birthDate', 'address'].map((prop) => (
                  <Box
                    key={prop}
                    sx={{
                      p: 1,
                      borderRadius: 0.5,
                      '&:hover': { bgcolor: theme.secondary },
                    }}
                  >
                    <Typography sx={{ color: theme.foreground, fontSize: 14 }}>{prop}</Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ bgcolor: theme.border, my: 2.5 }} />

              {/* Relations */}
              <Box>
                <Typography sx={{ color: theme.mutedForeground, fontSize: 12, mb: 1 }}>
                  RELATIONS
                </Typography>
                {['worksAt → Organization', 'knows → Person', 'livesIn → Location'].map((rel) => (
                  <Box
                    key={rel}
                    sx={{
                      p: 1,
                      borderRadius: 0.5,
                      '&:hover': { bgcolor: theme.secondary },
                    }}
                  >
                    <Typography sx={{ color: theme.foreground, fontSize: 14 }}>{rel}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
