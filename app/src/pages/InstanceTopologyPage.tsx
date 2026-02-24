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
  type InstancePropertyValueDTO,
  type InstanceRelationDTO,
} from '../services/coreService';
import ForceTopologyGraph, { type ForceGraphNode, type ForceGraphEdge } from '../components/ForceTopologyGraph';

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
  const [graphNodes, setGraphNodes] = useState<ForceGraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<ForceGraphEdge[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<number>>(new Set());

  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoom, setZoom] = useState(100);

  const handleNodeClick = useCallback((nodeId: number) => {
    setSelectedNodeIds((prev) => {
      if (prev.has(nodeId)) return new Set();
      return new Set([nodeId]);
    });
  }, []);

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
          const topo = topoRes.value.data;

          // Build class color map
          const FALLBACK_COLORS = [
            'var(--primary-color)', '#22D3EE', '#F472B6', '#4ADE80',
            '#A78BFA', '#FB923C', '#38BDF8', '#FBBF24',
          ];
          const classIds = [...new Set(topo.nodes.map((n) => n.classId))];
          const classColorMap = new Map<number, string>();
          classIds.forEach((cid, i) => classColorMap.set(cid, FALLBACK_COLORS[i % FALLBACK_COLORS.length]));

          const centerId = Number(instanceId);
          setGraphNodes(topo.nodes.map((n) => ({
            id: n.instanceId,
            name: n.instanceName,
            sublabel: n.className,
            color: classColorMap.get(n.classId) || '#a1a1aa',
            isCenter: n.instanceId === centerId,
          })));
          setGraphEdges(topo.edges.map((e) => ({
            source: e.sourceInstanceId,
            target: e.targetInstanceId,
            label: e.relationName || undefined,
          })));
        }
      } catch {
        // failed
      } finally {
        setLoading(false);
      }
    })();
  }, [instanceId]);

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
      {/* Topology Canvas */}
      <div style={{ flex: 1, borderRadius: 12, border: '1px solid #27273a', overflow: 'hidden', position: 'relative', background: '#0a0a0f' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f' }}>
            <Spin size="large" />
          </div>
        ) : graphNodes.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f' }}>
            <Typography.Text style={{ color: '#a1a1aa' }}>No topology data available</Typography.Text>
          </div>
        ) : (
          <ForceTopologyGraph
            nodes={graphNodes}
            edges={graphEdges}
            selectedNodeIds={selectedNodeIds}
            onNodeClick={handleNodeClick}
            onZoomChange={setZoom}
            zoomRef={zoomBehaviorRef}
            svgRef={svgRef}
          />
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
