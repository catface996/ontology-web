import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Spin, Collapse, Badge, Button, Flex } from 'antd';
import { ChevronRight, ZoomIn, ZoomOut, Maximize, Download, Pencil } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getTopology,
  fetchOntologyGraph,
  fetchMultiClassInstanceTopology,
  type TopologyDTO,
  type OntologyGraphData,
  type InstanceTopologyDTO,
} from '../services/coreService';
import ClassTopologyGraph, { type ClassNode, type ClassEdge } from '../components/ClassTopologyGraph';
import InstanceTopologyGraph from '../components/InstanceTopologyGraph';

/** Split a combined InstanceTopologyDTO into connected-component subgraphs */
interface InstanceSubgraph {
  index: number;
  label: string;
  nodeCount: number;
  data: InstanceTopologyDTO;
}

function splitByConnectedComponents(dto: InstanceTopologyDTO): InstanceSubgraph[] {
  if (dto.nodes.length === 0) return [];

  // Build adjacency list
  const adj = new Map<number, Set<number>>();
  for (const n of dto.nodes) adj.set(n.instanceId, new Set());
  for (const e of dto.edges) {
    adj.get(e.sourceInstanceId)?.add(e.targetInstanceId);
    adj.get(e.targetInstanceId)?.add(e.sourceInstanceId);
  }

  // BFS to find connected components
  const visited = new Set<number>();
  const components: Set<number>[] = [];

  for (const n of dto.nodes) {
    if (visited.has(n.instanceId)) continue;
    const component = new Set<number>();
    const queue = [n.instanceId];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      component.add(cur);
      for (const neighbor of adj.get(cur) ?? []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    components.push(component);
  }

  // Sort components by size descending
  components.sort((a, b) => b.size - a.size);

  return components.map((nodeIds, idx) => {
    const nodes = dto.nodes.filter((n) => nodeIds.has(n.instanceId));
    const edges = dto.edges.filter(
      (e) => nodeIds.has(e.sourceInstanceId) && nodeIds.has(e.targetInstanceId),
    );
    // Build label from distinct class names in this component
    const classNames = [...new Set(nodes.map((n) => n.className))].sort();
    const label = classNames.join(' · ');
    return { index: idx + 1, label, nodeCount: nodes.length, data: { nodes, edges } };
  });
}

export default function TopologyViewPage() {
  const { topologyId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();

  // Topology entity
  const [topology, setTopology] = useState<TopologyDTO | null>(null);
  const [loadingTopology, setLoadingTopology] = useState(true);

  // Class topology state
  const [classNodes, setClassNodes] = useState<ClassNode[]>([]);
  const [classEdges, setClassEdges] = useState<ClassEdge[]>([]);
  const [loadingClass, setLoadingClass] = useState(true);

  // Selection state — auto-populated from topology classIds
  const [selectedClassIds, setSelectedClassIds] = useState<Set<number>>(new Set());

  // Instance topology state
  const [instanceData, setInstanceData] = useState<InstanceTopologyDTO | null>(null);
  const [loadingInstance, setLoadingInstance] = useState(false);

  // Accordion active keys
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  // Divider drag state
  const [leftWidthPercent, setLeftWidthPercent] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load topology entity
  useEffect(() => {
    if (!topologyId) { setLoadingTopology(false); return; }
    (async () => {
      try {
        const res = await getTopology(Number(topologyId));
        if (res.data) {
          setTopology(res.data);
          setSelectedClassIds(new Set(res.data.classIds));
        }
      } catch {
        // not found
      } finally {
        setLoadingTopology(false);
      }
    })();
  }, [topologyId]);

  // Load class topology graph
  useEffect(() => {
    const ontologyId = topology?.ontologyId ?? currentOntologyId;
    if (!ontologyId) return;
    (async () => {
      try {
        const res = await fetchOntologyGraph(ontologyId);
        if (res.data) {
          const rawData = res.data as any;
          const nodes: ClassNode[] = (rawData.nodes || []).map((n: any) => ({
            id: n.id,
            name: n.name || n.label || String(n.id),
            type: n.type || 'class',
          }));
          const edges: ClassEdge[] = (rawData.edges || rawData.links || []).map((e: any) => ({
            source: typeof e.source === 'string' ? parseInt(e.source, 10) : e.source,
            target: typeof e.target === 'string' ? parseInt(e.target, 10) : e.target,
            type: e.type || (e.relationId || e.relationName ? 'relation' : 'subClassOf'),
            relationId: e.relationId,
            relationName: e.relationName || e.label,
          }));
          setClassNodes(nodes);
          setClassEdges(edges);
        }
      } catch {
        // failed
      } finally {
        setLoadingClass(false);
      }
    })();
  }, [topology?.ontologyId, currentOntologyId]);

  // Auto-expand: when a class is toggled, include classes connected by Relation edges
  const expandClassSelection = useCallback(
    (clickedId: number): Set<number> => {
      const expanded = new Set<number>([clickedId]);
      for (const edge of classEdges) {
        if (edge.type === 'relation') {
          if (edge.source === clickedId) expanded.add(edge.target);
          if (edge.target === clickedId) expanded.add(edge.source);
        }
      }
      return expanded;
    },
    [classEdges],
  );

  const handleToggleClass = useCallback(
    (classId: number, _className: string) => {
      setSelectedClassIds((prev) => {
        const next = new Set(prev);
        if (next.has(classId)) {
          const expanded = expandClassSelection(classId);
          expanded.forEach((id) => next.delete(id));
        } else {
          const expanded = expandClassSelection(classId);
          expanded.forEach((id) => next.add(id));
        }
        return next;
      });
    },
    [expandClassSelection],
  );

  // Fetch instance topology when selectedClassIds changes
  useEffect(() => {
    if (selectedClassIds.size === 0) {
      setInstanceData(null);
      setActiveKeys([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingInstance(true);
      try {
        const res = await fetchMultiClassInstanceTopology({
          classIds: Array.from(selectedClassIds),
          limit: 200,
        });
        if (res.data) {
          setInstanceData(res.data);
          const groups = splitByConnectedComponents(res.data);
          setActiveKeys(groups.map((g) => String(g.index)));
        }
      } catch {
        setInstanceData(null);
      } finally {
        setLoadingInstance(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedClassIds]);

  // Split instance data into connected-component subgraphs
  const subgraphs = useMemo(() => {
    if (!instanceData) return [];
    return splitByConnectedComponents(instanceData);
  }, [instanceData]);

  // Divider drag handlers
  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPercent(Math.max(20, Math.min(80, pct)));
    };
    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Breadcrumbs & actions
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/topology'); }}>Topology</a> },
          ...(topology ? [{ title: topology.name }] : []),
          { title: <Typography.Text strong>Topology View</Typography.Text> },
        ]}
      />,
    );
    setActions(
      <Flex gap={8}>
        {topology && (
          <Button icon={<Pencil size={16} />} onClick={() => navigate(`/topology/${topologyId}/edit`)}>
            Edit
          </Button>
        )}
        <Button icon={<Download size={16} />}>Export</Button>
      </Flex>,
    );
  }, [setBreadcrumbs, setActions, navigate, topology, topologyId]);

  if (loadingTopology) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Info bar */}
      {topology && (
        <div
          style={{
            height: 40,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: '1px solid #303030',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <Typography.Text strong style={{ fontSize: 13 }}>{topology.name}</Typography.Text>
          <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{topology.description}</Typography.Text>
          <div style={{ flex: 1 }} />
          <Badge count={`${topology.classCount} classes`} style={{ backgroundColor: '#27273a', color: '#a1a1aa', fontSize: 11, boxShadow: 'none' }} />
          <Badge count={`${topology.instanceCount} instances`} style={{ backgroundColor: '#27273a', color: '#a1a1aa', fontSize: 11, boxShadow: 'none' }} />
        </div>
      )}

      {/* Main split panel */}
      <div ref={containerRef} style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Class Topology */}
        <div
          style={{
            width: `${leftWidthPercent}%`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: '1px solid #303030',
            }}
          >
            <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>Class Topology</Typography.Text>
            <Typography.Text style={{ fontSize: 11, color: '#71717a', marginLeft: 8 }}>
              — dashed = subClassOf, solid = Relation
            </Typography.Text>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {loadingClass ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Spin />
              </div>
            ) : (
              <ClassTopologyGraph
                nodes={classNodes}
                edges={classEdges}
                selectedClassIds={selectedClassIds}
                onToggleClass={handleToggleClass}
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: 6,
            cursor: 'col-resize',
            background: '#303030',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 4,
              height: 32,
              borderRadius: 2,
              background: '#71717a',
            }}
          />
        </div>

        {/* Right: Instance Topology Accordion */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: '1px solid #303030',
              flexShrink: 0,
            }}
          >
            <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>Instance Topology</Typography.Text>
            {subgraphs.length > 0 && (
              <Typography.Text style={{ fontSize: 11, color: '#71717a', marginLeft: 8 }}>
                — {subgraphs.length} graph{subgraphs.length > 1 ? 's' : ''}
              </Typography.Text>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {loadingInstance ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Spin />
              </div>
            ) : subgraphs.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0a0a0f' }}>
                <Typography.Text style={{ color: '#71717a', fontSize: 13 }}>
                  Click classes on the left to view instance topology
                </Typography.Text>
              </div>
            ) : (
              <Collapse
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(keys as string[])}
                ghost
                style={{ background: '#0a0a0f' }}
                items={subgraphs.map((sg) => ({
                  key: String(sg.index),
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>
                        Graph {sg.index}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>
                        {sg.label}
                      </Typography.Text>
                      <Badge
                        count={`${sg.nodeCount} nodes`}
                        style={{ backgroundColor: '#27273a', color: '#a1a1aa', fontSize: 11, boxShadow: 'none' }}
                        overflowCount={999}
                      />
                    </span>
                  ),
                  children: (
                    <div style={{ height: 360, border: '1px solid #27273a', borderRadius: 8, overflow: 'hidden' }}>
                      <InstanceTopologyGraph data={sg.data} />
                    </div>
                  ),
                  style: {
                    borderBottom: '1px solid #1a1a24',
                  },
                }))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
