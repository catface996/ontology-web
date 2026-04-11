import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Checkbox, Tag, Typography, Flex, App, Spin, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search, Plus, Boxes, List, Pencil, Brain, Trash2, Share2,
  ArrowLeftRight, Save,
} from 'lucide-react';
import TableCard from '../components/TableCard';
import ForceTopologyGraph, { type ForceGraphNode, type ForceGraphEdge, type ViewportState } from '../components/ForceTopologyGraph';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  listClasses, deleteClass, getClassTopology, saveClassPositions,
  listClassProperties,
  type ClassDTO, type ClassPropertyDTO,
  type ClassTopologyNode, type ClassTopologyEdge,
} from '../services/coreService';
import { resolveClassIcon, DEFAULT_CLASS_COLOR } from '../utils/classIconMap';

interface ClassData {
  id: string;
  name: string;
  description: string;
  instanceCount: number;
  status: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

function dtoToClassData(dto: ClassDTO): ClassData {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? '',
    instanceCount: dto.instanceCount ?? 0,
    status: dto.status ?? 'ACTIVE',
    icon: resolveClassIcon(dto.icon),
    color: dto.color || DEFAULT_CLASS_COLOR,
  };
}

export default function ClassesPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const [view, setView] = useState('topology');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const confirmModal = useModal();

  // Store all classes from API; pagination is client-side
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);

  // Topology view data
  const [topoNodes, setTopoNodes] = useState<ForceGraphNode[]>([]);
  const [topoEdges, setTopoEdges] = useState<ForceGraphEdge[]>([]);
  const [topoLoading, setTopoLoading] = useState(false);
  const [selectedTopoClassIds, setSelectedTopoClassIds] = useState<Set<number>>(new Set());

  // Topology detail panel
  const [topoRawNodes, setTopoRawNodes] = useState<ClassTopologyNode[]>([]);
  const [topoRawEdges, setTopoRawEdges] = useState<ClassTopologyEdge[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [detailProperties, setDetailProperties] = useState<ClassPropertyDTO[]>([]);
  const [detailRelations, setDetailRelations] = useState<ClassTopologyEdge[]>([]);

  // Position tracking for save
  const [initialPositions, setInitialPositions] = useState<Map<number, { x: number; y: number }>>(new Map());
  const savedPositionsRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const positionChangesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const [savingPositions, setSavingPositions] = useState(false);

  // Viewport (pan + zoom) tracking
  const [initialViewport, setInitialViewport] = useState<ViewportState | undefined>(undefined);
  const viewportRef = useRef<ViewportState | undefined>(undefined);

  const loadClasses = useCallback(async (keyword: string) => {
    if (!currentOntologyId) {
      setAllClasses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listClasses({
        ontologyId: currentOntologyId,
        name: keyword || undefined,
      });
      const list = res.data ?? [];
      setAllClasses(list.map(dtoToClassData));
    } catch {
      // Error handled below in the effect; keep existing data
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  // Load on mount / ontology change
  useEffect(() => {
    void loadClasses(search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadClasses]);

  // Debounced search — skip initial mount (effect 1 already loads data)
  const searchMounted = useRef(false);
  useEffect(() => {
    if (!searchMounted.current) {
      searchMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setPage(0);
      void loadClasses(search);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Load topology data when switching to topology view
  useEffect(() => {
    if (view !== 'topology' || !currentOntologyId) return;
    let cancelled = false;
    setTopoLoading(true);

    (async () => {
      try {
        // Fetch full ontology topology (no classId = all classes)
        const res = await getClassTopology(undefined, currentOntologyId);
        if (cancelled) return;
        if (res.data) {
          const nodes: ForceGraphNode[] = res.data.nodes.map((n) => ({
            id: n.id,
            name: n.name,
            color: n.color,
            icon: n.icon,
          }));
          const edges: ForceGraphEdge[] = [];
          // All edges (including subClassOf) come from the edges array
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
          setTopoNodes(nodes);
          setTopoEdges(edges);
          setTopoRawNodes(res.data.nodes);
          setTopoRawEdges(res.data.edges);
          setSelectedClassId(null);
          // Build initial positions from saved data
          const posMap = new Map<number, { x: number; y: number }>();
          for (const n of res.data.nodes) {
            if (n.positionX != null && n.positionY != null) {
              posMap.set(n.id, { x: n.positionX, y: n.positionY });
            }
          }
          setInitialPositions(posMap);
          savedPositionsRef.current = new Map(posMap);
          positionChangesRef.current = new Map();
          // Restore viewport state
          if (res.data.viewportX != null && res.data.viewportY != null && res.data.viewportScale != null) {
            const vp = { x: res.data.viewportX, y: res.data.viewportY, scale: res.data.viewportScale };
            setInitialViewport(vp);
            viewportRef.current = vp;
          } else {
            setInitialViewport(undefined);
            viewportRef.current = undefined;
          }
        }
      } catch {
        // failed
      } finally {
        if (!cancelled) setTopoLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [view, currentOntologyId]);

  // Load detail data when a class is selected in topology view
  const handleTopoClassClick = useCallback((classId: number) => {
    setSelectedClassId(classId);
    setSelectedTopoClassIds(new Set([classId]));
    // Derive relations from topology edges (edges connected to this class)
    const classEdges = topoRawEdges.filter(
      (e) => e.sourceClassId === classId || e.targetClassId === classId,
    );
    setDetailRelations(classEdges);
    // Fetch properties
    listClassProperties(classId).then((res) => {
      if (res.data) {
        setDetailProperties(res.data);
      } else {
        setDetailProperties([]);
      }
    }).catch(() => {
      setDetailProperties([]);
    });
  }, [topoRawEdges]);

  // Track node position changes on drag
  const handleDragEnd = useCallback((nodeId: number, x: number, y: number) => {
    positionChangesRef.current.set(nodeId, { x, y });
  }, []);

  // Track viewport (pan/zoom) changes
  const handleViewportChange = useCallback((viewport: ViewportState) => {
    viewportRef.current = viewport;
  }, []);

  // Save all current node positions
  const handleSavePositions = useCallback(async () => {
    if (!currentOntologyId) return;
    setSavingPositions(true);
    try {
      // Merge saved baseline with drag changes (use ref to avoid re-render)
      const allPositions = new Map(savedPositionsRef.current);
      for (const [id, pos] of positionChangesRef.current) {
        allPositions.set(id, pos);
      }
      const positions = Array.from(allPositions.entries()).map(([classId, pos]) => ({
        classId,
        positionX: pos.x,
        positionY: pos.y,
      }));
      const viewport = viewportRef.current
        ? { viewportX: viewportRef.current.x, viewportY: viewportRef.current.y, viewportScale: viewportRef.current.scale }
        : undefined;
      await saveClassPositions(currentOntologyId, positions, viewport);
      message.success('Positions saved');
      // Update baseline ref (no state change = no re-render)
      savedPositionsRef.current = allPositions;
      positionChangesRef.current = new Map();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save positions');
    } finally {
      setSavingPositions(false);
    }
  }, [currentOntologyId, message]);

  // Get selected class info from raw topology nodes
  const selectedClassInfo = selectedClassId
    ? topoRawNodes.find((n) => n.id === selectedClassId)
    : null;

  // Client-side pagination
  const classesData = allClasses.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const total = allClasses.length;

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Ontologies</a> },
          { title: <Typography.Text strong>Classes</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8} align="center">
        <Input
          placeholder="Search classes..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {view === 'topology' && (
          <Button
            icon={<Save size={14} />}
            loading={savingPositions}
            onClick={handleSavePositions}
          >
            Save Position
          </Button>
        )}
        <div className="header-view-toggle">
          {[
            { key: 'list', Icon: List },
            { key: 'topology', Icon: Share2 },
          ].map(({ key, Icon }) => (
            <div
              key={key}
              className={view === key ? 'active' : ''}
              onClick={() => setView(key)}
            >
              <Icon size={16} color={view === key ? undefined : 'gray'} />
            </div>
          ))}
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/classes/new/edit')}
        >
          New Class
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate, search, view, savingPositions, handleSavePositions]);

  const handleDelete = (record: ClassData) => {
    confirmModal.confirm.delete({
      title: `Delete "${record.name}"?`,
      description: 'This action cannot be undone. The class and all its related data will be permanently deleted.',
      confirmName: record.name,
      confirmLabel: 'the class name',
      onConfirm: async () => {
        try {
          await deleteClass(Number(record.id));
          message.success('Class deleted');
          void loadClasses(search);
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete class');
        }
      },
    });
  };

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? classesData.map((c) => c.id) : []);
  };

  const columns: ColumnsType<ClassData> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < classesData.length}
          checked={selected.length === classesData.length}
          onChange={handleSelectAll}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_: unknown, record: ClassData) => (
        <Checkbox
          checked={selected.includes(record.id)}
          onChange={() =>
            setSelected((p) =>
              p.includes(record.id) ? p.filter((i) => i !== record.id) : [...p, record.id]
            )
          }
        />
      ),
    },
    {
      title: (
        <Flex align="center" gap={6}>
          <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>
            Name
          </Typography.Text>
          <ArrowLeftRight size={14} color="gray" />
        </Flex>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: ClassData) => (
        <Flex align="center" gap={10} style={{ whiteSpace: 'nowrap' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${record.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <record.icon size={16} color={record.color} />
          </div>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {record.name}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Description</Typography.Text>,
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Instances</Typography.Text>,
      dataIndex: 'instanceCount',
      key: 'instanceCount',
      width: 100,
      align: 'center',
      render: (val: number) => <Tag>{val}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Status</Typography.Text>,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (val: string) => (
        <Tag color={val === 'ACTIVE' ? 'green' : 'orange'}>{val}</Tag>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_: unknown, record: ClassData) => (
        <Flex justify="center" gap={4}>
          <Tooltip title="View Topology">
            <Button
              type="text"
              size="small"
              icon={<Share2 size={16} />}
              onClick={() => navigate(`/classes/${record.id}/topology`)}
            />
          </Tooltip>
          <Tooltip title="Logic Rules">
            <Button
              type="text"
              size="small"
              icon={<Brain size={16} />}
              onClick={() => navigate(`/classes/${record.id}/logic`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<Pencil size={16} />}
              onClick={() => navigate(`/classes/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" size="small" danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  if (!currentOntologyId) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
        <Boxes size={48} color="#a1a1aa" />
        <Typography.Text style={{ fontSize: 16, color: '#a1a1aa' }}>No ontology selected</Typography.Text>
        <Button type="primary" onClick={() => navigate('/ontologies')}>Select an Ontology</Button>
      </div>
    );
  }

  if (view === 'topology') {
    return (
      <div style={{ flex: 1, display: 'flex', gap: 16, padding: '16px 24px 24px', overflow: 'hidden' }}>
        {/* Topology Canvas */}
        <div style={{ flex: 1, borderRadius: 12, border: '1px solid #27273a', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          {topoLoading ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f' }}>
              <Spin size="large" />
            </div>
          ) : topoNodes.length === 0 ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0f' }}>
              <Typography.Text style={{ color: '#a1a1aa' }}>No topology data available</Typography.Text>
            </div>
          ) : (
            <ForceTopologyGraph
              nodes={topoNodes}
              edges={topoEdges}
              selectedNodeIds={selectedTopoClassIds}
              initialPositions={initialPositions}
              initialViewport={initialViewport}
              onNodeClick={(classId) => handleTopoClassClick(classId)}
              onDragEnd={handleDragEnd}
              onViewportChange={handleViewportChange}
              onBackgroundClick={() => {
                setSelectedClassId(null);
                setSelectedTopoClassIds(new Set());
                setDetailProperties([]);
                setDetailRelations([]);
              }}
            />
          )}
        </div>

        {/* Detail Panel — always rendered to keep layout stable */}
        <div style={{
          width: 300, borderRadius: 12, border: '1px solid #27273a',
          display: 'flex', flexDirection: 'column', overflow: 'auto', flexShrink: 0,
        }}>
          {selectedClassInfo ? (
            <>
              {/* Header */}
              <div style={{ padding: 20, borderBottom: '1px solid #27273a' }}>
                <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
                  <Boxes size={18} color={selectedClassInfo.color || 'var(--primary-color)'} />
                  <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Class Details</Typography.Text>
                </Flex>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Typography.Text style={{ fontSize: 20, fontWeight: 600 }}>{selectedClassInfo.name}</Typography.Text>
                  {selectedClassInfo.description && (
                    <Typography.Text style={{ color: '#71717a', fontSize: 13 }}>{selectedClassInfo.description}</Typography.Text>
                  )}
                </div>
              </div>

              {/* Properties */}
              <div style={{ padding: 20, borderBottom: '1px solid #27273a' }}>
                <Typography.Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600 }}>
                  Properties ({detailProperties.length})
                </Typography.Text>
                {detailProperties.length === 0 ? (
                  <Typography.Text style={{ color: '#71717a', fontSize: 13, display: 'block', marginTop: 8 }}>No properties</Typography.Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {detailProperties.map((p) => (
                      <Flex key={p.propertyId} justify="space-between" align="center">
                        <Typography.Text style={{ color: '#a1a1aa', fontSize: 13 }}>{p.propertyName}</Typography.Text>
                        <Tag style={{ fontSize: 11, margin: 0 }}>{p.dataType}</Tag>
                      </Flex>
                    ))}
                  </div>
                )}
              </div>

              {/* Relations */}
              <div style={{ padding: 20 }}>
                <Typography.Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600 }}>
                  Relations ({detailRelations.length})
                </Typography.Text>
                {detailRelations.length === 0 ? (
                  <Typography.Text style={{ color: '#71717a', fontSize: 13, display: 'block', marginTop: 8 }}>No relations</Typography.Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {detailRelations.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 2,
                          padding: 10, backgroundColor: '#1a1a24', borderRadius: 8,
                        }}
                      >
                        <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</Typography.Text>
                        <Typography.Text style={{ color: '#a1a1aa', fontSize: 11 }}>
                          {r.sourceClassName} → {r.targetClassName}
                        </Typography.Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography.Text style={{ color: '#52525b', fontSize: 13 }}>
                Click a class to see details
              </Typography.Text>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="list-page">
      <TableCard<ClassData>
        columns={columns}
        dataSource={classesData}
        rowKey="id"
        loading={loading}
        rowClassName={(record, index) =>
          selected.includes(record.id) ? 'ant-table-row-selected' : index % 2 === 1 ? 'ant-table-row-striped' : ''
        }
        pagination={{
          count: total,
          page,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: setRowsPerPage,
          label: 'classes',
        }}
      />
    </div>
  );
}
