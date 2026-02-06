import { useState } from 'react';
import {
  Box, Typography, Button, TextField,
} from '@mui/material';
import {
  Share2, Check, Download, Square, ShieldCheck,
} from 'lucide-react';

/* ══════════════════════════════════════════
   Data
   ══════════════════════════════════════════ */
const ACCENT = '#6366f1';

const executionSteps = [
  { number: 1, label: 'Load Constraint Rules', completed: true },
  { number: 2, label: 'Scan Instances', completed: true },
  { number: 3, label: 'Evaluate Rules', completed: true, active: true },
  { number: 4, label: 'Identify Violations', completed: true },
  { number: 5, label: 'Report Results', completed: true },
];

const progressSteps = [
  { label: 'Checking capacity constraints', detail: '12 rules' },
  { label: 'Checking connectivity constraints', detail: '8 rules' },
  { label: 'Checking SLA constraints', detail: '6 rules' },
  { label: 'Checking cardinality constraints', detail: '4 rules' },
];

const executionStats = [
  { label: 'Rules evaluated', value: '30' },
  { label: 'Violations found', value: '5' },
  { label: 'Duration', value: '2.4s', valueColor: '#22c55e' },
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
export default function ConstraintAgentPage() {
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
              <ShieldCheck size={14} color="#fff" />
            </Box>
            <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Constraint Agent</Typography>
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
          <Typography fontSize={18} fontWeight={600} color="#f4f4f5">Constraint Validation</Typography>
          <Box display="flex" gap={1.5}>
            <Button size="small" variant="outlined" startIcon={<Download size={14} />}
              sx={{ borderColor: '#27273a', color: '#a1a1aa', bgcolor: '#1a1a24', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#71717a', bgcolor: '#1a1a24' } }}>Export Log</Button>
            <Button size="small" variant="outlined" startIcon={<Square size={14} />}
              sx={{ borderColor: '#ef4444', color: '#ef4444', bgcolor: '#ef444420', textTransform: 'none', fontSize: 13, borderRadius: 1.5, '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444430' } }}>Stop Agent</Button>
          </Box>
        </Box>

        <Box flex={1} overflow="auto" px={3} py={3} display="flex" flexDirection="column" gap={2.5} sx={{ bgcolor: '#0a0a0f' }}>
          {/* ── Message 1: Loaded rules ── */}
          <MessageBubble name="Constraint Agent" time="3 min ago" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              I've loaded 30 constraint rules from the ontology. Select which categories to validate:
            </Typography>
            <ContentCard title="Constraint Categories">
              <OptionRow selected label="Capacity Constraints (12 rules)" description="Max load, memory limits, connection pools, throughput caps" />
              <OptionRow selected label="Connectivity Constraints (8 rules)" description="Required relations, min/max connections, reachability" />
              <OptionRow selected label="SLA Constraints (6 rules)" description="Latency thresholds, uptime requirements, error rate limits" />
              <OptionRow label="Cardinality Constraints (4 rules)" description="Min/max instances per class, relationship multiplicity" />
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
                Check all constraint categories. Report all violations.
              </Typography>
            </Box>
            <Box width={36} height={36} borderRadius="50%" bgcolor="#3b82f6" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Typography fontSize={14} fontWeight={700} color="#fff">U</Typography>
            </Box>
          </Box>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Constraint Agent" accent={ACCENT} badge={{ label: 'VALIDATING', color: ACCENT }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Evaluating 30 constraint rules across all instances...
            </Typography>
            <ContentCard title="Validation Progress">
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
                <Typography fontSize={11} sx={{ color: '#22c55e' }}>Validation complete - 100%</Typography>
              </Box>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Constraint Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              Validation complete. Found 5 violations across 30 rules. 25 rules passed successfully.
            </Typography>
            <Box sx={{ borderRadius: 3, bgcolor: '#111118', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600} color="#f4f4f5">Constraint Validation Report</Typography>
                <Typography fontSize={11} sx={{ color: '#71717a' }}>30 rules evaluated</Typography>
              </Box>

              <Box display="flex" gap={1.5}>
                <SummaryCard value="2" label="Critical" color="#ef4444" />
                <SummaryCard value="3" label="Warnings" color="#fbbf24" />
                <SummaryCard value="25" label="Passed" color="#22c55e" />
              </Box>

              {/* Validation matrix */}
              <SectionLabel>VALIDATION BY CATEGORY</SectionLabel>
              <Box sx={{ borderRadius: 2.5, bgcolor: '#0a0a0f', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <CategoryBar label="Capacity" total={12} passed={10} failed={2} color="#ef4444" />
                <CategoryBar label="Connectivity" total={8} passed={7} failed={1} color="#fbbf24" />
                <CategoryBar label="SLA" total={6} passed={4} failed={2} color="#fbbf24" />
                <CategoryBar label="Cardinality" total={4} passed={4} failed={0} color="#22c55e" />
              </Box>

              {/* Critical violations */}
              <SectionLabel>CRITICAL VIOLATIONS</SectionLabel>
              <ViolationCard
                severity="critical"
                rule="CAPACITY-07"
                title="cache-02 exceeds memory limit"
                description="Memory usage at 3.8GB exceeds the 4GB hard limit defined in capacity constraint. Risk of OOM kill."
                node="cache-02"
                expected="≤ 4GB (soft: 3.2GB)"
                actual="3.8GB (95%)"
              />
              <ViolationCard
                severity="critical"
                rule="CAPACITY-11"
                title="srv-07 connection pool exhausted"
                description="Active connections at 2,100 exceed the max_connections=2,000 constraint. New connections being rejected."
                node="srv-07"
                expected="≤ 2,000"
                actual="2,100 (105%)"
              />

              {/* Warning violations */}
              <SectionLabel>WARNINGS</SectionLabel>
              <ViolationCard
                severity="warning"
                rule="SLA-03"
                title="api-01 latency approaching SLA threshold"
                description="P99 latency at 380ms is within 5% of the 400ms SLA limit. May breach during peak hours."
                node="api-01"
                expected="≤ 400ms"
                actual="380ms (95%)"
              />
              <ViolationCard
                severity="warning"
                rule="CONN-05"
                title="db-03 missing redundant connection"
                description="Database db-03 has only 1 server connection. Connectivity constraint requires minimum 2 for redundancy."
                node="db-03"
                expected="≥ 2 connections"
                actual="1 connection"
              />
              <ViolationCard
                severity="warning"
                rule="SLA-06"
                title="lb-01 error rate elevated"
                description="5xx error rate at 0.8% approaches the 1% SLA threshold. Investigate upstream failures."
                node="lb-01"
                expected="≤ 1%"
                actual="0.8%"
              />

              {/* Recommendations */}
              <SectionLabel>RECOMMENDATIONS</SectionLabel>
              <RecommendationRow number={1} title="Scale cache-02 memory to 8GB"
                description="Increase memory allocation to provide headroom. Alternatively, add cache-05 to distribute load." />
              <RecommendationRow number={2} title="Increase srv-07 max_connections to 3,000"
                description="Or implement connection pooling to reduce concurrent connection count." />
              <RecommendationRow number={3} title="Add redundant connection to db-03"
                description="Connect srv-02 or srv-04 to db-03 to satisfy minimum redundancy constraint." />
            </Box>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Constraint Agent" time="just now" accent={ACCENT}>
            <Typography fontSize={14} color="#f4f4f5" lineHeight={1.5}>
              What would you like to do next?
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <ActionButton label="Re-validate After Fix" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Auto-fix Warnings" />
              <ActionButton label="Add New Rule" />
            </Box>
          </MessageBubble>
        </Box>

        {/* Input Area */}
        <Box display="flex" alignItems="center" gap={1.5} px={3} py={2} sx={{ bgcolor: '#0d0d14', flexShrink: 0 }}>
          <TextField fullWidth size="small" placeholder="Add a constraint rule or ask to validate..."
            value={input} onChange={(e) => setInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#1a1a24', fontSize: 14, '& fieldset': { borderColor: '#27273a' }, '&:hover fieldset': { borderColor: '#71717a' } } }} />
          <Button variant="contained"
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none', fontWeight: 600, fontSize: 14, borderRadius: 2, px: 2.5, py: 1.5, whiteSpace: 'nowrap' }}>
            Validate
          </Button>
        </Box>
      </Box>

      {/* ── Right Context Panel ── */}
      <Box width={340} flexShrink={0} display="flex" flexDirection="column" gap={2} p={2.5} sx={{ bgcolor: '#0d0d14', overflow: 'auto' }}>
        <Typography fontSize={16} fontWeight={600} color="#f4f4f5">Validation Context</Typography>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Validation Scope</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ color: ACCENT }}>Full Ontology</Typography>
        </Box>

        <Box sx={{ borderRadius: 2.5, bgcolor: '#111118', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={11} sx={{ color: '#71717a' }}>Rule Summary</Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Capacity</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#ef4444' }}>10/12</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Connectivity</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#fbbf24' }}>7/8</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>SLA</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#fbbf24' }}>4/6</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} sx={{ color: '#a1a1aa' }}>Cardinality</Typography>
            <Typography fontSize={13} fontWeight={600} fontFamily="JetBrains Mono, monospace" sx={{ color: '#22c55e' }}>4/4</Typography>
          </Box>
        </Box>

        <Box height="1px" bgcolor="#27273a" />

        <SectionLabel>VIOLATION NODES</SectionLabel>
        {[
          { node: 'cache-02', rule: 'CAPACITY-07', color: '#ef4444' },
          { node: 'srv-07', rule: 'CAPACITY-11', color: '#ef4444' },
          { node: 'api-01', rule: 'SLA-03', color: '#fbbf24' },
          { node: 'db-03', rule: 'CONN-05', color: '#fbbf24' },
          { node: 'lb-01', rule: 'SLA-06', color: '#fbbf24' },
        ].map((v) => (
          <Box key={v.node} sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: `${v.color}10`, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box width={8} height={8} borderRadius={1} bgcolor={v.color} />
            <Typography fontSize={12} fontFamily="JetBrains Mono, monospace" sx={{ color: '#a1a1aa', flex: 1 }}>{v.node}</Typography>
            <Typography fontSize={10} fontFamily="JetBrains Mono, monospace" sx={{ color: v.color }}>{v.rule}</Typography>
          </Box>
        ))}

        <Box height="1px" bgcolor="#27273a" />

        <Box sx={{ borderRadius: 2.5, bgcolor: `${ACCENT}10`, border: 1, borderColor: ACCENT, p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography fontSize={10} fontWeight={600} letterSpacing={1} sx={{ color: ACCENT }}>VALIDATION COMPLETE</Typography>
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

function CategoryBar({ label, total, passed, failed, color }: { label: string; total: number; passed: number; failed: number; color: string }) {
  const pct = (passed / total) * 100;
  return (
    <Box display="flex" flexDirection="column" gap={0.5}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={12} sx={{ color: '#a1a1aa' }}>{label}</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color: '#22c55e' }}>{passed} passed</Typography>
          {failed > 0 && <Typography fontSize={11} fontFamily="JetBrains Mono, monospace" sx={{ color }}>{failed} failed</Typography>}
        </Box>
      </Box>
      <Box height={6} borderRadius={0.75} bgcolor="#1a1a24" overflow="hidden">
        <Box height="100%" width={`${pct}%`} borderRadius={0.75} bgcolor={failed > 0 ? color : '#22c55e'} />
      </Box>
    </Box>
  );
}

function ViolationCard({ severity, rule, title, description, node, expected, actual }: {
  severity: string; rule: string; title: string; description: string; node: string; expected: string; actual: string;
}) {
  const color = severity === 'critical' ? '#ef4444' : '#fbbf24';
  return (
    <Box sx={{ borderRadius: 2.5, bgcolor: `${color}10`, border: 1, borderColor: `${color}60`, p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={20} height={20} borderRadius={1} bgcolor={color} />
          <Typography fontSize={13} fontWeight={600} color="#f4f4f5">{title}</Typography>
        </Box>
        <Chip label={rule} color={color} />
      </Box>
      <Typography fontSize={12} color="#a1a1aa" lineHeight={1.5}>{description}</Typography>
      <Box display="flex" gap={3}>
        <Box display="flex" flexDirection="column" gap={0.25}>
          <Typography fontSize={10} sx={{ color: '#71717a' }}>Node</Typography>
          <Typography fontSize={12} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color: ACCENT }}>{node}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap={0.25}>
          <Typography fontSize={10} sx={{ color: '#71717a' }}>Expected</Typography>
          <Typography fontSize={12} fontFamily="JetBrains Mono, monospace" sx={{ color: '#22c55e' }}>{expected}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap={0.25}>
          <Typography fontSize={10} sx={{ color: '#71717a' }}>Actual</Typography>
          <Typography fontSize={12} fontFamily="JetBrains Mono, monospace" fontWeight={600} sx={{ color }}>{actual}</Typography>
        </Box>
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
