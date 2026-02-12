import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Typography, Flex } from 'antd';
import {
  Leaf, Zap, Cloud, Boxes,
  Users, Headphones, Hash, Mail,
  Plus, Database,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type ConnectionStatus = 'connected' | 'syncing' | 'not_connected';

interface DataSource {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  brandColor: string;
  status: ConnectionStatus;
}

/* -- Status config -- */
const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  connected:     { label: 'Connected',     color: '#22C55E' },
  syncing:       { label: 'Syncing...',    color: '#F59E0B' },
  not_connected: { label: 'Not Connected', color: '#6B7280' },
};

/* -- Mock data -- */
const databases: DataSource[] = [
  { name: 'PostgreSQL', icon: ({ size, color }: { size?: number; color?: string }) => <Database size={size ?? 22} color={color ?? '#336791'} />, brandColor: '#336791', status: 'connected' },
  { name: 'MySQL',      icon: ({ size, color }: { size?: number; color?: string }) => <Database size={size ?? 22} color={color ?? '#4479A1'} />, brandColor: '#4479A1', status: 'connected' },
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

/* -- Card component -- */
function SourceCard({ source }: { source: DataSource }) {
  const Icon = source.icon;
  const st = statusConfig[source.status];

  return (
    <div
      style={{
        width: 180,
        height: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        background: 'var(--ant-color-bg-container)',
        border: `2px solid ${source.brandColor}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: `${source.brandColor}20`,
        }}
      >
        <Icon size={22} color={source.brandColor} />
      </div>

      {/* Name */}
      <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>
        {source.name}
      </Typography.Text>

      {/* Status */}
      <Flex align="center" gap={4}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
        <Typography.Text style={{ fontSize: 10, color: st.color }}>
          {st.label}
        </Typography.Text>
      </Flex>
    </div>
  );
}

/* -- Section component -- */
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Section header */}
      <Flex align="center" gap={10}>
        <Icon size={20} />
        <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>
          {title}
        </Typography.Text>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>
            {badge}
          </Typography.Text>
        </div>
      </Flex>

      {/* Cards grid */}
      <Flex wrap="wrap" gap={16}>
        {children}
      </Flex>
    </div>
  );
}

/* -- Page -- */
export default function DataSourcesPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Integrations</a> },
          { title: <Typography.Text strong>Data Sources</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Button
        type="primary"
        icon={<Plus size={16} />}
        onClick={() => navigate('/data-sources/add')}
      >
        Add Connection
      </Button>
    );
  }, [setBreadcrumbs, setActions, navigate]);

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        {/* Databases */}
        <Section
          icon={({ size, color }: { size?: number; color?: string }) => <Database size={size} color={color} />}
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
      </div>
    </>
  );
}
