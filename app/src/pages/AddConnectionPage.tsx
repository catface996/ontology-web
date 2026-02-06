import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, Button,
} from '@mui/material';
import {
  ChevronRight, Database, Leaf, Zap, Cloud, Boxes,
  Users, Hash, Plug, Save,
} from 'lucide-react';

/* ── Types ── */
interface SourceType {
  key: string;
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  brandColor: string;
  defaultPort: string;
}

/* ── Data ── */
const sourceTypes: SourceType[] = [
  { key: 'postgresql', name: 'PostgreSQL',  icon: Database, brandColor: '#336791', defaultPort: '5432' },
  { key: 'mysql',      name: 'MySQL',       icon: Database, brandColor: '#4479A1', defaultPort: '3306' },
  { key: 'mongodb',    name: 'MongoDB',     icon: Leaf,     brandColor: '#47A248', defaultPort: '27017' },
  { key: 'redis',      name: 'Redis',       icon: Zap,      brandColor: '#DC382D', defaultPort: '6379' },
  { key: 'salesforce', name: 'Salesforce',  icon: Cloud,    brandColor: '#00A1E0', defaultPort: '' },
  { key: 'sap',        name: 'SAP',         icon: Boxes,    brandColor: '#0070F2', defaultPort: '' },
  { key: 'workday',    name: 'Workday',     icon: Users,    brandColor: '#F68D2E', defaultPort: '' },
  { key: 'slack',      name: 'Slack',       icon: Hash,     brandColor: '#4A154B', defaultPort: '' },
];

/* ── Page ── */
export default function AddConnectionPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('postgresql');
  const [form, setForm] = useState({
    name: '',
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
  });

  const current = sourceTypes.find((s) => s.key === selected)!;

  const handleSelect = (key: string) => {
    const src = sourceTypes.find((s) => s.key === key)!;
    setSelected(key);
    setForm((prev) => ({ ...prev, port: src.defaultPort }));
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <>
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">
            Integrations
          </Link>
          <Link
            underline="hover"
            color="text.secondary"
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/data-sources'); }}
          >
            Data Sources
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Add Connection
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" flexDirection="column" gap={3} overflow="auto">
        {/* Choose Connection Type */}
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={1.25}>
            <Database size={20} />
            <Typography fontSize={16} fontWeight={600}>
              Choose Connection Type
            </Typography>
          </Box>
          <Typography fontSize={13} color="text.secondary">
            Select the type of data source you want to connect
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5}>
            {sourceTypes.map((src) => {
              const Icon = src.icon;
              const active = selected === src.key;
              return (
                <Box
                  key={src.key}
                  onClick={() => handleSelect(src.key)}
                  sx={{
                    width: 130,
                    height: 88,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                    border: active ? 2 : 1,
                    borderColor: active ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: active ? 'primary.main' : 'text.secondary' },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      bgcolor: `${src.brandColor}20`,
                    }}
                  >
                    <Icon size={18} color={src.brandColor} />
                  </Box>
                  <Typography fontSize={12} fontWeight={500}>
                    {src.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Connection Details */}
        <Box
          sx={{
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography fontSize={15} fontWeight={600}>
              Connection Details
            </Typography>
            <Typography fontSize={13} color="text.secondary" mt={0.5}>
              Configure the connection settings for {current.name}
            </Typography>
          </Box>

          {/* Form body */}
          <Box sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Connection Name */}
            <TextField
              label="Connection Name"
              size="small"
              fullWidth
              placeholder={`My ${current.name} Database`}
              value={form.name}
              onChange={handleChange('name')}
            />

            {/* Host + Port */}
            <Box display="flex" gap={2}>
              <TextField
                label="Host"
                size="small"
                fullWidth
                placeholder="localhost"
                value={form.host}
                onChange={handleChange('host')}
              />
              <TextField
                label="Port"
                size="small"
                sx={{ width: 160, flexShrink: 0 }}
                value={form.port}
                onChange={handleChange('port')}
              />
            </Box>

            {/* Database Name */}
            <TextField
              label="Database Name"
              size="small"
              fullWidth
              placeholder="ontology_db"
              value={form.database}
              onChange={handleChange('database')}
            />

            {/* Username + Password */}
            <Box display="flex" gap={2}>
              <TextField
                label="Username"
                size="small"
                fullWidth
                placeholder="admin"
                value={form.username}
                onChange={handleChange('username')}
              />
              <TextField
                label="Password"
                size="small"
                fullWidth
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
              />
            </Box>
          </Box>

          {/* Card footer */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button variant="outlined" size="small" startIcon={<Plug size={16} />}>
              Test Connection
            </Button>
            <Box display="flex" gap={1.5}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/data-sources')}
              >
                Cancel
              </Button>
              <Button variant="contained" size="small" startIcon={<Save size={16} />}>
                Save Connection
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
