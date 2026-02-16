import { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Button, Tag, Spin } from 'antd';
import { Download, Undo, Plus, Minus, Pencil, GitCompareArrows } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { fetchOntologyVersions, type OntologyVersion } from '../services/coreService';

/* -- Types -- */
interface VersionItem {
  tag: string;
  label: string;
  description: string;
  author: string;
  date: string;
  changes: string;
}

interface Change {
  type: 'added' | 'modified' | 'removed';
  label: string;
  detail: string;
}

function dtoToVersionItem(dto: OntologyVersion, index: number): VersionItem {
  const d = new Date(dto.createdAt);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return {
    tag: dto.tag,
    label: index === 0 ? 'Latest' : '',
    description: dto.description,
    author: dto.author,
    date,
    changes: `+${dto.additions} / -${dto.deletions} changes`,
  };
}

const detailStats = [
  { label: 'Classes Modified', value: '2', color: '#f4f4f5' },
  { label: 'Relations Modified', value: '1', color: '#f4f4f5' },
  { label: 'Axioms Added', value: '3', color: '#4ade80' },
  { label: 'Axioms Removed', value: '1', color: '#f87171' },
];

const changes: Change[] = [
  { type: 'added', label: 'Class Axiom Added', detail: 'Person owl:disjointWith Organization' },
  { type: 'added', label: 'Relation Auto-Added', detail: 'hasEmployee owl:maxCardinality 3' },
  { type: 'modified', label: 'Class Subclass Added', detail: 'Person \u2192 Employee \u222A Student' },
  { type: 'removed', label: 'Relation Property Removed', detail: 'hasEmployee.isSymmetric \u2192 (deprecated)' },
];

const changeConfig = {
  added:    { icon: <Plus size={14} />,   color: '#4ade80', bg: '#4ade8015' },
  modified: { icon: <Pencil size={14} />,   color: '#fbbf24', bg: '#fbbf2415' },
  removed:  { icon: <Minus size={14} />,  color: '#f87171', bg: '#f8717115' },
};

/* -- Page -- */
export default function VersionHistoryPage() {
  const [selected, setSelected] = useState(0);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { setBreadcrumbs, setActions } = useHeader();

  // Load versions from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchOntologyVersions();
        if (res.data) {
          setVersions(res.data.map(dtoToVersionItem));
        }
      } catch {
        // failed to load versions
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: 'Version History' },
      ]} />
    );
    setActions(
      <Button type="primary" icon={<GitCompareArrows size={16} />}>
        Compare Versions
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content -- split panels */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Left -- Version List */}
        <div style={{ width: 420, flexShrink: 0, borderRight: '1px solid #303030', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 20px', height: 56, flexShrink: 0, borderBottom: '1px solid #303030', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography.Text style={{ fontSize: 16, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>All Versions</Typography.Text>
            <Tag>{versions.length} versions</Tag>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>
            ) : versions.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <Typography.Text style={{ color: '#a1a1aa' }}>No version history available</Typography.Text>
              </div>
            ) : versions.map((v, i) => (
              <div
                key={v.tag}
                onClick={() => setSelected(i)}
                style={{
                  padding: '16px 20px', gap: 8, display: 'flex', flexDirection: 'column',
                  backgroundColor: selected === i ? '#1a1a24' : 'transparent',
                  borderBottom: '1px solid #303030', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color="blue">{v.tag}</Tag>
                    {v.label && <Tag color="green">{v.label}</Tag>}
                  </div>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{v.date}</Typography.Text>
                </div>
                <Typography.Text style={{ fontSize: 13, lineHeight: '1.4' }}>{v.description}</Typography.Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{v.author}</Typography.Text>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>&middot;</Typography.Text>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{v.changes}</Typography.Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right -- Version Detail */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {versions.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography.Text style={{ color: '#a1a1aa' }}>Select a version to view details</Typography.Text>
            </div>
          ) : (<>
          <div style={{ padding: '0 24px', height: 56, flexShrink: 0, borderBottom: '1px solid #303030', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tag color="blue">{versions[selected].tag}</Tag>
              <Typography.Text style={{ fontSize: 16, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Version Details</Typography.Text>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<Undo size={16} />}>Rollback</Button>
              <Button icon={<Download size={16} />}>Export</Button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 16 }}>
              {detailStats.map((s) => (
                <div key={s.label} style={{ flex: 1, padding: 16, borderRadius: 10, backgroundColor: '#1a1a24' }}>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{s.label}</Typography.Text>
                  <Typography.Text style={{ fontSize: 28, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: s.color, display: 'block', marginTop: 4 }}>{s.value}</Typography.Text>
                </div>
              ))}
            </div>

            {/* Changes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Changes</Typography.Text>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['All', 'Added', 'Modified', 'Removed'] as const).map((f) => (
                  <Tag key={f} color={f === 'All' ? 'blue' : undefined}>{f}</Tag>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {changes.map((c, i) => {
                const cfg = changeConfig[c.type];
                return (
                  <div key={i} style={{ padding: 16, borderRadius: 8, backgroundColor: cfg.bg, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: cfg.color }}>{c.label}</Typography.Text>
                    </div>
                    <Typography.Text style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#a1a1aa' }}>{c.detail}</Typography.Text>
                  </div>
                );
              })}
            </div>
          </div>
        </>)}
        </div>
      </div>
    </>
  );
}
