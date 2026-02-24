import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';

export interface ClassNode {
  id: number;
  name: string;
  type: string; // 'class'
  color?: string | null;
  icon?: string | null;
}

export interface ClassEdge {
  source: number;
  target: number;
  type: string; // 'subClassOf' | 'relation'
  relationId?: number;
  relationName?: string;
}

interface Props {
  nodes: ClassNode[];
  edges: ClassEdge[];
  selectedClassIds: Set<number>;
  onToggleClass: (classId: number, className: string) => void;
}

/* -- Node dimensions -- */
const NODE_W = 120;
const NODE_H = 56;
const NODE_RX = 12;

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type: string;
  color?: string | null;
  icon?: string | null;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  edgeType: string;
  relationName?: string;
}

/** Compute the point where a line from the rectangle center to (tx, ty) intersects the rectangle edge. */
function rectEdgePoint(cx: number, cy: number, tx: number, ty: number, hw: number, hh: number): [number, number] {
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

export default function ClassTopologyGraph({ nodes, edges, selectedClassIds, onToggleClass }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Track container size with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleClick = useCallback(
    (_event: MouseEvent, d: SimNode) => {
      onToggleClass(d.id, d.name);
    },
    [onToggleClass],
  );

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || size.width === 0 || size.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = size.width;
    const height = size.height;

    // Defs
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'class-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow markers — refX at tip since link endpoints are already at rect edges
    defs.append('marker').attr('id', 'arrow-subclass').attr('viewBox', '0 0 10 6').attr('refX', 10).attr('refY', 3)
      .attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,3 L0,6 Z').attr('fill', '#22D3EE');

    defs.append('marker').attr('id', 'arrow-relation').attr('viewBox', '0 0 10 6').attr('refX', 10).attr('refY', 3)
      .attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,3 L0,6 Z').attr('fill', 'var(--primary-color)');

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

    // Simulation data
    const simNodes: SimNode[] = nodes.map((n) => ({ ...n, x: 0, y: 0 }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
        edgeType: e.type,
        relationName: e.relationName,
      }));

    const hw = NODE_W / 2;
    const hh = NODE_H / 2;

    // Force simulation
    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(160))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(Math.max(hw, hh) + 10));
    simulationRef.current = simulation;

    // Draw links
    const link = g.selectAll<SVGLineElement, SimLink>('.link')
      .data(simLinks).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => d.edgeType === 'subClassOf' ? '#22D3EE' : 'var(--primary-color)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => d.edgeType === 'subClassOf' ? '6,4' : 'none')
      .attr('marker-end', (d) => d.edgeType === 'subClassOf' ? 'url(#arrow-subclass)' : 'url(#arrow-relation)');

    // Link labels
    const linkLabel = g.selectAll<SVGTextElement, SimLink>('.link-label')
      .data(simLinks.filter((l) => l.edgeType === 'relation' && l.relationName))
      .enter().append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--primary-color)')
      .attr('font-size', 10)
      .attr('dy', -6)
      .text((d) => d.relationName || '');

    // Draw nodes
    const node = g.selectAll<SVGGElement, SimNode>('.node')
      .data(simNodes).enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', handleClick as any)
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (e, d) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = d.x; d.fy = d.y;
        }),
      );

    // Node rounded rectangles — transparent fill, border-only
    node.append('rect')
      .attr('x', -hw)
      .attr('y', -hh)
      .attr('width', NODE_W)
      .attr('height', NODE_H)
      .attr('rx', NODE_RX)
      .attr('ry', NODE_RX)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => selectedClassIds.has(d.id) ? (d.color || 'var(--primary-color)') : (d.color || '#a78bfa'))
      .attr('stroke-width', 2)
      .attr('filter', (d) => selectedClassIds.has(d.id) ? 'url(#class-glow)' : 'none');

    // Node icon (top-left corner, using lucide icon font)
    node.filter((d) => !!d.icon)
      .append('text')
      .attr('font-family', 'lucide')
      .attr('font-size', 12)
      .attr('fill', (d) => d.color || '#a78bfa')
      .attr('x', -hw + 8)
      .attr('y', -hh + 16);

    // Node name labels (inside rect)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -2)
      .attr('fill', '#e4e4e7')
      .attr('font-size', 11)
      .attr('font-weight', 500)
      .text((d) => d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name);

    // "Class" label below name (inside rect)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 14)
      .attr('fill', (d) => d.color || '#71717a')
      .attr('font-size', 9)
      .text('Class');

    simulation.on('tick', () => {
      // Compute link endpoints snapped to rectangle edges
      link
        .attr('x1', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return rectEdgePoint(s.x!, s.y!, t.x!, t.y!, hw, hh)[0];
        })
        .attr('y1', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return rectEdgePoint(s.x!, s.y!, t.x!, t.y!, hw, hh)[1];
        })
        .attr('x2', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return rectEdgePoint(t.x!, t.y!, s.x!, s.y!, hw, hh)[0];
        })
        .attr('y2', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return rectEdgePoint(t.x!, t.y!, s.x!, s.y!, hw, hh)[1];
        });

      linkLabel
        .attr('x', (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
        .attr('y', (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2);

      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, selectedClassIds, handleClick, size]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#0a0a0f' }}>
      <svg ref={svgRef} width={size.width} height={size.height} />
    </div>
  );
}
