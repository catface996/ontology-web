import { useState } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment,
} from '@mui/material';
import {
  Share2, Check, Download, Square,
} from 'lucide-react';
import D3TopologyGraph from '../components/D3TopologyGraph';

/* ══════════════════════════════════════════
   Types
   ══════════════════════════════════════════ */
interface ExecutionStep {
  number: number;
  label: string;
  completed: boolean;
  active?: boolean;
}

interface ContextStat {
  label: string;
  value: string;
  valueColor?: string;
}

/* ══════════════════════════════════════════
   Data
   ══════════════════════════════════════════ */
const executionSteps: ExecutionStep[] = [
  { number: 1, label: 'Load Ontology Schema', completed: true },
  { number: 2, label: 'Build Instance Topology', completed: true },
  { number: 3, label: 'Select Relations', completed: true, active: true },
  { number: 4, label: 'Execute Analysis', completed: true },
  { number: 5, label: 'Report Results', completed: true },
];

const progressSteps = [
  { label: 'Analyzing Server → Database connections', detail: '12 checked' },
  { label: 'Analyzing Database → CacheNode connections', detail: '6 checked' },
  { label: 'Calculating capacity utilization', detail: '27 nodes' },
  { label: 'Identifying bottlenecks', detail: 'complete' },
];

const metricsToAnalyze = ['CPU Utilization', 'Memory Usage', 'Connection Count'];

const executionStats: ContextStat[] = [
  { label: 'Nodes analyzed', value: '27' },
  { label: 'Relations checked', value: '18' },
  { label: 'Duration', value: '4.2s', valueColor: '#22c55e' },
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
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: filled ? color : `${color}20`,
        display: 'inline-flex',
        alignItems: 'center',
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
export default function AgentConversationFlowPage() {
  const [input, setInput] = useState('');

  return (
    <Box display="flex" height="100vh" overflow="hidden" bgcolor="#0a0a0f">
      {/* ── Left Sidebar ── */}
      <Box
        width={260}
        flexShrink={0}
        display="flex"
        flexDirection="column"
        gap={2}
        p={2.5}
        sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}
      >
        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1.25} height={40}>
          <Box width={32} height={32} borderRadius={2} bgcolor="#8b5cf6" display="flex" alignItems="center" justifyContent="center">
            <Share2 size={16} color="#fff" />
          </Box>
          <Typography fontSize={18} fontWeight={700} color="#f4f4f5">Ontology</Typography>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        {/* Active Agent */}
        <SectionLabel>ACTIVE AGENT</SectionLabel>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#8b5cf615',
            border: 1,
            borderColor: '#8b5cf6',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={28} height={28} borderRadius={1.5} bgcolor="#8b5cf6" display="flex" alignItems="center" justifyContent="center">
              <Typography fontSize={10} fontWeight={700} color="#fff">AI</Typography>
            </Box>
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Bottleneck Agent</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box width={8} height={8} borderRadius={1} bgcolor="#22c55e" />
            <Typography fontSize={11} sx={{ color: '#22c55e' }}>Running</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        {/* Execution Steps */}
        <SectionLabel>EXECUTION STEPS</SectionLabel>
        {executionSteps.map((step) => (
          <Box
            key={step.number}
            sx={{
              px: 1.25,
              py: 1,
              borderRadius: 1.5,
              bgcolor: '#22c55e15',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
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
        {/* Chat Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          height={76}
          px={3}
          sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}
        >
          <Typography fontSize={18} fontWeight={600} color="#f4f4f5">Agent Conversation</Typography>
          <Box display="flex" gap={1.5}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download size={14} />}
              sx={{
                borderColor: '#27273a',
                color: '#a1a1aa',
                bgcolor: '#1a1a24',
                textTransform: 'none',
                fontSize: 13,
                borderRadius: 1.5,
                '&:hover': { borderColor: '#71717a', bgcolor: '#1a1a24' },
              }}
            >
              Export Log
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Square size={14} />}
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                bgcolor: '#ef444420',
                textTransform: 'none',
                fontSize: 13,
                borderRadius: 1.5,
                '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444430' },
              }}
            >
              Stop Agent
            </Button>
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box flex={1} overflow="auto" px={3} py={3} display="flex" flexDirection="column" gap={2.5} sx={{ bgcolor: '#0a0a0f' }}>
          {/* ── Message 1: Schema ── */}
          <MessageBubble name="Bottleneck Agent" time="2 min ago">
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              I've loaded the Ontology Schema. Here's the class structure I found:
            </Typography>
            <ContentCard title="Ontology Schema">
              <D3TopologyGraph
                nodes={[
                  { id: 'server', label: 'Server', layer: 0, color: '#8b5cf6' },
                  { id: 'database', label: 'Database', layer: 0, color: '#3b82f6' },
                  { id: 'cachenode', label: 'CacheNode', layer: 0, color: '#ec4899' },
                ]}
                edges={[
                  { source: 'server', target: 'database', label: 'connects_to', color: '#22c55e' },
                  { source: 'database', target: 'cachenode', label: 'uses', color: '#f59e0b' },
                ]}
                height={120}
                nodeWidth={90}
                nodeHeight={40}
              />
            </ContentCard>
          </MessageBubble>

          {/* ── Message 2: Topology ── */}
          <MessageBubble name="Bottleneck Agent" time="1 min ago">
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Based on the schema, I've built the instance topology. Here are the actual connections:
            </Typography>
            <ContentCard title="Instance Topology (27 instances)">
              <D3TopologyGraph
                nodes={[
                  { id: 'srv', label: 'srv-01..12', sublabel: '12 servers', layer: 0, color: '#8b5cf6' },
                  { id: 'db', label: 'db-01..06', sublabel: '6 databases', layer: 0, color: '#3b82f6' },
                  { id: 'cache', label: 'cache-01..04', sublabel: '4 caches', layer: 0, color: '#ec4899' },
                  { id: 'api', label: 'api-01..02', sublabel: '2 gateways', layer: 0, color: '#f59e0b' },
                ]}
                edges={[
                  { source: 'srv', target: 'db', color: '#22c55e' },
                  { source: 'db', target: 'cache', color: '#f59e0b' },
                  { source: 'cache', target: 'api', color: '#22c55e' },
                ]}
                height={120}
                nodeWidth={90}
                nodeHeight={44}
              />
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Select Relations ── */}
          <MessageBubble name="Bottleneck Agent" time="just now">
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Which relations should I analyze for bottleneck detection? Please select:
            </Typography>
            <ContentCard title="Available Relations">
              <OptionRow selected label="connects_to" description="Server → Database (12 connections)" />
              <OptionRow selected label="uses" description="Database → CacheNode (6 connections)" />
              <OptionRow label="routes_to" description="CacheNode → APIGateway (4 connections)" />
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <Box display="flex" gap={1.5} justifyContent="flex-end">
            <Box
              sx={{
                maxWidth: '70%',
                borderRadius: '12px 12px 0 12px',
                bgcolor: '#8b5cf620',
                border: 1,
                borderColor: '#8b5cf6',
                px: 2,
                py: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontSize={13} fontWeight={600} sx={{ color: '#8b5cf6' }}>You</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>just now</Typography>
              </Box>
              <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5} textAlign="right">
                Confirmed. Please proceed with connects_to and uses relations.
              </Typography>
            </Box>
            <Box
              width={36}
              height={36}
              borderRadius="50%"
              bgcolor="#3b82f6"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Typography fontSize={14} fontWeight={700} color="#fff">U</Typography>
            </Box>
          </Box>

          {/* ── Message 4: Progress ── */}
          <MessageBubble name="Bottleneck Agent" badge={{ label: 'EXECUTING', color: '#fbbf24' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Starting bottleneck analysis on selected relations. Traversing topology...
            </Typography>
            <ContentCard title="Execution Progress">
              {progressSteps.map((step) => (
                <Box key={step.label} display="flex" alignItems="center" gap={1.25} width="100%">
                  <Typography fontSize={12} sx={{ color: '#22c55e' }}>✓</Typography>
                  <Typography fontSize={13} sx={{ color: '#22c55e', flex: 1 }}>{step.label}</Typography>
                  <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#71717a' }}>{step.detail}</Typography>
                </Box>
              ))}
              {/* Progress bar */}
              <Box display="flex" flexDirection="column" gap={0.75} width="100%">
                <Box height={6} borderRadius={0.75} bgcolor="#1a1a24" overflow="hidden">
                  <Box height="100%" width="100%" borderRadius={0.75} bgcolor="#22c55e" />
                </Box>
                <Typography fontSize={11} sx={{ color: '#22c55e' }}>Analysis complete - 100%</Typography>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 5: Results ── */}
          <MessageBubble name="Bottleneck Agent" badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Analysis complete! I found 1 critical bottleneck and 2 warnings. Here's the detailed report:
            </Typography>
            <Box
              sx={{
                borderRadius: 3,
                bgcolor: '#111118',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Results header */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Bottleneck Analysis Report</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>Generated just now</Typography>
              </Box>

              {/* Summary cards */}
              <Box display="flex" gap={1.5}>
                <SummaryCard value="1" label="Critical" color="#ef4444" />
                <SummaryCard value="2" label="Warnings" color="#fbbf24" />
                <SummaryCard value="24" label="Healthy" color="#22c55e" />
              </Box>

              {/* Topology */}
              <SectionLabel>TOPOLOGY WITH BOTTLENECKS</SectionLabel>
              <D3TopologyGraph
                nodes={[
                  { id: 'srv-03', label: 'srv-03', sublabel: '45%', layer: 0, color: '#22c55e' },
                  { id: 'srv-07', label: 'srv-07', sublabel: '82%', layer: 0, color: '#fbbf24' },
                  { id: 'srv-12', label: 'srv-12', sublabel: '38%', layer: 0, color: '#22c55e' },
                  { id: 'db-02', label: 'db-02', sublabel: '65%', layer: 1, color: '#22c55e' },
                  { id: 'db-04', label: 'db-04', sublabel: '78%', layer: 1, color: '#fbbf24' },
                  { id: 'cache-01', label: 'cache-01', sublabel: '52%', layer: 2, color: '#22c55e' },
                  { id: 'cache-02', label: 'cache-02', sublabel: '94%', layer: 2, color: '#ef4444', bg: '#ef444415', borderWidth: 3, glow: true, badge: 'BOTTLENECK', badgeColor: '#ef4444' },
                  { id: 'cache-04', label: 'cache-04', sublabel: '41%', layer: 2, color: '#22c55e' },
                ]}
                edges={[
                  { source: 'srv-03', target: 'db-02', color: '#22c55e' },
                  { source: 'srv-07', target: 'db-04', color: '#fbbf24' },
                  { source: 'srv-12', target: 'db-02', color: '#22c55e' },
                  { source: 'db-02', target: 'cache-01', color: '#22c55e' },
                  { source: 'db-02', target: 'cache-02', color: '#ef4444' },
                  { source: 'db-04', target: 'cache-02', color: '#fbbf24' },
                  { source: 'db-04', target: 'cache-04', color: '#22c55e' },
                ]}
                layerLabels={[
                  { afterLayer: 0, text: 'connects_to' },
                  { afterLayer: 1, text: 'uses' },
                ]}
                legend={[
                  { color: '#22c55e', label: 'Healthy' },
                  { color: '#fbbf24', label: 'Warning' },
                  { color: '#ef4444', label: 'Bottleneck' },
                ]}
                nodeWidth={80}
                nodeHeight={44}
              />

              {/* Critical Findings */}
              <SectionLabel>CRITICAL FINDINGS</SectionLabel>
              <Box
                sx={{
                  borderRadius: 2.5,
                  bgcolor: '#ef444410',
                  border: 1,
                  borderColor: '#ef4444',
                  p: 1.75,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={24} height={24} borderRadius={1.5} bgcolor="#ef4444" />
                    <Typography fontSize={14} fontWeight={600} fontFamily="JetBrains Mono, monospace" color="#f4f4f5">cache-02</Typography>
                  </Box>
                  <Chip label="BOTTLENECK" color="#ef4444" filled />
                </Box>
                <Typography fontSize={13} color="#a1a1aa" lineHeight={1.5}>
                  CacheNode instance is operating at 94% capacity. Memory utilization critical at 3.8GB / 4GB limit.
                </Typography>
                <Box display="flex" gap={2}>
                  <MetricItem label="CPU" value="87%" color="#fbbf24" />
                  <MetricItem label="Memory" value="94%" color="#ef4444" />
                  <MetricItem label="Connections" value="1,847" color="#f4f4f5" />
                </Box>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Typography fontSize={11} sx={{ color: '#71717a' }}>Path:</Typography>
                  <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#8b5cf6' }}>
                    srv-03 → db-02 → cache-02
                  </Typography>
                </Box>
              </Box>

              {/* Warnings */}
              <SectionLabel>WARNINGS</SectionLabel>
              <WarningRow
                title="db-04 approaching threshold"
                description="Database at 78% capacity - monitor closely"
                value="78%"
              />
              <WarningRow
                title="srv-07 high connection count"
                description="Server handling 2,100+ concurrent connections"
                value="82%"
              />

              {/* Recommendations */}
              <SectionLabel>RECOMMENDATIONS</SectionLabel>
              <RecommendationRow
                number={1}
                title="Scale CacheNode horizontally"
                description="Add 2 more cache instances to distribute load from cache-02. Estimated impact: reduce memory utilization to ~60%."
              />
              <RecommendationRow
                number={2}
                title="Implement connection pooling"
                description="Configure connection pooling for srv-07 to reduce concurrent connection overhead."
              />
            </Box>
          </MessageBubble>

          {/* ── Message 6: Actions ── */}
          <MessageBubble name="Bottleneck Agent" time="just now">
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What would you like to do next?
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <ActionButton label="Run What-if Analysis" primary />
              <ActionButton label="Export Report" />
              <ActionButton label="Deep Dive cache-02" />
              <ActionButton label="Apply Recommendations" />
            </Box>
          </MessageBubble>
        </Box>

        {/* Input Area */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          px={3}
          py={2}
          sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message or use buttons to respond..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#1a1a24',
                fontSize: 14,
                '& fieldset': { borderColor: '#27273a' },
                '&:hover fieldset': { borderColor: '#71717a' },
              },
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 2,
              px: 2.5,
              py: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            Confirm Selection
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#27273a',
              color: '#a1a1aa',
              bgcolor: '#1a1a24',
              textTransform: 'none',
              fontSize: 14,
              borderRadius: 2,
              px: 2.5,
              py: 1.5,
              whiteSpace: 'nowrap',
              '&:hover': { borderColor: '#71717a', bgcolor: '#1a1a24' },
            }}
          >
            Select All
          </Button>
        </Box>
      </Box>

      {/* ── Right Context Panel ── */}
      <Box
        width={340}
        flexShrink={0}
        display="flex"
        flexDirection="column"
        gap={2}
        p={2.5}
        sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}
      >
        <Typography fontSize={16} fontWeight={600} color="#f4f4f5">Execution Context</Typography>

        {/* Context Card 1: Starting Point */}
        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Starting Point</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={20} borderRadius={1} bgcolor="#8b5cf6" />
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Server (Class)</Typography>
          </Box>
        </Box>

        {/* Context Card 2: Analysis Type */}
        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Analysis Type</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: '#8b5cf6' }}>Bottleneck Detection</Typography>
        </Box>

        {/* Context Card 3: Threshold Settings */}
        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Threshold Settings</Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Capacity Warning</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#fbbf24' }}>85%</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Capacity Critical</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444' }}>95%</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        {/* Selected Relations */}
        <SectionLabel>SELECTED RELATIONS</SectionLabel>
        <Box sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#22c55e15', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box width={8} height={8} borderRadius={1} bgcolor="#22c55e" />
          <Typography fontSize={12} fontFamily="JetBrains Mono, monospace" sx={{ color: '#22c55e' }}>connects_to</Typography>
        </Box>
        <Box sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#f59e0b15', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box width={8} height={8} borderRadius={1} bgcolor="#f59e0b" />
          <Typography fontSize={12} fontFamily="JetBrains Mono, monospace" sx={{ color: '#f59e0b' }}>uses</Typography>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        {/* Metrics to Analyze */}
        <SectionLabel>METRICS TO ANALYZE</SectionLabel>
        <Box display="flex" flexDirection="column" gap={0.75}>
          {metricsToAnalyze.map((m) => (
            <Box key={m} display="flex" alignItems="center" gap={1}>
              <Typography fontSize={11} sx={{ color: '#8b5cf6' }}>✓</Typography>
              <Typography fontSize={12} sx={{ color: '#a1a1aa' }}>{m}</Typography>
            </Box>
          ))}
        </Box>

        {/* Execution Summary */}
        <Box
          sx={{
            borderRadius: 2.5,
            bgcolor: '#22c55e10',
            border: 1,
            borderColor: '#22c55e',
            p: 1.75,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography fontSize={10} fontWeight={600} letterSpacing={1} sx={{ color: '#22c55e' }}>
            EXECUTION COMPLETE
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

/* ── AI message bubble ── */
function MessageBubble({
  name, time, badge, children,
}: {
  name: string;
  time?: string;
  badge?: { label: string; color: string };
  children: React.ReactNode;
}) {
  return (
    <Box display="flex" gap={1.5}>
      <Box
        width={36}
        height={36}
        borderRadius="50%"
        bgcolor="#8b5cf6"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Typography fontSize={12} fontWeight={700} color="#fff">AI</Typography>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontSize={14} fontWeight={600} sx={{ color: '#8b5cf6' }}>{name}</Typography>
          {badge && <Chip label={badge.label} color={badge.color} />}
          {time && <Typography fontSize={11} sx={{ color: '#71717a' }}>{time}</Typography>}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

/* ── Dark content card ── */
function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: '#111118',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      }}
    >
      <Typography fontSize={12} fontWeight={600} sx={{ color: '#71717a' }}>{title}</Typography>
      {children}
    </Box>
  );
}

/* ── Selectable option row ── */
function OptionRow({ label, description, selected }: { label: string; description: string; selected?: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        border: 1,
        borderColor: selected ? '#22c55e' : '#27273a',
        ...(selected ? { bgcolor: '#22c55e15' } : {}),
      }}
    >
      {selected ? (
        <Box
          width={18}
          height={18}
          borderRadius={1}
          bgcolor="#22c55e"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Check size={12} color="#000" />
        </Box>
      ) : (
        <Box
          width={18}
          height={18}
          borderRadius={1}
          sx={{ border: 1, borderColor: '#71717a' }}
        />
      )}
      <Box display="flex" flexDirection="column" gap={0.25}>
        <Typography fontSize={13} fontWeight={selected ? 600 : 400} sx={{ color: selected ? '#f4f4f5' : '#a1a1aa' }}>
          {label}
        </Typography>
        <Typography fontSize={11} sx={{ color: selected ? '#a1a1aa' : '#71717a' }}>{description}</Typography>
      </Box>
    </Box>
  );
}

/* ── Summary card ── */
function SummaryCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        borderRadius: 2,
        bgcolor: `${color}15`,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Typography fontSize={28} fontWeight={700} fontFamily="JetBrains Mono, monospace" sx={{ color }}>
        {value}
      </Typography>
      <Typography fontSize={11} sx={{ color }}>{label}</Typography>
    </Box>
  );
}

/* ── Metric item ── */
function MetricItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Box display="flex" flexDirection="column" gap={0.25}>
      <Typography fontSize={10} sx={{ color: '#71717a' }}>{label}</Typography>
      <Typography fontSize={14} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color }}>{value}</Typography>
    </Box>
  );
}

/* ── Warning row ── */
function WarningRow({ title, description, value }: { title: string; description: string; value: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.5,
        borderRadius: 2,
        bgcolor: '#fbbf2410',
        border: 1,
        borderColor: '#fbbf24',
      }}
    >
      <Box width={20} height={20} borderRadius={1} bgcolor="#fbbf24" flexShrink={0} />
      <Box flex={1} display="flex" flexDirection="column" gap={0.25}>
        <Typography fontSize={13} color="#f4f4f5">{title}</Typography>
        <Typography fontSize={11} sx={{ color: '#a1a1aa' }}>{description}</Typography>
      </Box>
      <Typography fontSize={14} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#fbbf24' }}>
        {value}
      </Typography>
    </Box>
  );
}

/* ── Recommendation row ── */
function RecommendationRow({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.25,
        p: 1.5,
        borderRadius: 2,
        bgcolor: '#8b5cf610',
      }}
    >
      <Box
        width={24}
        height={24}
        borderRadius="50%"
        bgcolor="#8b5cf6"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Typography fontSize={12} fontWeight={600} color="#fff">{number}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography fontSize={13} fontWeight={600} color="#f4f4f5">{title}</Typography>
        <Typography fontSize={12} color="#a1a1aa" lineHeight={1.4}>{description}</Typography>
      </Box>
    </Box>
  );
}

/* ── Action button ── */
function ActionButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 2,
        bgcolor: primary ? '#8b5cf620' : '#1a1a24',
        border: 1,
        borderColor: primary ? '#8b5cf6' : '#27273a',
        cursor: 'pointer',
        '&:hover': { borderColor: primary ? '#8b5cf6' : '#71717a' },
      }}
    >
      <Typography fontSize={13} sx={{ color: primary ? '#8b5cf6' : '#a1a1aa' }}>{label}</Typography>
    </Box>
  );
}
