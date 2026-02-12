import { useState } from 'react';
import { Button, Input } from 'antd';
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
export default function PatternAgentPage() {
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
              <Fingerprint size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Pattern Agent</span>
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
          <span style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>Pattern Recognition</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Download size={14} />}>Export Log</Button>
            <Button danger icon={<Square size={14} />}>Stop Agent</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, backgroundColor: '#0a0a0f' }}>
          {/* ── Message 1: Configure scan ── */}
          <MessageBubble name="Pattern Agent" time="4 min ago" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              I can scan for various pattern types across your topology. What should I look for?
            </span>
            <ContentCard title="Pattern Categories">
              <OptionRow selected label="Structural Patterns" description="Recurring topology structures (star, chain, mesh, hub-spoke)" />
              <OptionRow selected label="Failure Patterns" description="Recurring failure sequences and cascading failure chains" />
              <OptionRow selected label="Load Patterns" description="Periodic load spikes, traffic waves, hotspot migration" />
              <OptionRow label="Growth Patterns" description="Capacity trends, scaling events, resource exhaustion trajectories" />
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
                Scan for all selected patterns over the last 7 days.
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>U</span>
            </div>
          </div>

          {/* ── Message 2: Progress ── */}
          <MessageBubble name="Pattern Agent" accent={ACCENT} badge={{ label: 'SCANNING', color: ACCENT }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Scanning topology and historical data for recurring patterns...
            </span>
            <ContentCard title="Scan Progress">
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
                <span style={{ fontSize: 11, color: '#22c55e' }}>Scan complete - 100%</span>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 3: Results ── */}
          <MessageBubble name="Pattern Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Pattern scan complete. Detected 4 significant patterns and 3 anomalies across the topology:
            </span>
            <div style={{ borderRadius: 12, backgroundColor: '#111118', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Pattern Recognition Report</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>Last 7 days · 31 nodes</span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <SummaryCard value="2" label="Structural" color={ACCENT} />
                <SummaryCard value="1" label="Failure" color="#ef4444" />
                <SummaryCard value="1" label="Load" color="#f59e0b" />
              </div>

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
                <div style={{ borderRadius: 8, backgroundColor: '#0a0a0f', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { time: 'Mon 14:23', chain: 'cache-02 (OOM) → api-01 (timeout) → lb-01 (5xx)', dur: '12min' },
                    { time: 'Wed 14:45', chain: 'cache-02 (OOM) → api-01 (timeout) → lb-01 (5xx)', dur: '8min' },
                    { time: 'Fri 15:02', chain: 'cache-02 (OOM) → api-01 (timeout) → lb-01 (5xx)', dur: '15min' },
                  ].map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#71717a', width: 64 }}>{e.time}</span>
                      <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444', flex: 1 }}>{e.chain}</span>
                      <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24' }}>{e.dur}</span>
                    </div>
                  ))}
                </div>
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
                <div style={{ borderRadius: 8, backgroundColor: '#0a0a0f', padding: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: 60 }}>
                  {[20, 25, 30, 35, 82, 88, 75, 45, 35, 30, 28, 25].map((h, i) => (
                    <div key={i} style={{
                      width: 14, height: `${h}%`, borderRadius: 2,
                      backgroundColor: h > 70 ? '#f59e0b' : '#27273a',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 12, paddingRight: 12 }}>
                  <span style={{ fontSize: 8, color: '#71717a' }}>06:00</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: '#f59e0b' }}>09:00</span>
                  <span style={{ fontSize: 8, color: '#71717a' }}>12:00</span>
                </div>
              </PatternCard>

              {/* Recommendations */}
              <SectionLabel>RECOMMENDATIONS</SectionLabel>
              <RecommendationRow number={1} title="Add redundancy to db-02 hub"
                description="Deploy read replica db-07 to break single-point-of-failure. Distribute cache connections across both databases." />
              <RecommendationRow number={2} title="Increase cache-02 memory before 14:00 UTC"
                description="Recurring OOM at 14:00–16:00 suggests scheduled workload. Pre-scale memory or schedule eviction before peak." />
              <RecommendationRow number={3} title="Pre-scale servers before 09:00 UTC"
                description="Predictable daily spike allows proactive scaling. Spin up srv-13/14 at 08:45 and drain after 10:00." />
            </div>
          </MessageBubble>

          {/* ── Message 4: Actions ── */}
          <MessageBubble name="Pattern Agent" time="just now" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What would you like to do next?
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton label="Scan Longer Period" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Set Up Alerts" />
              <ActionButton label="Auto-remediate" />
            </div>
          </MessageBubble>
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#0d0d14', flexShrink: 0 }}>
          <Input style={{ flex: 1 }} placeholder="Describe a pattern to search for..."
            value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="primary">
            Scan Patterns
          </Button>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Pattern Context</span>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Scan Window</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>Last 7 Days</span>
          <span style={{ fontSize: 11, color: '#a1a1aa' }}>Jan 28 – Feb 04, 2025</span>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Data Points</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Nodes scanned</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>31</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Events analyzed</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>48</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Metrics sampled</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>2,016</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>DETECTED PATTERNS</SectionLabel>
        {[
          { name: 'Hub-Spoke (db-02)', confidence: '92%', type: 'Structural', color: ACCENT },
          { name: 'Chain Dependency', confidence: '88%', type: 'Structural', color: ACCENT },
          { name: 'Cascade Failure', confidence: '78%', type: 'Failure', color: '#ef4444' },
          { name: 'Daily Load Spike', confidence: '95%', type: 'Load', color: '#f59e0b' },
        ].map((p) => (
          <div key={p.name} style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 6, backgroundColor: `${p.color}10`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.color }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, color: '#a1a1aa', display: 'block' }}>{p.name}</span>
              <span style={{ fontSize: 9, color: '#71717a', display: 'block' }}>{p.type}</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: p.color }}>{p.confidence}</span>
          </div>
        ))}

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <div style={{ borderRadius: 10, backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: ACCENT }}>SCAN COMPLETE</span>
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

function PatternCard({ number, title, confidence, description, occurrences, color, children }: {
  number: number; title: string; confidence: number; description: string; occurrences: string; color: string; children?: React.ReactNode;
}) {
  return (
    <div style={{ borderRadius: 10, backgroundColor: `${color}10`, border: `1px solid ${color}50`, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{number}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>{title}</span>
        </div>
        <Chip label={`${confidence}%`} color={color} />
      </div>
      <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>{description}</span>
      {children}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#71717a' }}>Occurrences:</span>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color }}>{occurrences}</span>
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
