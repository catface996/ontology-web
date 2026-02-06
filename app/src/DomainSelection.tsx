import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Button,
  Avatar,
  Checkbox,
} from '@mui/material';
import { Share2, Search, Globe, Building2, Wallet, Cpu, ArrowRight, ChevronDown } from 'lucide-react';

interface Domain {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  stats: { classes: number; relations: number; instances: string };
}

const domains: Domain[] = [
  { id: 'enterprise', title: 'Enterprise', description: 'Corporate structures, business processes, and organizational hierarchies.', icon: <Globe size={24} />, color: '#8b5cf6', stats: { classes: 156, relations: 89, instances: '12.4K' } },
  { id: 'healthcare', title: 'Healthcare', description: 'Medical terminologies, patient records, and clinical workflows.', icon: <Building2 size={24} />, color: '#22D3EE', stats: { classes: 234, relations: 156, instances: '45.2K' } },
  { id: 'finance', title: 'Finance', description: 'Financial instruments, transactions, and regulatory compliance.', icon: <Wallet size={24} />, color: '#F472B6', stats: { classes: 189, relations: 112, instances: '28.7K' } },
  { id: 'iot', title: 'IoT & Sensors', description: 'Device telemetry, sensor networks, and real-time data streams.', icon: <Cpu size={24} />, color: '#4ADE80', stats: { classes: 98, relations: 67, instances: '156K' } },
];

export default function DomainSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(['enterprise']);
  const [filter, setFilter] = useState('all');

  const toggleDomain = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 6, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Share2 size={28} color="#8b5cf6" />
          <Typography variant="h5" fontWeight={700}>Ontology</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>A</Avatar>
          <Typography variant="body2" fontWeight={500}>Admin User</Typography>
          <ChevronDown size={16} />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, p: 6 }}>
        {/* Title */}
        <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>Select Your Domains</Typography>
          <Typography color="text.secondary">Choose one or more business domains to manage your knowledge graphs. You can switch between domains at any time.</Typography>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200 }}>
          <TextField
            size="small"
            placeholder="Search domains..."
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
            sx={{ width: 320 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['All', 'Recent', 'Favorites'].map((label) => (
              <Chip
                key={label}
                label={label}
                onClick={() => setFilter(label.toLowerCase())}
                color={filter === label.toLowerCase() ? 'primary' : 'default'}
                variant={filter === label.toLowerCase() ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>

        {/* Domain Cards */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {domains.map((domain) => {
            const isSelected = selected.includes(domain.id);
            return (
              <Card
                key={domain.id}
                onClick={() => toggleDomain(domain.id)}
                sx={{
                  width: 280,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  boxShadow: isSelected ? `0 8px 24px ${domain.color}30` : 1,
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: `${domain.color}20`, color: domain.color, width: 52, height: 52 }}>
                      {domain.icon}
                    </Avatar>
                    <Checkbox checked={isSelected} sx={{ '& .MuiSvgIcon-root': { color: isSelected ? 'primary.main' : 'text.disabled' } }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>{domain.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{domain.description}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box><Typography variant="caption" color="text.disabled">Classes</Typography><Typography variant="body2" fontWeight={500}>{domain.stats.classes}</Typography></Box>
                    <Box><Typography variant="caption" color="text.disabled">Relations</Typography><Typography variant="body2" fontWeight={500}>{domain.stats.relations}</Typography></Box>
                    <Box><Typography variant="caption" color="text.disabled">Instances</Typography><Typography variant="body2" fontWeight={500}>{domain.stats.instances}</Typography></Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Action Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography color="text.secondary">{selected.length} domain{selected.length !== 1 ? 's' : ''} selected</Typography>
          <Button variant="contained" size="large" endIcon={<ArrowRight size={18} />} onClick={() => navigate('/knowledge-graph')} disabled={selected.length === 0}>
            Enter Workspace
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
