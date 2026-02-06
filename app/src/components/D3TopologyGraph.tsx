import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

/* ══════════════════════════════════════════
   Types
   ══════════════════════════════════════════ */
export interface TopoNode {
  id: string;
  label: string;
  sublabel?: string;
  layer: number;
  color: string;
  borderWidth?: number;
  bg?: string;
  badge?: string;
  badgeColor?: string;
  opacity?: number;
  dashed?: boolean;
  /** highlight glow ring */
  glow?: boolean;
}

export interface TopoEdge {
  source: string;
  target: string;
  label?: string;
  color?: string;
}

export interface TopoLayerLabel {
  afterLayer: number;
  text: string;
  color?: string;
}

export interface LegendEntry {
  color: string;
  label: string;
}

interface Props {
  nodes: TopoNode[];
  edges: TopoEdge[];
  layerLabels?: TopoLayerLabel[];
  legend?: LegendEntry[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  layerGap?: number;
  nodeGap?: number;
}

/* ══════════════════════════════════════════
   Component
   ══════════════════════════════════════════ */
export default function D3TopologyGraph({
  nodes,
  edges,
  layerLabels = [],
  legend = [],
  width: propWidth,
  height: propHeight,
  nodeWidth = 72,
  nodeHeight = 44,
  layerGap = 72,
  nodeGap = 20,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  /* compute layout dimensions */
  const layers = new Map<number, TopoNode[]>();
  nodes.forEach((n) => {
    if (!layers.has(n.layer)) layers.set(n.layer, []);
    layers.get(n.layer)!.push(n);
  });
  const sortedLayers = [...layers.keys()].sort((a, b) => a - b);

  const maxNodesInLayer = Math.max(...sortedLayers.map((l) => layers.get(l)!.length));
  const autoWidth = maxNodesInLayer * (nodeWidth + nodeGap) + nodeGap + 40;

  const labelCount = layerLabels.length;
  const autoHeight = sortedLayers.length * (nodeHeight + 24) + (sortedLayers.length - 1) * (layerGap - nodeHeight - 24) + labelCount * 22 + (legend.length ? 32 : 0) + 40;

  const W = propWidth ?? Math.max(autoWidth, 240);
  const H = propHeight ?? Math.max(autoHeight, 120);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    /* ── defs ── */
    const defs = svg.append('defs');

    /* arrow markers per colour */
    const usedEdgeColors = new Set(edges.map((e) => e.color ?? '#71717a'));
    usedEdgeColors.forEach((c) => {
      defs
        .append('marker')
        .attr('id', `arrow-${c.replace('#', '')}`)
        .attr('viewBox', '0 0 10 6')
        .attr('refX', 10)
        .attr('refY', 3)
        .attr('markerWidth', 8)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,0 L10,3 L0,6 Z')
        .attr('fill', c);
    });

    /* glow filter */
    const glow = defs.append('filter').attr('id', 'glow').attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%');
    glow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');

    /* ── compute node positions ── */
    const nodePos = new Map<string, { x: number; y: number }>();
    let currentY = 20;

    sortedLayers.forEach((layerIdx, i) => {
      const layerNodes = layers.get(layerIdx)!;
      const totalWidth = layerNodes.length * nodeWidth + (layerNodes.length - 1) * nodeGap;
      const startX = (W - totalWidth) / 2;

      layerNodes.forEach((n, j) => {
        nodePos.set(n.id, {
          x: startX + j * (nodeWidth + nodeGap) + nodeWidth / 2,
          y: currentY + nodeHeight / 2,
        });
      });

      currentY += nodeHeight + 8;

      /* layer label after this layer */
      const ll = layerLabels.find((l) => l.afterLayer === layerIdx);
      if (ll) {
        currentY += 4;
        g.append('text')
          .attr('x', W / 2)
          .attr('y', currentY)
          .attr('text-anchor', 'middle')
          .attr('fill', ll.color ?? '#71717a')
          .attr('font-size', 10)
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(ll.text);
        currentY += 18;
      } else if (i < sortedLayers.length - 1) {
        currentY += layerGap - nodeHeight - 8;
      }
    });

    /* ── draw edges ── */
    edges.forEach((e) => {
      const src = nodePos.get(e.source);
      const tgt = nodePos.get(e.target);
      if (!src || !tgt) return;

      const c = e.color ?? '#71717a';
      const markerId = `arrow-${c.replace('#', '')}`;

      const sx = src.x;
      const sy = src.y + nodeHeight / 2;
      const tx = tgt.x;
      const ty = tgt.y - nodeHeight / 2;
      const midY = (sy + ty) / 2;

      g.append('path')
        .attr('d', `M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`)
        .attr('fill', 'none')
        .attr('stroke', c)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', `url(#${markerId})`);

      /* edge label */
      if (e.label) {
        g.append('text')
          .attr('x', (sx + tx) / 2 + 8)
          .attr('y', midY)
          .attr('text-anchor', 'start')
          .attr('fill', c)
          .attr('font-size', 8)
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('opacity', 0.7)
          .text(e.label);
      }
    });

    /* ── draw nodes ── */
    nodes.forEach((n) => {
      const pos = nodePos.get(n.id);
      if (!pos) return;

      const nw = nodeWidth;
      const nh = nodeHeight;
      const rx = pos.x - nw / 2;
      const ry = pos.y - nh / 2;

      /* glow ring */
      if (n.glow) {
        g.append('rect')
          .attr('x', rx - 3)
          .attr('y', ry - 3)
          .attr('width', nw + 6)
          .attr('height', nh + 6)
          .attr('rx', 8)
          .attr('fill', 'none')
          .attr('stroke', n.color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.3)
          .attr('filter', 'url(#glow)');
      }

      /* node rect */
      g.append('rect')
        .attr('x', rx)
        .attr('y', ry)
        .attr('width', nw)
        .attr('height', nh)
        .attr('rx', 6)
        .attr('fill', n.bg ?? '#111118')
        .attr('stroke', n.color)
        .attr('stroke-width', n.borderWidth ?? 2)
        .attr('opacity', n.opacity ?? 1)
        .attr('stroke-dasharray', n.dashed ? '4,3' : null);

      /* label */
      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y - (n.sublabel ? 4 : 0))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#f4f4f5')
        .attr('font-size', 10)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('opacity', n.opacity ?? 1)
        .text(n.label);

      /* sublabel */
      if (n.sublabel) {
        g.append('text')
          .attr('x', pos.x)
          .attr('y', pos.y + 10)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', n.color)
          .attr('font-size', 8)
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-weight', 600)
          .attr('opacity', n.opacity ?? 1)
          .text(n.sublabel);
      }

      /* badge */
      if (n.badge) {
        const bc = n.badgeColor ?? n.color;
        const bw = n.badge.length * 5.5 + 10;
        g.append('rect')
          .attr('x', pos.x - bw / 2)
          .attr('y', ry + nh + 4)
          .attr('width', bw)
          .attr('height', 14)
          .attr('rx', 3)
          .attr('fill', bc);
        g.append('text')
          .attr('x', pos.x)
          .attr('y', ry + nh + 11)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#fff')
          .attr('font-size', 8)
          .attr('font-weight', 700)
          .text(n.badge);
      }
    });

    /* ── legend ── */
    if (legend.length) {
      const legendY = H - 16;
      const totalLegendWidth = legend.reduce((acc, l) => acc + l.label.length * 6 + 24, 0);
      let lx = (W - totalLegendWidth) / 2;

      legend.forEach((l) => {
        g.append('rect')
          .attr('x', lx)
          .attr('y', legendY - 4)
          .attr('width', 8)
          .attr('height', 8)
          .attr('rx', 2)
          .attr('fill', l.color);
        g.append('text')
          .attr('x', lx + 12)
          .attr('y', legendY)
          .attr('dominant-baseline', 'central')
          .attr('fill', '#71717a')
          .attr('font-size', 9)
          .text(l.label);
        lx += l.label.length * 6 + 24;
      });
    }
  }, [nodes, edges, layerLabels, legend, W, H, nodeWidth, nodeHeight, layerGap, nodeGap, sortedLayers, layers]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ borderRadius: 12, background: '#0a0a0f' }}
    />
  );
}
