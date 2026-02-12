import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button } from 'antd';
import {
  User, Building2, MapPin, Folder, Briefcase, GraduationCap, FileText,
  Box as BoxIcon, Download, Info, Minus, Plus, Maximize2,
} from 'lucide-react';
import * as d3 from 'd3';
import { useHeader } from '../contexts/HeaderContext';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const instancesMap: Record<string, InstanceDetail> = {
  '1': {
    id: '1',
    name: 'John Smith',
    className: 'Person',
    classIcon: User,
    color: 'var(--primary-color)',
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
      { id: 'r1', name: 'John Smith', type: 'Person', relation: 'employs', icon: User, color: 'var(--primary-color)' },
      { id: 'r2', name: 'Jane Doe', type: 'Person', relation: 'employs', icon: User, color: '#4ADE80' },
      { id: 'r3', name: 'New York', type: 'Location', relation: 'locatedIn', icon: MapPin, color: '#F472B6' },
    ],
  },
};

const getInstanceDetail = (id: string): InstanceDetail => {
  if (instancesMap[id]) return instancesMap[id];
  return instancesMap['1'];
};

/* ------------------------------------------------------------------ */
/*  Lucide icon SVG paths (for D3 foreignObject rendering)             */
/* ------------------------------------------------------------------ */

const iconSvgPaths: Record<string, string> = {
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
};

const iconComponentToName = new Map<React.ComponentType<unknown>, string>([
  [User, 'user'],
  [Building2, 'building-2'],
  [MapPin, 'map-pin'],
  [Folder, 'folder'],
  [Briefcase, 'briefcase'],
  [GraduationCap, 'graduation-cap'],
  [FileText, 'file-text'],
]);

function makeSvgIcon(name: string, size: number, color: string): string {
  const paths = iconSvgPaths[name] || '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

/* ------------------------------------------------------------------ */
/*  D3 topology data types                                             */
/* ------------------------------------------------------------------ */

const OUTER_R = 60;
const CENTER_R = 80;

const defaultNodePositions = [
  { x: -160, y: -155 },  // top-left
  { x: 160, y: -155 },   // top-right
  { x: -195, y: 0 },     // center-left
  { x: 195, y: 0 },      // center-right
  { x: -160, y: 155 },   // bottom-left
  { x: 160, y: 155 },    // bottom-right
];

interface D3NodeData {
  index: number;
  name: string;
  typeName: string;
  relation: string;
  color: string;
  iconName: string;
  isCenter: boolean;
  x: number;
  y: number;
}

interface D3LinkData {
  sourceIndex: number;
  targetIndex: number;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function InstanceTopologyPage() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const instance = getInstanceDetail(instanceId || '1');
  const [zoom, setZoom] = useState(100);

  const svgRef = useRef<SVGSVGElement>(null);
  const nodesDataRef = useRef<D3NodeData[]>([]);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  /* ---------- D3 render ---------- */
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow').attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Build node data
    const centerIconName = iconComponentToName.get(instance.classIcon as React.ComponentType<unknown>) || 'user';
    const nodesData: D3NodeData[] = [
      {
        index: 0, name: instance.name, typeName: instance.className,
        relation: '', color: 'var(--primary-color)', iconName: centerIconName,
        isCenter: true, x: 0, y: 0,
      },
      ...instance.relations.slice(0, 6).map((rel, i) => ({
        index: i + 1, name: rel.name, typeName: rel.type,
        relation: rel.relation, color: rel.color,
        iconName: iconComponentToName.get(rel.icon as React.ComponentType<unknown>) || 'user',
        isCenter: false,
        x: defaultNodePositions[i]?.x || 0,
        y: defaultNodePositions[i]?.y || 0,
      })),
    ];
    nodesDataRef.current = nodesData;

    // Links: each outer → center
    const linksData: D3LinkData[] = nodesData.slice(1).map((n) => ({
      sourceIndex: 0,
      targetIndex: n.index,
      color: n.color,
    }));

    const g = svg.append('g');

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
        setZoom(Math.round(e.transform.k * 100));
      });
    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // Center initial view
    const rect = svgRef.current.getBoundingClientRect();
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(rect.width / 2, rect.height / 2));

    // Helper
    const getNode = (idx: number) => nodesDataRef.current.find((n) => n.index === idx)!;

    const updateLinks = () => {
      links
        .attr('x1', (d) => getNode(d.sourceIndex).x)
        .attr('y1', (d) => getNode(d.sourceIndex).y)
        .attr('x2', (d) => getNode(d.targetIndex).x)
        .attr('y2', (d) => getNode(d.targetIndex).y);
    };

    // Draw links
    const links = g.selectAll<SVGLineElement, D3LinkData>('.link')
      .data(linksData).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.3);

    // Draw nodes
    const nodeGroups = g.selectAll<SVGGElement, D3NodeData>('.node')
      .data(nodesData).enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'grab')
      .call(d3.drag<SVGGElement, D3NodeData>()
        .on('start', function () { d3.select(this).style('cursor', 'grabbing'); })
        .on('drag', function (e, d) {
          d.x = e.x; d.y = e.y;
          d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`);
          updateLinks();
        })
        .on('end', function () { d3.select(this).style('cursor', 'grab'); })
      );

    // Node circle backgrounds
    nodeGroups.append('circle')
      .attr('r', (d) => d.isCenter ? CENTER_R : OUTER_R)
      .attr('fill', (d) => d.isCenter ? 'var(--primary-color)' : '#1a1a24')
      .attr('stroke', (d) => d.isCenter ? 'none' : d.color)
      .attr('stroke-width', (d) => d.isCenter ? 0 : 3);

    // Node content via foreignObject
    nodeGroups.append('foreignObject')
      .attr('x', (d) => d.isCenter ? -CENTER_R : -OUTER_R)
      .attr('y', (d) => d.isCenter ? -CENTER_R : -OUTER_R)
      .attr('width', (d) => d.isCenter ? CENTER_R * 2 : OUTER_R * 2)
      .attr('height', (d) => d.isCenter ? CENTER_R * 2 : OUTER_R * 2)
      .style('pointer-events', 'none')
      .append('xhtml:div')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .style('user-select', 'none')
      .html((d) => {
        if (d.isCenter) {
          return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
              ${makeSvgIcon(d.iconName, 44, '#fff')}
              <span style="color:#fff;font-size:16px;font-weight:600;text-align:center;line-height:1.2;">${d.name}</span>
              <span style="color:#fff;font-size:12px;opacity:0.8;text-align:center;">${d.typeName}</span>
            </div>`;
        }
        return `
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            ${makeSvgIcon(d.iconName, 28, d.color)}
            <span style="color:#f4f4f5;font-size:11px;font-weight:500;text-align:center;line-height:1.2;">${d.name}</span>
            <span style="color:#a1a1aa;font-size:9px;text-align:center;">${d.typeName}</span>
            <div style="padding:4px 8px;border-radius:4px;border:1px solid ${d.color};">
              <span style="color:${d.color};font-size:10px;">${d.relation}</span>
            </div>
          </div>`;
      });

    updateLinks();
  }, [instance]);

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
  const { setBreadcrumbs, setActions } = useHeader();

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: <a onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate('/instances'); }}>Instances</a> },
        { title: instance.name },
        { title: 'Topology' },
      ]} />
    );
    setActions(
      <>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div
            onClick={handleZoomOut}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 8, borderRadius: 6, border: '1px solid #27273a', cursor: 'pointer',
            }}
          >
            <Minus size={16} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '8px 12px',
            borderRadius: 6, backgroundColor: '#1a1a24',
          }}>
            <Typography.Text style={{ fontSize: 12 }}>{zoom}%</Typography.Text>
          </div>
          <div
            onClick={handleZoomIn}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 8, borderRadius: 6, border: '1px solid #27273a', cursor: 'pointer',
            }}
          >
            <Plus size={16} />
          </div>
        </div>
        <div
          onClick={handleFit}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 6, border: '1px solid #27273a', cursor: 'pointer',
          }}
        >
          <Maximize2 size={16} />
          <Typography.Text style={{ fontSize: 13 }}>Fit</Typography.Text>
        </div>
        <Button type="primary" icon={<Download size={16} />}>Export</Button>
      </>
    );
  }, [setBreadcrumbs, setActions, instance.name, navigate, zoom, handleZoomIn, handleZoomOut, handleFit]);

  /* ---------- Render ---------- */
  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'hidden' }}>
      {/* Topology Canvas */}
      <div style={{
        flex: 1, borderRadius: 12, border: '1px solid #27273a',
        overflow: 'hidden', display: 'flex',
      }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      {/* Detail Panel */}
      <div style={{
        width: 300, borderRadius: 12, border: '1px solid #27273a',
        display: 'flex', flexDirection: 'column', overflow: 'auto', flexShrink: 0,
      }}>
        {/* Panel Header */}
        <div style={{ padding: 20, borderBottom: '1px solid #27273a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Info size={18} color="var(--primary-color)" />
            <span style={{ color: '#f4f4f5', fontSize: 16, fontWeight: 600 }}>Instance Details</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ color: '#f4f4f5', fontSize: 20, fontWeight: 600 }}>{instance.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BoxIcon size={14} color="var(--primary-color)" />
              <span style={{ color: '#a1a1aa', fontSize: 14 }}>{instance.className}</span>
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600 }}>Properties</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {instance.properties.map((prop) => (
                <div key={prop.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa', fontSize: 13 }}>{prop.label}</span>
                  <span style={{ color: '#f4f4f5', fontSize: 13 }}>{prop.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20, marginTop: 20, borderTop: '1px solid #27273a' }}>
            <span style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 600 }}>
              Relations ({instance.relations.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {instance.relations.map((rel) => (
                <div
                  key={rel.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 10, backgroundColor: '#1a1a24', borderRadius: 8,
                  }}
                >
                  <rel.icon size={16} color={rel.color} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: '#f4f4f5', fontSize: 13, fontWeight: 500 }}>
                      {rel.name}
                    </span>
                    <span style={{ color: '#a1a1aa', fontSize: 11 }}>
                      {rel.relation} &rarr; {rel.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
