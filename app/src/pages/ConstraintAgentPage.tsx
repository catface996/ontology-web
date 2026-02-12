import { useState } from 'react';
import { Button, Input } from 'antd';
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
export default function ConstraintAgentPage() {
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
              <ShieldCheck size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Constraint Agent</span>
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
          <span style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>Constraint Validation</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Download size={14} />}>Export Log</Button>
            <Button danger icon={<Square size={14} />}>Stop Agent</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, backgroundColor: '#0a0a0f' }}>
          {/* ── Message 1: Loaded rules ── */}
          <MessageBubble name="Constraint Agent" time="3 min ago" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              I've loaded 30 constraint rules from the ontology. Select which categories to validate:
            </span>
            <ContentCard title="Constraint Categories">
              <OptionRow selected label="Capacity Constraints (12 rules)" description="Max load, memory limits, connection pools, throughput caps" />
              <OptionRow selected label="Connectivity Constraints (8 rules)" description="Required relations, min/max connections, reachability" />
              <OptionRow selected label="SLA Constraints (6 rules)" description="Latency thresholds, uptime requirements, error rate limits" />
              <OptionRow label="Cardinality Constraints (4 rules)" description="Min/max instances per class, relationship multiplicity" />
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
                Check all constraint categories. Report all violations.
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>U</span>
            </div>
          </div>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Constraint Agent" accent={ACCENT} badge={{ label: 'VALIDATING', color: ACCENT }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Evaluating 30 constraint rules across all instances...
            </span>
            <ContentCard title="Validation Progress">
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
                <span style={{ fontSize: 11, color: '#22c55e' }}>Validation complete - 100%</span>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Constraint Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Validation complete. Found 5 violations across 30 rules. 25 rules passed successfully.
            </span>
            <div style={{ borderRadius: 12, backgroundColor: '#111118', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Constraint Validation Report</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>30 rules evaluated</span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <SummaryCard value="2" label="Critical" color="#ef4444" />
                <SummaryCard value="3" label="Warnings" color="#fbbf24" />
                <SummaryCard value="25" label="Passed" color="#22c55e" />
              </div>

              {/* Validation matrix */}
              <SectionLabel>VALIDATION BY CATEGORY</SectionLabel>
              <div style={{ borderRadius: 10, backgroundColor: '#0a0a0f', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CategoryBar label="Capacity" total={12} passed={10} failed={2} color="#ef4444" />
                <CategoryBar label="Connectivity" total={8} passed={7} failed={1} color="#fbbf24" />
                <CategoryBar label="SLA" total={6} passed={4} failed={2} color="#fbbf24" />
                <CategoryBar label="Cardinality" total={4} passed={4} failed={0} color="#22c55e" />
              </div>

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
            </div>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Constraint Agent" time="just now" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What would you like to do next?
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton label="Re-validate After Fix" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Auto-fix Warnings" />
              <ActionButton label="Add New Rule" />
            </div>
          </MessageBubble>
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#0d0d14', flexShrink: 0 }}>
          <Input style={{ flex: 1 }} placeholder="Add a constraint rule or ask to validate..."
            value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="primary">
            Validate
          </Button>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Validation Context</span>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Validation Scope</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>Full Ontology</span>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Rule Summary</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Capacity</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>10/12</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Connectivity</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24' }}>7/8</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>SLA</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24' }}>4/6</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Cardinality</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>4/4</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>VIOLATION NODES</SectionLabel>
        {[
          { node: 'cache-02', rule: 'CAPACITY-07', color: '#ef4444' },
          { node: 'srv-07', rule: 'CAPACITY-11', color: '#ef4444' },
          { node: 'api-01', rule: 'SLA-03', color: '#fbbf24' },
          { node: 'db-03', rule: 'CONN-05', color: '#fbbf24' },
          { node: 'lb-01', rule: 'SLA-06', color: '#fbbf24' },
        ].map((v) => (
          <div key={v.node} style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 6, backgroundColor: `${v.color}10`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: v.color }} />
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#a1a1aa', flex: 1 }}>{v.node}</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: v.color }}>{v.rule}</span>
          </div>
        ))}

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <div style={{ borderRadius: 10, backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: ACCENT }}>VALIDATION COMPLETE</span>
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

function OptionRow({ label, description, selected }: { label: string; description: string; selected?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 8, border: `1px solid ${selected ? ACCENT : '#27273a'}`, ...(selected ? { backgroundColor: `${ACCENT}15` } : {}) }}>
      {selected ? (
        <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></div>
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

function CategoryBar({ label, total, passed, failed, color }: { label: string; total: number; passed: number; failed: number; color: string }) {
  const pct = (passed / total) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#a1a1aa' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>{passed} passed</span>
          {failed > 0 && <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color }}>{failed} failed</span>}
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, backgroundColor: '#1a1a24', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, backgroundColor: failed > 0 ? color : '#22c55e' }} />
      </div>
    </div>
  );
}

function ViolationCard({ severity, rule, title, description, node, expected, actual }: {
  severity: string; rule: string; title: string; description: string; node: string; expected: string; actual: string;
}) {
  const color = severity === 'critical' ? '#ef4444' : '#fbbf24';
  return (
    <div style={{ borderRadius: 10, backgroundColor: `${color}10`, border: `1px solid ${color}60`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: color }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>{title}</span>
        </div>
        <Chip label={rule} color={color} />
      </div>
      <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>{description}</span>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: '#71717a' }}>Node</span>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: ACCENT }}>{node}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: '#71717a' }}>Expected</span>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>{expected}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: '#71717a' }}>Actual</span>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color }}>{actual}</span>
        </div>
      </div>
    </div>
  );
}

function RecommendationRow({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 8, backgroundColor: `${ACCENT}10` }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{number}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>{title}</span>
        <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.4 }}>{description}</span>
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
