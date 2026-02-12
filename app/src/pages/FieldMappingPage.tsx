import { Breadcrumb, Typography, Button, Select } from 'antd';
import {
  ChevronRight, ChevronDown, Database,
  ArrowRight, Zap, Plus, Save,
  ArrowLeftRight, Trash2, Check, AlertTriangle,
  KeyRound, Share2, GitMerge,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useState, useEffect } from 'react';
import { useHeader } from '../contexts/HeaderContext';

/* ── Types ── */
interface SourceField {
  name: string;
  type: string;
  isPrimary?: boolean;
}

interface MappingItem {
  source: string;
  target: string;
  transform: string;
}

interface TargetField {
  name: string;
  type: string;
}

/* ── Static data ── */
const allSourceFields: SourceField[] = [
  { name: 'id',         type: 'INTEGER',      isPrimary: true },
  { name: 'username',   type: 'VARCHAR(50)' },
  { name: 'email',      type: 'VARCHAR(100)' },
  { name: 'created_at', type: 'TIMESTAMP' },
];

const allTargetFields: TargetField[] = [
  { name: 'personId',    type: 'xsd:integer' },
  { name: 'name',        type: 'xsd:string' },
  { name: 'email',       type: 'xsd:string' },
  { name: 'createdDate', type: 'xsd:dateTime' },
  { name: 'belongsTo',   type: 'Organization' },
];

const initialMappings: MappingItem[] = [
  { source: 'id',       target: 'personId', transform: 'Direct mapping' },
  { source: 'username', target: 'name',     transform: 'Direct mapping' },
  { source: 'email',    target: 'email',    transform: 'Direct mapping' },
];

const transformOptions = ['Direct mapping', 'Uppercase', 'Lowercase', 'Trim', 'Custom'];

/* ── Connector dot ── */
function ConnectorDot({ filled }: { filled: boolean }) {
  return (
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        flexShrink: 0,
        ...(filled
          ? { background: 'var(--primary-color)' }
          : { border: '2px solid rgba(255,255,255,0.12)' }),
      }}
    />
  );
}

/* ── Field row ── */
function FieldRow({
  name,
  type,
  mapped,
  active,
  isPrimary,
  connectorSide,
}: {
  name: string;
  type: string;
  mapped: boolean;
  active?: boolean;
  isPrimary?: boolean;
  connectorSide: 'left' | 'right';
}) {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 8,
  };

  const stateStyle: React.CSSProperties = active
    ? { background: 'rgba(139,92,246,0.08)', border: '1.5px solid var(--primary-color)' }
    : mapped
      ? { background: 'rgba(139,92,246,0.12)' }
      : { border: '1px solid rgba(255,255,255,0.12)' };

  return (
    <div style={{ ...baseStyle, ...stateStyle }}>
      {connectorSide === 'right' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPrimary && <KeyRound size={14} />}
            <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{name}</Typography.Text>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{type}</Typography.Text>
          <ConnectorDot filled={mapped} />
        </>
      )}
      {connectorSide === 'left' && (
        <>
          <ConnectorDot filled={mapped} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{name}</Typography.Text>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{type}</Typography.Text>
        </>
      )}
    </div>
  );
}

/* ── Page ── */
export default function FieldMappingPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [source, setSource] = useState('PostgreSQL / users');
  const [target, setTarget] = useState('Person (Class)');

  // Mapping state
  const [mappingList, setMappingList] = useState<MappingItem[]>(initialMappings);

  // Add mapping state
  const [adding, setAdding] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newTransform, setNewTransform] = useState('Direct mapping');

  // Delete mapping state
  const [deletingSource, setDeletingSource] = useState<string | null>(null);

  // Save success modal
  const [saveOpen, setSaveOpen] = useState(false);

  // Derived mapped sets
  const mappedSourceNames = new Set(mappingList.map((m) => m.source));
  const mappedTargetNames = new Set(mappingList.map((m) => m.target));

  // Unmapped options for add form
  const unmappedSources = allSourceFields.filter((f) => !mappedSourceNames.has(f.name)).map((f) => f.name);
  const unmappedTargets = allTargetFields.filter((f) => !mappedTargetNames.has(f.name)).map((f) => f.name);

  const mappedCount = mappingList.length;
  const totalCount = allSourceFields.length;

  const handleConfirmAdd = () => {
    if (!newSource || !newTarget) return;
    setMappingList((prev) => [...prev, { source: newSource, target: newTarget, transform: newTransform }]);
    setAdding(false);
    setNewSource('');
    setNewTarget('');
    setNewTransform('Direct mapping');
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setNewSource('');
    setNewTarget('');
    setNewTransform('Direct mapping');
  };

  const handleConfirmDelete = (sourceKey: string) => {
    setMappingList((prev) => prev.filter((m) => m.source !== sourceKey));
    setDeletingSource(null);
  };

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<Typography.Text type="secondary" style={{ fontSize: 14 }}>/</Typography.Text>}
        items={[
          { title: <a>Integrations</a> },
          { title: <Typography.Text strong>Field Mapping</Typography.Text> },
        ]}
      />
    );
    setActions(
      <div style={{ display: 'flex', gap: 12 }}>
        <Button icon={<Zap size={16} />}>Auto Mapping</Button>
        <Button type="primary" icon={<Save size={16} />} onClick={() => setSaveOpen(true)}>
          Save Mapping
        </Button>
      </div>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      {/* Content — three-panel layout */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'hidden' }}>
        {/* ── Source Fields ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={20} color="#336791" />
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Source Fields</Typography.Text>
            </div>
            <Select
              style={{ width: '100%' }}
              value={source}
              onChange={setSource}
              suffixIcon={<ChevronDown size={16} />}
              options={[
                { value: 'PostgreSQL / users', label: 'PostgreSQL / users' },
                { value: 'PostgreSQL / orders', label: 'PostgreSQL / orders' },
                { value: 'MySQL / products', label: 'MySQL / products' },
              ]}
            />
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            {allSourceFields.map((f) => (
              <FieldRow
                key={f.name}
                name={f.name}
                type={f.type}
                mapped={mappedSourceNames.has(f.name)}
                active={adding && newSource === f.name}
                isPrimary={f.isPrimary}
                connectorSide="right"
              />
            ))}
          </div>
        </div>

        {/* ── Field Mappings ── */}
        <div style={{
          width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitMerge size={20} />
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Field Mappings</Typography.Text>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {mappedCount} of {totalCount} fields mapped
            </Typography.Text>
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            {mappingList.map((m) =>
              deletingSource === m.source ? (
                /* ── Delete confirmation ── */
                <div
                  key={m.source}
                  style={{
                    padding: 12, borderRadius: 8, border: '1px solid #ef4444',
                    background: 'rgba(239,68,68,0.08)', display: 'flex', flexDirection: 'column', gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.source}</Typography.Text>
                    <ArrowRight size={14} color="#ef4444" />
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.target}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={12} color="#a1a1aa" />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{m.transform}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <AlertTriangle size={12} color="#ef4444" />
                    <Typography.Text style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
                      Remove this mapping?
                    </Typography.Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button block onClick={() => setDeletingSource(null)}>Keep</Button>
                    <Button block danger type="primary" icon={<Trash2 size={16} />} onClick={() => handleConfirmDelete(m.source)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Normal mapping row with hover trash ── */
                <div
                  key={m.source}
                  className="mapping-row"
                  style={{
                    padding: 12, borderRadius: 8, border: '1px solid var(--primary-color)',
                    background: 'rgba(139,92,246,0.06)', display: 'flex', flexDirection: 'column',
                    gap: 8, position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.source}</Typography.Text>
                    <ArrowRight size={14} />
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{m.target}</Typography.Text>
                    <div
                      onClick={() => setDeletingSource(m.source)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 4, color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={12} color="#a1a1aa" />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{m.transform}</Typography.Text>
                  </div>
                </div>
              ),
            )}

            {/* Add Mapping — form or button */}
            {adding ? (
              <div style={{
                padding: 12, borderRadius: 8, border: '1px solid var(--primary-color)',
                background: 'rgba(139,92,246,0.06)', display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeftRight size={14} />
                  <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>New Mapping</Typography.Text>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Source Field</Typography.Text>
                    <Select
                      style={{ width: '100%' }}
                      value={newSource || undefined}
                      placeholder="Select source field"
                      onChange={setNewSource}
                      suffixIcon={<ChevronDown size={16} />}
                      options={unmappedSources.map((s) => ({ value: s, label: s }))}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Target Property</Typography.Text>
                    <Select
                      style={{ width: '100%' }}
                      value={newTarget || undefined}
                      placeholder="Select target property"
                      onChange={setNewTarget}
                      suffixIcon={<ChevronDown size={16} />}
                      options={unmappedTargets.map((t) => ({ value: t, label: t }))}
                    />
                  </div>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Transform</Typography.Text>
                    <Select
                      style={{ width: '100%' }}
                      value={newTransform}
                      onChange={setNewTransform}
                      suffixIcon={<ChevronDown size={16} />}
                      options={transformOptions.map((t) => ({ value: t, label: t }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button block onClick={handleCancelAdd}>Cancel</Button>
                  <Button block type="primary" disabled={!newSource || !newTarget} icon={<Check size={16} />} onClick={handleConfirmAdd}>
                    Confirm
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setAdding(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} color="#a1a1aa" />
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>Add Mapping</Typography.Text>
              </div>
            )}
          </div>
        </div>

        {/* ── Target Properties ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={20} />
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Target Properties</Typography.Text>
            </div>
            <Select
              style={{ width: '100%' }}
              value={target}
              onChange={setTarget}
              suffixIcon={<ChevronDown size={16} />}
              options={[
                { value: 'Person (Class)', label: 'Person (Class)' },
                { value: 'Organization (Class)', label: 'Organization (Class)' },
                { value: 'Event (Class)', label: 'Event (Class)' },
              ]}
            />
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            {allTargetFields.map((f) => (
              <FieldRow
                key={f.name}
                name={f.name}
                type={f.type}
                mapped={mappedTargetNames.has(f.name)}
                active={adding && newTarget === f.name}
                connectorSide="left"
              />
            ))}
          </div>
        </div>
      </div>

      <SuccessModal
        open={saveOpen}
        title="Save Successful"
        description="The field mapping configuration has been saved successfully. Changes will take effect on the next sync."
        onClose={() => setSaveOpen(false)}
      />
    </>
  );
}
