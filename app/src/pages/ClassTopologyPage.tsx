import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Spin, Flex } from 'antd';
import {
  Download, Info, Minus, Plus, Maximize2,
  User as UserIcon, ChevronRight,
} from 'lucide-react';
import * as d3 from 'd3';
import { useHeader } from '../contexts/HeaderContext';
import {
  getClassTopology,
  listClassProperties,
  type ClassPropertyDTO,
  type ClassTopologyNode,
  type ClassTopologyEdge,
} from '../services/coreService';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CLASS_COLORS = [
  'var(--primary-color)', '#22D3EE', '#F472B6', '#4ADE80',
  '#A78BFA', '#FB923C', '#38BDF8', '#FBBF24',
];

/* -- Node dimensions -- */
const NODE_W = 120;
const NODE_H = 56;
const CENTER_W = 150;
const CENTER_H = 64;
const NODE_RX = 12;
const CENTER_RX = 16;

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

/* ------------------------------------------------------------------ */
/*  D3 simulation types                                                */
/* ------------------------------------------------------------------ */

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  isCenter: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relationName: string;
}

/* ------------------------------------------------------------------ */
/*  Detail panel types                                                 */
/* ------------------------------------------------------------------ */

interface PropertyDisplay { label: string; dataType: string }
interface RelationDisplay { relationName: string; domainClass: string; rangeClass: string }

/* ------------------------------------------------------------------ */
/*  Build topology data from class/topology API response               */
/* ------------------------------------------------------------------ */

function buildTopology(
  nodes: ClassTopologyNode[],
  edges: ClassTopologyEdge[],
): { nodes: SimNode[]; links: SimLink[] } {
  let colorIndex = 0;
  const nodeMap = new Map<number, SimNode>();

  for (const n of nodes) {
    const isCenter = n.center;
    nodeMap.set(n.id, {
      id: n.id,
      name: n.name,
      color: n.color || (isCenter ? 'var(--primary-color)' : CLASS_COLORS[++colorIndex % CLASS_COLORS.length]),
      icon: n.icon,
      isCenter,
    });
  }

  const simNodes = [...nodeMap.values()];
  const simLinks: SimLink[] = [];

  for (const e of edges) {
    const sourceNode = nodeMap.get(e.sourceClassId);
    const targetNode = nodeMap.get(e.targetClassId);
    if (sourceNode && targetNode) {
      simLinks.push({
        source: sourceNode,
        target: targetNode,
        relationName: e.name,
      });
    }
  }

  return { nodes: simNodes, links: simLinks };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ClassTopologyPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();

  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [parentClassName, setParentClassName] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyDisplay[]>([]);
  const [relationsDisplay, setRelationsDisplay] = useState<RelationDisplay[]>([]);
  const [topoData, setTopoData] = useState<{ nodes: SimNode[]; links: SimLink[] } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoom, setZoom] = useState(100);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  /* ---------- Load data ---------- */
  useEffect(() => {
    if (!classId) { setLoading(false); return; }
    const id = Number(classId);

    (async () => {
      try {
        const [topoRes, propsRes] = await Promise.allSettled([
          getClassTopology(id),
          listClassProperties(id),
        ]);

        if (topoRes.status === 'fulfilled' && topoRes.value.data) {
          const { nodes, edges } = topoRes.value.data;

          // Find the center node to populate detail panel
          const centerNode = nodes.find((n) => n.center);
          if (centerNode) {
            setClassName(centerNode.name);
            setClassDescription(centerNode.description ?? '');
            setParentClassName(centerNode.parentClassName ?? null);
          }

          // Build relations display from edges
          setRelationsDisplay(edges.map((e) => ({
            relationName: e.name,
            domainClass: e.sourceClassName,
            rangeClass: e.targetClassName,
          })));

          // Build topology graph data
          if (nodes.length > 0) {
            setTopoData(buildTopology(nodes, edges));
          }
        }

        if (propsRes.status === 'fulfilled' && propsRes.value.data) {
          setProperties(propsRes.value.data.map((p: ClassPropertyDTO) => ({
            label: p.propertyName,
            dataType: p.dataType,
          })));
        }
      } catch {
        // failed
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  /* ---------- ResizeObserver ---------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSvgSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- D3 render ---------- */
  useEffect(() => {
    if (!svgRef.current || !topoData || topoData.nodes.length === 0 || svgSize.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = svgSize;

    // Defs
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'class-topo-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow marker
    defs.append('marker').attr('id', 'arrow-class-topo').attr('viewBox', '0 0 10 6').attr('refX', 10).attr('refY', 3)
      .attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,3 L0,6 Z').attr('fill', 'var(--primary-color)');

    const g = svg.append('g');

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
        setZoom(Math.round(e.transform.k * 100));
      });
    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(width / 2, height / 2));

    // Clone data for simulation (d3 mutates in place)
    const simNodes: SimNode[] = topoData.nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = topoData.links.map((l) => ({
      source: nodeMap.get((l.source as SimNode).id)!,
      target: nodeMap.get((l.target as SimNode).id)!,
      relationName: l.relationName,
    }));

    // Pin center at origin
    const centerNode = simNodes.find((n) => n.isCenter);
    if (centerNode) { centerNode.fx = 0; centerNode.fy = 0; }

    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(Math.max(CENTER_W, CENTER_H) / 2 + 10));

    // Links
    const link = g.selectAll<SVGLineElement, SimLink>('.link')
      .data(simLinks).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'var(--primary-color)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow-class-topo)');

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

    // Nodes
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

    // Node rounded rectangles
    node.append('rect')
      .attr('x', (d) => d.isCenter ? -CENTER_W / 2 : -NODE_W / 2)
      .attr('y', (d) => d.isCenter ? -CENTER_H / 2 : -NODE_H / 2)
      .attr('width', (d) => d.isCenter ? CENTER_W : NODE_W)
      .attr('height', (d) => d.isCenter ? CENTER_H : NODE_H)
      .attr('rx', (d) => d.isCenter ? CENTER_RX : NODE_RX)
      .attr('ry', (d) => d.isCenter ? CENTER_RX : NODE_RX)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2)
      .attr('filter', (d) => d.isCenter ? 'url(#class-topo-glow)' : 'none');

    // Node icon (top-left corner, using lucide icon font)
    node.filter((d) => !!d.icon)
      .append('text')
      .attr('font-family', 'lucide')
      .attr('font-size', (d) => d.isCenter ? 14 : 12)
      .attr('fill', (d) => d.color)
      .attr('x', (d) => d.isCenter ? -CENTER_W / 2 + 8 : -NODE_W / 2 + 8)
      .attr('y', (d) => d.isCenter ? -CENTER_H / 2 + 18 : -NODE_H / 2 + 16);

    // Node name labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.isCenter ? -4 : -2)
      .attr('fill', '#e4e4e7')
      .attr('font-size', (d) => d.isCenter ? 14 : 11)
      .attr('font-weight', (d) => d.isCenter ? 600 : 500)
      .text((d) => {
        const max = d.isCenter ? 16 : 14;
        return d.name.length > max ? d.name.slice(0, max - 1) + '…' : d.name;
      });

    // "Class" label below name
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.isCenter ? 14 : 14)
      .attr('fill', (d) => d.color)
      .attr('font-size', (d) => d.isCenter ? 11 : 9)
      .text('Class');

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const shw = s.isCenter ? CENTER_W / 2 : NODE_W / 2;
          const shh = s.isCenter ? CENTER_H / 2 : NODE_H / 2;
          return rectEdgePoint(s.x!, s.y!, t.x!, t.y!, shw, shh)[0];
        })
        .attr('y1', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const shw = s.isCenter ? CENTER_W / 2 : NODE_W / 2;
          const shh = s.isCenter ? CENTER_H / 2 : NODE_H / 2;
          return rectEdgePoint(s.x!, s.y!, t.x!, t.y!, shw, shh)[1];
        })
        .attr('x2', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const thw = t.isCenter ? CENTER_W / 2 : NODE_W / 2;
          const thh = t.isCenter ? CENTER_H / 2 : NODE_H / 2;
          return rectEdgePoint(t.x!, t.y!, s.x!, s.y!, thw, thh)[0];
        })
        .attr('y2', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          const thw = t.isCenter ? CENTER_W / 2 : NODE_W / 2;
          const thh = t.isCenter ? CENTER_H / 2 : NODE_H / 2;
          return rectEdgePoint(t.x!, t.y!, s.x!, s.y!, thw, thh)[1];
        });
      linkLabel
        .attr('x', (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
        .attr('y', (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2);
      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [topoData, svgSize]);

  /* ---------- Zoom controls ---------- */
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1 / 1.2);
  }, []);

  const handleFit = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    d3.select(svgRef.current).transition().duration(500)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(rect.width / 2, rect.height / 2));
  }, []);

  /* ---------- Header ---------- */
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/classes'); }}>Classes</a> },
          ...(className ? [{ title: className }] : []),
          { title: <Typography.Text strong>Topology</Typography.Text> },
        ]}
      />,
    );
    setActions(
      <Flex gap={8}>
        <Flex gap={4} align="center">
          <div onClick={handleZoomOut} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 6, border: '1px solid #27273a', cursor: 'pointer' }}>
            <Minus size={16} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: 6, backgroundColor: '#1a1a24' }}>
            <Typography.Text style={{ fontSize: 12 }}>{zoom}%</Typography.Text>
          </div>
          <div onClick={handleZoomIn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 6, border: '1px solid #27273a', cursor: 'pointer' }}>
            <Plus size={16} />
          </div>
        </Flex>
        <div onClick={handleFit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 6, border: '1px solid #27273a', cursor: 'pointer' }}>
          <Maximize2 size={16} />
          <Typography.Text style={{ fontSize: 13 }}>Fit</Typography.Text>
        </div>
        <Button type="primary" icon={<Download size={16} />}>Export</Button>
      </Flex>,
    );
  }, [setBreadcrumbs, setActions, className, navigate, zoom, handleZoomIn, handleZoomOut, handleFit]);

  /* ---------- Render ---------- */
  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'hidden' }}>
      {/* Topology Canvas */}
      <div
        ref={containerRef}
        style={{
          flex: 1, borderRadius: 12, border: '1px solid #27273a',
          overflow: 'hidden', position: 'relative', background: '#0a0a0f',
        }}
      >
        <svg ref={svgRef} width={svgSize.width} height={svgSize.height} style={{ display: 'block' }} />
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f' }}>
            <Spin size="large" />
          </div>
        )}
        {!loading && (!topoData || topoData.nodes.length === 0) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f' }}>
            <Typography.Text style={{ color: '#a1a1aa' }}>No topology data available</Typography.Text>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <div style={{
        width: 300, borderRadius: 12, border: '1px solid #27273a',
        display: 'flex', flexDirection: 'column', overflow: 'auto', flexShrink: 0,
      }}>
        {/* Panel Header */}
        <div style={{ padding: 20, borderBottom: '1px solid #27273a' }}>
          <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
            <Info size={18} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Class Details</Typography.Text>
          </Flex>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography.Text style={{ fontSize: 20, fontWeight: 600 }}>{className || '—'}</Typography.Text>
            <Flex align="center" gap={6}>
              <UserIcon size={14} color="var(--primary-color)" />
              <Typography.Text style={{ color: '#a1a1aa', fontSize: 14 }}>
                {parentClassName ? `Subclass of ${parentClassName}` : 'Root Class'}
              </Typography.Text>
            </Flex>
            {classDescription && (
              <Typography.Text style={{ color: '#71717a', fontSize: 13 }}>{classDescription}</Typography.Text>
            )}
          </div>
        </div>

        {/* Properties */}
        <div style={{ padding: 20, borderBottom: '1px solid #27273a' }}>
          <Typography.Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600 }}>Properties</Typography.Text>
          {properties.length === 0 ? (
            <Typography.Text style={{ color: '#71717a', fontSize: 13, display: 'block', marginTop: 8 }}>No properties</Typography.Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {properties.map((prop) => (
                <Flex key={prop.label} justify="space-between">
                  <Typography.Text style={{ color: '#a1a1aa', fontSize: 13 }}>{prop.label}</Typography.Text>
                  <Typography.Text style={{ fontSize: 13 }}>{prop.dataType}</Typography.Text>
                </Flex>
              ))}
            </div>
          )}
        </div>

        {/* Relations */}
        <div style={{ padding: 20 }}>
          <Typography.Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600 }}>
            Relations ({relationsDisplay.length})
          </Typography.Text>
          {relationsDisplay.length === 0 ? (
            <Typography.Text style={{ color: '#71717a', fontSize: 13, display: 'block', marginTop: 8 }}>No relations</Typography.Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {relationsDisplay.map((rel, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    padding: 10, backgroundColor: '#1a1a24', borderRadius: 8,
                  }}
                >
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{rel.relationName}</Typography.Text>
                  <Typography.Text style={{ color: '#a1a1aa', fontSize: 11 }}>
                    {rel.domainClass} → {rel.rangeClass}
                  </Typography.Text>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
