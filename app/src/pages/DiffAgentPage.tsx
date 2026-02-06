import { useState } from 'react';
import {
  Box, Typography, Button, TextField,
} from '@mui/material';
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
  return <Typography fontSize={11} fontWeight={600} letterSpacing={1} sx={{ color: '#71717a' }}>{children}</Typography>;
}

function Chip({ label, color, filled }: { label: string; color: string; filled?: boolean }) {
  return (
    <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: filled ? color : `${color}20`, display: 'inline-flex', alignItems: 'center' }}>
      <Typography fontSize={filled ? 9 : 10} fontWeight={600} sx={{ color: filled ? '#fff' : color }}>{label}</Typography>
    </Box>
  );
}

/* ══════════════════════════════════════════
   Page
   ══════════════════════════════════════════ */
export default function DiffAgentPage() {
  const [input, setInput] = useState('');

  return (
    <Box display="flex" height="100vh" overflow="hidden" bgcolor="#0a0a0f">
      {/* ── Left Sidebar ── */}
      <Box width={260} flexShrink={0} display="flex" flexDirection="column" gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}>
        <Box display="flex" alignItems="center" gap={1.25} height={40}>
          <Box width={32} height={32} borderRadius={2} bgcolor="#8b5cf6" display="flex" alignItems="center" justifyContent="center">
            <Share2 size={16} color="#fff" />
          </Box>
          <Typography fontSize={18} fontWeight={700} color="#f4f4f5">Ontology</Typography>
        </Box>
        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>ACTIVE AGENT</SectionLabel>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${ACCENT}15`, border: 1, borderColor: ACCENT, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={28} height={28} borderRadius={1.5} bgcolor={ACCENT} display="flex" alignItems="center" justifyContent="center">
              <GitCompareArrows size={14} color="#fff" />
            </Box>
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Diff Agent</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box width={8} height={8} borderRadius={1} bgcolor="#22c55e" />
            <Typography fontSize={11} sx={{ color: '#22c55e' }}>Running</Typography>
          </Box>
        </Box>
        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>EXECUTION STEPS</SectionLabel>
        {executionSteps.map((step) => (
          <Box key={step.number} sx={{ px: 1.25, py: 1, borderRadius: 1.5, bgcolor: '#22c55e15', display: 'flex', alignItems: 'center', gap: 1.25, ...(step.active ? { border: 1, borderColor: '#22c55e' } : {}) }}>
            <Typography fontSize={12} sx={{ color: '#22c55e' }}>✓</Typography>
            <Typography fontSize={12} sx={{ color: '#22c55e' }}>{step.number}. {step.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Chat Panel ── */}
      <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between" height={76} px={3} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}>
          <Typography fontSize={18} fontWeight={600} color="#f4f4f5">Topology Diff Analysis</Typography>
          <Box display="flex" gap={1.5}>
            <Button size="small" variant="outlined" startIcon={<Download size={14} />}
              sx={{ borderColor: '#27273a', color: '#a1a1aa', bgcolor: '#1a1a24', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#71717a', bgcolor: '#1a1a24' } }}>Export Log</Button>
            <Button size="small" variant="outlined" startIcon={<Square size={14} />}
              sx={{ borderColor: '#ef4444', color: '#ef4444', bgcolor: '#ef444420', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444430' } }}>Stop Agent</Button>
          </Box>
        </Box>

        <Box flex={1} overflow="auto" px={3} py={3} display="flex" flexDirection="column" gap={2.5} sx={{ bgcolor: '#0a0a0f' }}>
          {/* ── Message 1: Select snapshots ── */}
          <MessageBubble name="Diff Agent" time="3 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              I've found available topology snapshots. Please select two to compare:
            </Typography>
            <ContentCard title="Select Snapshots">
              <Box display="flex" gap={2}>
                <Box flex={1} display="flex" flexDirection="column" gap={1}>
                  <Typography fontSize={11} fontWeight={600} sx={{ color: ACCENT }}>BASE (older)</Typography>
                  <OptionRow selected label="Jan 28, 2025 — 09:00" description="27 nodes, 18 relations — before migration" />
                  <OptionRow label="Jan 21, 2025 — 09:00" description="26 nodes, 17 relations" />
                </Box>
                <Box width="1px" bgcolor="#27273a" />
                <Box flex={1} display="flex" flexDirection="column" gap={1}>
                  <Typography fontSize={11} fontWeight={600} sx={{ color: '#3b82f6' }}>HEAD (newer)</Typography>
                  <OptionRow selected label="Feb 04, 2025 — 09:00" description="31 nodes, 22 relations — current state" accent="#3b82f6" />
                  <OptionRow label="Feb 01, 2025 — 09:00" description="29 nodes, 20 relations" accent="#3b82f6" />
                </Box>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <Box display="flex" gap={1.5} justifyContent="flex-end">
            <Box sx={{ maxWidth: '70%', borderRadius: '12px 12px 0 12px', bgcolor: `${ACCENT}20`, border: 1, borderColor: ACCENT, px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontSize={13} fontWeight={600} sx={{ color: ACCENT }}>You</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>2 min ago</Typography>
              </Box>
              <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5} textAlign="right">
                Compare Jan 28 vs Feb 04. Show all changes.
              </Typography>
            </Box>
            <Box width={36} height={36} borderRadius="50%" bgcolor="#3b82f6" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Typography fontSize={14} fontWeight={700} color="#fff">U</Typography>
            </Box>
          </Box>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Diff Agent" accent={ACCENT} badge={{ label: 'COMPARING', color: ACCENT }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Computing differences between the two snapshots...
            </Typography>
            <ContentCard title="Diff Progress">
              {progressSteps.map((step) => (
                <Box key={step.label} display="flex" alignItems="center" gap={1.25} width="100%">
                  <Typography fontSize={12} sx={{ color: '#22c55e' }}>✓</Typography>
                  <Typography fontSize={13} sx={{ color: '#22c55e', flex: 1 }}>{step.label}</Typography>
                  <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#71717a' }}>{step.detail}</Typography>
                </Box>
              ))}
              <Box display="flex" flexDirection="column" gap={0.75} width="100%">
                <Box height={6} borderRadius={0.75} bgcolor="#1a1a24" overflow="hidden">
                  <Box height="100%" width="100%" borderRadius={0.75} bgcolor="#22c55e" />
                </Box>
                <Typography fontSize={11} sx={{ color: '#22c55e' }}>Diff complete - 100%</Typography>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Diff Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Diff analysis complete. Found 12 changes between Jan 28 and Feb 04:
            </Typography>
            <Box sx={{ borderRadius: 3, bgcolor: '#111118', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Topology Diff Report</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>Jan 28 → Feb 04</Typography>
              </Box>

              <Box display="flex" gap={1.5}>
                <SummaryCard value="4" label="Added" color="#22c55e" />
                <SummaryCard value="2" label="Removed" color="#ef4444" />
                <SummaryCard value="6" label="Modified" color="#f59e0b" />
              </Box>

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
            </Box>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Diff Agent" time="just now" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What would you like to do next?
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <ActionButton label="Compare Other Snapshots" primary accent={ACCENT} />
              <ActionButton label="Export Diff Report" />
              <ActionButton label="Rollback Changes" />
              <ActionButton label="Validate Constraints" />
            </Box>
          </MessageBubble>
        </Box>

        {/* Input Area */}
        <Box display="flex" alignItems="center" gap={1.5} px={3} py={2} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}>
          <TextField fullWidth size="small" placeholder="Select snapshots to compare or describe a diff query..."
            value={input} onChange={(e) => setInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#1a1a24', fontSize: 14, '& fieldset': { borderColor: '#27273a' }, '&:hover fieldset': { borderColor: '#71717a' } } }} />
          <Button variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 600, fontSize: 14, borderRadius: 2, px: 2.5, py: 1.5, whiteSpace: 'nowrap', color: '#fff' }}>
            Compare
          </Button>
        </Box>
      </Box>

      {/* ── Right Context Panel ── */}
      <Box width={340} flexShrink={0} display="flex" flexDirection="column" gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}>
        <Typography fontSize={16} fontWeight={600} color="#f4f4f5">Diff Context</Typography>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Base Snapshot</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: ACCENT }}>Jan 28, 2025 — 09:00</Typography>
          <Typography fontSize={11} sx={{ color: '#a1a1aa' }}>27 nodes · 18 relations</Typography>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Head Snapshot</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: '#3b82f6' }}>Feb 04, 2025 — 09:00</Typography>
          <Typography fontSize={11} sx={{ color: '#a1a1aa' }}>31 nodes · 22 relations</Typography>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Change Summary</Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Nodes added</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#22c55e' }}>+4</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Nodes removed</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444' }}>-2</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Nodes modified</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#f59e0b' }}>~6</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Relations added</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#22c55e' }}>+4</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

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
          <Box key={i} display="flex" alignItems="center" gap={1}>
            <Typography fontSize={12} fontFamily="JetBrains Mono, monospace" fontWeight={700} sx={{ color: c.color, width: 14 }}>{c.type}</Typography>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#a1a1aa' }}>{c.node}</Typography>
          </Box>
        ))}

        <Box height="1px" bgcolor="#27273a" />

        <Box sx={{ borderRadius: 2.5, bgcolor: `${ACCENT}10`, border: 1, borderColor: ACCENT, p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={10} fontWeight={600} letterSpacing={1} sx={{ color: ACCENT }}>DIFF COMPLETE</Typography>
          {executionStats.map((s) => (
            <Box key={s.label} display="flex" justifyContent="space-between">
              <Typography fontSize={12} sx={{ color: '#a1a1aa' }}>{s.label}</Typography>
              <Typography fontSize={12} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: s.valueColor ?? '#f4f4f5' }}>{s.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function MessageBubble({ name, time, badge, children, accent }: { name: string; time?: string; accent?: string; badge?: { label: string; color: string }; children: React.ReactNode }) {
  const a = accent ?? '#8b5cf6';
  return (
    <Box display="flex" gap={1.5}>
      <Box width={36} height={36} borderRadius="50%" bgcolor={a} display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <Typography fontSize={12} fontWeight={700} color="#fff">AI</Typography>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontSize={14} fontWeight={600} sx={{ color: a }}>{name}</Typography>
          {badge && <Chip label={badge.label} color={badge.color} />}
          {time && <Typography fontSize={11} sx={{ color: '#71717a' }}>{time}</Typography>}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ borderRadius: 3, bgcolor: '#111118', p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Typography fontSize={12} fontWeight={600} sx={{ color: '#71717a' }}>{title}</Typography>
      {children}
    </Box>
  );
}

function OptionRow({ label, description, selected, accent }: { label: string; description: string; selected?: boolean; accent?: string }) {
  const a = accent ?? ACCENT;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25, borderRadius: 2, border: 1, borderColor: selected ? a : '#27273a', ...(selected ? { bgcolor: `${a}15` } : {}) }}>
      {selected ? (
        <Box width={18} height={18} borderRadius={1} bgcolor={a} display="flex" alignItems="center" justifyContent="center"><Check size={12} color="#fff" /></Box>
      ) : (
        <Box width={18} height={18} borderRadius={1} sx={{ border: 1, borderColor: '#71717a' }} />
      )}
      <Box display="flex" flexDirection="column" gap={0.25}>
        <Typography fontSize={13} fontWeight={selected ? 600 : 400} sx={{ color: selected ? '#f4f4f5' : '#a1a1aa' }}>{label}</Typography>
        <Typography fontSize={11} sx={{ color: selected ? '#a1a1aa' : '#71717a' }}>{description}</Typography>
      </Box>
    </Box>
  );
}

function SummaryCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <Box sx={{ flex: 1, borderRadius: 2, bgcolor: `${color}15`, p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Typography fontSize={28} fontWeight={700} fontFamily="JetBrains Mono, monospace" sx={{ color }}>{value}</Typography>
      <Typography fontSize={11} sx={{ color }}>{label}</Typography>
    </Box>
  );
}

function DiffDetailRow({ type, node, description, property, oldVal, newVal }: {
  type: 'added' | 'removed' | 'modified'; node: string; description: string; property?: string; oldVal?: string; newVal?: string;
}) {
  const colors: Record<string, string> = { added: '#22c55e', removed: '#ef4444', modified: '#f59e0b' };
  const c = colors[type];
  return (
    <Box sx={{ display: 'flex', gap: 1.25, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: `${c}10`, border: 1, borderColor: `${c}40` }}>
      <Box width={20} height={20} borderRadius={1} bgcolor={c} display="flex" alignItems="center" justifyContent="center" flexShrink={0} mt={0.25}>
        <Typography fontSize={12} fontWeight={700} color="#fff">{type === 'added' ? '+' : type === 'removed' ? '-' : '~'}</Typography>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" gap={0.5}>
        <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" color="#f4f4f5">{node}</Typography>
        <Typography fontSize={11} sx={{ color: '#a1a1aa' }}>{description}</Typography>
        {property && (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" sx={{ color: '#71717a' }}>{property}:</Typography>
            <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444', textDecoration: 'line-through' }}>{oldVal}</Typography>
            <Typography fontSize={10} sx={{ color: '#71717a' }}>→</Typography>
            <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color: '#22c55e' }}>{newVal}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ActionButton({ label, primary, accent }: { label: string; primary?: boolean; accent?: string }) {
  const a = accent ?? '#8b5cf6';
  return (
    <Box sx={{ px: 2, py: 1.25, borderRadius: 2, bgcolor: primary ? `${a}20` : '#1a1a24', border: 1, borderColor: primary ? a : '#27273a', cursor: 'pointer', '&:hover': { borderColor: primary ? a : '#71717a' } }}>
      <Typography fontSize={13} sx={{ color: primary ? a : '#a1a1aa' }}>{label}</Typography>
    </Box>
  );
}
