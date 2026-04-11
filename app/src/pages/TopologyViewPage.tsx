import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Spin, Select, Badge, Button, Flex, message } from 'antd';
import { ChevronRight, Download, Pencil, Save, RotateCcw } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import SuccessModal from '../components/SuccessModal';
import {
  getTopology,
  getClassTopology,
  fetchMultiClassInstanceTopology,
  fetchGroupedInstanceTopology,
  saveTopologyPositions,
  resetTopologyPositions,
  type TopologyDTO,
  type InstanceTopologyDTO,
  type GroupedInstanceTopologyDTO,
} from '../services/coreService';
import ForceTopologyGraph, { type ForceGraphNode, type ForceGraphEdge } from '../components/ForceTopologyGraph';

const CLASS_COLORS = [
  'var(--primary-color)', '#22D3EE', '#F472B6', '#4ADE80',
  '#A78BFA', '#FB923C', '#38BDF8', '#FBBF24',
];

/** Map an instance subgraph DTO into ForceTopologyGraph props.
 *  classColorMap maps classId → color sourced from the Class Topology graph to ensure consistency. */
function mapInstanceSubgraph(
  sg: InstanceTopologyDTO,
  classColorMap: Map<number, string>,
): { nodes: ForceGraphNode[]; edges: ForceGraphEdge[] } {
  const nodes: ForceGraphNode[] = sg.nodes.map((n) => ({
    id: n.instanceId,
    name: n.instanceName,
    sublabel: n.className,
    color: classColorMap.get(n.classId) || n.classColor || '#a1a1aa',
  }));
  const edges: ForceGraphEdge[] = sg.edges.map((e) => ({
    source: e.sourceInstanceId,
    target: e.targetInstanceId,
    label: e.relationName,
  }));
  return { nodes, edges };
}

/** Map a grouped InstanceSubgraph into ForceTopologyGraph props */
function mapGroupedSubgraph(
  sg: GroupedInstanceTopologyDTO['unrelatedInstances'],
  classColorMap: Map<number, string>,
): { nodes: ForceGraphNode[]; edges: ForceGraphEdge[] } {
  const nodes: ForceGraphNode[] = sg.nodes.map((n) => ({
    id: n.instanceId,
    name: n.instanceName,
    sublabel: n.className,
    color: classColorMap.get(n.classId) || n.classColor || '#a1a1aa',
  }));
  const edges: ForceGraphEdge[] = sg.edges.map((e) => ({
    source: e.sourceInstanceId,
    target: e.targetInstanceId,
    label: e.relationName,
  }));
  return { nodes, edges };
}

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

  // Topology entity
  const [topology, setTopology] = useState<TopologyDTO | null>(null);
  const [loadingTopology, setLoadingTopology] = useState(true);

  // Class topology state
  const [classNodes, setClassNodes] = useState<ForceGraphNode[]>([]);
  const [classEdges, setClassEdges] = useState<ForceGraphEdge[]>([]);
  const [loadingClass, setLoadingClass] = useState(true);

  // Selection state — auto-populated from topology classIds (drives instance topology fetch)
  const [selectedClassIds, setSelectedClassIds] = useState<Set<number>>(new Set());
  // Visual highlight on the class graph — single focused node
  const [focusedClassId, setFocusedClassId] = useState<Set<number>>(new Set());

  // Instance topology state
  const [instanceData, setInstanceData] = useState<InstanceTopologyDTO | null>(null);
  const [groupedData, setGroupedData] = useState<GroupedInstanceTopologyDTO | null>(null);
  const [loadingInstance, setLoadingInstance] = useState(false);
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<Set<number>>(new Set());

  // Accordion active keys
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<string[]>([]);

  // Divider drag state
  const [leftWidthPercent, setLeftWidthPercent] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // classId → color, populated when class topology loads, used by both panels
  const classColorMapRef = useRef<Map<number, string>>(new Map());

  // T15: initialPositions for class topology (from saved positions in DB)
  const [initialPositions, setInitialPositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  // T16: Track all current node positions via drag end callback
  const nodePositionsRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  // Saving/resetting state
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [successModal, setSuccessModal] = useState<{ open: boolean; title?: string; description?: string }>({ open: false });

  // Debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  // Load class topology graph scoped to this topology's classes (wait for topology entity to load)
  useEffect(() => {
    if (!topology) return;
    const ontologyId = topology.ontologyId;
    if (!ontologyId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getClassTopology(undefined, ontologyId, topology.id);
        if (cancelled) return;
        if (res.data) {
          // Build color map: backend color first, fallback to generated color
          const colorMap = new Map<number, string>();
          let colorIdx = 0;
          for (const n of res.data.nodes) {
            colorMap.set(n.id, n.color || CLASS_COLORS[colorIdx++ % CLASS_COLORS.length]);
          }
          classColorMapRef.current = colorMap;

          // Build initial positions map from saved positionX/positionY
          const posMap = new Map<number, { x: number; y: number }>();
          for (const n of res.data.nodes) {
            if (n.positionX != null && n.positionY != null) {
              posMap.set(n.id, { x: n.positionX, y: n.positionY });
            }
          }
          setInitialPositions(posMap);
          // Seed nodePositionsRef with saved positions
          nodePositionsRef.current = new Map(posMap);

          const nodes: ForceGraphNode[] = res.data.nodes.map((n) => ({
            id: n.id,
            name: n.name,
            color: colorMap.get(n.id),
            icon: n.icon,
          }));
          const edges: ForceGraphEdge[] = [];
          // Add all relation edges (including subClassOf)
          for (const e of res.data.edges) {
            const isSubClassOf = e.type === 'SUB_CLASS_OF';
            edges.push({
              source: e.sourceClassId,
              target: e.targetClassId,
              label: isSubClassOf ? 'subClassOf' : e.name,
              style: isSubClassOf ? 'dashed' : 'solid',
              color: isSubClassOf ? '#22D3EE' : 'var(--primary-color)',
            });
          }
          setClassNodes(nodes);
          setClassEdges(edges);
        }
      } catch {
        // failed
      } finally {
        if (!cancelled) setLoadingClass(false);
      }
    })();

    return () => { cancelled = true; };
  }, [topology]);

  const handleToggleClass = useCallback(
    (classId: number) => {
      // Only toggle visual highlight — do NOT modify selectedClassIds to avoid re-fetching
      setFocusedClassId((prev) => {
        if (prev.has(classId)) return new Set();
        return new Set([classId]);
      });
    },
    [],
  );

  // T16: Track dragged node positions
  const handleClassDragEnd = useCallback((nodeId: number, x: number, y: number) => {
    nodePositionsRef.current.set(nodeId, { x, y });
  }, []);

  // T20: Click background to deselect
  const handleClassBackgroundClick = useCallback(() => {
    setFocusedClassId(new Set());
    setSelectedInstanceIds(new Set());
  }, []);

  // T17: Save all node positions
  const handleSavePositions = useCallback(async () => {
    if (!topology) return;
    setSaving(true);
    try {
      const positions = Array.from(nodePositionsRef.current.entries()).map(([classId, pos]) => ({
        classId,
        positionX: pos.x,
        positionY: pos.y,
      }));
      await saveTopologyPositions({ topologyId: topology.id, positions });
      setSuccessModal({ open: true, title: 'Positions Saved', description: 'Node positions have been saved successfully.' });
    } catch {
      message.error('Failed to save positions');
    } finally {
      setSaving(false);
    }
  }, [topology]);

  // T18: Reset layout (clear all saved positions)
  const handleResetLayout = useCallback(async () => {
    if (!topology) return;
    setResetting(true);
    try {
      await resetTopologyPositions(topology.id);
      setSuccessModal({ open: true, title: 'Layout Reset', description: 'Layout has been reset to default. Nodes will be repositioned automatically.' });
      // Clear local positions and reload topology
      nodePositionsRef.current.clear();
      setInitialPositions(new Map());
      // Re-fetch class topology to get fresh data
      setLoadingClass(true);
      const res = await getClassTopology(undefined, topology.ontologyId, topology.id);
      if (res.data) {
        const colorMap = new Map<number, string>();
        let colorIdx = 0;
        for (const n of res.data.nodes) {
          colorMap.set(n.id, n.color || CLASS_COLORS[colorIdx++ % CLASS_COLORS.length]);
        }
        classColorMapRef.current = colorMap;
        const nodes: ForceGraphNode[] = res.data.nodes.map((n) => ({
          id: n.id,
          name: n.name,
          color: colorMap.get(n.id),
          icon: n.icon,
        }));
        const edges: ForceGraphEdge[] = [];
        for (const e of res.data.edges) {
          const isSubClassOf = e.type === 'SUB_CLASS_OF';
          edges.push({
            source: e.sourceClassId,
            target: e.targetClassId,
            label: isSubClassOf ? 'subClassOf' : e.name,
            style: isSubClassOf ? 'dashed' : 'solid',
            color: isSubClassOf ? '#22D3EE' : 'var(--primary-color)',
          });
        }
        setClassNodes(nodes);
        setClassEdges(edges);
      }
      setLoadingClass(false);
    } catch {
      message.error('Failed to reset layout');
    } finally {
      setResetting(false);
    }
  }, [topology]);

  const handleInstanceNodeClick = useCallback((nodeId: number) => {
    setSelectedInstanceIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.clear();
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Fetch instance topology when selectedClassIds changes
  useEffect(() => {
    if (selectedClassIds.size === 0) {
      setInstanceData(null);
      setGroupedData(null);
      setSelectedGroupKeys([]);
      setSelectedInstanceIds(new Set());
      return;
    }

    // Wait for topology entity to be loaded before deciding the fetch mode
    if (!topology) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingInstance(true);
      try {
        if (topology?.centralClassId && topologyId) {
          // Central class grouping mode
          const res = await fetchGroupedInstanceTopology(Number(topologyId));
          if (res.data) {
            setGroupedData(res.data);
            setInstanceData(null);
            setSelectedInstanceIds(new Set());
            setSelectedGroupKeys(res.data.groups.length > 0 ? ['group-0'] : []);
          }
        } else {
          // Fallback: connected-component grouping
          const res = await fetchMultiClassInstanceTopology({
            classIds: Array.from(selectedClassIds),
          });
          if (res.data) {
            setInstanceData(res.data);
            setGroupedData(null);
            setSelectedInstanceIds(new Set());
            const groups = splitByConnectedComponents(res.data);
            setSelectedGroupKeys(groups.length > 0 ? [String(groups[0].index)] : []);
          }
        }
      } catch {
        setInstanceData(null);
        setGroupedData(null);
      } finally {
        setLoadingInstance(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedClassIds, topology, topologyId]);

  // Split instance data into connected-component subgraphs and pre-map ForceGraph props
  // classColorMapRef is populated when class topology loads, so instance colors match exactly
  const subgraphs = useMemo(() => {
    if (!instanceData) return [];
    return splitByConnectedComponents(instanceData).map((sg) => ({
      ...sg,
      mapped: mapInstanceSubgraph(sg.data, classColorMapRef.current),
    }));
  }, [instanceData]);

  // Map grouped data for central-class grouping mode
  const groupedSubgraphs = useMemo(() => {
    if (!groupedData) return null;
    const groups = groupedData.groups.map((g, idx) => ({
      key: `group-${idx}`,
      label: g.centralInstance.instanceName || `Instance ${g.centralInstance.instanceId}`,
      nodeCount: g.subgraph.nodes.length,
      mapped: mapGroupedSubgraph(g.subgraph, classColorMapRef.current),
    }));
    const unrelated = groupedData.unrelatedInstances.nodes.length > 0
      ? {
          key: 'unrelated',
          label: '未关联实例',
          nodeCount: groupedData.unrelatedInstances.nodes.length,
          mapped: mapGroupedSubgraph(groupedData.unrelatedInstances, classColorMapRef.current),
        }
      : null;
    return { groups, unrelated };
  }, [groupedData]);

  // Build select options and merged graph for the selected groups
  const groupSelectOptions = useMemo(() => {
    if (groupedSubgraphs) {
      const opts = groupedSubgraphs.groups.map((sg) => ({
        label: `${sg.label} (${sg.nodeCount} nodes)`,
        value: sg.key,
      }));
      if (groupedSubgraphs.unrelated) {
        opts.push({
          label: `${groupedSubgraphs.unrelated.label} (${groupedSubgraphs.unrelated.nodeCount} nodes)`,
          value: groupedSubgraphs.unrelated.key,
        });
      }
      return opts;
    }
    if (subgraphs.length > 0) {
      return subgraphs.map((sg) => ({
        label: `Graph ${sg.index}: ${sg.label} (${sg.nodeCount} nodes)`,
        value: String(sg.index),
      }));
    }
    return [];
  }, [groupedSubgraphs, subgraphs]);

  const mergedSelectedGraph = useMemo(() => {
    const selectedKeys = new Set(selectedGroupKeys);
    const allNodes: ForceGraphNode[] = [];
    const allEdges: ForceGraphEdge[] = [];
    const nodeIdSet = new Set<number>();

    if (groupedSubgraphs) {
      for (const sg of groupedSubgraphs.groups) {
        if (!selectedKeys.has(sg.key)) continue;
        for (const n of sg.mapped.nodes) {
          if (!nodeIdSet.has(n.id)) { nodeIdSet.add(n.id); allNodes.push(n); }
        }
        allEdges.push(...sg.mapped.edges);
      }
      if (groupedSubgraphs.unrelated && selectedKeys.has('unrelated')) {
        for (const n of groupedSubgraphs.unrelated.mapped.nodes) {
          if (!nodeIdSet.has(n.id)) { nodeIdSet.add(n.id); allNodes.push(n); }
        }
        allEdges.push(...groupedSubgraphs.unrelated.mapped.edges);
      }
    } else {
      for (const sg of subgraphs) {
        if (!selectedKeys.has(String(sg.index))) continue;
        for (const n of sg.mapped.nodes) {
          if (!nodeIdSet.has(n.id)) { nodeIdSet.add(n.id); allNodes.push(n); }
        }
        allEdges.push(...sg.mapped.edges);
      }
    }

    return { nodes: allNodes, edges: allEdges };
  }, [selectedGroupKeys, groupedSubgraphs, subgraphs]);

  // Compute three class-level states from the Class Topology:
  //   focused (highlighted), connected (normal), rest (dimmed)
  // Then map to instance IDs for the Instance Topology.
  const connectedClassIds = useMemo(() => {
    if (focusedClassId.size === 0) return new Set<number>();
    const ids = new Set<number>();
    for (const e of classEdges) {
      const src = e.source as number;
      const tgt = e.target as number;
      if (focusedClassId.has(src)) ids.add(tgt);
      if (focusedClassId.has(tgt)) ids.add(src);
    }
    // Remove the focused class itself — it belongs in selectedNodeIds, not connectedNodeIds
    for (const id of focusedClassId) ids.delete(id);
    return ids;
  }, [focusedClassId, classEdges]);

  // Instances of the focused class → highlighted (selectedNodeIds)
  const highlightedInstanceIds = useMemo(() => {
    if (focusedClassId.size === 0 || !instanceData) return selectedInstanceIds;
    const ids = new Set<number>();
    for (const n of instanceData.nodes) {
      if (focusedClassId.has(n.classId)) ids.add(n.instanceId);
    }
    for (const id of selectedInstanceIds) ids.add(id);
    // When a class is focused but has no matching instances, use sentinel (-1)
    // to signal "selection is active" so all instance nodes get dimmed
    if (ids.size === 0) ids.add(-1);
    return ids;
  }, [focusedClassId, instanceData, selectedInstanceIds]);

  // Instances of connected classes → normal display (connectedNodeIds)
  const connectedInstanceIds = useMemo<Set<number> | undefined>(() => {
    if (focusedClassId.size === 0 || !instanceData) return undefined;
    const ids = new Set<number>();
    for (const n of instanceData.nodes) {
      if (connectedClassIds.has(n.classId)) ids.add(n.instanceId);
    }
    return ids;
  }, [focusedClassId, connectedClassIds, instanceData]);

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
          <>
            <Button icon={<Save size={16} />} loading={saving} onClick={handleSavePositions}>
              Save Position
            </Button>
            <Button icon={<RotateCcw size={16} />} loading={resetting} onClick={handleResetLayout}>
              Reset Layout
            </Button>
            <Button icon={<Pencil size={16} />} onClick={() => navigate(`/topology/${topologyId}/edit`)}>
              Edit
            </Button>
          </>
        )}
        <Button icon={<Download size={16} />}>Export</Button>
      </Flex>,
    );
  }, [setBreadcrumbs, setActions, navigate, topology, topologyId, saving, resetting, handleSavePositions, handleResetLayout]);

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
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: '1px solid #303030',
              flexShrink: 0,
              gap: 8,
              minHeight: 40,
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
              <ForceTopologyGraph
                nodes={classNodes}
                edges={classEdges}
                selectedNodeIds={focusedClassId}
                initialPositions={initialPositions}
                onNodeClick={handleToggleClass}
                onDragEnd={handleClassDragEnd}
                onBackgroundClick={handleClassBackgroundClick}
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

        {/* Right: Instance Topology */}
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
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: '1px solid #303030',
              flexShrink: 0,
              gap: 8,
              minHeight: 40,
            }}
          >
            <Typography.Text style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Instance Topology</Typography.Text>
            {groupSelectOptions.length > 0 && (
              <Select
                mode="multiple"
                size="small"
                placeholder="Select groups..."
                value={selectedGroupKeys}
                onChange={setSelectedGroupKeys}
                options={groupSelectOptions}
                style={{ flex: 1, minWidth: 0 }}
                maxTagCount="responsive"
                allowClear
              />
            )}
          </div>

          <div style={{ flex: 1, overflow: 'hidden', background: '#0a0a0f' }}>
            {loadingInstance ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Spin />
              </div>
            ) : groupSelectOptions.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography.Text style={{ color: '#71717a', fontSize: 13 }}>
                  {groupedSubgraphs ? 'Central class has no instances' : 'Click classes on the left to view instance topology'}
                </Typography.Text>
              </div>
            ) : selectedGroupKeys.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography.Text style={{ color: '#71717a', fontSize: 13 }}>
                  Select groups from the dropdown to view instance topology
                </Typography.Text>
              </div>
            ) : (
              <ForceTopologyGraph
                nodes={mergedSelectedGraph.nodes}
                edges={mergedSelectedGraph.edges}
                selectedNodeIds={highlightedInstanceIds}
                connectedNodeIds={connectedInstanceIds}
                onNodeClick={handleInstanceNodeClick}
              />
            )}
          </div>
        </div>
      </div>

      <SuccessModal
        open={successModal.open}
        title={successModal.title}
        description={successModal.description}
        onClose={() => setSuccessModal({ open: false })}
      />
    </div>
  );
}
