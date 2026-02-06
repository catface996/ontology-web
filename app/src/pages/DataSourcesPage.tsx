import { useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, Button,
} from '@mui/material';
import {
  ChevronRight, Plus, Database, Leaf, Zap, Cloud, Boxes,
  Users, Headphones, Hash, Mail,
} from 'lucide-react';

/* ── Types ── */
type ConnectionStatus = 'connected' | 'syncing' | 'not_connected';

interface DataSource {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  brandColor: string;
  status: ConnectionStatus;
}

/* ── Status config ── */
const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  connected:     { label: 'Connected',     color: '#22C55E' },
  syncing:       { label: 'Syncing...',    color: '#F59E0B' },
  not_connected: { label: 'Not Connected', color: '#6B7280' },
};

/* ── Mock data ── */
const databases: DataSource[] = [
  { name: 'PostgreSQL', icon: Database,   brandColor: '#336791', status: 'connected' },
  { name: 'MySQL',      icon: Database,   brandColor: '#4479A1', status: 'connected' },
  { name: 'MongoDB',    icon: Leaf,       brandColor: '#47A248', status: 'connected' },
  { name: 'Redis',      icon: Zap,        brandColor: '#DC382D', status: 'syncing' },
];

const saasIntegrations: DataSource[] = [
  { name: 'Salesforce',       icon: Cloud,      brandColor: '#00A1E0', status: 'connected' },
  { name: 'SAP',              icon: Boxes,      brandColor: '#0070F2', status: 'connected' },
  { name: 'Workday',          icon: Users,      brandColor: '#F68D2E', status: 'connected' },
  { name: 'ServiceNow',       icon: Headphones, brandColor: '#81B5A1', status: 'not_connected' },
  { name: 'Slack',            icon: Hash,       brandColor: '#4A154B', status: 'syncing' },
  { name: 'Google Workspace', icon: Mail,       brandColor: '#4285F4', status: 'not_connected' },
];

/* ── Card component ── */
function SourceCard({ source }: { source: DataSource }) {
  const Icon = source.icon;
  const st = statusConfig[source.status];

  return (
    <Box
      sx={{
        width: 180,
        height: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: 2,
        borderColor: source.brandColor,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${source.brandColor}30` },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: `${source.brandColor}20`,
        }}
      >
        <Icon size={22} color={source.brandColor} />
      </Box>

      {/* Name */}
      <Typography fontSize={13} fontWeight={600}>
        {source.name}
      </Typography>

      {/* Status */}
      <Box display="flex" alignItems="center" gap={0.5}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: st.color }} />
        <Typography fontSize={10} sx={{ color: st.color }}>
          {st.label}
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Section component ── */
function Section({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Section header */}
      <Box display="flex" alignItems="center" gap={1.25}>
        <Icon size={20} />
        <Typography fontSize={16} fontWeight={600}>
          {title}
        </Typography>
        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            bgcolor: 'action.hover',
          }}
        >
          <Typography fontSize={11} color="text.secondary">
            {badge}
          </Typography>
        </Box>
      </Box>

      {/* Cards grid */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        {children}
      </Box>
    </Box>
  );
}

/* ── Page ── */
export default function DataSourcesPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">
            Integrations
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Data Sources
          </Typography>
        </Breadcrumbs>

        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => navigate('/data-sources/add')}
        >
          Add Connection
        </Button>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" flexDirection="column" gap={3} overflow="auto">
        {/* Databases */}
        <Section
          icon={Database}
          title="Databases"
          badge={`${databases.filter((d) => d.status === 'connected').length} connected`}
        >
          {databases.map((ds) => (
            <SourceCard key={ds.name} source={ds} />
          ))}
        </Section>

        {/* SaaS Integrations */}
        <Section
          icon={Cloud}
          title="SaaS Integrations"
          badge={`${saasIntegrations.length} available`}
        >
          {saasIntegrations.map((ds) => (
            <SourceCard key={ds.name} source={ds} />
          ))}
        </Section>
      </Box>
    </>
  );
}
