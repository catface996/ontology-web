import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Breadcrumb, Checkbox } from 'antd';
import {
  ChevronRight, ChevronDown, Play, List as ListIcon, GitFork,
  Settings2, Package, Gauge, Cpu, GitBranch as GitBranchIcon,
  Factory, CircleCheck,
} from 'lucide-react';
import * as d3 from 'd3';
import { useHeader } from '../contexts/HeaderContext';

/* ── Types ── */
interface InferenceRule {
  label: string;
  checked: boolean;
}

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  bg: string;
  row: number;
  col: number;
  w: number;
  h: number;
  rx: number;
}

/* ── Mock data ── */
const flowNodes: FlowNode[] = [
  { id: 'input', label: 'Order #1024', icon: 'package', color: '#fff', bg: 'var(--primary-color)', row: 0, col: 1, w: 140, h: 70, rx: 12 },
  { id: 'capacity', label: 'Capacity', sublabel: '60% ✓', icon: 'gauge', color: 'var(--primary-color)', bg: '#1e1e3f', row: 1, col: 0, w: 110, h: 55, rx: 10 },
  { id: 'resources', label: 'Resources', sublabel: 'M1,M2 ✓', icon: 'cpu', color: 'var(--primary-color)', bg: '#1e1e3f', row: 1, col: 1, w: 110, h: 55, rx: 10 },
  { id: 'depends', label: 'Depends', sublabel: 'None ✓', icon: 'git-branch', color: 'var(--primary-color)', bg: '#1e1e3f', row: 1, col: 2, w: 110, h: 55, rx: 10 },
  { id: 'lineA', label: 'Production Line A', sublabel: '800 units/day', icon: 'factory', color: '#22C55E', bg: '#1e1e3f', row: 2, col: 1, w: 140, h: 60, rx: 10 },
  { id: 'result', label: 'Assigned', sublabel: '98% confidence', icon: 'check', color: '#fff', bg: '#22C55E', row: 3, col: 1, w: 160, h: 70, rx: 12 },
];

const flowEdges = [
  { from: 'input', to: 'capacity', color: 'var(--primary-color)' },
  { from: 'input', to: 'resources', color: 'var(--primary-color)' },
  { from: 'input', to: 'depends', color: 'var(--primary-color)' },
  { from: 'capacity', to: 'lineA', color: 'var(--primary-color)' },
  { from: 'resources', to: 'lineA', color: 'var(--primary-color)' },
  { from: 'depends', to: 'lineA', color: 'var(--primary-color)' },
  { from: 'lineA', to: 'result', color: '#22C55E' },
];

/* ── Flow Graph Canvas ── */
function FlowGraphCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Position nodes using per-node dimensions
    const gapX = 150;
    const gapY = 100;
    const startX = width / 2;
    const startY = 60;

    const nodeMap: Record<string, FlowNode> = {};
    flowNodes.forEach((n) => { nodeMap[n.id] = n; });

    const positions: Record<string, { x: number; y: number }> = {};
    flowNodes.forEach((n) => {
      const cols = flowNodes.filter((fn) => fn.row === n.row).length;
      const colOffset = n.col - (cols > 1 ? 1 : n.col);
      positions[n.id] = {
        x: startX + colOffset * gapX,
        y: startY + n.row * gapY,
      };
    });

    // Lucide icon SVG paths (24x24 viewBox)
    const iconPaths: Record<string, string[]> = {
      package: [
        'M16.5 9.4 7.55 4.24', 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
        'M3.27 6.96 12 12.01l8.73-5.05', 'M12 22.08V12',
      ],
      gauge: [
        'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z',
        'M12 3v2', 'M12 19v2', 'M3 12h2', 'M19 12h2',
      ],
      cpu: [
        'M6 6h12v12H6z', 'M9 2v2', 'M15 2v2', 'M9 20v2', 'M15 20v2',
        'M2 9h2', 'M2 15h2', 'M20 9h2', 'M20 15h2',
      ],
      'git-branch': [
        'M6 3v12', 'M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
        'M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M15 6a9 9 0 0 1-9 9',
      ],
      factory: [
        'M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
        'M17 18h1', 'M12 18h1', 'M7 18h1',
      ],
      check: [
        'M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4 12 14.01l-3-3',
      ],
    };

    // Helper: compute edge endpoints from current positions
    const edgeEndpoints = (e: typeof flowEdges[0]) => {
      const fromNode = nodeMap[e.from];
      const toNode = nodeMap[e.to];
      const from = positions[e.from];
      const to = positions[e.to];
      if (!from || !to || !fromNode || !toNode) return null;
      return {
        x1: from.x, y1: from.y + fromNode.h / 2,
        x2: to.x, y2: to.y - toNode.h / 2,
      };
    };

    // Draw edges with D3 data binding
    const edgeSelection = g.selectAll<SVGLineElement, typeof flowEdges[0]>('.edge')
      .data(flowEdges)
      .join('line')
      .attr('class', 'edge')
      .each(function (e) {
        const ep = edgeEndpoints(e);
        if (!ep) return;
        d3.select(this)
          .attr('x1', ep.x1).attr('y1', ep.y1)
          .attr('x2', ep.x2).attr('y2', ep.y2);
      })
      .attr('stroke', (e) => e.color)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Update all edges from current positions
    const updateEdges = () => {
      edgeSelection.each(function (e) {
        const ep = edgeEndpoints(e);
        if (!ep) return;
        d3.select(this)
          .attr('x1', ep.x1).attr('y1', ep.y1)
          .attr('x2', ep.x2).attr('y2', ep.y2);
      });
    };

    // Draw nodes with per-node dimensions, icons, and drag support
    flowNodes.forEach((n) => {
      const pos = positions[n.id];
      if (!pos) return;
      const nodeG = g.append('g')
        .datum(n)
        .attr('transform', `translate(${pos.x - n.w / 2},${pos.y - n.h / 2})`)
        .style('cursor', 'grab');

      // Node rect
      nodeG.append('rect')
        .attr('width', n.w)
        .attr('height', n.h)
        .attr('rx', n.rx)
        .attr('fill', n.bg)
        .attr('stroke', n.id === 'input' || n.id === 'result' ? 'none' : n.color)
        .attr('stroke-width', 2);

      // Icon
      const paths = iconPaths[n.icon];
      if (paths) {
        const iconSize = 16;
        const s = iconSize / 24;
        const iconColor = n.color === '#fff' ? '#ffffffc0' : n.color;
        const iconX = n.w / 2 - iconSize / 2;
        const iconY = n.sublabel ? 6 : (n.h / 2 - iconSize / 2);
        const iconG = nodeG.append('g')
          .attr('transform', `translate(${iconX},${iconY}) scale(${s})`)
          .attr('fill', 'none')
          .attr('stroke', iconColor)
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
        paths.forEach((p) => {
          iconG.append('path').attr('d', p);
        });
      }

      // Label
      const labelY = n.sublabel ? n.h / 2 + 4 : n.h / 2 + 4;
      nodeG.append('text')
        .attr('x', n.w / 2)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('fill', n.color === '#fff' ? '#fff' : '#f4f4f5')
        .attr('font-size', n.id === 'input' || n.id === 'result' ? 13 : 11)
        .attr('font-weight', 600)
        .attr('font-family', 'Inter, sans-serif')
        .text(n.label);

      // Sublabel
      if (n.sublabel) {
        nodeG.append('text')
          .attr('x', n.w / 2)
          .attr('y', n.h / 2 + 18)
          .attr('text-anchor', 'middle')
          .attr('fill', n.id === 'result' ? '#ffffffa0' : '#22C55E')
          .attr('font-size', 9)
          .attr('font-family', 'Inter, sans-serif')
          .text(n.sublabel);
      }

      // Drag behavior
      nodeG.call(
        d3.drag<SVGGElement, FlowNode>()
          .on('start', function () {
            d3.select(this).raise().style('cursor', 'grabbing');
          })
          .on('drag', function (event, d) {
            const p = positions[d.id];
            p.x += event.dx;
            p.y += event.dy;
            d3.select(this).attr('transform', `translate(${p.x - d.w / 2},${p.y - d.h / 2})`);
            updateEdges();
          })
          .on('end', function () {
            d3.select(this).style('cursor', 'grab');
          }),
      );
    });

    // Center view
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1);
    svg.call(zoom.transform, initialTransform);
  }, []);

  return <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }} />;
}

/* ── Page ── */
export default function ReasoningGraphPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const [rules, setRules] = useState<InferenceRule[]>([
    { label: 'Capacity Constraints', checked: true },
    { label: 'Resource Availability', checked: true },
    { label: 'Priority Ordering', checked: false },
    { label: 'Dependency Chain', checked: true },
  ]);

  const toggleRule = (index: number) => {
    setRules((prev) => prev.map((r, i) => i === index ? { ...r, checked: !r.checked } : r));
  };

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb separator={<ChevronRight size={14} />}>
        <Breadcrumb.Item><span style={{ color: '#a1a1aa', fontSize: 14 }}>Tools</span></Breadcrumb.Item>
        <Breadcrumb.Item><span style={{ color: '#f4f4f5', fontWeight: 500, fontSize: 14 }}>Reasoning Graph</span></Breadcrumb.Item>
      </Breadcrumb>,
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
            { key: 'list' as const, Icon: ListIcon, label: 'List' },
            { key: 'graph' as const, Icon: GitFork, label: 'Graph' },
          ] as const).map(({ key, Icon, label }) => (
            <div
              key={key}
              onClick={() => key === 'list' ? navigate('/reasoning') : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 12px',
                height: 28,
                borderRadius: 6,
                cursor: key === 'list' ? 'pointer' : 'default',
                backgroundColor: key === 'graph' ? '#111118' : 'transparent',
              }}
            >
              <Icon size={14} color={key === 'graph' ? '#f4f4f5' : '#a1a1aa'} />
              <span style={{ fontSize: 12, fontWeight: 500, color: key === 'graph' ? '#f4f4f5' : '#a1a1aa' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <Button type="primary" icon={<Play size={16} />}>
          Run Inference
        </Button>
      </div>,
    );
  }, [setBreadcrumbs, setActions, navigate]);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 20, padding: 20 }}>
        {/* Left — Config Panel */}
        <div style={{ width: 320, flexShrink: 0, borderRadius: 12, border: '1px solid #27273a', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Config Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', height: 56, flexShrink: 0, borderBottom: '1px solid #27273a' }}>
            <Settings2 size={18} color="var(--primary-color)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Reasoning Configuration</span>
          </div>

          {/* Config Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 20, flex: 1 }}>
            {/* Reasoning Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Reasoning Type</span>
              <div style={{ backgroundColor: '#1a1a24', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>Production Scheduling</span>
                <ChevronDown size={16} color="#a1a1aa" />
              </div>
            </div>

            {/* Source Ontology */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Source Ontology</span>
              <div style={{ backgroundColor: '#1a1a24', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>Supply Chain Ontology</span>
                <ChevronDown size={16} color="#a1a1aa" />
              </div>
            </div>

            {/* Inference Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Inference Rules</span>
              {rules.map((rule, i) => (
                <div
                  key={rule.label}
                  style={{ backgroundColor: '#1a1a24', borderRadius: 8, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}
                  onClick={() => toggleRule(i)}
                >
                  <Checkbox checked={rule.checked} />
                  <span style={{ fontSize: 13 }}>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Graph Canvas */}
        <div style={{ flex: 1, borderRadius: 12, border: '1px solid #27273a', backgroundColor: '#111118', overflow: 'hidden' }}>
          <FlowGraphCanvas />
        </div>
      </div>
    </>
  );
}
