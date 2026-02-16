import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';

export interface ClassNode {
  id: number;
  name: string;
  type: string; // 'class'
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

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  type: string;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  edgeType: string;
  relationName?: string;
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

    // Arrow markers
    defs.append('marker').attr('id', 'arrow-subclass').attr('viewBox', '0 0 10 6').attr('refX', 28).attr('refY', 3)
      .attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,3 L0,6 Z').attr('fill', '#22D3EE');

    defs.append('marker').attr('id', 'arrow-relation').attr('viewBox', '0 0 10 6').attr('refX', 28).attr('refY', 3)
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

    // Force simulation
    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(50));
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

    // Node circles
    node.append('circle')
      .attr('r', 24)
      .attr('fill', (d) => selectedClassIds.has(d.id) ? 'var(--primary-color)' : '#1a1a24')
      .attr('stroke', (d) => selectedClassIds.has(d.id) ? 'var(--primary-color)' : '#a78bfa')
      .attr('stroke-width', 2)
      .attr('filter', (d) => selectedClassIds.has(d.id) ? 'url(#class-glow)' : 'none');

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', (d) => selectedClassIds.has(d.id) ? '#fff' : '#e4e4e7')
      .attr('font-size', 11)
      .attr('font-weight', 500)
      .text((d) => d.name.length > 10 ? d.name.slice(0, 9) + '…' : d.name);

    // subClassOf label below circle
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 38)
      .attr('fill', '#71717a')
      .attr('font-size', 9)
      .text('Class');

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!);

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
