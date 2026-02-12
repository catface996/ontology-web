import { useState } from 'react';
import { Button, Input } from 'antd';
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
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#71717a' }}>
      {children}
    </span>
  );
}

function Chip({ label, color, filled }: { label: string; color: string; filled?: boolean }) {
  return (
    <div
      style={{
        paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 4,
        backgroundColor: filled ? color : `${color}20`,
        display: 'inline-flex', alignItems: 'center',
      }}
    >
      <span style={{ fontSize: filled ? 9 : 10, fontWeight: 600, color: filled ? '#fff' : color }}>
        {label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   Page
   ══════════════════════════════════════════ */
export default function WhatIfAgentPage() {
  const [input, setInput] = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0a0a0f' }}>
      {/* ── Left Sidebar ── */}
      <div
        style={{
          width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
          gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Share2 size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5' }}>Ontology</span>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>ACTIVE AGENT</SectionLabel>
        <div
          style={{
            padding: 12, borderRadius: 8, backgroundColor: `${ACCENT}15`,
            border: `1px solid ${ACCENT}`,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>What-if Agent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#22c55e' }}>Running</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>EXECUTION STEPS</SectionLabel>
        {executionSteps.map((step) => (
          <div
            key={step.number}
            style={{
              paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, borderRadius: 6, backgroundColor: '#22c55e15',
              display: 'flex', alignItems: 'center', gap: 10,
              ...(step.active ? { border: '1px solid #22c55e' } : {}),
            }}
          >
            <span style={{ fontSize: 12, color: '#22c55e' }}>&#10003;</span>
            <span style={{ fontSize: 12, color: '#22c55e' }}>
              {step.number}. {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 76, paddingLeft: 24, paddingRight: 24, backgroundColor: '#0d0d14', flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>What-if Scenario Analysis</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Download size={14} />}>Export Log</Button>
            <Button danger icon={<Square size={14} />}>Stop Agent</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, backgroundColor: '#0a0a0f' }}>
          {/* ── Message 1: Current topology ── */}
          <MessageBubble name="What-if Agent" time="3 min ago" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              I've loaded the current topology. Here's the baseline state before simulation:
            </span>
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
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What scenario would you like to simulate? Here are some suggestions:
            </span>
            <ContentCard title="Scenario Options">
              <OptionRow selected label="Remove srv-03" description="Simulate server failure — 4 connections will be re-routed" />
              <OptionRow label="Double traffic on srv-01" description="Simulate traffic spike — load increases from 42% to ~84%" />
              <OptionRow label="Add new cache-05 instance" description="Simulate scale-out — redistribute cache load" />
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <div
              style={{
                maxWidth: '70%', borderRadius: '12px 12px 0 12px',
                backgroundColor: `${ACCENT}20`, border: `1px solid ${ACCENT}`,
                paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>You</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>2 min ago</span>
              </div>
              <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5, textAlign: 'right' }}>
                Remove srv-03 and show me the cascading impact.
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>U</span>
            </div>
          </div>

          {/* ── Message 3: Simulation progress ── */}
          <MessageBubble name="What-if Agent" accent={ACCENT} badge={{ label: 'SIMULATING', color: ACCENT }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Running scenario: <strong>Remove srv-03</strong>. Recalculating topology...
            </span>
            <ContentCard title="Simulation Progress">
              {progressSteps.map((step) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <span style={{ fontSize: 12, color: '#22c55e' }}>&#10003;</span>
                  <span style={{ fontSize: 13, color: '#22c55e', flex: 1 }}>{step.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#71717a' }}>{step.detail}</span>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: '#1a1a24', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', borderRadius: 3, backgroundColor: '#22c55e' }} />
                </div>
                <span style={{ fontSize: 11, color: '#22c55e' }}>Simulation complete - 100%</span>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 4: Results ── */}
          <MessageBubble name="What-if Agent" accent={ACCENT} badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Scenario simulation complete. Removing srv-03 would cause cascading load increases across 3 layers:
            </span>
            <div style={{ borderRadius: 12, backgroundColor: '#111118', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>What-if Impact Report</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>Scenario: Remove srv-03</span>
              </div>

              {/* Summary cards */}
              <div style={{ display: 'flex', gap: 12 }}>
                <SummaryCard value="1" label="Failures" color="#ef4444" />
                <SummaryCard value="3" label="Overloaded" color="#fbbf24" />
                <SummaryCard value="4" label="Affected" color={ACCENT} />
              </div>

              {/* Before / After comparison */}
              <SectionLabel>BEFORE vs AFTER</SectionLabel>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, borderRadius: 10, backgroundColor: '#0a0a0f', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Chip label="BEFORE" color="#71717a" />
                  <D3TopologyGraph
                    nodes={baselineNodes}
                    edges={baselineEdges}
                    nodeWidth={56}
                  />
                </div>
                <div style={{ flex: 1, borderRadius: 10, backgroundColor: '#0a0a0f', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Chip label="AFTER" color={ACCENT} />
                  <D3TopologyGraph
                    nodes={afterNodes}
                    edges={afterEdges}
                    nodeWidth={56}
                  />
                </div>
              </div>

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
            </div>
          </MessageBubble>

          {/* ── Message 5: Actions ── */}
          <MessageBubble name="What-if Agent" time="just now" accent={ACCENT}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What would you like to do next?
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton label="Try Another Scenario" primary accent={ACCENT} />
              <ActionButton label="Export Report" />
              <ActionButton label="Compare with Baseline" />
              <ActionButton label="Apply Mitigations" />
            </div>
          </MessageBubble>
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#0d0d14', flexShrink: 0 }}>
          <Input
            style={{ flex: 1 }}
            placeholder="Describe a scenario to simulate..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="primary">
            Run Scenario
          </Button>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 20, backgroundColor: '#0d0d14', overflow: 'auto' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Scenario Context</span>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Scenario Type</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>Node Removal</span>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Target Node</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#ef4444' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>srv-03 (Server)</span>
          </div>
        </div>

        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Impact Radius</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Direct dependents</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>4</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Indirect dependents</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: ACCENT }}>4</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Total affected</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>8</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <SectionLabel>LOAD CHANGES</SectionLabel>
        {[
          { node: 'srv-01', before: '42%', after: '67%', color: '#f59e0b' },
          { node: 'srv-02', before: '55%', after: '78%', color: '#f59e0b' },
          { node: 'srv-04', before: '38%', after: '62%', color: '#f59e0b' },
          { node: 'db-01', before: '60%', after: '82%', color: '#fbbf24' },
        ].map((r) => (
          <div key={r.node} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#a1a1aa', width: 48 }}>{r.node}</span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#71717a' }}>{r.before}</span>
            <span style={{ fontSize: 11, color: '#71717a' }}>&rarr;</span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: r.color }}>{r.after}</span>
          </div>
        ))}

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        <div
          style={{
            borderRadius: 10, backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}`,
            padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: ACCENT }}>
            SIMULATION COMPLETE
          </span>
          {executionStats.map((s) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: s.valueColor ?? '#f4f4f5' }}>
                {s.value}
              </span>
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

function MessageBubble({
  name, time, badge, children, accent,
}: {
  name: string; time?: string; accent?: string;
  badge?: { label: string; color: string };
  children: React.ReactNode;
}) {
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
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
        borderRadius: 8, border: `1px solid ${selected ? ACCENT : '#27273a'}`,
        ...(selected ? { backgroundColor: `${ACCENT}15` } : {}),
      }}
    >
      {selected ? (
        <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={12} color="#000" />
        </div>
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

function CascadeRow({ step, title, description, color }: { step: number; title: string; description: string; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 8, backgroundColor: `${color}10`, border: `1px solid ${color}40` }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{step}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>{title}</span>
        <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.4 }}>{description}</span>
      </div>
    </div>
  );
}

function RecommendationRow({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 8, backgroundColor: 'rgba(var(--primary-rgb), 0.06)' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
    <div
      style={{
        paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 8,
        backgroundColor: primary ? `${a}20` : '#1a1a24',
        border: `1px solid ${primary ? a : '#27273a'}`,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 13, color: primary ? a : '#a1a1aa' }}>{label}</span>
    </div>
  );
}
