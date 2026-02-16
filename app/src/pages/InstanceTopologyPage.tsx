import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Spin, Flex } from 'antd';
import {
  Download, Info, Minus, Plus, Maximize2,
  Box as BoxIcon, ChevronRight,
} from 'lucide-react';
import * as d3 from 'd3';
import { useHeader } from '../contexts/HeaderContext';
import {
  getInstance,
  listInstancePropertyValues,
  listInstanceRelations,
  getInstanceTopology,
  type InstanceDTO,
  type InstancePropertyValueDTO,
  type InstanceRelationDTO,
  type InstanceTopologyDTO,
} from '../services/coreService';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CLASS_COLORS = [
  'var(--primary-color)', '#22D3EE', '#F472B6', '#4ADE80',
  '#A78BFA', '#FB923C', '#38BDF8', '#FBBF24',
];

/* ------------------------------------------------------------------ */
/*  D3 simulation types                                                */
/* ------------------------------------------------------------------ */

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  classId: number;
  className: string;
  color: string;
  isCenter: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relationName: string;
}

/* ------------------------------------------------------------------ */
/*  Detail panel types                                                 */
/* ------------------------------------------------------------------ */

interface PropertyDisplay { label: string; value: string }
interface RelationDisplay { name: string; relation: string; targetClass: string }

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InstanceTopologyPage() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();

  const [loading, setLoading] = useState(true);
  const [instanceName, setInstanceName] = useState('');
  const [instanceClassName, setInstanceClassName] = useState('');
  const [properties, setProperties] = useState<PropertyDisplay[]>([]);
  const [relations, setRelations] = useState<RelationDisplay[]>([]);
  const [topoData, setTopoData] = useState<InstanceTopologyDTO | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoom, setZoom] = useState(100);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  /* ---------- Load data ---------- */
  useEffect(() => {
    if (!instanceId) { setLoading(false); return; }
    const id = Number(instanceId);

    (async () => {
      try {
        const [instRes, propsRes, relsRes, topoRes] = await Promise.allSettled([
          getInstance(id),
          listInstancePropertyValues(id),
          listInstanceRelations(id),
          getInstanceTopology(id),
        ]);

        if (instRes.status === 'fulfilled' && instRes.value.data) {
          setInstanceName(instRes.value.data.name);
          setInstanceClassName(instRes.value.data.className);
        }
        if (propsRes.status === 'fulfilled' && propsRes.value.data) {
          setProperties(propsRes.value.data.map((pv: InstancePropertyValueDTO) => ({
            label: pv.propertyName,
            value: pv.value,
          })));
        }
        if (relsRes.status === 'fulfilled' && relsRes.value.data) {
          setRelations(relsRes.value.data.map((r: InstanceRelationDTO) => ({
            name: r.targetInstanceName,
            relation: r.relationName,
            targetClass: r.targetClassName,
          })));
        }
        if (topoRes.status === 'fulfilled' && topoRes.value.data) {
          setTopoData(topoRes.value.data);
        }
      } catch {
        // failed
      } finally {
        setLoading(false);
      }
    })();
  }, [instanceId]);

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

    const centerId = Number(instanceId);
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = svgSize;

    // Class color map
    const classIds = [...new Set(topoData.nodes.map((n) => n.classId))];
    const classColorMap = new Map<number, string>();
    classIds.forEach((cid, i) => classColorMap.set(cid, CLASS_COLORS[i % CLASS_COLORS.length]));

    // Defs
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'inst-topo-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow marker
    defs.append('marker').attr('id', 'arrow-inst-topo').attr('viewBox', '0 0 10 6').attr('refX', 28).attr('refY', 3)
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

    // Build simulation data
    const simNodes: SimNode[] = topoData.nodes.map((n) => ({
      id: n.instanceId,
      name: n.instanceName,
      classId: n.classId,
      className: n.className,
      color: classColorMap.get(n.classId) || '#a1a1aa',
      isCenter: n.instanceId === centerId,
    }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = topoData.edges
      .filter((e) => nodeMap.has(e.sourceInstanceId) && nodeMap.has(e.targetInstanceId))
      .map((e) => ({
        source: nodeMap.get(e.sourceInstanceId)!,
        target: nodeMap.get(e.targetInstanceId)!,
        relationName: e.relationName || '',
      }));

    // Force simulation — pin center node at origin
    const centerNode = simNodes.find((n) => n.isCenter);
    if (centerNode) { centerNode.fx = 0; centerNode.fy = 0; }

    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(40));

    // Links
    const link = g.selectAll<SVGLineElement, SimLink>('.link')
      .data(simLinks).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'var(--primary-color)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow-inst-topo)');

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

    // Node circles — center node is larger and filled with primary color
    node.append('circle')
      .attr('r', (d) => d.isCenter ? 32 : 18)
      .attr('fill', (d) => d.isCenter ? 'var(--primary-color)' : '#1a1a24')
      .attr('stroke', (d) => d.isCenter ? 'var(--primary-color)' : d.color)
      .attr('stroke-width', 2)
      .attr('filter', (d) => d.isCenter ? 'url(#inst-topo-glow)' : 'none');

    // Node name labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.isCenter ? 4 : 4)
      .attr('fill', (d) => d.isCenter ? '#fff' : '#e4e4e7')
      .attr('font-size', (d) => d.isCenter ? 12 : 9)
      .attr('font-weight', (d) => d.isCenter ? 600 : 500)
      .text((d) => {
        const max = d.isCenter ? 12 : 6;
        return d.name.length > max ? d.name.slice(0, max - 1) + '…' : d.name;
      });

    // Class label below
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.isCenter ? 48 : 32)
      .attr('fill', (d) => d.isCenter ? 'var(--primary-color)' : d.color)
      .attr('font-size', (d) => d.isCenter ? 10 : 8)
      .text((d) => d.className);

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

    return () => { simulation.stop(); };
  }, [topoData, svgSize, instanceId]);

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
          { title: <a onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/instances'); }}>Instances</a> },
          ...(instanceName ? [{ title: instanceName }] : []),
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
  }, [setBreadcrumbs, setActions, instanceName, navigate, zoom, handleZoomIn, handleZoomOut, handleFit]);

  /* ---------- Render ---------- */
  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'hidden' }}>
      {/* Topology Canvas — always rendered so ResizeObserver can measure it */}
      <div
        ref={containerRef}
        style={{
          flex: 1, borderRadius: 12, border: '1px solid #27273a',
          overflow: 'hidden', position: 'relative', background: '#0a0a0f',
        }}
      >
        <svg ref={svgRef} width={svgSize.width} height={svgSize.height} style={{ display: 'block' }} />
        {/* Overlay: loading / empty states */}
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
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Instance Details</Typography.Text>
          </Flex>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography.Text style={{ fontSize: 20, fontWeight: 600 }}>{instanceName || '—'}</Typography.Text>
            <Flex align="center" gap={6}>
              <BoxIcon size={14} color="var(--primary-color)" />
              <Typography.Text style={{ color: '#a1a1aa', fontSize: 14 }}>{instanceClassName || '—'}</Typography.Text>
            </Flex>
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
                  <Typography.Text style={{ fontSize: 13 }}>{prop.value}</Typography.Text>
                </Flex>
              ))}
            </div>
          )}
        </div>

        {/* Relations */}
        <div style={{ padding: 20 }}>
          <Typography.Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600 }}>
            Relations ({relations.length})
          </Typography.Text>
          {relations.length === 0 ? (
            <Typography.Text style={{ color: '#71717a', fontSize: 13, display: 'block', marginTop: 8 }}>No relations</Typography.Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {relations.map((rel, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    padding: 10, backgroundColor: '#1a1a24', borderRadius: 8,
                  }}
                >
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{rel.name}</Typography.Text>
                  <Typography.Text style={{ color: '#a1a1aa', fontSize: 11 }}>
                    {rel.relation} → {rel.targetClass}
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
