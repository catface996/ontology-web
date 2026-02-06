import { useState } from 'react';
import {
  Box, Typography, Button, TextField,
} from '@mui/material';
import {
  Share2, Check, Download, Square, ArrowRightCircle,
} from 'lucide-react';
import D3TopologyGraph from '../components/D3TopologyGraph';
import type { TopoNode, TopoEdge, TopoLayerLabel, LegendEntry } from '../components/D3TopologyGraph';

/* ══════════════════════════════════════════
   Types & Data
   ══════════════════════════════════════════ */
const ACCENT = '#06b6d4';

const executionSteps = [
  { number: 1, label: 'Select Source Node', completed: true },
  { number: 2, label: 'Define Change Event', completed: true },
  { number: 3, label: 'Forward Traverse', completed: true, active: true },
  { number: 4, label: 'Calculate Propagation', completed: true },
  { number: 5, label: 'Report Impacts', completed: true },
];

const progressSteps = [
  { label: 'Propagating from db-02 → downstream', detail: '6 paths' },
  { label: 'Evaluating cache layer impact', detail: '4 nodes' },
  { label: 'Evaluating API gateway impact', detail: '2 nodes' },
  { label: 'Calculating cumulative latency', detail: 'complete' },
];

const executionStats = [
  { label: 'Nodes traversed', value: '14' },
  { label: 'Propagation depth', value: '3' },
  { label: 'Duration', value: '2.8s', valueColor: '#22c55e' },
];

/* ── Propagation Chain graph data ── */
const propagationNodes: TopoNode[] = [
  { id: 'db-02', label: 'db-02', sublabel: '+200ms', layer: 0, color: '#ef4444', glow: true, bg: '#ef444415' },
  { id: 'cache-01', label: 'cache-01', sublabel: '+200ms', layer: 1, color: '#fbbf24' },
  { id: 'cache-02', label: 'cache-02', sublabel: '+200ms', layer: 1, color: '#fbbf24' },
  { id: 'cache-03', label: 'cache-03', sublabel: '+200ms', layer: 1, color: '#fbbf24' },
  { id: 'cache-04', label: 'cache-04', sublabel: '+200ms', layer: 1, color: '#fbbf24' },
  { id: 'api-01', label: 'api-01', sublabel: '+340ms', layer: 2, color: '#f59e0b' },
  { id: 'api-02', label: 'api-02', sublabel: '+340ms', layer: 2, color: '#f59e0b' },
  { id: 'lb-01', label: 'lb-01', sublabel: '+540ms', layer: 3, color: '#ef4444' },
  { id: 'lb-02', label: 'lb-02', sublabel: '+540ms', layer: 3, color: '#ef4444' },
];

const propagationEdges: TopoEdge[] = [
  // db-02 → all 4 caches
  { source: 'db-02', target: 'cache-01', color: '#fbbf24' },
  { source: 'db-02', target: 'cache-02', color: '#fbbf24' },
  { source: 'db-02', target: 'cache-03', color: '#fbbf24' },
  { source: 'db-02', target: 'cache-04', color: '#fbbf24' },
  // caches → apis
  { source: 'cache-01', target: 'api-01', color: '#f59e0b' },
  { source: 'cache-02', target: 'api-01', color: '#f59e0b' },
  { source: 'cache-03', target: 'api-02', color: '#f59e0b' },
  { source: 'cache-04', target: 'api-02', color: '#f59e0b' },
  // apis → lbs
  { source: 'api-01', target: 'lb-01', color: '#ef4444' },
  { source: 'api-02', target: 'lb-02', color: '#ef4444' },
];

const propagationLayerLabels: TopoLayerLabel[] = [
  { afterLayer: 0, text: 'uses (\u00d74 connections)', color: '#06b6d4' },
  { afterLayer: 1, text: 'serves (\u00d72 connections each)', color: '#06b6d4' },
  { afterLayer: 2, text: 'routes_to', color: '#06b6d4' },
];

const propagationLegend: LegendEntry[] = [
  { color: '#06b6d4', label: 'Source' },
  { color: '#fbbf24', label: '+200ms' },
  { color: '#f59e0b', label: '+340ms' },
  { color: '#ef4444', label: '+540ms' },
];

/* ══════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════ */
function SectionLabel({ children }: { children: string }) {
  return (
    <Typography fontSize={11} fontWeight={600} letterSpacing={1} sx={{ color: '#71717a' }}>
      {children}
    </Typography>
  );
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
export default function ForwardAgentPage() {
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
              <ArrowRightCircle size={14} color="#fff" />
            </Box>
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Forward Agent</Typography>
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
          <Typography fontSize={18} fontWeight={600} color="#f4f4f5">Forward Propagation Analysis</Typography>
          <Box display="flex" gap={1.5}>
            <Button size="small" variant="outlined" startIcon={<Download size={14} />}
              sx={{ borderColor: '#27273a', color: '#a1a1aa', bgcolor: '#1a1a24', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#71717a', bgcolor: '#1a1a24' } }}>
              Export Log
            </Button>
            <Button size="small" variant="outlined" startIcon={<Square size={14} />}
              sx={{ borderColor: '#ef4444', color: '#ef4444', bgcolor: '#ef444420', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444430' } }}>
              Stop Agent
            </Button>
          </Box>
        </Box>

        <Box flex={1} overflow="auto" px={3} py={3} display="flex" flexDirection="column" gap={2.5} sx={{ bgcolor: '#0a0a0f' }}>
          {/* ── Message 1: Source node ── */}
          <MessageBubble name="Forward Agent" time="3 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              I've loaded the topology. Please select the source node and the change event to propagate forward:
            </Typography>
            <ContentCard title="Select Source Node">
              <OptionRow selected label="db-02 (Database)" description="Central database — 8 downstream dependents" accent={ACCENT} />
              <OptionRow label="srv-03 (Server)" description="Application server — 4 downstream dependents" accent={ACCENT} />
              <OptionRow label="cache-01 (CacheNode)" description="Cache layer — 2 downstream dependents" accent={ACCENT} />
            </ContentCard>
          </MessageBubble>

          {/* ── Message 2: Define change ── */}
          <MessageBubble name="Forward Agent" time="2 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What change event should I propagate from <strong>db-02</strong>?
            </Typography>
            <ContentCard title="Change Event">
              <OptionRow selected label="Latency +200ms" description="Database response time increases by 200ms" accent={ACCENT} />
              <OptionRow label="Throughput -50%" description="Database throughput drops by half" accent={ACCENT} />
              <OptionRow label="Connection limit reached" description="Max connections hit — new requests queued" accent={ACCENT} />
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
                Propagate latency +200ms from db-02 and show all downstream impact.
              </Typography>
            </Box>
            <Box width={36} height={36} borderRadius="50%" bgcolor="#3b82f6" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Typography fontSize={14} fontWeight={700} color="#fff">U</Typography>
            </Box>
          </Box>

          {/* ── Message 3: Progress ── */}
          <MessageBubble name="Forward Agent" accent={ACCENT} badge={{ label: 'PROPAGATING', color: ACCENT }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Propagating latency change forward through topology from db-02...
            </Typography>
            <ContentCard title="Propagation Progress">
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
                <Typography fontSize={11} sx={{ color: '#22c55e' }}>Propagation complete - 100%</Typography>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 4: Results ── */}
          <MessageBubble name="Forward Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Forward propagation complete. A +200ms latency at db-02 cascades through 3 layers affecting 8 nodes:
            </Typography>
            <Box sx={{ borderRadius: 3, bgcolor: '#111118', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Forward Propagation Report</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>Source: db-02 (+200ms)</Typography>
              </Box>

              <Box display="flex" gap={1.5}>
                <SummaryCard value="3" label="Layers Deep" color={ACCENT} />
                <SummaryCard value="8" label="Nodes Hit" color="#fbbf24" />
                <SummaryCard value="+540ms" label="Max Latency" color="#ef4444" />
              </Box>

              {/* Propagation chain */}
              <SectionLabel>PROPAGATION CHAIN</SectionLabel>
              <D3TopologyGraph
                nodes={propagationNodes}
                edges={propagationEdges}
                layerLabels={propagationLayerLabels}
                legend={propagationLegend}
              />

              {/* Impact details */}
              <SectionLabel>IMPACT DETAILS</SectionLabel>
              <ImpactRow node="cache-01..04" impact="+200ms each" description="Direct latency inheritance from db-02. Cache lookup times unaffected but response delayed." severity="medium" />
              <ImpactRow node="api-01..02" impact="+340ms each" description="Cumulative: 200ms from db + 140ms from cache serialization overhead under load." severity="high" />
              <ImpactRow node="lb-01..02" impact="+540ms each" description="End-user facing. P99 response time breaches 1s SLA threshold. Alert triggered." severity="critical" />

              {/* Recommendations */}
              <SectionLabel>RECOMMENDATIONS</SectionLabel>
              <RecommendationRow number={1} title="Add read replica for db-02" description="Offload read queries to reduce latency at source. Expected reduction: ~150ms." />
              <RecommendationRow number={2} title="Enable cache-aside pattern" description="Allow cache nodes to serve stale data during db latency spikes, breaking the propagation chain." />
            </Box>
          </MessageBubble>

          {/* ── Message 5: Actions ── */}
          <MessageBubble name="Forward Agent" time="just now" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What would you like to do next?
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <ActionButton label="Trace Another Source" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Run Backward from lb-01" />
              <ActionButton label="Simulate Mitigation" />
            </Box>
          </MessageBubble>
        </Box>

        {/* Input Area */}
        <Box display="flex" alignItems="center" gap={1.5} px={3} py={2} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}>
          <TextField fullWidth size="small" placeholder="Select a source node or describe a change event..."
            value={input} onChange={(e) => setInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#1a1a24', fontSize: 14, '& fieldset': { borderColor: '#27273a' }, '&:hover fieldset': { borderColor: '#71717a' } } }} />
          <Button variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#0891b2' }, textTransform: 'none', fontWeight: 600, fontSize: 14, borderRadius: 2, px: 2.5, py: 1.5, whiteSpace: 'nowrap', color: '#fff' }}>
            Propagate
          </Button>
        </Box>
      </Box>

      {/* ── Right Context Panel ── */}
      <Box width={340} flexShrink={0} display="flex" flexDirection="column" gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}>
        <Typography fontSize={16} fontWeight={600} color="#f4f4f5">Propagation Context</Typography>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Source Node</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={20} borderRadius={1} bgcolor="#3b82f6" />
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">db-02 (Database)</Typography>
          </Box>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Change Event</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: ACCENT }}>Latency +200ms</Typography>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Propagation Settings</Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Max depth</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>∞</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Decay factor</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>0.7×</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>PROPAGATION PATH</SectionLabel>
        {[
          { depth: '0', node: 'db-02', latency: '+200ms', color: '#ef4444' },
          { depth: '1', node: 'cache-*', latency: '+200ms', color: '#fbbf24' },
          { depth: '2', node: 'api-*', latency: '+340ms', color: '#f59e0b' },
          { depth: '3', node: 'lb-*', latency: '+540ms', color: '#ef4444' },
        ].map((r) => (
          <Box key={r.depth} display="flex" alignItems="center" gap={1}>
            <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" sx={{ color: '#71717a', width: 16 }}>L{r.depth}</Typography>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#a1a1aa', flex: 1 }}>{r.node}</Typography>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color: r.color }}>{r.latency}</Typography>
          </Box>
        ))}

        <Box height="1px" bgcolor="#27273a" />

        <Box sx={{ borderRadius: 2.5, bgcolor: `${ACCENT}10`, border: 1, borderColor: ACCENT, p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={10} fontWeight={600} letterSpacing={1} sx={{ color: ACCENT }}>PROPAGATION COMPLETE</Typography>
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

function ImpactRow({ node, impact, description, severity }: { node: string; impact: string; description: string; severity: string }) {
  const severityColor = severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f59e0b' : '#fbbf24';
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 1.5, py: 1.5, borderRadius: 2, bgcolor: `${severityColor}10`, border: 1, borderColor: `${severityColor}40` }}>
      <Box width={20} height={20} borderRadius={1} bgcolor={severityColor} flexShrink={0} mt={0.25} />
      <Box flex={1} display="flex" flexDirection="column" gap={0.25}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" color="#f4f4f5">{node}</Typography>
          <Typography fontSize={12} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: severityColor }}>{impact}</Typography>
        </Box>
        <Typography fontSize={11} sx={{ color: '#a1a1aa' }}>{description}</Typography>
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
