import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, Button, Card,
} from '@mui/material';
import {
  ChevronRight, Minus, Plus, Maximize2, Download, Info,
  User, Building2, MapPin, Folder, Briefcase, GraduationCap, FileText, Box as BoxIcon,
} from 'lucide-react';

interface RelationNode {
  id: string;
  name: string;
  type: string;
  relation: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

interface InstanceDetail {
  id: string;
  name: string;
  className: string;
  classIcon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  properties: { label: string; value: string }[];
  relations: RelationNode[];
}

const instancesMap: Record<string, InstanceDetail> = {
  '1': {
    id: '1',
    name: 'John Smith',
    className: 'Person',
    classIcon: User,
    color: '#8B5CF6',
    properties: [
      { label: 'email', value: 'john@acme.com' },
      { label: 'birthDate', value: '1985-03-15' },
      { label: 'phone', value: '+1 555-0123' },
    ],
    relations: [
      { id: 'r1', name: 'Acme Corp', type: 'Organization', relation: 'worksFor', icon: Building2, color: '#22D3EE' },
      { id: 'r2', name: 'New York', type: 'Location', relation: 'livesIn', icon: MapPin, color: '#F472B6' },
      { id: 'r3', name: 'Project X', type: 'Project', relation: 'worksOn', icon: Folder, color: '#4ADE80' },
      { id: 'r4', name: 'Engineer', type: 'Role', relation: 'hasRole', icon: Briefcase, color: '#A78BFA' },
      { id: 'r5', name: 'MIT', type: 'University', relation: 'graduatedFrom', icon: GraduationCap, color: '#FB923C' },
      { id: 'r6', name: 'Contract #42', type: 'Document', relation: 'signed', icon: FileText, color: '#38BDF8' },
    ],
  },
  '2': {
    id: '2',
    name: 'Acme Corp',
    className: 'Organization',
    classIcon: Building2,
    color: '#22D3EE',
    properties: [
      { label: 'industry', value: 'Technology' },
      { label: 'founded', value: '1998-06-15' },
      { label: 'employees', value: '5,200' },
    ],
    relations: [
      { id: 'r1', name: 'John Smith', type: 'Person', relation: 'employs', icon: User, color: '#8B5CF6' },
      { id: 'r2', name: 'Jane Doe', type: 'Person', relation: 'employs', icon: User, color: '#4ADE80' },
      { id: 'r3', name: 'New York', type: 'Location', relation: 'locatedIn', icon: MapPin, color: '#F472B6' },
    ],
  },
};

const getInstanceDetail = (id: string): InstanceDetail => {
  if (instancesMap[id]) return instancesMap[id];
  return instancesMap['1'];
};

const defaultNodePositions = [
  { x: -120, y: -140 },
  { x: 120, y: -140 },
  { x: -180, y: 0 },
  { x: 180, y: 0 },
  { x: -120, y: 140 },
  { x: 120, y: 140 },
];

const OUTER_SIZE = 90;
const CENTER_SIZE = 120;

function TopologyNode({
  x, y, name, type, icon: Icon, color,
  onDragStart,
}: {
  x: number; y: number; name: string; type: string;
  icon: React.ComponentType<{ size?: number; color?: string }>; color: string;
  onDragStart: (e: React.PointerEvent) => void;
}) {
  const r = OUTER_SIZE / 2;
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={onDragStart}
      style={{ cursor: 'grab' }}
    >
      <circle cx={0} cy={0} r={r} fill="#1e1e2a" stroke={color} strokeWidth={2.5} />
      <foreignObject x={-r} y={-r} width={OUTER_SIZE} height={OUTER_SIZE} style={{ pointerEvents: 'none' }}>
        <Box sx={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2px', userSelect: 'none',
        }}>
          <Icon size={22} color={color} />
          <Typography sx={{ color: '#f4f4f5', fontSize: 10, fontWeight: 500, textAlign: 'center', lineHeight: 1.2, px: 0.25 }}>
            {name}
          </Typography>
          <Typography sx={{ color: '#a1a1aa', fontSize: 8, textAlign: 'center' }}>
            {type}
          </Typography>
        </Box>
      </foreignObject>
    </g>
  );
}

function EdgeLabel({
  x1, y1, x2, y2, label, color, r1, r2,
}: {
  x1: number; y1: number; x2: number; y2: number; label: string; color: string;
  r1: number; r2: number;
}) {
  // Calculate midpoint of the visible line segment (between circle edges)
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const t1 = r1 / dist;
  const t2 = 1 - r2 / dist;
  const tMid = (t1 + t2) / 2;
  const mx = x1 + dx * tMid;
  const my = y1 + dy * tMid;
  // Visible segment length between circle edges, with gap on each side
  const GAP = 12;
  const visibleLen = dist * (t2 - t1);
  const labelW = Math.max(visibleLen * 0.5, 20);
  // Angle in degrees, keep text readable (flip if upside down)
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  return (
    <g transform={`translate(${mx}, ${my}) rotate(${angle})`}>
      <foreignObject x={-labelW / 2} y={-8} width={labelW} height={16} style={{ pointerEvents: 'none', overflow: 'visible' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', userSelect: 'none', width: '100%' }}>
          <Typography sx={{
            color, fontSize: 7, border: `1px dashed ${color}`, borderRadius: '2px',
            px: '4px', py: '1px', whiteSpace: 'nowrap', bgcolor: '#0a0a0f', lineHeight: 1.3,
          }}>
            {label}
          </Typography>
        </Box>
      </foreignObject>
    </g>
  );
}

function CenterNode({
  x, y, name, type, icon: Icon, color, onDragStart,
}: {
  x: number; y: number; name: string; type: string;
  icon: React.ComponentType<{ size?: number; color?: string }>; color: string;
  onDragStart: (e: React.PointerEvent) => void;
}) {
  const r = CENTER_SIZE / 2;
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={onDragStart}
      style={{ cursor: 'grab' }}
    >
      <circle cx={0} cy={0} r={r} fill={color} />
      <foreignObject x={-r} y={-r} width={CENTER_SIZE} height={CENTER_SIZE} style={{ pointerEvents: 'none' }}>
        <Box sx={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '6px', userSelect: 'none',
        }}>
          <Icon size={36} color="#fff" />
          <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            {name}
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: 11, opacity: 0.8, textAlign: 'center' }}>
            {type}
          </Typography>
        </Box>
      </foreignObject>
    </g>
  );
}

export default function InstanceTopologyPage() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const instance = getInstanceDetail(instanceId || '1');
  const [zoom, setZoom] = useState(100);

  // Draggable node positions: index 0 = center, 1..N = relation nodes
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(() => [
    { x: 0, y: 0 },
    ...defaultNodePositions.slice(0, instance.relations.length),
  ]);

  // Reset positions when instance changes
  useEffect(() => {
    setPositions([
      { x: 0, y: 0 },
      ...defaultNodePositions.slice(0, instance.relations.length),
    ]);
  }, [instance]);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ index: number; startMouse: { x: number; y: number }; startPos: { x: number; y: number } } | null>(null);

  const screenToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  const handleDragStart = useCallback((index: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const svgPos = screenToSvg(e.clientX, e.clientY);
    dragRef.current = {
      index,
      startMouse: svgPos,
      startPos: { ...positions[index] },
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [positions, screenToSvg]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const svgPos = screenToSvg(e.clientX, e.clientY);
    const { index, startMouse, startPos } = dragRef.current;
    const dx = svgPos.x - startMouse.x;
    const dy = svgPos.y - startMouse.y;
    setPositions((prev) => {
      const next = [...prev];
      next[index] = { x: startPos.x + dx, y: startPos.y + dy };
      return next;
    });
  }, [screenToSvg]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  const centerPos = positions[0];

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#" onClick={(e) => { e.preventDefault(); navigate('/instances'); }}>
            Instances
          </Link>
          <Typography color="text.primary" fontWeight={500}>{instance.name}</Typography>
          <Typography color="text.primary" fontWeight={500}>Topology</Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5} alignItems="center">
          <Box display="flex" gap={0.5} alignItems="center">
            <Box
              onClick={handleZoomOut}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                p: 1, borderRadius: 1.5, border: 1, borderColor: 'divider', cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Minus size={16} />
            </Box>
            <Box sx={{
              display: 'flex', alignItems: 'center', px: 1.5, py: 1,
              borderRadius: 1.5, bgcolor: 'action.hover',
            }}>
              <Typography variant="body2" fontSize={12}>{zoom}%</Typography>
            </Box>
            <Box
              onClick={handleZoomIn}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                p: 1, borderRadius: 1.5, border: 1, borderColor: 'divider', cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Plus size={16} />
            </Box>
          </Box>
          <Box
            onClick={() => setZoom(100)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 1, borderRadius: 1.5, border: 1, borderColor: 'divider',
              cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Maximize2 size={16} />
            <Typography variant="body2" fontSize={13}>Fit</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Download size={16} />}
            sx={{ boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" gap={3} overflow="hidden">
        {/* Topology Canvas */}
        <Card
          variant="outlined"
          sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 3, overflow: 'hidden', position: 'relative',
          }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="-300 -240 600 480"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Connection Lines + Edge Labels */}
            {instance.relations.slice(0, 6).map((rel, i) => {
              const nodePos = positions[i + 1];
              if (!nodePos) return null;
              return (
                <g key={`edge-${rel.id}`}>
                  <line
                    x1={centerPos.x} y1={centerPos.y}
                    x2={nodePos.x} y2={nodePos.y}
                    stroke={rel.color}
                    strokeWidth={2}
                    strokeOpacity={0.3}
                  />
                  <EdgeLabel
                    x1={centerPos.x} y1={centerPos.y}
                    x2={nodePos.x} y2={nodePos.y}
                    r1={CENTER_SIZE / 2} r2={OUTER_SIZE / 2}
                    label={rel.relation}
                    color={rel.color}
                  />
                </g>
              );
            })}

            {/* Surrounding Nodes */}
            {instance.relations.slice(0, 6).map((rel, i) => {
              const nodePos = positions[i + 1];
              if (!nodePos) return null;
              return (
                <TopologyNode
                  key={rel.id}
                  x={nodePos.x}
                  y={nodePos.y}
                  name={rel.name}
                  type={rel.type}
                  icon={rel.icon}
                  color={rel.color}
                  onDragStart={(e) => handleDragStart(i + 1, e)}
                />
              );
            })}

            {/* Center Node */}
            <CenterNode
              x={centerPos.x}
              y={centerPos.y}
              name={instance.name}
              type={instance.className}
              icon={instance.classIcon}
              color={instance.color}
              onDragStart={(e) => handleDragStart(0, e)}
            />
          </svg>
        </Card>

        {/* Detail Panel */}
        <Card variant="outlined" sx={{ width: 300, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'auto' }}>
          <Box px={2.5} py={2.5} borderBottom={1} borderColor="divider">
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Info size={18} color="#8b5cf6" />
              <Typography fontWeight={600}>Instance Details</Typography>
            </Box>
            <Typography fontSize={20} fontWeight={600} mb={1}>
              {instance.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.75}>
              <BoxIcon size={14} color="#8b5cf6" />
              <Typography variant="body2" color="text.secondary">
                {instance.className}
              </Typography>
            </Box>
          </Box>

          <Box px={2.5} py={2.5} flex={1} display="flex" flexDirection="column" gap={2.5}>
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1.5}>
                Properties
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {instance.properties.map((prop) => (
                  <Box key={prop.label} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                      {prop.label}
                    </Typography>
                    <Typography variant="body2" fontSize={13}>
                      {prop.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box pt={2.5} borderTop={1} borderColor="divider">
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1.5}>
                Relations ({instance.relations.length})
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {instance.relations.map((rel) => (
                  <Box
                    key={rel.id}
                    display="flex"
                    alignItems="center"
                    gap={1.25}
                    p={1.25}
                    bgcolor="action.hover"
                    borderRadius={2}
                  >
                    <rel.icon size={16} color={rel.color} />
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={500} fontSize={13}>
                        {rel.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize={11}>
                        {rel.relation} → {rel.type}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </>
  );
}
