import { useState } from 'react';
import { Button, Input } from 'antd';
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
  { afterLayer: 0, text: 'uses (×4 connections)', color: '#06b6d4' },
  { afterLayer: 1, text: 'serves (×2 connections each)', color: '#06b6d4' },
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
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#71717a' }}>
      {children}
    </span>
  );
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
export default function ForwardAgentPage() {
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
              <ArrowRightCircle size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Forward Agent</span>
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
          <span style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>Forward Propagation Analysis</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Download size={14} />}>Export Log</Button>
            <Button danger icon={<Square size={14} />}>Stop Agent</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, backgroundColor: '#0a0a0f' }}>
          {/* ── Message 1: Source node ── */}
          <MessageBubble name="Forward Agent" time="3 min ago" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              I've loaded the topology. Please select the source node and the change event to propagate forward:
            </span>
            <ContentCard title="Select Source Node">
              <OptionRow selected label="db-02 (Database)" description="Central database — 8 downstream dependents" accent={ACCENT} />
              <OptionRow label="srv-03 (Server)" description="Application server — 4 downstream dependents" accent={ACCENT} />
              <OptionRow label="cache-01 (CacheNode)" description="Cache layer — 2 downstream dependents" accent={ACCENT} />
            </ContentCard>
          </MessageBubble>

          {/* ── Message 2: Define change ── */}
          <MessageBubble name="Forward Agent" time="2 min ago" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What change event should I propagate from <strong>db-02</strong>?
            </span>
            <ContentCard title="Change Event">
              <OptionRow selected label="Latency +200ms" description="Database response time increases by 200ms" accent={ACCENT} />
              <OptionRow label="Throughput -50%" description="Database throughput drops by half" accent={ACCENT} />
              <OptionRow label="Connection limit reached" description="Max connections hit — new requests queued" accent={ACCENT} />
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
                Propagate latency +200ms from db-02 and show all downstream impact.
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>U</span>
            </div>
          </div>

          {/* ── Message 3: Progress ── */}
          <MessageBubble name="Forward Agent" accent={ACCENT} badge={{ label: 'PROPAGATING', color: ACCENT }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Propagating latency change forward through topology from db-02...
            </span>
            <ContentCard title="Propagation Progress">
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
                <span style={{ fontSize: 11, color: '#22c55e' }}>Propagation complete - 100%</span>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 4: Results ── */}
          <MessageBubble name="Forward Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Forward propagation complete. A +200ms latency at db-02 cascades through 3 layers affecting 8 nodes:
            </span>
            <div style={{ borderRadius: 12, backgroundColor: '#111118', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Forward Propagation Report</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>Source: db-02 (+200ms)</span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <SummaryCard value="3" label="Layers Deep" color={ACCENT} />
                <SummaryCard value="8" label="Nodes Hit" color="#fbbf24" />
                <SummaryCard value="+540ms" label="Max Latency" color="#ef4444" />
              </div>

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
            </div>
          </MessageBubble>

          {/* ── Message 5: Actions ── */}
          <MessageBubble name="Forward Agent" time="just now" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What would you like to do next?
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton label="Trace Another Source" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Run Backward from lb-01" />
              <ActionButton label="Simulate Mitigation" />
            </div>
          </MessageBubble>
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#0d0d14', flexShrink: 0 }}>
          <Input style={{ flex: 1 }} placeholder="Select a source node or describe a change event..."
            value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="primary">
            Propagate
          </Button>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Propagation Context</span>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Source Node</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#3b82f6' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>db-02 (Database)</span>
          </div>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Change Event</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>Latency +200ms</span>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Propagation Settings</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Max depth</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>∞</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Decay factor</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>0.7×</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>PROPAGATION PATH</SectionLabel>
        {[
          { depth: '0', node: 'db-02', latency: '+200ms', color: '#ef4444' },
          { depth: '1', node: 'cache-*', latency: '+200ms', color: '#fbbf24' },
          { depth: '2', node: 'api-*', latency: '+340ms', color: '#f59e0b' },
          { depth: '3', node: 'lb-*', latency: '+540ms', color: '#ef4444' },
        ].map((r) => (
          <div key={r.depth} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#71717a', width: 16 }}>L{r.depth}</span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#a1a1aa', flex: 1 }}>{r.node}</span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: r.color }}>{r.latency}</span>
          </div>
        ))}

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <div style={{ borderRadius: 10, backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: ACCENT }}>PROPAGATION COMPLETE</span>
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

function ImpactRow({ node, impact, description, severity }: { node: string; impact: string; description: string; severity: string }) {
  const severityColor = severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f59e0b' : '#fbbf24';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: 12, paddingRight: 12, paddingTop: 12, paddingBottom: 12, borderRadius: 8, backgroundColor: `${severityColor}10`, border: `1px solid ${severityColor}40` }}>
      <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: severityColor, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#f4f4f5' }}>{node}</span>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: severityColor }}>{impact}</span>
        </div>
        <span style={{ fontSize: 11, color: '#a1a1aa' }}>{description}</span>
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
