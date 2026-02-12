import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Breadcrumb, Checkbox, Select } from 'antd';
import {
  ChevronRight, Play, List, GitFork, Settings2, Zap,
  Download, Factory, TriangleAlert, Package, GitBranch, Timer, TrendingUp,
  Workflow, Gauge, Cpu, CircleCheck,
} from 'lucide-react';
import * as d3 from 'd3';
import { useHeader } from '../contexts/HeaderContext';

/* ── Types ── */
type ViewMode = 'list' | 'graph';

/* ── Mock inference data ── */
const inferences = [
  {
    id: 1,
    icon: Factory,
    iconColor: 'var(--primary-color)',
    iconBg: 'rgba(var(--primary-rgb), 0.13)',
    title: 'Production Line A → Order #1024',
    badge: '98%',
    badgeColor: '#22C55E',
    description:
      'Based on capacity constraints and resource availability, Order #1024 should be assigned to Production Line A for optimal throughput.',
    ruleTag: 'Capacity Rule',
    meta: { type: 'time', label: 'Est. 4h 30m' },
  },
  {
    id: 2,
    icon: TriangleAlert,
    iconColor: '#F59E0B',
    iconBg: '#F59E0B20',
    title: 'Resource Conflict: Machine M3',
    badge: 'Warning',
    badgeColor: '#F59E0B',
    description:
      'Machine M3 is scheduled for maintenance during Order #1025 production window. Recommend rescheduling to Line B or delaying start time.',
    ruleTag: 'Resource Rule',
    meta: { type: 'action', label: 'Auto-resolve' },
  },
  {
    id: 3,
    icon: Package,
    iconColor: '#22C55E',
    iconBg: '#22C55E20',
    title: 'Batch Optimization: Orders #1026-1028',
    badge: '95%',
    badgeColor: '#22C55E',
    description:
      'Orders #1026, #1027, and #1028 share common components. Batching these orders reduces setup time by 40% and improves material utilization.',
    ruleTag: 'Dependency Rule',
    meta: { type: 'savings', label: '40% time saved' },
  },
];

/* ── Inference chain steps ── */
const chainSteps = [
  {
    num: '1',
    title: 'Input Analysis',
    desc: 'Parsed Order #1024 requirements: 500 units, priority HIGH, due in 48h',
    color: 'var(--primary-color)',
  },
  {
    num: '2',
    title: 'Capacity Check',
    desc: 'Line A: 800 units/day capacity, 60% utilization → Available',
    color: 'var(--primary-color)',
  },
  {
    num: '3',
    title: 'Resource Matching',
    desc: 'Required: Machine M1, M2. Both available on Line A during window',
    color: 'var(--primary-color)',
  },
  {
    num: '✓',
    title: 'Conclusion',
    desc: 'Assign Order #1024 to Line A with 98% confidence score',
    color: '#22C55E',
  },
];

/* ── Inference rules ── */
const inferenceRules = [
  { label: 'Capacity Constraints', checked: true },
  { label: 'Resource Availability', checked: true },
  { label: 'Priority Ordering', checked: false },
  { label: 'Dependency Chain', checked: true },
];

/* ── Graph view nodes ── */
const graphNodes = {
  input: { icon: Package, label: 'Order #1024', color: 'var(--primary-color)', bg: 'var(--primary-color)' },
  checks: [
    { icon: Gauge, label: 'Capacity', status: '60% ✓' },
    { icon: Cpu, label: 'Resources', status: 'M1,M2 ✓' },
    { icon: GitBranch, label: 'Depends', status: 'None ✓' },
  ],
  lineA: { icon: Factory, label: 'Production Line A', status: '800 units/day' },
  result: { icon: CircleCheck, label: 'Assigned', sub: '98% confidence' },
};

/* ── SVG icon paths (lucide) ── */
const ICON_PACKAGE = 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12';
const ICON_GAUGE = 'M12 16.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM15.4 10.2l-2.7 2.1M2 12a10 10 0 1 1 20 0 10 10 0 1 1-20 0';
const ICON_CPU = 'M6 9H4M6 15H4M20 9h-2M20 15h-2M9 6V4M15 6V4M9 20v-2M15 20v-2M6 9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9zM10 10h4v4h-4v-4z';
const ICON_GITBRANCH = 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9';
const ICON_FACTORY = 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4';
const ICON_CIRCLECHECK = 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3';

/* ── Graph flow node definitions ── */
interface FlowNode {
  id: string;
  row: number;
  col: number;
  w: number;
  h: number;
  rx: number;
  fill: string;
  stroke: string | null;
  strokeWidth: number;
  icon: string;
  iconColor: string;
  label: string;
  labelColor: string;
  sub?: string;
  subColor?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  color: string;
}

const flowNodes: FlowNode[] = [
  { id: 'input', row: 0, col: 1, w: 152, h: 72, rx: 14, fill: 'var(--primary-color)', stroke: null, strokeWidth: 0, icon: ICON_PACKAGE, iconColor: '#fff', label: 'Order #1024', labelColor: '#fff' },
  { id: 'capacity', row: 1, col: 0, w: 120, h: 60, rx: 12, fill: '#16163a', stroke: 'var(--primary-color)', strokeWidth: 2, icon: ICON_GAUGE, iconColor: 'var(--primary-color)', label: 'Capacity', labelColor: '#e4e4e7', sub: '60% ✓', subColor: '#22C55E' },
  { id: 'resources', row: 1, col: 1, w: 120, h: 60, rx: 12, fill: '#16163a', stroke: 'var(--primary-color)', strokeWidth: 2, icon: ICON_CPU, iconColor: 'var(--primary-color)', label: 'Resources', labelColor: '#e4e4e7', sub: 'M1,M2 ✓', subColor: '#22C55E' },
  { id: 'depends', row: 1, col: 2, w: 120, h: 60, rx: 12, fill: '#16163a', stroke: 'var(--primary-color)', strokeWidth: 2, icon: ICON_GITBRANCH, iconColor: 'var(--primary-color)', label: 'Depends', labelColor: '#e4e4e7', sub: 'None ✓', subColor: '#22C55E' },
  { id: 'lineA', row: 2, col: 1, w: 152, h: 66, rx: 12, fill: '#16163a', stroke: '#22C55E', strokeWidth: 2, icon: ICON_FACTORY, iconColor: '#22C55E', label: 'Production Line A', labelColor: '#e4e4e7', sub: '800 units/day', subColor: '#22C55E' },
  { id: 'result', row: 3, col: 1, w: 168, h: 76, rx: 14, fill: '#22C55E', stroke: null, strokeWidth: 0, icon: ICON_CIRCLECHECK, iconColor: '#fff', label: 'Assigned', labelColor: '#fff', sub: '98% confidence', subColor: 'rgba(255,255,255,0.6)' },
];

const flowEdges: FlowEdge[] = [
  { from: 'input', to: 'capacity', color: 'var(--primary-color)' },
  { from: 'input', to: 'resources', color: 'var(--primary-color)' },
  { from: 'input', to: 'depends', color: 'var(--primary-color)' },
  { from: 'capacity', to: 'lineA', color: 'var(--primary-color)' },
  { from: 'resources', to: 'lineA', color: 'var(--primary-color)' },
  { from: 'depends', to: 'lineA', color: 'var(--primary-color)' },
  { from: 'lineA', to: 'result', color: '#22C55E' },
];

/* ── Config Panel (shared by both views) ── */
function ConfigPanel({
  reasoningType,
  setReasoningType,
  sourceOntology,
  setSourceOntology,
  rules,
  onToggleRule,
}: {
  reasoningType: string;
  setReasoningType: (v: string) => void;
  sourceOntology: string;
  setSourceOntology: (v: string) => void;
  rules: { label: string; checked: boolean }[];
  onToggleRule: (index: number) => void;
}) {
  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #27273a',
        borderRadius: 12,
        backgroundColor: '#0d0d14',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          height: 56,
          flexShrink: 0,
          borderBottom: '1px solid #27273a',
        }}
      >
        <Settings2 size={18} color="var(--primary-color)" />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
          Reasoning Configuration
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
        {/* Reasoning Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>
            Reasoning Type
          </span>
          <Select
            value={reasoningType}
            onChange={(value) => setReasoningType(value)}
            style={{ width: '100%' }}
            options={[
              { value: 'production-scheduling', label: 'Production Scheduling' },
              { value: 'resource-allocation', label: 'Resource Allocation' },
              { value: 'dependency-analysis', label: 'Dependency Analysis' },
            ]}
          />
        </div>

        {/* Source Ontology */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>
            Source Ontology
          </span>
          <Select
            value={sourceOntology}
            onChange={(value) => setSourceOntology(value)}
            style={{ width: '100%' }}
            options={[
              { value: 'supply-chain', label: 'Supply Chain Ontology' },
              { value: 'manufacturing', label: 'Manufacturing Ontology' },
              { value: 'logistics', label: 'Logistics Ontology' },
            ]}
          />
        </div>

        {/* Inference Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>
            Inference Rules
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map((rule, i) => (
              <div
                key={i}
                onClick={() => onToggleRule(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  backgroundColor: '#1a1a24',
                  cursor: 'pointer',
                }}
              >
                <Checkbox
                  checked={rule.checked}
                  tabIndex={-1}
                />
                <span style={{ fontSize: 13, color: '#f4f4f5' }}>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Results Panel (list view) ── */
function ResultsPanel() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
        border: '1px solid #27273a',
        borderRadius: 12,
        backgroundColor: '#0d0d14',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: 56,
          flexShrink: 0,
          borderBottom: '1px solid #27273a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={18} color="#F59E0B" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
            Inference Results
          </span>
          <span
            style={{
              backgroundColor: '#22C55E20',
              color: '#22C55E',
              borderRadius: 100,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            12 inferences
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            backgroundColor: '#1a1a24',
            cursor: 'pointer',
          }}
        >
          <Download size={14} />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#f4f4f5' }}>Export</span>
        </div>
      </div>

      {/* Inference Cards */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        {inferences.map((inf) => {
          const Icon = inf.icon;
          return (
            <div
              key={inf.id}
              style={{
                padding: 16,
                borderRadius: 8,
                backgroundColor: '#1a1a24',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: inf.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={inf.iconColor} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: '#f4f4f5' }}>
                  {inf.title}
                </span>
                <span
                  style={{
                    backgroundColor: `${inf.badgeColor}20`,
                    color: inf.badgeColor,
                    borderRadius: 100,
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {inf.badge}
                </span>
              </div>

              {/* Description */}
              <span style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>
                {inf.description}
              </span>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <GitBranch size={12} color="#a1a1aa" />
                  <span style={{ fontSize: 11, color: '#a1a1aa' }}>
                    {inf.ruleTag}
                  </span>
                </div>
                {inf.meta.type === 'time' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Timer size={12} color="#a1a1aa" />
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>
                      {inf.meta.label}
                    </span>
                  </div>
                )}
                {inf.meta.type === 'action' && (
                  <span style={{ fontSize: 11, color: 'var(--primary-color)', fontWeight: 500 }}>
                    {inf.meta.label}
                  </span>
                )}
                {inf.meta.type === 'savings' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={12} color="#22C55E" />
                    <span style={{ fontSize: 11, color: '#22C55E' }}>
                      {inf.meta.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Inference Chain Panel (list view) ── */
function ChainPanel() {
  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #27273a',
        borderRadius: 12,
        backgroundColor: '#0d0d14',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          height: 56,
          flexShrink: 0,
          borderBottom: '1px solid #27273a',
        }}
      >
        <Workflow size={18} color="var(--primary-color)" />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
          Inference Chain
        </span>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#a1a1aa',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Reasoning Path
        </span>

        {chainSteps.map((step, i) => (
          <div key={i}>
            {/* Step */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>
                    {step.num}
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step.color === '#22C55E' ? '#22C55E' : '#f4f4f5' }}>
                  {step.title}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.4, paddingLeft: 28 }}>
                {step.desc}
              </span>
            </div>

            {/* Connector line */}
            {i < chainSteps.length - 1 && (
              <div
                style={{
                  width: 2,
                  height: 20,
                  backgroundColor: '#27273a',
                  marginLeft: 9,
                  marginTop: 8,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Graph Canvas (D3 rendered flow chart) ── */
function GraphCanvasView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    /* ── Layout constants ── */
    const rowGap = 56;
    const colGap = 52;
    const topPad = 60;

    /* ── Compute node positions ── */
    const colCenters = [0, 1, 2].map((c) => width / 2 + (c - 1) * (120 + colGap));

    const positions: Record<string, { x: number; y: number; w: number; h: number }> = {};
    let currentY = topPad;
    let prevRow = -1;

    for (const node of flowNodes) {
      if (node.row !== prevRow) {
        if (prevRow >= 0) {
          const prevMaxH = Math.max(...flowNodes.filter((n) => n.row === prevRow).map((n) => n.h));
          currentY += prevMaxH + rowGap;
        }
        prevRow = node.row;
      }
      const cx = colCenters[node.col];
      positions[node.id] = { x: cx - node.w / 2, y: currentY, w: node.w, h: node.h };
    }

    /* ── Zoom ── */
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);

    /* ── Center content ── */
    const totalH = currentY + flowNodes[flowNodes.length - 1].h + topPad;
    const offsetY = Math.max(0, (height - totalH) / 2);
    const initialTransform = d3.zoomIdentity.translate(0, offsetY);
    svg.call(zoom.transform, initialTransform);

    /* ── Defs: arrow markers, drop shadows, gradients ── */
    const defs = g.append('defs');

    // Drop shadow filter
    const filter = defs.append('filter').attr('id', 'dropShadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feDropShadow').attr('dx', 0).attr('dy', 4).attr('stdDeviation', 8).attr('flood-color', 'rgba(0,0,0,0.35)');

    // Glow filter for result node
    const glow = defs.append('filter').attr('id', 'glowGreen').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    glow.append('feDropShadow').attr('dx', 0).attr('dy', 0).attr('stdDeviation', 12).attr('flood-color', 'rgba(34,197,94,0.4)');

    // Purple glow for input
    const glowP = defs.append('filter').attr('id', 'glowPurple').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    glowP.append('feDropShadow').attr('dx', 0).attr('dy', 0).attr('stdDeviation', 12).attr('flood-color', 'rgba(139,92,246,0.4)');

    // Arrow markers
    ['var(--primary-color)', '#22C55E'].forEach((color) => {
      const markerId = `arrow-${color.replace('#', '')}`;
      defs.append('marker')
        .attr('id', markerId)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 5)
        .attr('refY', 5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,0 L10,5 L0,10 Z')
        .attr('fill', color);
    });

    /* ── Helper: compute edge path from current positions ── */
    function edgePath(edge: FlowEdge) {
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (!from || !to) return '';
      const x1 = from.x + from.w / 2;
      const y1 = from.y + from.h;
      const x2 = to.x + to.w / 2;
      const y2 = to.y;
      const midY = (y1 + y2) / 2;
      return `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
    }

    /* ── Draw edges with smooth curves ── */
    const edgeGroup = g.append('g');
    const edgePaths: d3.Selection<SVGPathElement, FlowEdge, SVGGElement, unknown> =
      edgeGroup.selectAll('path')
        .data(flowEdges)
        .join('path')
        .attr('d', (e) => edgePath(e))
        .attr('fill', 'none')
        .attr('stroke', (e) => e.color)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', (e) => `url(#arrow-${e.color.replace('#', '')})`);

    /* ── Draw nodes ── */
    const nodeGroup = g.append('g');

    for (const node of flowNodes) {
      const pos = positions[node.id];
      if (!pos) continue;

      const ng = nodeGroup.append('g')
        .attr('transform', `translate(${pos.x},${pos.y})`)
        .style('cursor', 'grab')
        .datum(node);

      // Background rect
      const filterAttr = node.id === 'result' ? 'url(#glowGreen)' : node.id === 'input' ? 'url(#glowPurple)' : 'url(#dropShadow)';
      ng.append('rect')
        .attr('width', node.w)
        .attr('height', node.h)
        .attr('rx', node.rx)
        .attr('fill', node.fill)
        .attr('stroke', node.stroke || 'none')
        .attr('stroke-width', node.strokeWidth)
        .attr('filter', filterAttr);

      // Icon
      const iconScale = node.id === 'input' || node.id === 'result' ? 0.78 : 0.62;
      const iconSize = 24 * iconScale;
      const hasSub = !!node.sub;
      const contentH = hasSub ? iconSize + 14 + 12 : iconSize + 14;
      const startY = (node.h - contentH) / 2;

      ng.append('g')
        .attr('transform', `translate(${(node.w - iconSize) / 2},${startY}) scale(${iconScale})`)
        .append('path')
        .attr('d', node.icon)
        .attr('fill', 'none')
        .attr('stroke', node.iconColor)
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      // Label
      const labelY = startY + iconSize + 13;
      ng.append('text')
        .attr('x', node.w / 2)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('fill', node.labelColor)
        .attr('font-size', node.id === 'input' || node.id === 'result' ? 13 : 11)
        .attr('font-weight', node.id === 'input' || node.id === 'result' ? 600 : 500)
        .attr('font-family', 'Geist, Inter, system-ui, sans-serif')
        .text(node.label);

      // Subtitle
      if (node.sub) {
        ng.append('text')
          .attr('x', node.w / 2)
          .attr('y', labelY + 14)
          .attr('text-anchor', 'middle')
          .attr('fill', node.subColor || '#a1a1aa')
          .attr('font-size', 10)
          .attr('font-weight', 400)
          .attr('font-family', 'Geist, Inter, system-ui, sans-serif')
          .text(node.sub);
      }

      // Hover effect
      ng.on('mouseover', function () {
        d3.select(this).select('rect')
          .transition().duration(200)
          .attr('stroke-width', Math.max(node.strokeWidth + 1, 2))
          .attr('stroke', node.stroke || node.fill);
      }).on('mouseout', function () {
        d3.select(this).select('rect')
          .transition().duration(200)
          .attr('stroke-width', node.strokeWidth)
          .attr('stroke', node.stroke || 'none');
      });

      // Drag behavior
      ng.call(
        d3.drag<SVGGElement, FlowNode>()
          .on('start', function () {
            d3.select(this).raise().style('cursor', 'grabbing');
          })
          .on('drag', function (event, d) {
            const p = positions[d.id];
            p.x += event.dx;
            p.y += event.dy;
            d3.select(this).attr('transform', `translate(${p.x},${p.y})`);
            edgePaths.attr('d', (e) => edgePath(e));
          })
          .on('end', function () {
            d3.select(this).style('cursor', 'grab');
          }),
      );
    }

    return () => { svg.selectAll('*').remove(); };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        border: '1px solid #27273a',
        borderRadius: 12,
        backgroundColor: '#0d0d14',
      }}
    >
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ReasoningPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [reasoningType, setReasoningType] = useState('production-scheduling');
  const [sourceOntology, setSourceOntology] = useState('supply-chain');
  const [rules, setRules] = useState(inferenceRules);

  const handleToggleRule = (index: number) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, checked: !r.checked } : r)),
    );
  };

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb separator={<ChevronRight size={14} />}>
        <Breadcrumb.Item><span style={{ color: '#a1a1aa', cursor: 'pointer' }}>Tools</span></Breadcrumb.Item>
        <Breadcrumb.Item><span style={{ color: '#f4f4f5', fontWeight: 500 }}>{viewMode === 'list' ? 'Reasoning' : 'Reasoning Graph'}</span></Breadcrumb.Item>
      </Breadcrumb>
    );
    setActions(
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* View Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 4,
            borderRadius: 8,
            backgroundColor: '#1a1a24',
            height: 36,
            boxSizing: 'border-box',
          }}
        >
          {([
            { key: 'list' as const, Icon: List, label: 'List' },
            { key: 'graph' as const, Icon: GitFork, label: 'Graph' },
          ] as const).map(({ key, Icon, label }) => (
            <div
              key={key}
              onClick={() => key === 'graph' ? navigate('/reasoning-graph') : setViewMode(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 12px',
                height: 28,
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: viewMode === key ? '#111118' : 'transparent',
              }}
            >
              <Icon size={14} color={viewMode === key ? '#f4f4f5' : '#a1a1aa'} />
              <span style={{ fontSize: 12, fontWeight: 500, color: viewMode === key ? '#f4f4f5' : '#a1a1aa' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Run Inference Button */}
        <Button
          type="primary"
          icon={<Play size={16} />}
        >
          Run Inference
        </Button>
      </div>
    );
  }, [setBreadcrumbs, setActions, navigate, viewMode]);

  return (
    <>
      {/* Main Content */}
      <div style={{ flex: 1, padding: 20, display: 'flex', gap: 20, overflow: 'hidden' }}>
        {/* Config Panel (always visible) */}
        <ConfigPanel
          reasoningType={reasoningType}
          setReasoningType={setReasoningType}
          sourceOntology={sourceOntology}
          setSourceOntology={setSourceOntology}
          rules={rules}
          onToggleRule={handleToggleRule}
        />

        {/* View-specific content */}
        {viewMode === 'list' ? (
          <>
            <ResultsPanel />
            <ChainPanel />
          </>
        ) : (
          <GraphCanvasView />
        )}
      </div>
    </>
  );
}
