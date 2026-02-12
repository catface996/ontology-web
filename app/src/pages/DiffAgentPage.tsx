import { useState } from 'react';
import { Button, Input } from 'antd';
import {
  Share2, Check, Download, Square, GitCompareArrows,
} from 'lucide-react';
import D3TopologyGraph from '../components/D3TopologyGraph';
import type { TopoNode, TopoEdge, TopoLayerLabel, LegendEntry } from '../components/D3TopologyGraph';

/* ══════════════════════════════════════════
   Data
   ══════════════════════════════════════════ */
const ACCENT = '#10b981';

const executionSteps = [
  { number: 1, label: 'Load Snapshots', completed: true },
  { number: 2, label: 'Align Structures', completed: true },
  { number: 3, label: 'Compute Diffs', completed: true, active: true },
  { number: 4, label: 'Classify Changes', completed: true },
  { number: 5, label: 'Report Differences', completed: true },
];

const progressSteps = [
  { label: 'Comparing node inventories', detail: '27 vs 31 nodes' },
  { label: 'Comparing relation mappings', detail: '18 vs 22 edges' },
  { label: 'Detecting property changes', detail: '142 properties' },
  { label: 'Classifying change types', detail: 'complete' },
];

const executionStats = [
  { label: 'Total changes', value: '12' },
  { label: 'Nodes compared', value: '31' },
  { label: 'Duration', value: '1.9s', valueColor: '#22c55e' },
];

/* ── Topology Diff Data ── */
const diffTopoNodes: TopoNode[] = [
  // Layer 0 — SERVERS
  { id: 'srv-01', label: 'srv-01', layer: 0, color: '#71717a', opacity: 0.5 },
  { id: 'srv-02', label: 'srv-02', sublabel: 'CPU: 40→65%', layer: 0, color: '#f59e0b' },
  { id: 'srv-03', label: 'srv-03', layer: 0, color: '#71717a', opacity: 0.5 },
  { id: 'srv-04', label: 'srv-04', sublabel: 'mem: 4→8GB', layer: 0, color: '#f59e0b' },
  { id: 'srv-13', label: 'srv-13', layer: 0, color: '#22c55e', bg: '#22c55e15' },
  { id: 'srv-14', label: 'srv-14', layer: 0, color: '#22c55e', bg: '#22c55e15' },
  // Layer 1 — DATABASES
  { id: 'db-01', label: 'db-01', sublabel: 'pool: 100→200', layer: 1, color: '#f59e0b' },
  { id: 'db-02', label: 'db-02', layer: 1, color: '#71717a', opacity: 0.5 },
  { id: 'db-05', label: 'db-05', layer: 1, color: '#ef4444', dashed: true, bg: '#ef444415' },
  { id: 'db-07', label: 'db-07', layer: 1, color: '#22c55e', bg: '#22c55e15' },
  // Layer 2 — CACHES
  { id: 'cache-01', label: 'cache-01', sublabel: 'size: 2→4GB', layer: 2, color: '#f59e0b' },
  { id: 'cache-02', label: 'cache-02', sublabel: 'evict: LRU→LFU', layer: 2, color: '#f59e0b' },
  { id: 'cache-03', label: 'cache-03', layer: 2, color: '#ef4444', dashed: true, bg: '#ef444415' },
  { id: 'cache-05', label: 'cache-05', layer: 2, color: '#22c55e', bg: '#22c55e15' },
];

const diffTopoEdges: TopoEdge[] = [
  { source: 'srv-01', target: 'db-01', color: '#27273a' },
  { source: 'srv-02', target: 'db-01', color: '#27273a' },
  { source: 'srv-03', target: 'db-02', color: '#27273a' },
  { source: 'srv-04', target: 'db-02', color: '#27273a' },
  { source: 'srv-13', target: 'db-01', color: '#22c55e' },
  { source: 'srv-14', target: 'db-02', color: '#22c55e' },
  { source: 'db-01', target: 'cache-01', color: '#27273a' },
  { source: 'db-01', target: 'cache-02', color: '#27273a' },
  { source: 'db-02', target: 'cache-05', color: '#22c55e' },
  { source: 'db-05', target: 'cache-03', color: '#ef4444' },
];

const diffTopoLayerLabels: TopoLayerLabel[] = [
  { afterLayer: 0, text: '↓ connects_to ↓', color: '#71717a' },
  { afterLayer: 1, text: '↓ uses ↓', color: '#71717a' },
];

const diffTopoLegend: LegendEntry[] = [
  { color: '#22c55e', label: 'Added' },
  { color: '#ef4444', label: 'Removed' },
  { color: '#f59e0b', label: 'Modified' },
  { color: '#71717a', label: 'Unchanged' },
];

/* ══════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════ */
function SectionLabel({ children }: { children: string }) {
  return <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#71717a' }}>{children}</span>;
}

function Chip({ label, color, filled }: { label: string; color: string; filled?: boolean }) {
  return (
    <div style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 4, backgroundColor: filled ? color : `${color}20`, display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ fontSize: filled ? 9 : 10, fontWeight: 600, color: filled ? '#fff' : color }}>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   Page
   ══════════════════════════════════════════ */
export default function DiffAgentPage() {
  const [input, setInput] = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0a0a0f' }}>
      {/* ── Left Sidebar ── */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Share2 size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5' }}>Ontology</span>
        </div>
        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>ACTIVE AGENT</SectionLabel>
        <div style={{ padding: 12, borderRadius: 8, backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitCompareArrows size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Diff Agent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#22c55e' }}>Running</span>
          </div>
        </div>
        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>EXECUTION STEPS</SectionLabel>
        {executionSteps.map((step) => (
          <div key={step.number} style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, borderRadius: 6, backgroundColor: '#22c55e15', display: 'flex', alignItems: 'center', gap: 10, ...(step.active ? { border: '1px solid #22c55e' } : {}) }}>
            <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>
            <span style={{ fontSize: 12, color: '#22c55e' }}>{step.number}. {step.label}</span>
          </div>
        ))}
      </div>

      {/* ── Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76, paddingLeft: 24, paddingRight: 24, backgroundColor: '#0d0d14', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>Topology Diff Analysis</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Download size={14} />}>Export Log</Button>
            <Button danger icon={<Square size={14} />}>Stop Agent</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, backgroundColor: '#0a0a0f' }}>
          {/* ── Message 1: Select snapshots ── */}
          <MessageBubble name="Diff Agent" time="3 min ago" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              I've found available topology snapshots. Please select two to compare:
            </span>
            <ContentCard title="Select Snapshots">
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>BASE (older)</span>
                  <OptionRow selected label="Jan 28, 2025 — 09:00" description="27 nodes, 18 relations — before migration" />
                  <OptionRow label="Jan 21, 2025 — 09:00" description="26 nodes, 17 relations" />
                </div>
                <div style={{ width: 1, backgroundColor: '#27273a' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>HEAD (newer)</span>
                  <OptionRow selected label="Feb 04, 2025 — 09:00" description="31 nodes, 22 relations — current state" accent="#3b82f6" />
                  <OptionRow label="Feb 01, 2025 — 09:00" description="29 nodes, 20 relations" accent="#3b82f6" />
                </div>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '70%', borderRadius: '12px 12px 0 12px', backgroundColor: `${ACCENT}20`, border: `1px solid ${ACCENT}`, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>You</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>2 min ago</span>
              </div>
              <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5, textAlign: 'right' }}>
                Compare Jan 28 vs Feb 04. Show all changes.
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>U</span>
            </div>
          </div>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Diff Agent" accent={ACCENT} badge={{ label: 'COMPARING', color: ACCENT }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Computing differences between the two snapshots...
            </span>
            <ContentCard title="Diff Progress">
              {progressSteps.map((step) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>
                  <span style={{ fontSize: 13, color: '#22c55e', flex: 1 }}>{step.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#71717a' }}>{step.detail}</span>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: '#1a1a24', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', borderRadius: 3, backgroundColor: '#22c55e' }} />
                </div>
                <span style={{ fontSize: 11, color: '#22c55e' }}>Diff complete - 100%</span>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Diff Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Diff analysis complete. Found 12 changes between Jan 28 and Feb 04:
            </span>
            <div style={{ borderRadius: 12, backgroundColor: '#111118', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Topology Diff Report</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>Jan 28 → Feb 04</span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <SummaryCard value="4" label="Added" color="#22c55e" />
                <SummaryCard value="2" label="Removed" color="#ef4444" />
                <SummaryCard value="6" label="Modified" color="#f59e0b" />
              </div>

              {/* Visual diff */}
              <SectionLabel>TOPOLOGY DIFF</SectionLabel>
              <D3TopologyGraph
                nodeWidth={68}
                nodes={diffTopoNodes}
                edges={diffTopoEdges}
                layerLabels={diffTopoLayerLabels}
                legend={diffTopoLegend}
              />

              {/* Change details */}
              <SectionLabel>ADDED NODES</SectionLabel>
              <DiffDetailRow type="added" node="srv-13" description="New application server. 8 CPU, 16GB RAM. Connected to db-01 and db-07." />
              <DiffDetailRow type="added" node="srv-14" description="New application server. 8 CPU, 16GB RAM. Connected to db-02 and db-07." />
              <DiffDetailRow type="added" node="db-07" description="New PostgreSQL database. Replica of db-01 for read scaling." />
              <DiffDetailRow type="added" node="cache-05" description="New Redis cache instance. 4GB, LFU eviction. Replaces cache-03." />

              <SectionLabel>REMOVED NODES</SectionLabel>
              <DiffDetailRow type="removed" node="db-05" description="Decommissioned MySQL database. Data migrated to db-07." />
              <DiffDetailRow type="removed" node="cache-03" description="Replaced by cache-05 with larger memory and updated eviction policy." />

              <SectionLabel>MODIFIED NODES</SectionLabel>
              <DiffDetailRow type="modified" node="srv-02" description="CPU utilization increased from 40% to 65% after routing changes." property="cpu_usage" oldVal="40%" newVal="65%" />
              <DiffDetailRow type="modified" node="srv-04" description="Memory upgraded from 4GB to 8GB during maintenance window." property="memory" oldVal="4GB" newVal="8GB" />
              <DiffDetailRow type="modified" node="db-01" description="Connection pool expanded from 100 to 200 to handle new servers." property="max_pool" oldVal="100" newVal="200" />
              <DiffDetailRow type="modified" node="cache-01" description="Cache size doubled from 2GB to 4GB." property="size" oldVal="2GB" newVal="4GB" />
            </div>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Diff Agent" time="just now" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What would you like to do next?
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton label="Compare Other Snapshots" primary accent={ACCENT} />
              <ActionButton label="Export Diff Report" />
              <ActionButton label="Rollback Changes" />
              <ActionButton label="Validate Constraints" />
            </div>
          </MessageBubble>
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#0d0d14', flexShrink: 0 }}>
          <Input style={{ flex: 1 }} placeholder="Select snapshots to compare or describe a diff query..."
            value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="primary">
            Compare
          </Button>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Diff Context</span>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Base Snapshot</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>Jan 28, 2025 — 09:00</span>
          <span style={{ fontSize: 11, color: '#a1a1aa' }}>27 nodes · 18 relations</span>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Head Snapshot</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6' }}>Feb 04, 2025 — 09:00</span>
          <span style={{ fontSize: 11, color: '#a1a1aa' }}>31 nodes · 22 relations</span>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Change Summary</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Nodes added</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>+4</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Nodes removed</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>-2</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Nodes modified</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b' }}>~6</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Relations added</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>+4</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>CHANGE LOG</SectionLabel>
        {[
          { type: '+', node: 'srv-13', color: '#22c55e' },
          { type: '+', node: 'srv-14', color: '#22c55e' },
          { type: '+', node: 'db-07', color: '#22c55e' },
          { type: '+', node: 'cache-05', color: '#22c55e' },
          { type: '-', node: 'db-05', color: '#ef4444' },
          { type: '-', node: 'cache-03', color: '#ef4444' },
          { type: '~', node: 'srv-02', color: '#f59e0b' },
          { type: '~', node: 'srv-04', color: '#f59e0b' },
          { type: '~', node: 'db-01', color: '#f59e0b' },
          { type: '~', node: 'cache-01', color: '#f59e0b' },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: c.color, width: 14 }}>{c.type}</span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#a1a1aa' }}>{c.node}</span>
          </div>
        ))}

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <div style={{ borderRadius: 10, backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: ACCENT }}>DIFF COMPLETE</span>
          {executionStats.map((s) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: s.valueColor ?? '#f4f4f5' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function MessageBubble({ name, time, badge, children, accent }: { name: string; time?: string; accent?: string; badge?: { label: string; color: string }; children: React.ReactNode }) {
  const a = accent ?? 'var(--primary-color)';
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: a, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>AI</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: a }}>{name}</span>
          {badge && <Chip label={badge.label} color={badge.color} />}
          {time && <span style={{ fontSize: 11, color: '#71717a' }}>{time}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 12, backgroundColor: '#111118', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a' }}>{title}</span>
      {children}
    </div>
  );
}

function OptionRow({ label, description, selected, accent }: { label: string; description: string; selected?: boolean; accent?: string }) {
  const a = accent ?? ACCENT;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 8, border: `1px solid ${selected ? a : '#27273a'}`, ...(selected ? { backgroundColor: `${a}15` } : {}) }}>
      {selected ? (
        <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: a, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></div>
      ) : (
        <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #71717a' }} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? '#f4f4f5' : '#a1a1aa' }}>{label}</span>
        <span style={{ fontSize: 11, color: selected ? '#a1a1aa' : '#71717a' }}>{description}</span>
      </div>
    </div>
  );
}

function SummaryCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ flex: 1, borderRadius: 8, backgroundColor: `${color}15`, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color }}>{value}</span>
      <span style={{ fontSize: 11, color }}>{label}</span>
    </div>
  );
}

function DiffDetailRow({ type, node, description, property, oldVal, newVal }: {
  type: 'added' | 'removed' | 'modified'; node: string; description: string; property?: string; oldVal?: string; newVal?: string;
}) {
  const colors: Record<string, string> = { added: '#22c55e', removed: '#ef4444', modified: '#f59e0b' };
  const c = colors[type];
  return (
    <div style={{ display: 'flex', gap: 10, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 8, backgroundColor: `${c}10`, border: `1px solid ${c}40` }}>
      <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{type === 'added' ? '+' : type === 'removed' ? '-' : '~'}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#f4f4f5' }}>{node}</span>
        <span style={{ fontSize: 11, color: '#a1a1aa' }}>{description}</span>
        {property && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#71717a' }}>{property}:</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444', textDecoration: 'line-through' }}>{oldVal}</span>
            <span style={{ fontSize: 10, color: '#71717a' }}>→</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#22c55e' }}>{newVal}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ label, primary, accent }: { label: string; primary?: boolean; accent?: string }) {
  const a = accent ?? 'var(--primary-color)';
  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 8, backgroundColor: primary ? `${a}20` : '#1a1a24', border: `1px solid ${primary ? a : '#27273a'}`, cursor: 'pointer' }}>
      <span style={{ fontSize: 13, color: primary ? a : '#a1a1aa' }}>{label}</span>
    </div>
  );
}
