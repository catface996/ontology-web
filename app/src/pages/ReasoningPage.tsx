import { useState, useRef, useEffect } from 'react';
import {
  Box, Breadcrumbs, Link, Typography, Button, Card, Checkbox, FormControlLabel,
  Select, MenuItem, FormControl,
} from '@mui/material';
import {
  ChevronRight, Play, List, GitFork, Settings2, ChevronDown, Zap,
  Download, Factory, TriangleAlert, Package, GitBranch, Timer, TrendingUp,
  Workflow, Gauge, Cpu, CircleCheck,
} from 'lucide-react';
import * as d3 from 'd3';

/* ── Types ── */
type ViewMode = 'list' | 'graph';

/* ── Mock inference data ── */
const inferences = [
  {
    id: 1,
    icon: Factory,
    iconColor: '#8B5CF6',
    iconBg: '#8B5CF620',
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
    color: '#8b5cf6',
  },
  {
    num: '2',
    title: 'Capacity Check',
    desc: 'Line A: 800 units/day capacity, 60% utilization → Available',
    color: '#8b5cf6',
  },
  {
    num: '3',
    title: 'Resource Matching',
    desc: 'Required: Machine M1, M2. Both available on Line A during window',
    color: '#8b5cf6',
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
  input: { icon: Package, label: 'Order #1024', color: '#8B5CF6', bg: '#8B5CF6' },
  checks: [
    { icon: Gauge, label: 'Capacity', status: '60% ✓' },
    { icon: Cpu, label: 'Resources', status: 'M1,M2 ✓' },
    { icon: GitBranch, label: 'Depends', status: 'None ✓' },
  ],
  lineA: { icon: Factory, label: 'Production Line A', status: '800 units/day' },
  result: { icon: CircleCheck, label: 'Assigned', sub: '98% confidence' },
};

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
    <Card
      variant="outlined"
      sx={{
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.25}
        px={2.5}
        py={2}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Settings2 size={18} color="#8b5cf6" />
        <Typography fontSize={14} fontWeight={600}>
          Reasoning Configuration
        </Typography>
      </Box>

      {/* Body */}
      <Box flex={1} p={2.5} display="flex" flexDirection="column" gap={2.5} overflow="auto">
        {/* Reasoning Type */}
        <Box display="flex" flexDirection="column" gap={1.25}>
          <Typography fontSize={12} fontWeight={600} color="text.secondary" textTransform="uppercase">
            Reasoning Type
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={reasoningType}
              onChange={(e) => setReasoningType(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: 'action.hover' }}
              IconComponent={() => <ChevronDown size={16} color="#a1a1aa" style={{ marginRight: 12 }} />}
            >
              <MenuItem value="production-scheduling">Production Scheduling</MenuItem>
              <MenuItem value="resource-allocation">Resource Allocation</MenuItem>
              <MenuItem value="dependency-analysis">Dependency Analysis</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Source Ontology */}
        <Box display="flex" flexDirection="column" gap={1.25}>
          <Typography fontSize={12} fontWeight={600} color="text.secondary" textTransform="uppercase">
            Source Ontology
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={sourceOntology}
              onChange={(e) => setSourceOntology(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: 'action.hover' }}
              IconComponent={() => <ChevronDown size={16} color="#a1a1aa" style={{ marginRight: 12 }} />}
            >
              <MenuItem value="supply-chain">Supply Chain Ontology</MenuItem>
              <MenuItem value="manufacturing">Manufacturing Ontology</MenuItem>
              <MenuItem value="logistics">Logistics Ontology</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Inference Rules */}
        <Box display="flex" flexDirection="column" gap={1.25}>
          <Typography fontSize={12} fontWeight={600} color="text.secondary" textTransform="uppercase">
            Inference Rules
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {rules.map((rule, i) => (
              <Box
                key={i}
                onClick={() => onToggleRule(i)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                }}
              >
                <Checkbox
                  checked={rule.checked}
                  size="small"
                  sx={{ p: 0 }}
                  tabIndex={-1}
                />
                <Typography fontSize={13}>{rule.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

/* ── Results Panel (list view) ── */
function ResultsPanel() {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2.5}
        py={2}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Box display="flex" alignItems="center" gap={1.25}>
          <Zap size={18} color="#F59E0B" />
          <Typography fontSize={14} fontWeight={600}>
            Inference Results
          </Typography>
          <Box
            sx={{
              bgcolor: '#22C55E20',
              color: '#22C55E',
              borderRadius: 100,
              px: 1.25,
              py: 0.5,
              fontSize: 11,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            12 inferences
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.75,
            borderRadius: '6px',
            bgcolor: 'action.hover',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <Download size={14} />
          <Typography fontSize={12} fontWeight={500}>Export</Typography>
        </Box>
      </Box>

      {/* Inference Cards */}
      <Box flex={1} p={2.5} display="flex" flexDirection="column" gap={2} overflow="auto">
        {inferences.map((inf) => {
          const Icon = inf.icon;
          return (
            <Box
              key={inf.id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {/* Card Header */}
              <Box display="flex" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    bgcolor: inf.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={inf.iconColor} />
                </Box>
                <Typography fontSize={14} fontWeight={500} sx={{ flex: 1 }}>
                  {inf.title}
                </Typography>
                <Box
                  sx={{
                    bgcolor: `${inf.badgeColor}20`,
                    color: inf.badgeColor,
                    borderRadius: 100,
                    px: 1,
                    py: 0.5,
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {inf.badge}
                </Box>
              </Box>

              {/* Description */}
              <Typography fontSize={13} color="text.secondary" lineHeight={1.5}>
                {inf.description}
              </Typography>

              {/* Meta */}
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <GitBranch size={12} color="#a1a1aa" />
                  <Typography fontSize={11} color="text.secondary">
                    {inf.ruleTag}
                  </Typography>
                </Box>
                {inf.meta.type === 'time' && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Timer size={12} color="#a1a1aa" />
                    <Typography fontSize={11} color="text.secondary">
                      {inf.meta.label}
                    </Typography>
                  </Box>
                )}
                {inf.meta.type === 'action' && (
                  <Typography fontSize={11} color="primary.main" fontWeight={500}>
                    {inf.meta.label}
                  </Typography>
                )}
                {inf.meta.type === 'savings' && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrendingUp size={12} color="#22C55E" />
                    <Typography fontSize={11} color="#22C55E">
                      {inf.meta.label}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

/* ── Inference Chain Panel (list view) ── */
function ChainPanel() {
  return (
    <Card
      variant="outlined"
      sx={{
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.25}
        px={2.5}
        py={2}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Workflow size={18} color="#8b5cf6" />
        <Typography fontSize={14} fontWeight={600}>
          Inference Chain
        </Typography>
      </Box>

      {/* Steps */}
      <Box flex={1} p={2.5} display="flex" flexDirection="column" gap={2} overflow="auto">
        <Typography
          fontSize={11}
          fontWeight={600}
          color="text.secondary"
          letterSpacing={1}
          textTransform="uppercase"
        >
          Reasoning Path
        </Typography>

        {chainSteps.map((step, i) => (
          <Box key={i}>
            {/* Step */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography fontSize={11} fontWeight={600} color="#fff">
                    {step.num}
                  </Typography>
                </Box>
                <Typography fontSize={13} fontWeight={500} color={step.color === '#22C55E' ? '#22C55E' : 'text.primary'}>
                  {step.title}
                </Typography>
              </Box>
              <Typography fontSize={12} color="text.secondary" lineHeight={1.4} pl={3.5}>
                {step.desc}
              </Typography>
            </Box>

            {/* Connector line */}
            {i < chainSteps.length - 1 && (
              <Box
                sx={{
                  width: 2,
                  height: 20,
                  bgcolor: 'divider',
                  ml: '9px',
                  mt: 1,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
}

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
  { id: 'input', row: 0, col: 1, w: 152, h: 72, rx: 14, fill: '#8B5CF6', stroke: null, strokeWidth: 0, icon: ICON_PACKAGE, iconColor: '#fff', label: 'Order #1024', labelColor: '#fff' },
  { id: 'capacity', row: 1, col: 0, w: 120, h: 60, rx: 12, fill: '#16163a', stroke: '#8B5CF6', strokeWidth: 2, icon: ICON_GAUGE, iconColor: '#8B5CF6', label: 'Capacity', labelColor: '#e4e4e7', sub: '60% ✓', subColor: '#22C55E' },
  { id: 'resources', row: 1, col: 1, w: 120, h: 60, rx: 12, fill: '#16163a', stroke: '#8B5CF6', strokeWidth: 2, icon: ICON_CPU, iconColor: '#8B5CF6', label: 'Resources', labelColor: '#e4e4e7', sub: 'M1,M2 ✓', subColor: '#22C55E' },
  { id: 'depends', row: 1, col: 2, w: 120, h: 60, rx: 12, fill: '#16163a', stroke: '#8B5CF6', strokeWidth: 2, icon: ICON_GITBRANCH, iconColor: '#8B5CF6', label: 'Depends', labelColor: '#e4e4e7', sub: 'None ✓', subColor: '#22C55E' },
  { id: 'lineA', row: 2, col: 1, w: 152, h: 66, rx: 12, fill: '#16163a', stroke: '#22C55E', strokeWidth: 2, icon: ICON_FACTORY, iconColor: '#22C55E', label: 'Production Line A', labelColor: '#e4e4e7', sub: '800 units/day', subColor: '#22C55E' },
  { id: 'result', row: 3, col: 1, w: 168, h: 76, rx: 14, fill: '#22C55E', stroke: null, strokeWidth: 0, icon: ICON_CIRCLECHECK, iconColor: '#fff', label: 'Assigned', labelColor: '#fff', sub: '98% confidence', subColor: 'rgba(255,255,255,0.6)' },
];

const flowEdges: FlowEdge[] = [
  { from: 'input', to: 'capacity', color: '#8B5CF6' },
  { from: 'input', to: 'resources', color: '#8B5CF6' },
  { from: 'input', to: 'depends', color: '#8B5CF6' },
  { from: 'capacity', to: 'lineA', color: '#8B5CF6' },
  { from: 'resources', to: 'lineA', color: '#8B5CF6' },
  { from: 'depends', to: 'lineA', color: '#8B5CF6' },
  { from: 'lineA', to: 'result', color: '#22C55E' },
];

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
    ['#8B5CF6', '#22C55E'].forEach((color) => {
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
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      <Box ref={containerRef} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </Box>
    </Card>
  );
}

/* ── Main component ── */
export default function ReasoningPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [reasoningType, setReasoningType] = useState('production-scheduling');
  const [sourceOntology, setSourceOntology] = useState('supply-chain');
  const [rules, setRules] = useState(inferenceRules);

  const handleToggleRule = (index: number) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, checked: !r.checked } : r)),
    );
  };

  return (
    <>
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">
            Tools
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            {viewMode === 'list' ? 'Reasoning' : 'Reasoning Graph'}
          </Typography>
        </Breadcrumbs>

        <Box display="flex" alignItems="stretch" gap={1.5}>
          {/* View Toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              p: 0.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            {([
              { key: 'list' as const, Icon: List, label: 'List' },
              { key: 'graph' as const, Icon: GitFork, label: 'Graph' },
            ] as const).map(({ key, Icon, label }) => (
              <Box
                key={key}
                onClick={() => setViewMode(key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  bgcolor: viewMode === key ? 'background.paper' : 'transparent',
                }}
              >
                <Icon size={14} color={viewMode === key ? '#f4f4f5' : '#a1a1aa'} />
                <Typography fontSize={12} fontWeight={500} color={viewMode === key ? 'text.primary' : 'text.secondary'}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Run Inference Button */}
          <Button
            variant="contained"
            startIcon={<Play size={16} />}
            sx={{ boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' }}
          >
            Run Inference
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} p={2.5} display="flex" gap={2.5} overflow="hidden">
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
      </Box>
    </>
  );
}
