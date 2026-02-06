import { useState } from 'react';
import {
  Box, Typography, Button, TextField,
} from '@mui/material';
import {
  Share2, Check, Download, Square, FlaskConical,
} from 'lucide-react';
import D3TopologyGraph from '../components/D3TopologyGraph';
import type { TopoNode as TopoNodeType, TopoEdge } from '../components/D3TopologyGraph';

/* ══════════════════════════════════════════
   Types
   ══════════════════════════════════════════ */
interface ExecutionStep {
  number: number;
  label: string;
  completed: boolean;
  active?: boolean;
}

/* ══════════════════════════════════════════
   Data
   ══════════════════════════════════════════ */
const ACCENT = '#f59e0b';

const executionSteps: ExecutionStep[] = [
  { number: 1, label: 'Load Ontology Topology', completed: true },
  { number: 2, label: 'Define Scenario', completed: true },
  { number: 3, label: 'Simulate Changes', completed: true, active: true },
  { number: 4, label: 'Calculate Impact', completed: true },
  { number: 5, label: 'Report Results', completed: true },
];

const progressSteps = [
  { label: 'Removing srv-03 from topology', detail: 'simulated' },
  { label: 'Re-routing 4 database connections', detail: 'calculated' },
  { label: 'Recalculating load distribution', detail: '27 nodes' },
  { label: 'Detecting cascading failures', detail: 'complete' },
];

const executionStats = [
  { label: 'Scenarios tested', value: '1' },
  { label: 'Nodes impacted', value: '8' },
  { label: 'Duration', value: '3.1s', valueColor: '#22c55e' },
];

/* ══════════════════════════════════════════
   Topology data
   ══════════════════════════════════════════ */
const baselineNodes: TopoNodeType[] = [
  { id: 'srv-01', label: 'srv-01', sublabel: '42%', layer: 0, color: '#22c55e' },
  { id: 'srv-02', label: 'srv-02', sublabel: '55%', layer: 0, color: '#22c55e' },
  { id: 'srv-03', label: 'srv-03', sublabel: '71%', layer: 0, color: '#f59e0b' },
  { id: 'srv-04', label: 'srv-04', sublabel: '38%', layer: 0, color: '#22c55e' },
  { id: 'db-01', label: 'db-01', sublabel: '60%', layer: 1, color: '#22c55e' },
  { id: 'db-02', label: 'db-02', sublabel: '48%', layer: 1, color: '#22c55e' },
];

const baselineEdges: TopoEdge[] = [
  { source: 'srv-01', target: 'db-01' },
  { source: 'srv-02', target: 'db-01' },
  { source: 'srv-03', target: 'db-01' },
  { source: 'srv-03', target: 'db-02' },
  { source: 'srv-04', target: 'db-02' },
  { source: 'srv-01', target: 'db-02' },
];

const afterNodes: TopoNodeType[] = [
  { id: 'srv-01', label: 'srv-01', sublabel: '67%', layer: 0, color: '#f59e0b' },
  { id: 'srv-02', label: 'srv-02', sublabel: '78%', layer: 0, color: '#f59e0b' },
  { id: 'srv-03', label: 'srv-03', sublabel: 'DOWN', layer: 0, color: '#ef4444', dashed: true, opacity: 0.5, badge: 'REMOVED', badgeColor: '#ef4444' },
  { id: 'srv-04', label: 'srv-04', sublabel: '62%', layer: 0, color: '#f59e0b' },
  { id: 'db-01', label: 'db-01', sublabel: '82%', layer: 1, color: '#f59e0b' },
  { id: 'db-02', label: 'db-02', sublabel: '74%', layer: 1, color: '#f59e0b' },
];

const afterEdges: TopoEdge[] = [
  { source: 'srv-01', target: 'db-01' },
  { source: 'srv-02', target: 'db-01' },
  { source: 'srv-04', target: 'db-02' },
  { source: 'srv-01', target: 'db-02' },
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
    <Box
      sx={{
        px: 1, py: 0.25, borderRadius: 1,
        bgcolor: filled ? color : `${color}20`,
        display: 'inline-flex', alignItems: 'center',
      }}
    >
      <Typography fontSize={filled ? 9 : 10} fontWeight={600} sx={{ color: filled ? '#fff' : color }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ══════════════════════════════════════════
   Page
   ══════════════════════════════════════════ */
export default function WhatIfAgentPage() {
  const [input, setInput] = useState('');

  return (
    <Box display="flex" height="100vh" overflow="hidden" bgcolor="#0a0a0f">
      {/* ── Left Sidebar ── */}
      <Box
        width={260} flexShrink={0} display="flex" flexDirection="column"
        gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}
      >
        <Box display="flex" alignItems="center" gap={1.25} height={40}>
          <Box width={32} height={32} borderRadius={2} bgcolor="#8b5cf6" display="flex" alignItems="center" justifyContent="center">
            <Share2 size={16} color="#fff" />
          </Box>
          <Typography fontSize={18} fontWeight={700} color="#f4f4f5">Ontology</Typography>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>ACTIVE AGENT</SectionLabel>
        <Box
          sx={{
            p: 1.5, borderRadius: 2, bgcolor: `${ACCENT}15`,
            border: 1, borderColor: ACCENT,
            display: 'flex', flexDirection: 'column', gap: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={28} height={28} borderRadius={1.5} bgcolor={ACCENT} display="flex" alignItems="center" justifyContent="center">
              <FlaskConical size={14} color="#fff" />
            </Box>
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">What-if Agent</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box width={8} height={8} borderRadius={1} bgcolor="#22c55e" />
            <Typography fontSize={11} sx={{ color: '#22c55e' }}>Running</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>EXECUTION STEPS</SectionLabel>
        {executionSteps.map((step) => (
          <Box
            key={step.number}
            sx={{
              px: 1.25, py: 1, borderRadius: 1.5, bgcolor: '#22c55e15',
              display: 'flex', alignItems: 'center', gap: 1.25,
              ...(step.active ? { border: 1, borderColor: '#22c55e' } : {}),
            }}
          >
            <Typography fontSize={12} sx={{ color: '#22c55e' }}>✓</Typography>
            <Typography fontSize={12} sx={{ color: '#22c55e' }}>
              {step.number}. {step.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Chat Panel ── */}
      <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
        <Box
          display="flex" alignItems="center" justifyContent="space-between"
          height={76} px={3} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}
        >
          <Typography fontSize={18} fontWeight={600} color="#f4f4f5">What-if Scenario Analysis</Typography>
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
          {/* ── Message 1: Current topology ── */}
          <MessageBubble name="What-if Agent" time="3 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              I've loaded the current topology. Here's the baseline state before simulation:
            </Typography>
            <ContentCard title="Current Topology — Baseline">
              <D3TopologyGraph
                nodes={baselineNodes}
                edges={baselineEdges}
                layerLabels={[{ afterLayer: 0, text: 'connects_to' }]}
              />
            </ContentCard>
          </MessageBubble>

          {/* ── Message 2: Define scenario ── */}
          <MessageBubble name="What-if Agent" time="2 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What scenario would you like to simulate? Here are some suggestions:
            </Typography>
            <ContentCard title="Scenario Options">
              <OptionRow selected label="Remove srv-03" description="Simulate server failure — 4 connections will be re-routed" />
              <OptionRow label="Double traffic on srv-01" description="Simulate traffic spike — load increases from 42% to ~84%" />
              <OptionRow label="Add new cache-05 instance" description="Simulate scale-out — redistribute cache load" />
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <Box display="flex" gap={1.5} justifyContent="flex-end">
            <Box
              sx={{
                maxWidth: '70%', borderRadius: '12px 12px 0 12px',
                bgcolor: `${ACCENT}20`, border: 1, borderColor: ACCENT,
                px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontSize={13} fontWeight={600} sx={{ color: ACCENT }}>You</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>2 min ago</Typography>
              </Box>
              <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5} textAlign="right">
                Remove srv-03 and show me the cascading impact.
              </Typography>
            </Box>
            <Box width={36} height={36} borderRadius="50%" bgcolor="#3b82f6" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Typography fontSize={14} fontWeight={700} color="#fff">U</Typography>
            </Box>
          </Box>

          {/* ── Message 3: Simulation progress ── */}
          <MessageBubble name="What-if Agent" accent={ACCENT} badge={{ label: 'SIMULATING', color: ACCENT }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Running scenario: <strong>Remove srv-03</strong>. Recalculating topology...
            </Typography>
            <ContentCard title="Simulation Progress">
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
                <Typography fontSize={11} sx={{ color: '#22c55e' }}>Simulation complete - 100%</Typography>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 4: Results ── */}
          <MessageBubble name="What-if Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Scenario simulation complete. Removing srv-03 would cause cascading load increases across 3 layers:
            </Typography>
            <Box sx={{ borderRadius: 3, bgcolor: '#111118', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600} color="#f4f4f5">What-if Impact Report</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>Scenario: Remove srv-03</Typography>
              </Box>

              {/* Summary cards */}
              <Box display="flex" gap={1.5}>
                <SummaryCard value="1" label="Failures" color="#ef4444" />
                <SummaryCard value="3" label="Overloaded" color="#fbbf24" />
                <SummaryCard value="4" label="Affected" color={ACCENT} />
              </Box>

              {/* Before / After comparison */}
              <SectionLabel>BEFORE vs AFTER</SectionLabel>
              <Box display="flex" gap={2}>
                <Box flex={1} sx={{ borderRadius: 2.5, bgcolor: '#0a0a0f', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Chip label="BEFORE" color="#71717a" />
                  <D3TopologyGraph
                    nodes={baselineNodes}
                    edges={baselineEdges}
                    nodeWidth={56}
                  />
                </Box>
                <Box flex={1} sx={{ borderRadius: 2.5, bgcolor: '#0a0a0f', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Chip label="AFTER" color={ACCENT} />
                  <D3TopologyGraph
                    nodes={afterNodes}
                    edges={afterEdges}
                    nodeWidth={56}
                  />
                </Box>
              </Box>

              {/* Cascading effects */}
              <SectionLabel>CASCADING EFFECTS</SectionLabel>
              <CascadeRow
                step={1}
                title="srv-03 removed → 4 connections orphaned"
                description="Connections to db-01 (2) and db-02 (2) need re-routing to remaining servers."
                color="#ef4444"
              />
              <CascadeRow
                step={2}
                title="srv-01, srv-02, srv-04 absorb load"
                description="Average load increases from 45% → 69%. srv-02 approaches warning threshold at 78%."
                color={ACCENT}
              />
              <CascadeRow
                step={3}
                title="db-01 load increases to 82%"
                description="With redistributed connections, db-01 nears capacity. Consider scaling if sustained."
                color="#fbbf24"
              />

              {/* Recommendations */}
              <SectionLabel>RECOMMENDATIONS</SectionLabel>
              <RecommendationRow
                number={1}
                title="Pre-provision replacement server"
                description="If srv-03 failure is planned maintenance, spin up srv-05 beforehand to absorb load gracefully."
              />
              <RecommendationRow
                number={2}
                title="Enable connection pooling on db-01"
                description="At 82% load post-failure, db-01 benefits from connection pooling to handle burst redistribution."
              />
            </Box>
          </MessageBubble>

          {/* ── Message 5: Actions ── */}
          <MessageBubble name="What-if Agent" time="just now" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What would you like to do next?
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <ActionButton label="Try Another Scenario" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Compare with Baseline" />
              <ActionButton label="Apply Mitigations" />
            </Box>
          </MessageBubble>
        </Box>

        {/* Input Area */}
        <Box display="flex" alignItems="center" gap={1.5} px={3} py={2} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}>
          <TextField
            fullWidth size="small" placeholder="Describe a scenario to simulate..."
            value={input} onChange={(e) => setInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#1a1a24', fontSize: 14, '& fieldset': { borderColor: '#27273a' }, '&:hover fieldset': { borderColor: '#71717a' } } }}
          />
          <Button variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#d97706' }, textTransform: 'none', fontWeight: 600, fontSize: 14, borderRadius: 2, px: 2.5, py: 1.5, whiteSpace: 'nowrap', color: '#000' }}>
            Run Scenario
          </Button>
        </Box>
      </Box>

      {/* ── Right Context Panel ── */}
      <Box width={340} flexShrink={0} display="flex" flexDirection="column" gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}>
        <Typography fontSize={16} fontWeight={600} color="#f4f4f5">Scenario Context</Typography>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Scenario Type</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: ACCENT }}>Node Removal</Typography>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Target Node</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={20} borderRadius={1} bgcolor="#ef4444" />
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">srv-03 (Server)</Typography>
          </Box>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Impact Radius</Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Direct dependents</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>4</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Indirect dependents</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: ACCENT }}>4</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Total affected</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444' }}>8</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>LOAD CHANGES</SectionLabel>
        {[
          { node: 'srv-01', before: '42%', after: '67%', color: '#f59e0b' },
          { node: 'srv-02', before: '55%', after: '78%', color: '#f59e0b' },
          { node: 'srv-04', before: '38%', after: '62%', color: '#f59e0b' },
          { node: 'db-01', before: '60%', after: '82%', color: '#fbbf24' },
        ].map((r) => (
          <Box key={r.node} display="flex" alignItems="center" gap={1}>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#a1a1aa', width: 48 }}>{r.node}</Typography>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#71717a' }}>{r.before}</Typography>
            <Typography fontSize={11} sx={{ color: '#71717a' }}>→</Typography>
            <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color: r.color }}>{r.after}</Typography>
          </Box>
        ))}

        <Box height="1px" bgcolor="#27273a" />

        <Box
          sx={{
            borderRadius: 2.5, bgcolor: `${ACCENT}10`, border: 1, borderColor: ACCENT,
            p: 1.75, display: 'flex', flexDirection: 'column', gap: 1,
          }}
        >
          <Typography fontSize={10} fontWeight={600} letterSpacing={1} sx={{ color: ACCENT }}>
            SIMULATION COMPLETE
          </Typography>
          {executionStats.map((s) => (
            <Box key={s.label} display="flex" justifyContent="space-between">
              <Typography fontSize={12} sx={{ color: '#a1a1aa' }}>{s.label}</Typography>
              <Typography fontSize={12} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: s.valueColor ?? '#f4f4f5' }}>
                {s.value}
              </Typography>
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

function MessageBubble({
  name, time, badge, children, accent,
}: {
  name: string; time?: string; accent?: string;
  badge?: { label: string; color: string };
  children: React.ReactNode;
}) {
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
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25,
        borderRadius: 2, border: 1, borderColor: selected ? ACCENT : '#27273a',
        ...(selected ? { bgcolor: `${ACCENT}15` } : {}),
      }}
    >
      {selected ? (
        <Box width={18} height={18} borderRadius={1} bgcolor={ACCENT} display="flex" alignItems="center" justifyContent="center">
          <Check size={12} color="#000" />
        </Box>
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

function CascadeRow({ step, title, description, color }: { step: number; title: string; description: string; color: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: `${color}10`, border: 1, borderColor: `${color}40` }}>
      <Box width={24} height={24} borderRadius="50%" bgcolor={color} display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <Typography fontSize={12} fontWeight={600} color="#fff">{step}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography fontSize={13} fontWeight={600} color="#f4f4f5">{title}</Typography>
        <Typography fontSize={12} color="#a1a1aa" lineHeight={1.4}>{description}</Typography>
      </Box>
    </Box>
  );
}

function RecommendationRow({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: '#8b5cf610' }}>
      <Box width={24} height={24} borderRadius="50%" bgcolor="#8b5cf6" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
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
    <Box
      sx={{
        px: 2, py: 1.25, borderRadius: 2,
        bgcolor: primary ? `${a}20` : '#1a1a24',
        border: 1, borderColor: primary ? a : '#27273a',
        cursor: 'pointer',
        '&:hover': { borderColor: primary ? a : '#71717a' },
      }}
    >
      <Typography fontSize={13} sx={{ color: primary ? a : '#a1a1aa' }}>{label}</Typography>
    </Box>
  );
}
