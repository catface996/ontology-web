import { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Button, Tag } from 'antd';
import {
  HeartPulse, CircleX, TriangleAlert, CircleCheck, ChevronRight,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type Severity = 'error' | 'warning' | 'passed';
type FilterKey = 'All' | 'Errors' | 'Warnings' | 'Passed';

interface ValidationResult {
  severity: Severity;
  check: string;
  description: string;
  target: string;
  status: string;
}

/* -- Config -- */
const severityConfig: Record<Severity, { icon: React.ReactNode; color: string; rowBg: string; statusBg: string; statusColor: string }> = {
  error:   { icon: <CircleX size={14} />,       color: '#f87171', rowBg: '#1a1215', statusBg: '#9F1D1D', statusColor: '#FFFFFF' },
  warning: { icon: <TriangleAlert size={14} />,  color: '#fbbf24', rowBg: '#1c1710', statusBg: '#33260D', statusColor: '#FFB443' },
  passed:  { icon: <CircleCheck size={14} />,    color: '#4ade80', rowBg: 'transparent', statusBg: '#15382A', statusColor: '#6EE7A0' },
};

/* -- Mock data -- */
const stats = [
  { label: 'Overall Health', value: '94%', sub: 'Good condition', color: '#4ade80', icon: <HeartPulse size={18} /> },
  { label: 'Errors', value: '2', sub: 'Require immediate fix', color: '#f87171', icon: <CircleX size={18} /> },
  { label: 'Warnings', value: '5', sub: 'Should be reviewed', color: '#fbbf24', icon: <TriangleAlert size={18} /> },
  { label: 'Checks Passed', value: '38', sub: 'Out of 45 total checks', color: '#f4f4f5', icon: <CircleCheck size={18} /> },
];

const results: ValidationResult[] = [
  { severity: 'error',   check: 'Unsatisfiable Class Detected', description: 'Class has contradictory constraints making it impossible to have instances', target: 'TempEmployee', status: 'Failed' },
  { severity: 'error',   check: 'Cyclic Dependency', description: 'Circular subclass relationship detected in class hierarchy', target: 'Manager \u2192 Employee', status: 'Failed' },
  { severity: 'warning', check: 'Redundant Axiom', description: 'Axiom can be inferred from existing definitions', target: 'Employee \u2291 Person', status: 'Warning' },
  { severity: 'warning', check: 'Missing Label Annotation', description: 'Entity lacks rdfs:label annotation for display purposes', target: 'hasEmployee', status: 'Warning' },
  { severity: 'passed',  check: 'Ontology Consistency', description: 'No logical contradictions found in the overall ontology', target: 'Global', status: 'Passed' },
  { severity: 'passed',  check: 'Property Domain/Range Validity', description: 'All property domains and ranges reference valid classes', target: 'All Properties', status: 'Passed' },
];

const filters: FilterKey[] = ['All', 'Errors', 'Warnings', 'Passed'];

const filterToSeverity: Record<FilterKey, Severity | null> = {
  All: null,
  Errors: 'error',
  Warnings: 'warning',
  Passed: 'passed',
};

/* -- Page -- */
export default function ValidationDashboardPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Ontology' },
        { title: 'Validation Dashboard' },
      ]} />
    );
    setActions(
      <Button type="primary" icon={<ChevronRight size={16} />}>
        Run Validation
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  const filtered = results.filter((r) => {
    const target = filterToSeverity[activeFilter];
    return target === null || r.severity === target;
  });

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ flex: 1, padding: 20, borderRadius: 12, backgroundColor: '#1a1a24' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>{s.label}</Typography.Text>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <Typography.Text style={{ fontSize: 28, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: s.color, display: 'block', marginTop: 4 }}>
                {s.value}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{s.sub}</Typography.Text>
            </div>
          ))}
        </div>

        {/* Validation Results Table */}
        <div style={{ flex: 1, borderRadius: 12, border: '1px solid #303030', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Table Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #303030' }}>
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Validation Results</Typography.Text>
            <div style={{ display: 'flex', gap: 4, backgroundColor: '#1a1a24', borderRadius: 8, padding: 4 }}>
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
                  }}
                >
                  {f}
                </Tag>
              ))}
            </div>
          </div>

          {/* Column Headers */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #303030' }}>
            <div style={{ width: 100 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Severity</Typography.Text></div>
            <div style={{ flex: 1 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Check</Typography.Text></div>
            <div style={{ width: 200 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Target</Typography.Text></div>
            <div style={{ width: 100 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Status</Typography.Text></div>
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.map((r, i) => {
              const cfg = severityConfig[r.severity];
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 24px',
                    backgroundColor: cfg.rowBg,
                    borderBottom: '1px solid #303030',
                  }}
                >
                  {/* Severity */}
                  <div style={{ width: 100, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <Typography.Text style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
                      {r.severity === 'error' ? 'Error' : r.severity === 'warning' ? 'Warning' : 'Passed'}
                    </Typography.Text>
                  </div>

                  {/* Check */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{r.check}</Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{r.description}</Typography.Text>
                  </div>

                  {/* Target */}
                  <div style={{ width: 200 }}>
                    <Typography.Text style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: r.severity === 'passed' ? '#f4f4f5' : 'var(--primary-color)' }}>
                      {r.target}
                    </Typography.Text>
                  </div>

                  {/* Status */}
                  <div style={{ width: 100 }}>
                    <Tag
                      style={{
                        backgroundColor: cfg.statusBg,
                        color: cfg.statusColor,
                        border: 'none',
                        borderRadius: 12,
                      }}
                    >
                      {r.status}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
