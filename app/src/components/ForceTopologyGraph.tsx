import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface ForceGraphNode {
  id: number;
  name: string;
  sublabel?: string;
  color?: string | null;
  icon?: string | null;
  isCenter?: boolean;
}

export interface ForceGraphEdge {
  source: number;
  target: number;
  label?: string;
  style?: 'solid' | 'dashed';
  color?: string;
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

interface Props {
  nodes: ForceGraphNode[];
  edges: ForceGraphEdge[];
  selectedNodeIds?: Set<number>;
  /** Explicitly provide the set of "connected/normal" node IDs. When provided, these nodes display at normal opacity (not highlighted, not dimmed) and edge-based auto-expansion is skipped. */
  connectedNodeIds?: Set<number>;
  /** Initial saved positions for nodes. Nodes with saved positions are pinned (fx/fy). */
  initialPositions?: Map<number, { x: number; y: number }>;
  /** Initial saved viewport transform (pan + zoom). */
  initialViewport?: ViewportState;
  onNodeClick?: (nodeId: number, nodeName: string) => void;
  /** Called when a node drag ends, with the node's final position. */
  onDragEnd?: (nodeId: number, x: number, y: number) => void;
  /** Called when the background (empty area) is clicked. */
  onBackgroundClick?: () => void;
  onZoomChange?: (zoomPercent: number) => void;
  /** Called when the viewport (pan/zoom) changes. */
  onViewportChange?: (viewport: ViewportState) => void;
  zoomRef?: React.MutableRefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | null>;
  svgRef?: React.MutableRefObject<SVGSVGElement | null>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const NODE_W = 120;
const NODE_H = 56;
const CENTER_W = 150;
const CENTER_H = 64;
const NODE_RX = 12;
const CENTER_RX = 16;
const DEFAULT_COLOR = '#a78bfa';
const DEFAULT_EDGE_COLOR = 'var(--primary-color)';

/* ------------------------------------------------------------------ */
/*  Internal simulation types                                          */
/* ------------------------------------------------------------------ */

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  sublabel?: string;
  color: string;
  icon?: string | null;
  isCenter: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  label?: string;
  edgeStyle: 'solid' | 'dashed';
  edgeColor: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function rectEdgePoint(
  cx: number, cy: number, tx: number, ty: number, hw: number, hh: number,
): [number, number] {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (absDx * hh > absDy * hw) {
    const sign = dx > 0 ? 1 : -1;
    return [cx + sign * hw, cy + (dy * hw) / absDx];
  } else {
    const sign = dy > 0 ? 1 : -1;
    return [cx + (dx * hh) / absDy, cy + sign * hh];
  }
}

function sanitizeColor(c: string): string {
  return c.replace(/[^a-zA-Z0-9]/g, '_');
}

function nodeHW(d: SimNode): number {
  return (d.isCenter ? CENTER_W : NODE_W) / 2;
}

function nodeHH(d: SimNode): number {
  return (d.isCenter ? CENTER_H : NODE_H) / 2;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ForceTopologyGraph({
  nodes, edges, selectedNodeIds, connectedNodeIds, initialPositions, initialViewport, onNodeClick, onDragEnd, onBackgroundClick, onZoomChange, onViewportChange, zoomRef, svgRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgElRef = useRef<SVGSVGElement | null>(null);
  const nodeSelRef = useRef<d3.Selection<SVGGElement, SimNode, SVGGElement, unknown> | null>(null);
  const linkSelRef = useRef<d3.Selection<SVGLineElement, SimLink, SVGGElement, unknown> | null>(null);
  const linkLabelSelRef = useRef<d3.Selection<SVGTextElement, SimLink, SVGGElement, unknown> | null>(null);
  const simLinksRef = useRef<SimLink[]>([]);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Stable callback refs
  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;
  const onBackgroundClickRef = useRef(onBackgroundClick);
  onBackgroundClickRef.current = onBackgroundClick;
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  // Callback ref to expose SVG element to parent
  const setSvgRef = useCallback(
    (el: SVGSVGElement | null) => {
      svgElRef.current = el;
      if (svgRef) svgRef.current = el;
    },
    [svgRef],
  );

  // ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        clearTimeout(timer);
        timer = setTimeout(() => setSize({ width, height }), 100);
      }
    });
    ro.observe(el);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, []);

  // Stable click handler
  const handleClick = useCallback(
    (_event: MouseEvent, d: SimNode) => {
      onNodeClickRef.current?.(d.id, d.name);
    },
    [],
  );

  /* ---------- Main D3 effect ---------- */
  useEffect(() => {
    const svgEl = svgElRef.current;
    if (!svgEl || nodes.length === 0 || size.width === 0 || size.height === 0) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const { width, height } = size;

    // Defs
    const defs = svg.append('defs');

    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'force-topo-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow markers — one per unique edge color
    const edgeColors = new Set<string>();
    for (const e of edges) edgeColors.add(e.color || DEFAULT_EDGE_COLOR);

    for (const color of edgeColors) {
      defs.append('marker')
        .attr('id', `arrow-${sanitizeColor(color)}`)
        .attr('viewBox', '0 0 10 6').attr('refX', 10).attr('refY', 3)
        .attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,0 L10,3 L0,6 Z').attr('fill', color);
    }

    const g = svg.append('g');

    // Background rect for click-to-deselect
    g.append('rect')
      .attr('x', -10000).attr('y', -10000)
      .attr('width', 20000).attr('height', 20000)
      .attr('fill', 'transparent')
      .on('click', () => {
        onBackgroundClickRef.current?.();
      });

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
        onZoomChangeRef.current?.(Math.round(e.transform.k * 100));
        onViewportChangeRef.current?.({ x: e.transform.x, y: e.transform.y, scale: e.transform.k });
      });
    if (zoomRef) zoomRef.current = zoomBehavior;
    svg.call(zoomBehavior);
    // Restore saved viewport or default to center
    const initTransform = initialViewport
      ? d3.zoomIdentity.translate(initialViewport.x, initialViewport.y).scale(initialViewport.scale)
      : d3.zoomIdentity.translate(width / 2, height / 2);
    svg.call(zoomBehavior.transform, initTransform);

    // Build simulation data
    const simNodes: SimNode[] = nodes.map((n) => {
      const saved = initialPositions?.get(n.id);
      return {
        id: n.id,
        name: n.name,
        sublabel: n.sublabel,
        color: n.color || DEFAULT_COLOR,
        icon: n.icon,
        isCenter: n.isCenter ?? false,
        x: saved ? saved.x : 0,
        y: saved ? saved.y : 0,
        fx: saved ? saved.x : undefined,
        fy: saved ? saved.y : undefined,
      };
    });
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    // Pin center nodes at origin (only if no saved position)
    for (const n of simNodes) {
      if (n.isCenter && n.fx === undefined) { n.fx = 0; n.fy = 0; }
    }

    const simLinks: SimLink[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
        label: e.label,
        edgeStyle: e.style || 'solid',
        edgeColor: e.color || DEFAULT_EDGE_COLOR,
      }));
    simLinksRef.current = simLinks;

    // Force simulation
    const hasCenter = simNodes.some((n) => n.isCenter);
    const collideRadius = hasCenter
      ? Math.max(CENTER_W, CENTER_H) / 2 + 10
      : Math.max(NODE_W, NODE_H) / 2 + 10;

    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(hasCenter ? 180 : 160))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(0, 0))
      .force('x', d3.forceX(0).strength(0.05))
      .force('y', d3.forceY(0).strength(0.05))
      .force('collide', d3.forceCollide(collideRadius));

    // Draw links
    const link = g.selectAll<SVGLineElement, SimLink>('.link')
      .data(simLinks).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => d.edgeColor)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => d.edgeStyle === 'dashed' ? '6,4' : 'none')
      .attr('marker-end', (d) => `url(#arrow-${sanitizeColor(d.edgeColor)})`);
    linkSelRef.current = link;

    // Link labels
    const linkLabel = g.selectAll<SVGTextElement, SimLink>('.link-label')
      .data(simLinks.filter((l) => !!l.label))
      .enter().append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => d.edgeColor)
      .attr('font-size', 10)
      .attr('dy', -6)
      .text((d) => d.label || '');
    linkLabelSelRef.current = linkLabel;

    // Draw nodes
    const clickable = !!onNodeClickRef.current;
    const node = g.selectAll<SVGGElement, SimNode>('.node')
      .data(simNodes).enter().append('g')
      .attr('class', 'node')
      .style('cursor', clickable ? 'pointer' : 'grab')
      .on('click', clickable ? handleClick as any : null)
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (e, d) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
          if (!clickable) {
            d3.select(e.sourceEvent.target.closest('.node')).style('cursor', 'grabbing');
          }
        })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = d.x; d.fy = d.y;
          onDragEndRef.current?.(d.id, d.x!, d.y!);
          if (!clickable) {
            d3.select(e.sourceEvent.target.closest('.node')).style('cursor', 'grab');
          }
        }),
      );

    // Node rounded rectangles — transparent fill, border-only
    node.append('rect')
      .attr('x', (d) => -nodeHW(d))
      .attr('y', (d) => -nodeHH(d))
      .attr('width', (d) => d.isCenter ? CENTER_W : NODE_W)
      .attr('height', (d) => d.isCenter ? CENTER_H : NODE_H)
      .attr('rx', (d) => d.isCenter ? CENTER_RX : NODE_RX)
      .attr('ry', (d) => d.isCenter ? CENTER_RX : NODE_RX)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2)
      .attr('filter', (d) => d.isCenter ? 'url(#force-topo-glow)' : 'none');

    nodeSelRef.current = node;

    // Node icon (top-left corner, using lucide icon font)
    node.filter((d) => !!d.icon)
      .append('text')
      .attr('font-family', 'lucide')
      .attr('font-size', (d) => d.isCenter ? 14 : 12)
      .attr('fill', (d) => d.color)
      .attr('x', (d) => -nodeHW(d) + 8)
      .attr('y', (d) => -nodeHH(d) + (d.isCenter ? 18 : 16));

    // Node name labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.isCenter ? -4 : -2)
      .attr('fill', '#e4e4e7')
      .attr('font-size', (d) => d.isCenter ? 14 : 11)
      .attr('font-weight', (d) => d.isCenter ? 600 : 500)
      .text((d) => {
        const max = d.isCenter ? 16 : 14;
        return d.name.length > max ? d.name.slice(0, max - 1) + '\u2026' : d.name;
      });

    // Sublabel below name
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.isCenter ? 14 : 14)
      .attr('fill', (d) => d.color)
      .attr('font-size', (d) => d.isCenter ? 11 : 9)
      .text((d) => d.sublabel || '');

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => {
          const s = d.source as SimNode; const t = d.target as SimNode;
          return rectEdgePoint(s.x!, s.y!, t.x!, t.y!, nodeHW(s), nodeHH(s))[0];
        })
        .attr('y1', (d) => {
          const s = d.source as SimNode; const t = d.target as SimNode;
          return rectEdgePoint(s.x!, s.y!, t.x!, t.y!, nodeHW(s), nodeHH(s))[1];
        })
        .attr('x2', (d) => {
          const s = d.source as SimNode; const t = d.target as SimNode;
          return rectEdgePoint(t.x!, t.y!, s.x!, s.y!, nodeHW(t), nodeHH(t))[0];
        })
        .attr('y2', (d) => {
          const s = d.source as SimNode; const t = d.target as SimNode;
          return rectEdgePoint(t.x!, t.y!, s.x!, s.y!, nodeHW(t), nodeHH(t))[1];
        });

      linkLabel
        .attr('x', (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
        .attr('y', (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2);

      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [nodes, edges, handleClick, size, zoomRef, initialPositions, initialViewport]);

  /* ---------- Highlight effect ---------- */
  useEffect(() => {
    const nodeSelection = nodeSelRef.current;
    const linkSelection = linkSelRef.current;
    const linkLabelSelection = linkLabelSelRef.current;
    if (!nodeSelection) return;

    const hasSelection = selectedNodeIds && selectedNodeIds.size > 0;

    if (!hasSelection) {
      // Reset all to default
      nodeSelection.select('rect')
        .attr('stroke-width', 2)
        .attr('filter', (d) => d.isCenter ? 'url(#force-topo-glow)' : 'none')
        .attr('stroke', (d) => d.color);
      nodeSelection.selectAll('text').attr('opacity', 1);
      nodeSelection.attr('opacity', 1);
      if (linkSelection) {
        linkSelection.attr('opacity', 1).attr('stroke', (d) => d.edgeColor);
      }
      if (linkLabelSelection) linkLabelSelection.attr('opacity', 1);
      return;
    }

    // Determine "connected/normal" node IDs:
    // If connectedNodeIds is explicitly provided, use it (union with selectedNodeIds).
    // Otherwise, auto-expand from selectedNodeIds via edges.
    const connectedIds = new Set<number>(selectedNodeIds);
    if (connectedNodeIds) {
      for (const id of connectedNodeIds) connectedIds.add(id);
    } else {
      for (const link of simLinksRef.current) {
        const sourceId = (link.source as SimNode).id;
        const targetId = (link.target as SimNode).id;
        if (selectedNodeIds.has(sourceId)) connectedIds.add(targetId);
        if (selectedNodeIds.has(targetId)) connectedIds.add(sourceId);
      }
    }

    // Nodes: highlight selected + connected, dim others
    nodeSelection.each(function (d) {
      const el = d3.select(this);
      const isSelected = selectedNodeIds.has(d.id);
      const isConnected = connectedIds.has(d.id);

      if (isSelected) {
        el.attr('opacity', 1);
        el.select('rect')
          .attr('stroke-width', 3)
          .attr('filter', 'url(#force-topo-glow)')
          .attr('stroke', d.color);
        el.selectAll('text').attr('opacity', 1);
      } else if (isConnected) {
        el.attr('opacity', 1);
        el.select('rect')
          .attr('stroke-width', 2)
          .attr('filter', 'none')
          .attr('stroke', d.color);
        el.selectAll('text').attr('opacity', 1);
      } else {
        el.attr('opacity', 0.15);
        el.select('rect')
          .attr('stroke-width', 2)
          .attr('filter', 'none')
          .attr('stroke', '#3f3f46');
      }
    });

    // Links: highlight connected, dim others
    if (linkSelection) {
      linkSelection.each(function (d) {
        const sourceId = (d.source as SimNode).id;
        const targetId = (d.target as SimNode).id;
        const isConnected = (selectedNodeIds.has(sourceId) || selectedNodeIds.has(targetId))
          && connectedIds.has(sourceId) && connectedIds.has(targetId);

        d3.select(this)
          .attr('opacity', isConnected ? 1 : 0.1)
          .attr('stroke', isConnected ? d.edgeColor : '#3f3f46');
      });
    }

    // Link labels
    if (linkLabelSelection) {
      linkLabelSelection.each(function (d) {
        const sourceId = (d.source as SimNode).id;
        const targetId = (d.target as SimNode).id;
        const isConnected = (selectedNodeIds.has(sourceId) || selectedNodeIds.has(targetId))
          && connectedIds.has(sourceId) && connectedIds.has(targetId);
        d3.select(this).attr('opacity', isConnected ? 1 : 0.1);
      });
    }
  }, [selectedNodeIds, connectedNodeIds]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#0a0a0f' }}>
      <svg ref={setSvgRef} width={size.width} height={size.height} style={{ display: 'block' }} />
    </div>
  );
}
