import { useState } from 'react';
import { Button, Input } from 'antd';
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
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: '#71717a' }}>
      {children}
    </span>
  );
}

function Chip({ label, color, filled }: { label: string; color: string; filled?: boolean }) {
  return (
    <div
      style={{
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 2,
        paddingBottom: 2,
        borderRadius: 4,
        backgroundColor: filled ? color : `${color}20`,
        display: 'inline-flex',
        alignItems: 'center',
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
export default function AgentConversationFlowPage() {
  const [input, setInput] = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0a0a0f' }}>
      {/* ── Left Sidebar ── */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 20,
          backgroundColor: '#0d0d14',
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Share2 size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5' }}>Ontology</span>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        {/* Active Agent */}
        <SectionLabel>ACTIVE AGENT</SectionLabel>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: 'rgba(var(--primary-rgb), 0.08)',
            border: '1px solid var(--primary-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>AI</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Bottleneck Agent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#22c55e' }}>Running</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        {/* Execution Steps */}
        <SectionLabel>EXECUTION STEPS</SectionLabel>
        {executionSteps.map((step) => (
          <div
            key={step.number}
            style={{
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 6,
              backgroundColor: '#22c55e15',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              ...(step.active ? { border: '1px solid #22c55e' } : {}),
            }}
          >
            <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>
            <span style={{ fontSize: 12, color: '#22c55e' }}>
              {step.number}. {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 76,
            paddingLeft: 24,
            paddingRight: 24,
            backgroundColor: '#0d0d14',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>Agent Conversation</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Download size={14} />}>
              Export Log
            </Button>
            <Button danger icon={<Square size={14} />}>
              Stop Agent
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflow: 'auto', paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20, backgroundColor: '#0a0a0f' }}>
          {/* ── Message 1: Schema ── */}
          <MessageBubble name="Bottleneck Agent" time="2 min ago">
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              I've loaded the Ontology Schema. Here's the class structure I found:
            </span>
            <ContentCard title="Ontology Schema">
              <D3TopologyGraph
                nodes={[
                  { id: 'server', label: 'Server', layer: 0, color: 'var(--primary-color)' },
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
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Based on the schema, I've built the instance topology. Here are the actual connections:
            </span>
            <ContentCard title="Instance Topology (27 instances)">
              <D3TopologyGraph
                nodes={[
                  { id: 'srv', label: 'srv-01..12', sublabel: '12 servers', layer: 0, color: 'var(--primary-color)' },
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
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Which relations should I analyze for bottleneck detection? Please select:
            </span>
            <ContentCard title="Available Relations">
              <OptionRow selected label="connects_to" description="Server → Database (12 connections)" />
              <OptionRow selected label="uses" description="Database → CacheNode (6 connections)" />
              <OptionRow label="routes_to" description="CacheNode → APIGateway (4 connections)" />
            </ContentCard>
          </MessageBubble>

          {/* ── User Message ── */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <div
              style={{
                maxWidth: '70%',
                borderRadius: '12px 12px 0 12px',
                backgroundColor: 'rgba(var(--primary-rgb), 0.13)',
                border: '1px solid var(--primary-color)',
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 12,
                paddingBottom: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-color)' }}>You</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>just now</span>
              </div>
              <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5, textAlign: 'right' }}>
                Confirmed. Please proceed with connects_to and uses relations.
              </span>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>U</span>
            </div>
          </div>

          {/* ── Message 4: Progress ── */}
          <MessageBubble name="Bottleneck Agent" badge={{ label: 'EXECUTING', color: '#fbbf24' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Starting bottleneck analysis on selected relations. Traversing topology...
            </span>
            <ContentCard title="Execution Progress">
              {progressSteps.map((step) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>
                  <span style={{ fontSize: 13, color: '#22c55e', flex: 1 }}>{step.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#71717a' }}>{step.detail}</span>
                </div>
              ))}
              {/* Progress bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: '#1a1a24', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', borderRadius: 3, backgroundColor: '#22c55e' }} />
                </div>
                <span style={{ fontSize: 11, color: '#22c55e' }}>Analysis complete - 100%</span>
              </div>
            </ContentCard>
          </MessageBubble>

          {/* ── Message 5: Results ── */}
          <MessageBubble name="Bottleneck Agent" badge={{ label: 'COMPLETED', color: '#22c55e' }}>
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              Analysis complete! I found 1 critical bottleneck and 2 warnings. Here's the detailed report:
            </span>
            <div
              style={{
                borderRadius: 12,
                backgroundColor: '#111118',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Results header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Bottleneck Analysis Report</span>
                <span style={{ fontSize: 11, color: '#71717a' }}>Generated just now</span>
              </div>

              {/* Summary cards */}
              <div style={{ display: 'flex', gap: 12 }}>
                <SummaryCard value="1" label="Critical" color="#ef4444" />
                <SummaryCard value="2" label="Warnings" color="#fbbf24" />
                <SummaryCard value="24" label="Healthy" color="#22c55e" />
              </div>

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
              <div
                style={{
                  borderRadius: 10,
                  backgroundColor: '#ef444410',
                  border: '1px solid #ef4444',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#ef4444' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#f4f4f5' }}>cache-02</span>
                  </div>
                  <Chip label="BOTTLENECK" color="#ef4444" filled />
                </div>
                <span style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>
                  CacheNode instance is operating at 94% capacity. Memory utilization critical at 3.8GB / 4GB limit.
                </span>
                <div style={{ display: 'flex', gap: 16 }}>
                  <MetricItem label="CPU" value="87%" color="#fbbf24" />
                  <MetricItem label="Memory" value="94%" color="#ef4444" />
                  <MetricItem label="Connections" value="1,847" color="#f4f4f5" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#71717a' }}>Path:</span>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)' }}>
                    srv-03 → db-02 → cache-02
                  </span>
                </div>
              </div>

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
            </div>
          </MessageBubble>

          {/* ── Message 6: Actions ── */}
          <MessageBubble name="Bottleneck Agent" time="just now">
            <span style={{ fontSize: 14, color: '#f4f4f5', lineHeight: 1.5 }}>
              What would you like to do next?
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ActionButton label="Run What-if Analysis" primary />
              <ActionButton label="Export Report" />
              <ActionButton label="Deep Dive cache-02" />
              <ActionButton label="Apply Recommendations" />
            </div>
          </MessageBubble>
        </div>

        {/* Input Area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 16,
            paddingBottom: 16,
            backgroundColor: '#0d0d14',
            flexShrink: 0,
          }}
        >
          <Input
            style={{ flex: 1 }}
            placeholder="Type a message or use buttons to respond..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="primary">
            Confirm Selection
          </Button>
          <Button>
            Select All
          </Button>
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <div
        style={{
          width: 340,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 20,
          backgroundColor: '#0d0d14',
          overflow: 'auto',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Execution Context</span>

        {/* Context Card 1: Starting Point */}
        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Starting Point</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: 'var(--primary-color)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Server (Class)</span>
          </div>
        </div>

        {/* Context Card 2: Analysis Type */}
        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Analysis Type</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-color)' }}>Bottleneck Detection</span>
        </div>

        {/* Context Card 3: Threshold Settings */}
        <div style={{ borderRadius: 10, backgroundColor: '#111118', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Threshold Settings</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Capacity Warning</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24' }}>85%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>Capacity Critical</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#ef4444' }}>95%</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        {/* Selected Relations */}
        <SectionLabel>SELECTED RELATIONS</SectionLabel>
        <div style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 6, backgroundColor: '#22c55e15', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e' }}>connects_to</span>
        </div>
        <div style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 6, backgroundColor: '#f59e0b15', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' }} />
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b' }}>uses</span>
        </div>

        <div style={{ height: 1, backgroundColor: '#27273a' }} />

        {/* Metrics to Analyze */}
        <SectionLabel>METRICS TO ANALYZE</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {metricsToAnalyze.map((m) => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--primary-color)' }}>✓</span>
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>{m}</span>
            </div>
          ))}
        </div>

        {/* Execution Summary */}
        <div
          style={{
            borderRadius: 10,
            backgroundColor: '#22c55e10',
            border: '1px solid #22c55e',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: '#22c55e' }}>
            EXECUTION COMPLETE
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
    <div style={{ display: 'flex', gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>AI</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-color)' }}>{name}</span>
          {badge && <Chip label={badge.label} color={badge.color} />}
          {time && <span style={{ fontSize: 11, color: '#71717a' }}>{time}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Dark content card ── */
function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 12,
        backgroundColor: '#111118',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a' }}>{title}</span>
      {children}
    </div>
  );
}

/* ── Selectable option row ── */
function OptionRow({ label, description, selected }: { label: string; description: string; selected?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 8,
        border: selected ? '1px solid #22c55e' : '1px solid #27273a',
        ...(selected ? { backgroundColor: '#22c55e15' } : {}),
      }}
    >
      {selected ? (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            backgroundColor: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={12} color="#000" />
        </div>
      ) : (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            border: '1px solid #71717a',
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? '#f4f4f5' : '#a1a1aa' }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: selected ? '#a1a1aa' : '#71717a' }}>{description}</span>
      </div>
    </div>
  );
}

/* ── Summary card ── */
function SummaryCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 8,
        backgroundColor: `${color}15`,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color }}>{label}</span>
    </div>
  );
}

/* ── Metric item ── */
function MetricItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, color: '#71717a' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color }}>{value}</span>
    </div>
  );
}

/* ── Warning row ── */
function WarningRow({ title, description, value }: { title: string; description: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 12,
        paddingBottom: 12,
        borderRadius: 8,
        backgroundColor: '#fbbf2410',
        border: '1px solid #fbbf24',
      }}
    >
      <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#fbbf24', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, color: '#f4f4f5' }}>{title}</span>
        <span style={{ fontSize: 11, color: '#a1a1aa' }}>{description}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24' }}>
        {value}
      </span>
    </div>
  );
}

/* ── Recommendation row ── */
function RecommendationRow({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(var(--primary-rgb), 0.06)',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{number}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>{title}</span>
        <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.4 }}>{description}</span>
      </div>
    </div>
  );
}

/* ── Action button ── */
function ActionButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <div
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 8,
        backgroundColor: primary ? 'rgba(var(--primary-rgb), 0.13)' : '#1a1a24',
        border: primary ? '1px solid var(--primary-color)' : '1px solid #27273a',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 13, color: primary ? 'var(--primary-color)' : '#a1a1aa' }}>{label}</span>
    </div>
  );
}
