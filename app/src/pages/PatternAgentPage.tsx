import { useState } from 'react';
import {
  Box, Typography, Button, TextField,
} from '@mui/material';
import {
  Share2, Check, Download, Square, Fingerprint,
} from 'lucide-react';
import D3TopologyGraph from '../components/D3TopologyGraph';
import type { TopoNode, TopoEdge } from '../components/D3TopologyGraph';

/* ══════════════════════════════════════════
   Data
   ══════════════════════════════════════════ */
const ACCENT = '#ec4899';

const executionSteps = [
  { number: 1, label: 'Load Historical Data', completed: true },
  { number: 2, label: 'Extract Features', completed: true },
  { number: 3, label: 'Match Patterns', completed: true, active: true },
  { number: 4, label: 'Score Anomalies', completed: true },
  { number: 5, label: 'Report Patterns', completed: true },
];

const progressSteps = [
  { label: 'Scanning topology for structural patterns', detail: '31 nodes' },
  { label: 'Analyzing load distribution patterns', detail: '7 days' },
  { label: 'Detecting recurring failure sequences', detail: '48 events' },
  { label: 'Scoring anomaly confidence', detail: 'complete' },
];

const executionStats = [
  { label: 'Patterns found', value: '4' },
  { label: 'Anomalies scored', value: '3' },
  { label: 'Duration', value: '5.2s', valueColor: '#22c55e' },
];

/* ── Hub-Spoke topology data ── */
const hubSpokeNodes: TopoNode[] = [
  { id: 'cache-01', label: 'cache-01', layer: 0, color: '#ec4899' },
  { id: 'cache-02', label: 'cache-02', layer: 0, color: '#ec4899' },
  { id: 'api-01',   label: 'api-01',   layer: 1, color: '#ec4899' },
  { id: 'db-02',    label: 'db-02',    layer: 1, color: '#ec4899', glow: true },
  { id: 'api-02',   label: 'api-02',   layer: 1, color: '#ec4899' },
  { id: 'cache-03', label: 'cache-03', layer: 2, color: '#ec4899' },
  { id: 'cache-04', label: 'cache-04', layer: 2, color: '#ec4899' },
];

const hubSpokeEdges: TopoEdge[] = [
  { source: 'db-02', target: 'cache-01' },
  { source: 'db-02', target: 'cache-02' },
  { source: 'db-02', target: 'api-01' },
  { source: 'db-02', target: 'api-02' },
  { source: 'db-02', target: 'cache-03' },
  { source: 'db-02', target: 'cache-04' },
];

/* ── Chain Dependency topology data ── */
const chainNodes: TopoNode[] = [
  { id: 'srv',   label: 'srv',   layer: 0, color: '#ec4899' },
  { id: 'db',    label: 'db',    layer: 0, color: '#ec4899' },
  { id: 'cache', label: 'cache', layer: 0, color: '#ec4899' },
  { id: 'api',   label: 'api',   layer: 0, color: '#ec4899' },
  { id: 'lb',    label: 'lb',    layer: 0, color: '#ec4899' },
];

const chainEdges: TopoEdge[] = [
  { source: 'srv',   target: 'db' },
  { source: 'db',    target: 'cache' },
  { source: 'cache', target: 'api' },
  { source: 'api',   target: 'lb' },
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
export default function PatternAgentPage() {
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
              <Fingerprint size={14} color="#fff" />
            </Box>
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Pattern Agent</Typography>
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
          <Typography fontSize={18} fontWeight={600} color="#f4f4f5">Pattern Recognition</Typography>
          <Box display="flex" gap={1.5}>
            <Button size="small" variant="outlined" startIcon={<Download size={14} />}
              sx={{ borderColor: '#27273a', color: '#a1a1aa', bgcolor: '#1a1a24', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#71717a', bgcolor: '#1a1a24' } }}>Export Log</Button>
            <Button size="small" variant="outlined" startIcon={<Square size={14} />}
              sx={{ borderColor: '#ef4444', color: '#ef4444', bgcolor: '#ef444420', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444430' } }}>Stop Agent</Button>
          </Box>
        </Box>

        <Box flex={1} overflow="auto" px={3} py={3} display="flex" flexDirection="column" gap={2.5} sx={{ bgcolor: '#0a0a0f' }}>
          {/* ── Message 1: Configure scan ── */}
          <MessageBubble name="Pattern Agent" time="4 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              I can scan for various pattern types across your topology. What should I look for?
            </Typography>
            <ContentCard title="Pattern Categories">
              <OptionRow selected label="Structural Patterns" description="Recurring topology structures (star, chain, mesh, hub-spoke)" />
              <OptionRow selected label="Failure Patterns" description="Recurring failure sequences and cascading failure chains" />
              <OptionRow selected label="Load Patterns" description="Periodic load spikes, traffic waves, hotspot migration" />
              <OptionRow label="Growth Patterns" description="Capacity trends, scaling events, resource exhaustion trajectories" />
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
                Scan for all selected patterns over the last 7 days.
              </Typography>
            </Box>
            <Box width={36} height={36} borderRadius="50%" bgcolor="#3b82f6" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Typography fontSize={14} fontWeight={700} color="#fff">U</Typography>
            </Box>
          </Box>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Pattern Agent" accent={ACCENT} badge={{ label: 'SCANNING', color: ACCENT }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Scanning topology and historical data for recurring patterns...
            </Typography>
            <ContentCard title="Scan Progress">
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
                <Typography fontSize={11} sx={{ color: '#22c55e' }}>Scan complete - 100%</Typography>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Pattern Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Pattern scan complete. Detected 4 significant patterns and 3 anomalies across the topology:
            </Typography>
            <Box sx={{ borderRadius: 3, bgcolor: '#111118', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Pattern Recognition Report</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>Last 7 days · 31 nodes</Typography>
              </Box>

              <Box display="flex" gap={1.5}>
                <SummaryCard value="2" label="Structural" color={ACCENT} />
                <SummaryCard value="1" label="Failure" color="#ef4444" />
                <SummaryCard value="1" label="Load" color="#f59e0b" />
              </Box>

              {/* Pattern 1: Structural */}
              <SectionLabel>STRUCTURAL PATTERNS</SectionLabel>
              <PatternCard
                number={1}
                title="Hub-Spoke Pattern — db-02"
                confidence={92}
                description="db-02 acts as a central hub connected to 8 downstream nodes (4 caches, 2 APIs, 2 LBs). Single point of failure risk."
                occurrences="Persistent"
                color={ACCENT}
              >
                <D3TopologyGraph
                  nodes={hubSpokeNodes}
                  edges={hubSpokeEdges}
                  nodeWidth={56}
                  nodeHeight={32}
                  layerGap={48}
                />
              </PatternCard>

              <PatternCard
                number={2}
                title="Chain Dependency — srv → db → cache → api → lb"
                confidence={88}
                description="5-layer linear chain with no redundancy between layers. A failure at any point cascades to all downstream layers."
                occurrences="Persistent"
                color={ACCENT}
              >
                <D3TopologyGraph
                  nodes={chainNodes}
                  edges={chainEdges}
                  nodeWidth={48}
                  nodeHeight={28}
                  nodeGap={12}
                />
              </PatternCard>

              {/* Pattern 2: Failure */}
              <SectionLabel>FAILURE PATTERNS</SectionLabel>
              <PatternCard
                number={3}
                title="Recurring Cascade — cache-02 → api-01 → lb-01"
                confidence={78}
                description="cache-02 memory pressure triggers api-01 timeouts, which causes lb-01 5xx errors. This sequence occurred 3 times in 7 days, each time between 14:00–16:00 UTC."
                occurrences="3× in 7 days"
                color="#ef4444"
              >
                <Box sx={{ borderRadius: 2, bgcolor: '#0a0a0f', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { time: 'Mon 14:23', chain: 'cache-02 (OOM) → api-01 (timeout) → lb-01 (5xx)', dur: '12min' },
                    { time: 'Wed 14:45', chain: 'cache-02 (OOM) → api-01 (timeout) → lb-01 (5xx)', dur: '8min' },
                    { time: 'Fri 15:02', chain: 'cache-02 (OOM) → api-01 (timeout) → lb-01 (5xx)', dur: '15min' },
                  ].map((e, i) => (
                    <Box key={i} display="flex" alignItems="center" gap={1}>
                      <Typography fontSize={9} fontFamily="JetBrains Mono, monospace" sx={{ color: '#71717a', width: 64 }}>{e.time}</Typography>
                      <Typography fontSize={9} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444', flex: 1 }}>{e.chain}</Typography>
                      <Typography fontSize={9} fontFamily="JetBrains Mono, monospace" sx={{ color: '#fbbf24' }}>{e.dur}</Typography>
                    </Box>
                  ))}
                </Box>
              </PatternCard>

              {/* Pattern 3: Load */}
              <SectionLabel>LOAD PATTERNS</SectionLabel>
              <PatternCard
                number={4}
                title="Daily Load Spike — 09:00 UTC Peak"
                confidence={95}
                description="Consistent traffic surge at 09:00–09:30 UTC every weekday. srv-01 and srv-02 reach 80%+ CPU. Pattern correlates with business hours start in EU timezone."
                occurrences="5× in 7 days"
                color="#f59e0b"
              >
                <Box sx={{ borderRadius: 2, bgcolor: '#0a0a0f', p: 1.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.5, height: 60 }}>
                  {[20, 25, 30, 35, 82, 88, 75, 45, 35, 30, 28, 25].map((h, i) => (
                    <Box key={i} sx={{
                      width: 14, height: `${h}%`, borderRadius: 0.5,
                      bgcolor: h > 70 ? '#f59e0b' : '#27273a',
                    }} />
                  ))}
                </Box>
                <Box display="flex" justifyContent="space-between" px={1.5}>
                  <Typography fontSize={8} sx={{ color: '#71717a' }}>06:00</Typography>
                  <Typography fontSize={8} fontWeight={600} sx={{ color: '#f59e0b' }}>09:00</Typography>
                  <Typography fontSize={8} sx={{ color: '#71717a' }}>12:00</Typography>
                </Box>
              </PatternCard>

              {/* Recommendations */}
              <SectionLabel>RECOMMENDATIONS</SectionLabel>
              <RecommendationRow number={1} title="Add redundancy to db-02 hub"
                description="Deploy read replica db-07 to break single-point-of-failure. Distribute cache connections across both databases." />
              <RecommendationRow number={2} title="Increase cache-02 memory before 14:00 UTC"
                description="Recurring OOM at 14:00–16:00 suggests scheduled workload. Pre-scale memory or schedule eviction before peak." />
              <RecommendationRow number={3} title="Pre-scale servers before 09:00 UTC"
                description="Predictable daily spike allows proactive scaling. Spin up srv-13/14 at 08:45 and drain after 10:00." />
            </Box>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Pattern Agent" time="just now" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What would you like to do next?
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <ActionButton label="Scan Longer Period" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Set Up Alerts" />
              <ActionButton label="Auto-remediate" />
            </Box>
          </MessageBubble>
        </Box>

        {/* Input Area */}
        <Box display="flex" alignItems="center" gap={1.5} px={3} py={2} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}>
          <TextField fullWidth size="small" placeholder="Describe a pattern to search for..."
            value={input} onChange={(e) => setInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#1a1a24', fontSize: 14, '& fieldset': { borderColor: '#27273a' }, '&:hover fieldset': { borderColor: '#71717a' } } }} />
          <Button variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#db2777' }, textTransform: 'none', fontWeight: 600, fontSize: 14, borderRadius: 2, px: 2.5, py: 1.5, whiteSpace: 'nowrap', color: '#fff' }}>
            Scan Patterns
          </Button>
        </Box>
      </Box>

      {/* ── Right Context Panel ── */}
      <Box width={340} flexShrink={0} display="flex" flexDirection="column" gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}>
        <Typography fontSize={16} fontWeight={600} color="#f4f4f5">Pattern Context</Typography>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Scan Window</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: ACCENT }}>Last 7 Days</Typography>
          <Typography fontSize={11} sx={{ color: '#a1a1aa' }}>Jan 28 – Feb 04, 2025</Typography>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Data Points</Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Nodes scanned</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>31</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Events analyzed</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>48</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Metrics sampled</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>2,016</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>DETECTED PATTERNS</SectionLabel>
        {[
          { name: 'Hub-Spoke (db-02)', confidence: '92%', type: 'Structural', color: ACCENT },
          { name: 'Chain Dependency', confidence: '88%', type: 'Structural', color: ACCENT },
          { name: 'Cascade Failure', confidence: '78%', type: 'Failure', color: '#ef4444' },
          { name: 'Daily Load Spike', confidence: '95%', type: 'Load', color: '#f59e0b' },
        ].map((p) => (
          <Box key={p.name} sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: `${p.color}10`, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box width={8} height={8} borderRadius={1} bgcolor={p.color} />
            <Box flex={1}>
              <Typography fontSize={11} sx={{ color: '#a1a1aa' }}>{p.name}</Typography>
              <Typography fontSize={9} sx={{ color: '#71717a' }}>{p.type}</Typography>
            </Box>
            <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color: p.color }}>{p.confidence}</Typography>
          </Box>
        ))}

        <Box height="1px" bgcolor="#27273a" />

        <Box sx={{ borderRadius: 2.5, bgcolor: `${ACCENT}10`, border: 1, borderColor: ACCENT, p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={10} fontWeight={600} letterSpacing={1} sx={{ color: ACCENT }}>SCAN COMPLETE</Typography>
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

function PatternCard({ number, title, confidence, description, occurrences, color, children }: {
  number: number; title: string; confidence: number; description: string; occurrences: string; color: string; children?: React.ReactNode;
}) {
  return (
    <Box sx={{ borderRadius: 2.5, bgcolor: `${color}10`, border: 1, borderColor: `${color}50`, p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={24} height={24} borderRadius="50%" bgcolor={color} display="flex" alignItems="center" justifyContent="center">
            <Typography fontSize={12} fontWeight={600} color="#fff">{number}</Typography>
          </Box>
          <Typography fontSize={13} fontWeight={600} color="#f4f4f5">{title}</Typography>
        </Box>
        <Chip label={`${confidence}%`} color={color} />
      </Box>
      <Typography fontSize={12} color="#a1a1aa" lineHeight={1.5}>{description}</Typography>
      {children}
      <Box display="flex" alignItems="center" gap={0.75}>
        <Typography fontSize={10} sx={{ color: '#71717a' }}>Occurrences:</Typography>
        <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color }}>{occurrences}</Typography>
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
