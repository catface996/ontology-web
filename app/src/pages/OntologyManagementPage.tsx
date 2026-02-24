import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Typography, Tag, Spin } from 'antd';
import {
  Search, Plus, Boxes, Heart, Globe, Wallet,
  Cpu, Link2, Share2,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listOntologies, type OntologyDTO } from '../services/coreService';

/* -- Types -- */
type FilterKey = 'All' | 'Published' | 'Draft';

interface OntologyCard {
  id: number;
  name: string;
  description: string;
  status: 'Published' | 'Draft';
  classCount: number;
  relationCount: number;
  propertyCount: number;
  instanceCount: number;
  version: string;
  updatedAt: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  iconBg: string;
}

/* -- Icon palette -- */
const ICON_MAP: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; color: string; bg: string }> = {
  enterprise:    { icon: Share2,  color: '#8B5CF6', bg: '#8b5cf620' },
  healthcare:    { icon: Heart,   color: '#22D3EE', bg: '#22D3EE20' },
  finance:       { icon: Wallet,  color: '#F472B6', bg: '#F472B620' },
  'iot & sensors': { icon: Cpu,   color: '#4ADE80', bg: '#4ADE8020' },
  'supply chain':  { icon: Link2, color: '#FBBF24', bg: '#FBBF2420' },
};
const PALETTE = ['#8B5CF6', '#22D3EE', '#F472B6', '#4ADE80', '#FBBF24', '#60A5FA'];
const DEFAULT_ICON = { icon: Globe, color: '#60A5FA', bg: '#60A5FA20' };

function formatUpdated(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Updated just now';
  if (hours < 24) return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
  return `Updated ${new Date(dateStr).toLocaleDateString()}`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function normalizeStatus(raw: string | undefined): 'Published' | 'Draft' {
  if (!raw) return 'Draft';
  const lower = raw.toLowerCase();
  if (lower === 'published') return 'Published';
  return 'Draft';
}

function dtoToCard(dto: OntologyDTO & Record<string, unknown>, index: number): OntologyCard {
  const key = (dto.name ?? '').toLowerCase();
  const visual = ICON_MAP[key] ?? { ...DEFAULT_ICON, color: PALETTE[index % PALETTE.length], bg: `${PALETTE[index % PALETTE.length]}20` };
  // Handle both camelCase and snake_case field names from backend
  const classCount = (dto.classCount ?? dto.class_count ?? 0) as number;
  const relationCount = (dto.relationCount ?? dto.relation_count ?? 0) as number;
  const propertyCount = (dto.propertyCount ?? dto.property_count ?? 0) as number;
  const instanceCount = (dto.instanceCount ?? dto.instance_count ?? 0) as number;
  const updatedAt = (dto.updatedAt ?? dto.updated_at ?? '') as string;
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    status: normalizeStatus(dto.status),
    classCount,
    relationCount,
    propertyCount,
    instanceCount,
    version: dto.version ?? 'v1.0.0',
    updatedAt: updatedAt ? formatUpdated(updatedAt) : '',
    icon: visual.icon,
    iconColor: visual.color,
    iconBg: visual.bg,
  };
}

const filters: FilterKey[] = ['All', 'Published', 'Draft'];

/* -- Page -- */
export default function OntologyManagementPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const { setCurrentOntology } = useCurrentOntology();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [ontologies, setOntologies] = useState<OntologyCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from API
  useEffect(() => {
    (async () => {
      try {
        const res = await listOntologies();
        if (res.data) {
          setOntologies(res.data.map((dto, i) => dtoToCard(dto as OntologyDTO & Record<string, unknown>, i)));
        }
      } catch {
        // failed to load ontologies
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setBreadcrumbs(null);
    setActions(null);
  }, [setBreadcrumbs, setActions]);

  const filtered = ontologies.filter((o) => {
    if (activeFilter !== 'All' && o.status !== activeFilter) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group cards into rows of 3
  const rows: OntologyCard[][] = [];
  for (let i = 0; i < filtered.length; i += 3) {
    rows.push(filtered.slice(i, i + 3));
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Typography.Text style={{ fontSize: 28, fontWeight: 700 }}>Ontology Management</Typography.Text>
        <Typography.Text style={{ fontSize: 15, color: '#a1a1aa', lineHeight: '1.5' }}>
          Create, manage and explore your ontologies. Select an ontology to view its knowledge graph, classes, relations and more.
        </Typography.Text>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Input
            placeholder="Search ontologies..."
            prefix={<Search size={16} color="#a1a1aa" />}
            style={{ width: 260, borderRadius: 8 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 4, backgroundColor: '#1a1a24', borderRadius: 8, padding: '0 4px', height: 32, alignItems: 'center' }}>
            {filters.map((f) => (
              <Tag
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  borderRadius: 6,
                  backgroundColor: activeFilter === f ? '#0a0a0f' : 'transparent',
                  color: activeFilter === f ? '#f4f4f5' : '#a1a1aa',
                  fontSize: 12,
                  fontWeight: activeFilter === f ? 500 : 400,
                  cursor: 'pointer',
                  border: 'none',
                  margin: 0,
                  lineHeight: '24px',
                }}
              >
                {f}
              </Tag>
            ))}
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/ontologies/new')}
          style={{ borderRadius: 8 }}
        >
          New Ontology
        </Button>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography.Text style={{ color: '#a1a1aa' }}>No ontologies found</Typography.Text>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 20 }}>
              {row.map((o) => (
                <div
                  key={o.id}
                  onClick={() => { setCurrentOntology({ id: o.id, name: o.name, version: o.version, status: o.status }); navigate(`/ontologies/${o.id}`); }}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    border: '1px solid #27273a',
                    backgroundColor: '#0d0d14',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: o.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <o.icon size={20} color={o.iconColor} />
                      </div>
                      <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>{o.name}</Typography.Text>
                    </div>
                    <Tag
                      color={o.status === 'Published' ? 'green' : 'orange'}
                      style={{ borderRadius: 20, margin: 0, fontSize: 11, fontWeight: 600 }}
                    >
                      {o.status}
                    </Tag>
                  </div>

                  {/* Description */}
                  <div style={{ padding: '0 20px 16px 20px', flex: 1 }}>
                    <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', lineHeight: '1.5' }}>{o.description}</Typography.Text>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: '#27273a', flexShrink: 0 }} />

                  {/* Stats Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px' }}>
                    {[
                      { label: 'Classes', value: o.classCount },
                      { label: 'Relations', value: o.relationCount },
                      { label: 'Properties', value: o.propertyCount },
                      { label: 'Instances', value: o.instanceCount },
                    ].map((s) => (
                      <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography.Text style={{ fontSize: 18, fontWeight: 700 }}>{formatCount(s.value)}</Typography.Text>
                        <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>{s.label}</Typography.Text>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 14px 20px' }}>
                    <Typography.Text style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>{o.version}</Typography.Text>
                    <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>{o.updatedAt}</Typography.Text>
                  </div>
                </div>
              ))}
              {/* Fill empty slots to keep 3-column grid even */}
              {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => (
                <div key={`empty-${i}`} style={{ flex: 1 }} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
