import { useState } from 'react';
import { Button, Input } from 'antd';
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
export default function BackwardAgentPage() {
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
              <ArrowLeftCircle size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Backward Agent</span>
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
          <span style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>Backward Root Cause Analysis</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Download size={14} />}>Export Log</Button>
            <Button danger icon={<Square size={14} />}>Stop Agent</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, backgroundColor: '#0a0a0f' }}>
          {/* ── Message 1: Symptom ── */}
          <MessageBubble name="Backward Agent" time="4 min ago" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Please describe the symptom you're observing, or select a node showing anomalous behavior:
            </span>
            <ContentCard title="Detected Anomalies">
              <OptionRow selected label="api-01 — Response time > 2s" description="P99 latency spiked from 400ms to 2.1s in the last 15 minutes" />
              <OptionRow label="lb-01 — 5xx error rate 12%" description="Error rate increased from 0.1% to 12% in the last hour" />
              <OptionRow label="cache-03 — Eviction rate high" description="Cache evictions jumped 4× indicating memory pressure" />
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '70%', borderRadius: '12px 12px 0 12px', backgroundColor: `${ACCENT}20`, border: `1px solid ${ACCENT}`, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>You</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>3 min ago</span>
              </div>
              <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5, textAlign: 'right' }}>
                Investigate api-01 response time spike. Find the root cause.
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>U</span>
            </div>
          </div>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Backward Agent" accent={ACCENT} badge={{ label: 'TRACING', color: ACCENT }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Tracing backward from api-01 through the dependency chain...
            </span>
            <ContentCard title="Backward Trace Progress">
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
                <span style={{ fontSize: 11, color: '#22c55e' }}>Trace complete - 100%</span>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Backward Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Root cause analysis complete. I traced 3 hops backward from api-01 and identified 2 root causes:
            </span>
            <div style={{ borderRadius: 12, backgroundColor: '#111118', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Root Cause Analysis Report</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>Symptom: api-01 latency</span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <SummaryCard value="2" label="Root Causes" color="#ef4444" />
                <SummaryCard value="3" label="Hops Deep" color={ACCENT} />
                <SummaryCard value="85%" label="Confidence" color="#22c55e" />
              </div>

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
            </div>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Backward Agent" time="just now" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What would you like to do next?
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton label="Investigate Another Symptom" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Forward from disk-vol-07" />
              <ActionButton label="Apply Fixes" />
            </div>
          </MessageBubble>
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#0d0d14', flexShrink: 0 }}>
          <Input style={{ flex: 1 }} placeholder="Describe a symptom to trace backward..."
            value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="primary">
            Trace Back
          </Button>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Trace Context</span>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Symptom Node</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#ef4444' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>api-01 (APIGateway)</span>
          </div>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Analysis Type</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>Root Cause Detection</span>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Symptom Metrics</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>P99 Latency</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>2.1s</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Normal P99</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>400ms</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Degradation</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>5.25×</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>TRACE PATH</SectionLabel>
        {[
          { hop: 'Symptom', node: 'api-01', status: 'P99: 2.1s', color: '#ef4444' },
          { hop: 'Hop 1', node: 'cache-02', status: 'Hit: 34%', color: '#fbbf24' },
          { hop: 'Hop 2', node: 'db-02', status: 'Query: 450ms', color: '#f59e0b' },
          { hop: 'Root', node: 'disk-vol-07', status: 'I/O: 82%', color: '#ef4444' },
        ].map((r) => (
          <div key={r.node} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#71717a', width: 52 }}>{r.hop}</span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#a1a1aa', flex: 1 }}>{r.node}</span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: r.color }}>{r.status}</span>
          </div>
        ))}

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <div style={{ borderRadius: 10, backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: ACCENT }}>TRACE COMPLETE</span>
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

function RootCauseCard({ number, title, confidence, description, path }: { number: number; title: string; confidence: string; description: string; path: string }) {
  return (
    <div style={{ borderRadius: 10, backgroundColor: '#ef444410', border: '1px solid #ef4444', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{number}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>{title}</span>
        </div>
        <Chip label={`${confidence} confidence`} color="#22c55e" />
      </div>
      <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>{description}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#71717a' }}>Path:</span>
        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>{path}</span>
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
