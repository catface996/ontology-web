import { useState } from 'react';
import {
  Box, Typography, Button, TextField,
} from '@mui/material';
import {
  Share2, Check, Download, Square, ArrowLeftCircle,
} from 'lucide-react';
import D3TopologyGraph from '../components/D3TopologyGraph';
import type { TopoNode, TopoEdge, TopoLayerLabel, LegendEntry } from '../components/D3TopologyGraph';

/* ══════════════════════════════════════════
   Data
   ══════════════════════════════════════════ */
const ACCENT = '#a855f7';

const executionSteps = [
  { number: 1, label: 'Identify Symptom', completed: true },
  { number: 2, label: 'Backward Traverse', completed: true },
  { number: 3, label: 'Analyze Dependencies', completed: true, active: true },
  { number: 4, label: 'Root Cause Detection', completed: true },
  { number: 5, label: 'Report Findings', completed: true },
];

const progressSteps = [
  { label: 'Tracing api-01 upstream dependencies', detail: '3 hops' },
  { label: 'Analyzing cache-02 health metrics', detail: 'degraded' },
  { label: 'Analyzing db-02 query performance', detail: 'slow queries' },
  { label: 'Correlating root cause signals', detail: 'complete' },
];

const executionStats = [
  { label: 'Nodes traced', value: '9' },
  { label: 'Root causes found', value: '2' },
  { label: 'Duration', value: '3.5s', valueColor: '#22c55e' },
];

const backwardTraceNodes: TopoNode[] = [
  { id: 'api-01', label: 'api-01', sublabel: 'P99: 2.1s', layer: 0, color: '#ef4444', glow: true },
  { id: 'cache-02', label: 'cache-02', sublabel: 'Hit rate: 34%', layer: 1, color: '#fbbf24' },
  { id: 'cache-01', label: 'cache-01', sublabel: 'Hit rate: 91%', layer: 1, color: '#22c55e', opacity: 0.4 },
  { id: 'db-02', label: 'db-02', sublabel: 'Avg query: 450ms', layer: 2, color: '#f59e0b' },
  { id: 'disk-vol-07', label: 'disk-vol-07', sublabel: 'I/O wait: 82%', layer: 3, color: '#ef4444', glow: true, badge: 'ROOT CAUSE' },
  { id: 'mem-pool-02', label: 'mem-pool-02', sublabel: 'Swap: 3.2GB', layer: 3, color: '#ef4444', glow: true, badge: 'ROOT CAUSE' },
];

const backwardTraceEdges: TopoEdge[] = [
  { source: 'api-01', target: 'cache-02' },
  { source: 'api-01', target: 'cache-01' },
  { source: 'cache-02', target: 'db-02' },
  { source: 'db-02', target: 'disk-vol-07' },
  { source: 'db-02', target: 'mem-pool-02' },
];

const backwardTraceLayerLabels: TopoLayerLabel[] = [
  { afterLayer: 0, text: '\u2191 served_by', color: '#a855f7' },
  { afterLayer: 1, text: '\u2191 backed_by', color: '#a855f7' },
  { afterLayer: 2, text: '\u2191 hosted_on', color: '#a855f7' },
];

const backwardTraceLegend: LegendEntry[] = [
  { color: '#ef4444', label: 'Root cause / Symptom' },
  { color: '#fbbf24', label: 'Degraded' },
  { color: '#22c55e', label: 'Healthy' },
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
export default function BackwardAgentPage() {
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
              <ArrowLeftCircle size={14} color="#fff" />
            </Box>
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Backward Agent</Typography>
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
          <Typography fontSize={18} fontWeight={600} color="#f4f4f5">Backward Root Cause Analysis</Typography>
          <Box display="flex" gap={1.5}>
            <Button size="small" variant="outlined" startIcon={<Download size={14} />}
              sx={{ borderColor: '#27273a', color: '#a1a1aa', bgcolor: '#1a1a24', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#71717a', bgcolor: '#1a1a24' } }}>Export Log</Button>
            <Button size="small" variant="outlined" startIcon={<Square size={14} />}
              sx={{ borderColor: '#ef4444', color: '#ef4444', bgcolor: '#ef444420', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444430' } }}>Stop Agent</Button>
          </Box>
        </Box>

        <Box flex={1} overflow="auto" px={3} py={3} display="flex" flexDirection="column" gap={2.5} sx={{ bgcolor: '#0a0a0f' }}>
          {/* ── Message 1: Symptom ── */}
          <MessageBubble name="Backward Agent" time="4 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Please describe the symptom you're observing, or select a node showing anomalous behavior:
            </Typography>
            <ContentCard title="Detected Anomalies">
              <OptionRow selected label="api-01 — Response time > 2s" description="P99 latency spiked from 400ms to 2.1s in the last 15 minutes" />
              <OptionRow label="lb-01 — 5xx error rate 12%" description="Error rate increased from 0.1% to 12% in the last hour" />
              <OptionRow label="cache-03 — Eviction rate high" description="Cache evictions jumped 4× indicating memory pressure" />
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <Box display="flex" gap={1.5} justifyContent="flex-end">
            <Box sx={{ maxWidth: '70%', borderRadius: '12px 12px 0 12px', bgcolor: `${ACCENT}20`, border: 1, borderColor: ACCENT, px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontSize={13} fontWeight={600} sx={{ color: ACCENT }}>You</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>3 min ago</Typography>
              </Box>
              <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5} textAlign="right">
                Investigate api-01 response time spike. Find the root cause.
              </Typography>
            </Box>
            <Box width={36} height={36} borderRadius="50%" bgcolor="#3b82f6" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Typography fontSize={14} fontWeight={700} color="#fff">U</Typography>
            </Box>
          </Box>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Backward Agent" accent={ACCENT} badge={{ label: 'TRACING', color: ACCENT }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Tracing backward from api-01 through the dependency chain...
            </Typography>
            <ContentCard title="Backward Trace Progress">
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
                <Typography fontSize={11} sx={{ color: '#22c55e' }}>Trace complete - 100%</Typography>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Backward Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Root cause analysis complete. I traced 3 hops backward from api-01 and identified 2 root causes:
            </Typography>
            <Box sx={{ borderRadius: 3, bgcolor: '#111118', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Root Cause Analysis Report</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>Symptom: api-01 latency</Typography>
              </Box>

              <Box display="flex" gap={1.5}>
                <SummaryCard value="2" label="Root Causes" color="#ef4444" />
                <SummaryCard value="3" label="Hops Deep" color={ACCENT} />
                <SummaryCard value="85%" label="Confidence" color="#22c55e" />
              </Box>

              {/* Backward trace visualization */}
              <SectionLabel>BACKWARD TRACE</SectionLabel>
              <D3TopologyGraph
                nodes={backwardTraceNodes}
                edges={backwardTraceEdges}
                layerLabels={backwardTraceLayerLabels}
                legend={backwardTraceLegend}
                nodeWidth={80}
                nodeHeight={48}
              />

              {/* Root cause details */}
              <SectionLabel>ROOT CAUSE DETAILS</SectionLabel>
              <RootCauseCard
                number={1}
                title="disk-vol-07 — High I/O Wait"
                confidence="85%"
                description="Storage volume serving db-02 has 82% I/O wait time. Slow disk reads cause query execution delays (avg 450ms → normally 40ms). This propagates through cache-02 (reduced hit rate due to timeouts) to api-01."
                path="api-01 ← cache-02 ← db-02 ← disk-vol-07"
              />
              <RootCauseCard
                number={2}
                title="mem-pool-02 — Memory Swapping"
                confidence="72%"
                description="Memory pool for db-02 is swapping 3.2GB to disk. Combined with disk I/O contention, this amplifies query latency. Likely triggered by a bulk import job running concurrently."
                path="api-01 ← cache-02 ← db-02 ← mem-pool-02"
              />

              {/* Recommendations */}
              <SectionLabel>RECOMMENDATIONS</SectionLabel>
              <RecommendationRow number={1} title="Migrate disk-vol-07 to SSD-backed storage"
                description="Replace HDD volume with SSD to eliminate I/O bottleneck. Expected query time improvement: 450ms → ~50ms." />
              <RecommendationRow number={2} title="Increase memory allocation for db-02"
                description="Allocate additional 4GB RAM to mem-pool-02 to eliminate swapping. Schedule bulk imports during off-peak hours." />
            </Box>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Backward Agent" time="just now" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What would you like to do next?
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <ActionButton label="Investigate Another Symptom" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Forward from disk-vol-07" />
              <ActionButton label="Apply Fixes" />
            </Box>
          </MessageBubble>
        </Box>

        {/* Input Area */}
        <Box display="flex" alignItems="center" gap={1.5} px={3} py={2} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}>
          <TextField fullWidth size="small" placeholder="Describe a symptom to trace backward..."
            value={input} onChange={(e) => setInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#1a1a24', fontSize: 14, '& fieldset': { borderColor: '#27273a' }, '&:hover fieldset': { borderColor: '#71717a' } } }} />
          <Button variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9333ea' }, textTransform: 'none', fontWeight: 600, fontSize: 14, borderRadius: 2, px: 2.5, py: 1.5, whiteSpace: 'nowrap' }}>
            Trace Back
          </Button>
        </Box>
      </Box>

      {/* ── Right Context Panel ── */}
      <Box width={340} flexShrink={0} display="flex" flexDirection="column" gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}>
        <Typography fontSize={16} fontWeight={600} color="#f4f4f5">Trace Context</Typography>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Symptom Node</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={20} borderRadius={1} bgcolor="#ef4444" />
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">api-01 (APIGateway)</Typography>
          </Box>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Analysis Type</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: ACCENT }}>Root Cause Detection</Typography>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Symptom Metrics</Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>P99 Latency</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444' }}>2.1s</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Normal P99</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#22c55e' }}>400ms</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Degradation</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444' }}>5.25×</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>TRACE PATH</SectionLabel>
        {[
          { hop: 'Symptom', node: 'api-01', status: 'P99: 2.1s', color: '#ef4444' },
          { hop: 'Hop 1', node: 'cache-02', status: 'Hit: 34%', color: '#fbbf24' },
          { hop: 'Hop 2', node: 'db-02', status: 'Query: 450ms', color: '#f59e0b' },
          { hop: 'Root', node: 'disk-vol-07', status: 'I/O: 82%', color: '#ef4444' },
        ].map((r) => (
          <Box key={r.node} display="flex" alignItems="center" gap={1}>
            <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" sx={{ color: '#71717a', width: 52 }}>{r.hop}</Typography>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#a1a1aa', flex: 1 }}>{r.node}</Typography>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color: r.color }}>{r.status}</Typography>
          </Box>
        ))}

        <Box height="1px" bgcolor="#27273a" />

        <Box sx={{ borderRadius: 2.5, bgcolor: `${ACCENT}10`, border: 1, borderColor: ACCENT, p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={10} fontWeight={600} letterSpacing={1} sx={{ color: ACCENT }}>TRACE COMPLETE</Typography>
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

function OptionRow({ label, description, selected }: { label: string; description: string; selected?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25, borderRadius: 2, border: 1, borderColor: selected ? ACCENT : '#27273a', ...(selected ? { bgcolor: `${ACCENT}15` } : {}) }}>
      {selected ? (
        <Box width={18} height={18} borderRadius={1} bgcolor={ACCENT} display="flex" alignItems="center" justifyContent="center"><Check size={12} color="#fff" /></Box>
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

function RootCauseCard({ number, title, confidence, description, path }: { number: number; title: string; confidence: string; description: string; path: string }) {
  return (
    <Box sx={{ borderRadius: 2.5, bgcolor: '#ef444410', border: 1, borderColor: '#ef4444', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={24} height={24} borderRadius="50%" bgcolor="#ef4444" display="flex" alignItems="center" justifyContent="center">
            <Typography fontSize={12} fontWeight={600} color="#fff">{number}</Typography>
          </Box>
          <Typography fontSize={13} fontWeight={600} color="#f4f4f5">{title}</Typography>
        </Box>
        <Chip label={`${confidence} confidence`} color="#22c55e" />
      </Box>
      <Typography fontSize={12} color="#a1a1aa" lineHeight={1.5}>{description}</Typography>
      <Box display="flex" alignItems="center" gap={0.75}>
        <Typography fontSize={11} sx={{ color: '#71717a' }}>Path:</Typography>
        <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>{path}</Typography>
      </Box>
    </Box>
  );
}

function RecommendationRow({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: `${ACCENT}10` }}>
      <Box width={24} height={24} borderRadius="50%" bgcolor={ACCENT} display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <Typography fontSize={12} fontWeight={600} color="#fff">{number}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography fontSize={13} fontWeight={600} color="#f4f4f5">{title}</Typography>
        <Typography fontSize={12} color="#a1a1aa" lineHeight={1.4}>{description}</Typography>
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
