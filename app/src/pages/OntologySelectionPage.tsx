import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Tag, Spin, Divider, Flex } from 'antd';
import {
  Share2, LayoutGrid, Heart, Wallet, Cpu, Link2, Globe, Plus, Eye, Check, LogOut,
} from 'lucide-react';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { getUser, logout } from '../utils/auth';
import { listOntologies, type OntologyDTO } from '../services/coreService';

/* -- Icon palette -- */
const ICON_MAP: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; color: string; bg: string }> = {
  enterprise:      { icon: Share2,  color: '#8B5CF6', bg: '#8b5cf620' },
  healthcare:      { icon: Heart,   color: '#22D3EE', bg: '#22D3EE20' },
  finance:         { icon: Wallet,  color: '#F472B6', bg: '#F472B620' },
  'iot & sensors': { icon: Cpu,     color: '#4ADE80', bg: '#4ADE8020' },
  'supply chain':  { icon: Link2,   color: '#FBBF24', bg: '#FBBF2420' },
};
const PALETTE = ['#8B5CF6', '#22D3EE', '#F472B6', '#4ADE80', '#FBBF24', '#60A5FA'];
const DEFAULT_ICON = { icon: Globe, color: '#60A5FA', bg: '#60A5FA20' };

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function normalizeStatus(raw: string | undefined): 'Published' | 'Draft' {
  if (!raw) return 'Draft';
  return raw.toLowerCase() === 'published' ? 'Published' : 'Draft';
}

interface CardData {
  id: number;
  name: string;
  description: string;
  status: 'Published' | 'Draft';
  classCount: number;
  relationCount: number;
  propertyCount: number;
  instanceCount: number;
  version: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  iconBg: string;
}

function dtoToCard(dto: OntologyDTO & Record<string, unknown>, index: number): CardData {
  const key = (dto.name ?? '').toLowerCase();
  const visual = ICON_MAP[key] ?? { ...DEFAULT_ICON, color: PALETTE[index % PALETTE.length], bg: `${PALETTE[index % PALETTE.length]}20` };
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    status: normalizeStatus(dto.status),
    classCount: (dto.classCount ?? (dto as Record<string, unknown>).class_count ?? 0) as number,
    relationCount: (dto.relationCount ?? (dto as Record<string, unknown>).relation_count ?? 0) as number,
    propertyCount: (dto.propertyCount ?? (dto as Record<string, unknown>).property_count ?? 0) as number,
    instanceCount: (dto.instanceCount ?? (dto as Record<string, unknown>).instance_count ?? 0) as number,
    version: dto.version ?? 'v1.0.0',
    icon: visual.icon,
    iconColor: visual.color,
    iconBg: visual.bg,
  };
}

export default function OntologySelectionPage() {
  const navigate = useNavigate();
  const { setCurrentOntology } = useCurrentOntology();
  const [ontologies, setOntologies] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const user = getUser();

  useEffect(() => {
    (async () => {
      try {
        const res = await listOntologies();
        if (res.data && res.data.length > 0) {
          setOntologies(res.data.map(dtoToCard));
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (o: CardData) => {
    setCurrentOntology({ id: o.id, name: o.name, version: o.version, status: o.status });
    navigate('/classes');
  };

  // Group cards into rows of 3
  const rows: CardData[][] = [];
  for (let i = 0; i < ontologies.length; i += 3) {
    rows.push(ontologies.slice(i, i + 3));
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ height: 64, padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e1e2a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Share2 size={24} color="#e4e4e7" />
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, color: '#e4e4e7' }}>Ontology</Typography.Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => setUserMenuOpen((prev) => !prev)}
          >
            <Typography.Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
              {(user?.nickname || user?.username || 'U').charAt(0).toUpperCase()}
            </Typography.Text>
          </div>
        </div>
      </div>

      {/* User Menu Popover */}
      {userMenuOpen && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute', top: 0, right: 24, zIndex: 1300,
              width: 248, background: '#1a1a24',
              border: '1px solid #27273a', borderRadius: 12, padding: '8px 0',
            }}
          >
            {/* User Info */}
            <Flex align="center" gap={12} style={{ padding: '12px 16px' }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--primary-color)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <Typography.Text style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {(user?.nickname || user?.username || 'U').charAt(0).toUpperCase()}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>
                  {user?.nickname || 'Admin User'}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', display: 'block' }}>
                  {user?.username || 'admin@ontology.io'}
                </Typography.Text>
              </div>
            </Flex>
            <Divider style={{ margin: '0 8px' }} />

            {/* Language */}
            <div style={{ padding: '8px 16px' }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Language</Typography.Text>
            </div>
            {(['English', '中文', '日本語'] as const).map((lang) => {
              const isActive = selectedLanguage === lang;
              return (
                <Flex
                  key={lang}
                  align="center"
                  gap={12}
                  onClick={() => setSelectedLanguage(lang)}
                  style={{
                    padding: '8px 16px', margin: '0 8px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? 'rgba(var(--primary-rgb), 0.13)' : 'transparent',
                  }}
                >
                  <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isActive && <Check size={14} color="var(--primary-color)" />}
                  </div>
                  <Globe size={14} color="#a1a1aa" />
                  <Typography.Text style={{ fontSize: 13 }}>{lang}</Typography.Text>
                </Flex>
              );
            })}
            <Divider style={{ margin: '0 8px' }} />

            {/* Logout */}
            <Flex
              align="center"
              gap={12}
              onClick={() => { void logout().then(() => navigate('/login')); }}
              style={{
                padding: '8px 16px', margin: '0 8px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <LogOut size={14} color="#f87171" />
              <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#f87171' }}>Log out</Typography.Text>
            </Flex>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: '60px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, overflow: 'auto' }}>
        {/* Title Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(var(--primary-rgb), 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutGrid size={32} color="var(--primary-color)" />
          </div>
          <Typography.Text style={{ fontSize: 28, fontWeight: 700, color: '#f4f4f5' }}>Select an Ontology</Typography.Text>
          <Typography.Text style={{ fontSize: 15, color: '#a1a1aa', textAlign: 'center', maxWidth: 720, lineHeight: '1.6' }}>
            Choose an ontology to explore its knowledge graph, classes, relations and properties.
          </Typography.Text>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            style={{ borderRadius: 8, marginTop: 8 }}
            onClick={() => navigate('/ontologies/new')}
          >
            New Ontology
          </Button>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            {rows.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 20 }}>
                {row.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      border: '1px solid #27273a',
                      backgroundColor: '#0d0d14',
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
                        <Typography.Text style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>{o.name}</Typography.Text>
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
                          <Typography.Text style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5' }}>{formatCount(s.value)}</Typography.Text>
                          <Typography.Text style={{ fontSize: 11, color: '#a1a1aa' }}>{s.label}</Typography.Text>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
                      <Typography.Text style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>{o.version}</Typography.Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<Eye size={14} />}
                          style={{ borderRadius: 8, fontSize: 12, color: '#a1a1aa' }}
                          onClick={() => { handleSelect(o); navigate(`/ontologies/${o.id}`); }}
                        >
                          Details
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                          onClick={() => handleSelect(o)}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Fill empty slots */}
                {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ flex: 1 }} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
