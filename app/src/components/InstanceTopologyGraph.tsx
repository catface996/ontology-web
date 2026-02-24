import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { InstanceTopologyDTO } from '../services/coreService';

const CLASS_COLORS = [
  'var(--primary-color)', '#22D3EE', '#F472B6', '#4ADE80',
  '#A78BFA', '#FB923C', '#38BDF8', '#FBBF24',
];

/* -- Node dimensions -- */
const NODE_W = 120;
const NODE_H = 56;
const NODE_RX = 12;

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  classId: number;
  className: string;
  color: string;
}

/** Compute the point where a line from the rectangle center to (tx, ty) intersects the rectangle edge. */
function rectEdgePoint(cx: number, cy: number, tx: number, ty: number, hw: number, hh: number): [number, number] {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  // Determine if intersection is on vertical or horizontal edge
  if (absDx * hh > absDy * hw) {
    // hits left or right edge
    const sign = dx > 0 ? 1 : -1;
    return [cx + sign * hw, cy + (dy * hw) / absDx];
  } else {
    // hits top or bottom edge
    const sign = dy > 0 ? 1 : -1;
    return [cx + (dx * hh) / absDy, cy + sign * hh];
  }
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relationName: string;
}

interface Props {
  data: InstanceTopologyDTO;
}

export default function InstanceTopologyGraph({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Track container size with ResizeObserver (debounced to avoid re-renders during Collapse animation)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        clearTimeout(timer);
        timer = setTimeout(() => setSize({ width, height }), 150);
      }
    });
    ro.observe(el);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0 || size.width === 0 || size.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = size.width;
    const height = size.height;

    // Build class color map — use class-defined color if available, fallback to auto-assigned
    const classIds = [...new Set(data.nodes.map((n) => n.classId))];
    const classColorMap = new Map<number, string>();
    let autoIdx = 0;
    classIds.forEach((cid) => {
      const node = data.nodes.find((n) => n.classId === cid);
      classColorMap.set(cid, node?.classColor || CLASS_COLORS[autoIdx++ % CLASS_COLORS.length]);
    });

    // Defs
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'inst-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow marker — refX pushed out so arrowhead sits at rectangle edge
    defs.append('marker').attr('id', 'arrow-inst-relation').attr('viewBox', '0 0 10 6').attr('refX', 10).attr('refY', 3)
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
    const simNodes: SimNode[] = data.nodes.map((n) => ({
      id: n.instanceId,
      name: n.instanceName,
      classId: n.classId,
      className: n.className,
      color: classColorMap.get(n.classId) || '#a1a1aa',
    }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = data.edges
      .filter((e) => nodeMap.has(e.sourceInstanceId) && nodeMap.has(e.targetInstanceId))
      .map((e) => ({
        source: nodeMap.get(e.sourceInstanceId)!,
        target: nodeMap.get(e.targetInstanceId)!,
        relationName: e.relationName || '',
      }));

    const hw = NODE_W / 2;
    const hh = NODE_H / 2;

    // Force simulation
    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(160))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(Math.max(hw, hh) + 10));

    // Draw links
    const link = g.selectAll<SVGLineElement, SimLink>('.link')
      .data(simLinks).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'var(--primary-color)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow-inst-relation)');

    // Link labels
    const linkLabel = g.selectAll<SVGTextElement, SimLink>('.link-label')
      .data(simLinks.filter((l) => l.relationName))
      .enter().append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--primary-color)')
      .attr('font-size', 10)
      .attr('dy', -6)
      .text((d) => d.relationName);

    // Draw nodes
    const node = g.selectAll<SVGGElement, SimNode>('.node')
      .data(simNodes).enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'grab')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (e, d) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
          d3.select(e.sourceEvent.target.closest('.node')).style('cursor', 'grabbing');
        })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = d.x; d.fy = d.y;
          d3.select(e.sourceEvent.target.closest('.node')).style('cursor', 'grab');
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
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2);

    // Node name labels (inside rect)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -2)
      .attr('fill', '#e4e4e7')
      .attr('font-size', 11)
      .attr('font-weight', 500)
      .text((d) => d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name);

    // Class label below name (inside rect)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 14)
      .attr('fill', (d) => d.color)
      .attr('font-size', 9)
      .text((d) => d.className);

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
  }, [data, size]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#0a0a0f' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
