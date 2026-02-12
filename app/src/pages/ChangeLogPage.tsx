import { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Button } from 'antd';
import { Download, ChevronDown, Calendar } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type FilterKey = 'all' | 'created' | 'modified' | 'deleted';

interface LogEntry {
  timestamp: string;
  user: string;
  action: 'Created' | 'Modified' | 'Deleted';
  description: string;
  entity: string;
  entityColor: string;
  entityBg: string;
}

/* Badge color map */
const actionStyles: Record<string, { color: string; bg: string }> = {
  Created: { color: '#4ade80', bg: '#132B1E' },
  Modified: { color: '#fbbf24', bg: '#2E2008' },
  Deleted: { color: '#f87171', bg: '#2E1215' },
};

const entityStyles: Record<string, { color: string; bg: string }> = {
  Class: { color: '#fff', bg: 'var(--primary-color)' },
  Relation: { color: '#4ade80', bg: '#132B1E' },
  Property: { color: '#fbbf24', bg: '#2E2008' },
  Axiom: { color: '#f4f4f5', bg: '#1a1a24' },
  Import: { color: '#818cf8', bg: '#191933' },
};

/* -- Mock data -- */
const logEntries: LogEntry[] = [
  { timestamp: '2024-01-15 14:32', user: 'admin', action: 'Created', description: 'Added new class "MedicalRecord" with 5 properties', entity: 'Class', entityColor: '#fff', entityBg: 'var(--primary-color)' },
  { timestamp: '2024-01-15 13:18', user: 'data_eng', action: 'Modified', description: 'Updated domain of "hasEmployee" from Thing to Organization', entity: 'Relation', entityColor: '#4ade80', entityBg: '#132B1E' },
  { timestamp: '2024-01-15 11:45', user: 'admin', action: 'Deleted', description: 'Removed deprecated property "legacyId" from Person class', entity: 'Property', entityColor: '#fbbf24', entityBg: '#2E2008' },
  { timestamp: '2024-01-14 16:50', user: 'ontologist', action: 'Created', description: 'Added disjointWith axiom between Person and Organization', entity: 'Axiom', entityColor: '#f4f4f5', entityBg: '#1a1a24' },
  { timestamp: '2024-01-14 10:22', user: 'data_eng', action: 'Modified', description: 'Changed cardinality of hasName to maxCardinality=1', entity: 'Property', entityColor: '#fbbf24', entityBg: '#2E2008' },
  { timestamp: '2024-01-13 09:05', user: 'admin', action: 'Created', description: 'Imported health: namespace with 14 classes from OWL file', entity: 'Import', entityColor: '#818cf8', entityBg: '#191933' },
];

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Changes' },
  { key: 'created', label: 'Created' },
  { key: 'modified', label: 'Modified' },
  { key: 'deleted', label: 'Deleted' },
];

const columns = [
  { label: 'Timestamp', width: 160 },
  { label: 'User', width: 120 },
  { label: 'Action', width: 100 },
  { label: 'Description', width: undefined },
  { label: 'Entity', width: 80 },
];

/* -- Page -- */
export default function ChangeLogPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Admin' },
        { title: 'Change Log' },
      ]} />
    );
    setActions(
      <Button type="primary" icon={<Download size={16} />}>
        Export
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  const filtered = activeFilter === 'all'
    ? logEntries
    : logEntries.filter((e) => e.action.toLowerCase() === activeFilter);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {filterTabs.map((f) => {
              const isActive = f.key === activeFilter;
              return (
                <div
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                    border: isActive ? 'none' : '1px solid #303030',
                  }}
                >
                  <Typography.Text style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? '#fff' : undefined }}>
                    {f.label}
                  </Typography.Text>
                </div>
              );
            })}
          </div>

          {/* Date range */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8, border: '1px solid #303030', cursor: 'pointer',
            }}
          >
            <Calendar size={16} color="#a1a1aa" />
            <Typography.Text style={{ fontSize: 13 }}>Last 7 days</Typography.Text>
            <ChevronDown size={14} color="#a1a1aa" />
          </div>
        </div>

        {/* Table */}
        <div style={{ borderRadius: 12, border: '1px solid #303030', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ display: 'flex', padding: '12px 24px', borderBottom: '1px solid #303030' }}>
            {columns.map((col) => (
              <div key={col.label} style={{ width: col.width, flex: col.width ? undefined : 1 }}>
                <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>
                  {col.label}
                </Typography.Text>
              </div>
            ))}
          </div>

          {/* Table Rows */}
          {filtered.map((entry, i) => {
            const aStyle = actionStyles[entry.action];
            const eStyle = entityStyles[entry.entity] || { color: '#f4f4f5', bg: '#1a1a24' };
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 24px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #303030' : 'none',
                }}
              >
                <div style={{ width: 160 }}>
                  <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'JetBrains Mono' }}>{entry.timestamp}</Typography.Text>
                </div>
                <div style={{ width: 120 }}>
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{entry.user}</Typography.Text>
                </div>
                <div style={{ width: 100 }}>
                  <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, backgroundColor: aStyle.bg }}>
                    <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: aStyle.color }}>{entry.action}</Typography.Text>
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Text style={{ fontSize: 13 }}>{entry.description}</Typography.Text>
                </div>
                <div style={{ width: 80 }}>
                  <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, backgroundColor: eStyle.bg }}>
                    <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: eStyle.color }}>{entry.entity}</Typography.Text>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
