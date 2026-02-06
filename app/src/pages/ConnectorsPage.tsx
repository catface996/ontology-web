import {
  Box, Breadcrumbs, Link, Typography, Button,
} from '@mui/material';
import {
  ChevronRight, Plus, Activity, LayoutTemplate,
  Database, Cloud, Boxes, Share2, ArrowRight, Repeat, Timer,
  Globe, FileUp, Webhook, Braces, Radio,
} from 'lucide-react';

/* ── Types ── */
type ConnectorStatus = 'running' | 'paused' | 'stopped';

interface Connector {
  srcName: string;
  srcIcon: React.ComponentType<{ size?: number; color?: string }>;
  srcColor: string;
  status: ConnectorStatus;
  frequency: string;
  lastSync: string;
}

interface Template {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  description: string;
}

/* ── Status config ── */
const statusConfig: Record<ConnectorStatus, { label: string; color: string }> = {
  running: { label: 'Running', color: '#22C55E' },
  paused:  { label: 'Paused',  color: '#F59E0B' },
  stopped: { label: 'Stopped', color: '#6B7280' },
};

/* ── Mock data ── */
const connectors: Connector[] = [
  { srcName: 'PostgreSQL',  srcIcon: Database, srcColor: '#336791', status: 'running', frequency: 'Every 5 min',  lastSync: 'Last sync: 2 min ago' },
  { srcName: 'Salesforce',  srcIcon: Cloud,    srcColor: '#00A1E0', status: 'running', frequency: 'Every 15 min', lastSync: 'Last sync: 8 min ago' },
  { srcName: 'SAP',         srcIcon: Boxes,    srcColor: '#0070F2', status: 'paused',  frequency: 'Every 1 hour', lastSync: 'Last sync: 3 hours ago' },
];

const templates: Template[] = [
  { name: 'Database Sync', icon: Database, description: 'Sync from any SQL database' },
  { name: 'REST API',      icon: Globe,    description: 'Connect to any REST endpoint' },
  { name: 'File Import',   icon: FileUp,   description: 'Import CSV, JSON, or XML files' },
  { name: 'Webhook',       icon: Webhook,  description: 'Receive real-time data updates' },
  { name: 'GraphQL',       icon: Braces,   description: 'Query GraphQL endpoints' },
  { name: 'Event Stream',  icon: Radio,    description: 'Kafka, RabbitMQ, Pulsar' },
];

/* ── Connector Card ── */
function ConnectorCard({ connector }: { connector: Connector }) {
  const SrcIcon = connector.srcIcon;
  const st = statusConfig[connector.status];

  return (
    <Box
      sx={{
        width: 360,
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'text.secondary' },
      }}
    >
      {/* Header: flow + status */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <SrcIcon size={18} color={connector.srcColor} />
            <Typography fontSize={13} fontWeight={600}>{connector.srcName}</Typography>
          </Box>
          <ArrowRight size={16} color="#a1a1aa" />
          <Box display="flex" alignItems="center" gap={0.75}>
            <Share2 size={18} />
            <Typography fontSize={13} fontWeight={600}>Ontology</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: 999,
            bgcolor: `${st.color}20`,
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: st.color }} />
          <Typography fontSize={11} fontWeight={500} sx={{ color: st.color }}>
            {st.label}
          </Typography>
        </Box>
      </Box>

      {/* Details: frequency + last sync */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Repeat size={14} color="#a1a1aa" />
          <Typography fontSize={12} color="text.secondary">{connector.frequency}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Timer size={14} color="#a1a1aa" />
          <Typography fontSize={12} color="text.secondary">{connector.lastSync}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Template Card ── */
function TemplateCard({ template }: { template: Template }) {
  const Icon = template.icon;

  return (
    <Box
      sx={{
        width: 180,
        height: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.25,
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'text.secondary' },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2.5,
          bgcolor: 'action.hover',
        }}
      >
        <Icon size={22} />
      </Box>
      <Typography fontSize={13} fontWeight={600}>{template.name}</Typography>
      <Typography fontSize={11} color="text.secondary" textAlign="center">
        {template.description}
      </Typography>
    </Box>
  );
}

/* ── Page ── */
export default function ConnectorsPage() {
  const runningCount = connectors.filter((c) => c.status === 'running').length;

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
            Connectors
          </Typography>
        </Breadcrumbs>

        <Button variant="contained" size="small" startIcon={<Plus size={16} />}>
          Create Connector
        </Button>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" flexDirection="column" gap={3} overflow="auto">
        {/* Active Connectors */}
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={1.25}>
            <Activity size={20} />
            <Typography fontSize={16} fontWeight={600}>Active Connectors</Typography>
            <Box sx={{ px: 1.25, py: 0.5, borderRadius: 999, bgcolor: 'action.hover' }}>
              <Typography fontSize={11} color="text.secondary">
                {runningCount} running
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {connectors.map((c) => (
              <ConnectorCard key={c.srcName} connector={c} />
            ))}
          </Box>
        </Box>

        {/* Connector Templates */}
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={1.25}>
            <LayoutTemplate size={20} />
            <Typography fontSize={16} fontWeight={600}>Connector Templates</Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {templates.map((t) => (
              <TemplateCard key={t.name} template={t} />
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
