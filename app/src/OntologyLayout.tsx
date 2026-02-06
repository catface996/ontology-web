import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  TextField,
  Button,
  Breadcrumbs,
  Link,
  Collapse,
  InputAdornment,
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
  Plus,
  X,
} from 'lucide-react';

const drawerWidth = 280;
const propertiesPanelWidth = 320;

interface NavItemData {
  icon: React.ReactNode;
  label: string;
}

interface DomainData {
  icon: React.ReactNode;
  label: string;
  color: string;
  active?: boolean;
}

export default function OntologyLayout() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    domains: true,
    ontologies: true,
    tools: true,
  });
  const [selectedNav, setSelectedNav] = useState('Knowledge Graph');

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const domains: DomainData[] = [
    { icon: <Globe size={18} />, label: 'Enterprise', color: 'text.primary', active: true },
    { icon: <Building2 size={18} />, label: 'Healthcare', color: '#22D3EE' },
    { icon: <Wallet size={18} />, label: 'Finance', color: '#F472B6' },
    { icon: <Cpu size={18} />, label: 'IoT & Sensors', color: '#4ADE80' },
  ];

  const ontologyNavItems: NavItemData[] = [
    { icon: <GitBranch size={20} />, label: 'Knowledge Graph' },
    { icon: <Boxes size={20} />, label: 'Classes' },
    { icon: <LinkIcon size={20} />, label: 'Relations' },
    { icon: <ListIcon size={20} />, label: 'Properties' },
    { icon: <Database size={20} />, label: 'Instances' },
  ];

  const toolsNavItems: NavItemData[] = [
    { icon: <Search size={20} />, label: 'SPARQL Query' },
    { icon: <Upload size={20} />, label: 'Import/Export' },
  ];

  const renderSection = (title: string, key: string, items: NavItemData[]) => (
    <Box sx={{ py: 1 }}>
      <ListItemButton onClick={() => toggleSection(key)} sx={{ px: 1 }}>
        <ListItemText primary={title} primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }} />
        {openSections[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </ListItemButton>
      <Collapse in={openSections[key]}>
        <List disablePadding>
          {items.map((item) => (
            <ListItemButton
              key={item.label}
              selected={selectedNav === item.label}
              onClick={() => setSelectedNav(item.label)}
              sx={{ gap: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 'auto' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer variant="permanent" sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth } }}>
        {/* Header */}
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Share2 size={24} />
          <Typography variant="h6">Ontology</Typography>
        </Box>
        <Divider />

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
          {/* Domains */}
          <Box sx={{ py: 1 }}>
            <ListItemButton onClick={() => toggleSection('domains')} sx={{ px: 1 }}>
              <ListItemText primary="DOMAINS" primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }} />
              {openSections.domains ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </ListItemButton>
            <Collapse in={openSections.domains}>
              <List disablePadding>
                {domains.map((domain) => (
                  <ListItemButton key={domain.label} selected={domain.active} sx={{ gap: 1.5, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', color: domain.active ? 'text.primary' : domain.color }}>
                      {domain.icon}
                    </ListItemIcon>
                    <ListItemText primary={domain.label} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
          <Divider />

          {renderSection('ONTOLOGIES', 'ontologies', ontologyNavItems)}
          {renderSection('TOOLS', 'tools', toolsNavItems)}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2">Admin User</Typography>
            <Typography variant="caption" color="text.disabled">admin@ontology.io</Typography>
          </Box>
          <ChevronDown size={20} />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Breadcrumbs separator={<ChevronRight size={14} />}>
            <Link underline="hover" color="text.secondary" sx={{ cursor: 'pointer' }}>Ontologies</Link>
            <Typography color="text.primary">{selectedNav}</Typography>
          </Breadcrumbs>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search classes..."
              InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
              sx={{ width: 240 }}
            />
            <Button variant="contained" startIcon={<Plus size={16} />}>New Class</Button>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          {/* Search Panel */}
          <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>Classes</Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="Filter classes..."
                InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
              />
            </Box>
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {['Person', 'Organization', 'Product', 'Event', 'Location'].map((cls) => (
                <ListItemButton key={cls}><ListItemText primary={cls} /></ListItemButton>
              ))}
            </List>
          </Box>

          {/* Canvas */}
          <Box sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" gutterBottom>Graph Canvas</Typography>
            <Box sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.disabled">Knowledge Graph Visualization</Typography>
            </Box>
          </Box>

          {/* Properties Panel */}
          <Box sx={{ width: propertiesPanelWidth, borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1">Class Properties</Typography>
              <IconButton size="small"><X size={20} /></IconButton>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Typography variant="caption" color="text.secondary">SELECTED CLASS</Typography>
              <Box sx={{ p: 1.5, mt: 1, mb: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2">Person</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">BASIC PROPERTIES</Typography>
              <List dense disablePadding>
                {['name', 'email', 'birthDate', 'address'].map((prop) => (
                  <ListItemButton key={prop}><ListItemText primary={prop} /></ListItemButton>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">RELATIONS</Typography>
              <List dense disablePadding>
                {['worksAt → Organization', 'knows → Person', 'livesIn → Location'].map((rel) => (
                  <ListItemButton key={rel}><ListItemText primary={rel} /></ListItemButton>
                ))}
              </List>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
