import { useEffect } from 'react';
import { Breadcrumb, Button, Typography, Flex } from 'antd';
import {
  Database, Cloud, Boxes, Share2, ArrowRight, Repeat, Timer,
  Globe, FileUp, Webhook, Braces, Radio, LayoutTemplate,
  Plus, Activity,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
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

/* -- Status config -- */
const statusConfig: Record<ConnectorStatus, { label: string; color: string }> = {
  running: { label: 'Running', color: '#22C55E' },
  paused:  { label: 'Paused',  color: '#F59E0B' },
  stopped: { label: 'Stopped', color: '#6B7280' },
};

/* -- Mock data -- */
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

/* -- Connector Card -- */
function ConnectorCard({ connector }: { connector: Connector }) {
  const SrcIcon = connector.srcIcon;
  const st = statusConfig[connector.status];

  return (
    <div
      style={{
        width: 360,
        padding: 16,
        borderRadius: 12,
        border: '1px solid #27273a',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {/* Header: flow + status */}
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={8}>
          <Flex align="center" gap={6}>
            <SrcIcon size={18} color={connector.srcColor} />
            <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>{connector.srcName}</Typography.Text>
          </Flex>
          <ArrowRight size={16} color="#a1a1aa" />
          <Flex align="center" gap={6}>
            <Share2 size={18} />
            <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>Ontology</Typography.Text>
          </Flex>
        </Flex>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 999,
            background: `${st.color}20`,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
          <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: st.color }}>
            {st.label}
          </Typography.Text>
        </div>
      </Flex>

      {/* Details: frequency + last sync */}
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={4}>
          <Repeat size={14} color="#a1a1aa" />
          <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{connector.frequency}</Typography.Text>
        </Flex>
        <Flex align="center" gap={4}>
          <Timer size={14} color="#a1a1aa" />
          <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{connector.lastSync}</Typography.Text>
        </Flex>
      </Flex>
    </div>
  );
}

/* -- Template Card -- */
function TemplateCard({ template }: { template: Template }) {
  const Icon = template.icon;

  return (
    <div
      style={{
        width: 180,
        height: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 16,
        borderRadius: 12,
        border: '1px solid #27273a',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        <Icon size={22} />
      </div>
      <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>{template.name}</Typography.Text>
      <Typography.Text style={{ fontSize: 11, color: '#a1a1aa', textAlign: 'center' }}>
        {template.description}
      </Typography.Text>
    </div>
  );
}

/* -- Page -- */
export default function ConnectorsPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const runningCount = connectors.filter((c) => c.status === 'running').length;

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Integrations</a> },
          { title: <Typography.Text strong>Connectors</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Button type="primary" icon={<Plus size={16} />}>
        Create Connector
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        {/* Active Connectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Flex align="center" gap={10}>
            <Activity size={20} />
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Active Connectors</Typography.Text>
            <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
              <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>
                {runningCount} running
              </Typography.Text>
            </div>
          </Flex>
          <Flex wrap="wrap" gap={16}>
            {connectors.map((c) => (
              <ConnectorCard key={c.srcName} connector={c} />
            ))}
          </Flex>
        </div>

        {/* Connector Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Flex align="center" gap={10}>
            <LayoutTemplate size={20} />
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Connector Templates</Typography.Text>
          </Flex>
          <Flex wrap="wrap" gap={16}>
            {templates.map((t) => (
              <TemplateCard key={t.name} template={t} />
            ))}
          </Flex>
        </div>
      </div>
    </>
  );
}
