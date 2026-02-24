import { useState, useEffect, useRef, useCallback } from 'react';
import { Breadcrumb, Typography, Input, Spin } from 'antd';
import { Search, X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import * as d3 from 'd3';
import { useHeader } from '../contexts/HeaderContext';
import { fetchOntologyTree, fetchOntologyGraph, getClass, type OntologyTreeNode, type OntologyGraphData, type ClassDTO } from '../services/coreService';

interface SearchItem {
  id?: number;
  name: string;
  type: 'Class' | 'Relation';
}

interface LinkData {
  source: string;
  target: string;
  label: string;
  style: 'solid' | 'dashed';
}

interface GraphData {
  nodes: { id: string; type: string; x: number; y: number }[];
  links: LinkData[];
}

const EMPTY_GRAPH: GraphData = { nodes: [], links: [] };

interface GraphCanvasProps {
  selected: string | null;
  selectedType: 'Class' | 'Relation' | null;
  graphData: GraphData;
}

function GraphCanvas({ selected, selectedType, graphData }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const nodesRef = useRef<d3.Selection<SVGGElement, { id: string; type: string; x: number; y: number }, SVGGElement, unknown> | null>(null);
  const linksRef = useRef<d3.Selection<SVGLineElement, LinkData, SVGGElement, unknown> | null>(null);
  const linkLabelsRef = useRef<d3.Selection<SVGTextElement, LinkData, SVGGElement, unknown> | null>(null);
  const nodesDataRef = useRef<{ id: string; type: string; x: number; y: number }[]>([]);

  // Initial D3 render
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add defs for glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const nodesData = graphData.nodes.map((d) => ({ ...d }));
    const linksData: LinkData[] = graphData.links.map((d) => ({ ...d }));
    nodesDataRef.current = nodesData;

    const nodeW = 120, nodeH = 50;
    const g = svg.append('g');
    gRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 3]).on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);

    const rect = svgRef.current.getBoundingClientRect();
    const minX = Math.min(...nodesData.map((n) => n.x)) - nodeW / 2;
    const maxX = Math.max(...nodesData.map((n) => n.x)) + nodeW / 2;
    const minY = Math.min(...nodesData.map((n) => n.y)) - nodeH / 2;
    const maxY = Math.max(...nodesData.map((n) => n.y)) + nodeH / 2;
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const tx = (rect.width - contentW) / 2 - minX;
    const ty = (rect.height - contentH) / 2 - minY;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty));

    const links = g.selectAll<SVGLineElement, LinkData>('.link').data(linksData).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => d.style === 'dashed' ? '#22D3EE' : 'var(--primary-color)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) => d.style === 'dashed' ? '6,4' : 'none');
    linksRef.current = links;

    const linkLabels = g.selectAll<SVGTextElement, LinkData>('.link-label').data(linksData).enter().append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => d.style === 'dashed' ? '#22D3EE' : '#a1a1aa')
      .attr('font-size', 10)
      .text((d) => d.label);
    linkLabelsRef.current = linkLabels;

    const nodes = g.selectAll<SVGGElement, typeof nodesData[0]>('.node').data(nodesData).enter().append('g')
      .attr('class', 'node').style('cursor', 'grab')
      .call(d3.drag<SVGGElement, typeof nodesData[0]>()
        .on('start', function () { d3.select(this).style('cursor', 'grabbing'); })
        .on('drag', function (e, d) {
          d.x = e.x; d.y = e.y;
          d3.select(this).attr('transform', `translate(${d.x - 60}, ${d.y - 25})`);
          updateLinks();
        })
        .on('end', function () { d3.select(this).style('cursor', 'grab'); })
      );
    nodesRef.current = nodes;

    const getEndpoints = (d: LinkData) => {
      const src = nodesDataRef.current.find((n) => n.id === d.source)!;
      const tgt = nodesDataRef.current.find((n) => n.id === d.target)!;
      const halfH = 25;
      if (src.y < tgt.y) {
        return { x1: src.x, y1: src.y + halfH, x2: tgt.x, y2: tgt.y - halfH };
      } else if (src.y > tgt.y) {
        return { x1: src.x, y1: src.y - halfH, x2: tgt.x, y2: tgt.y + halfH };
      } else {
        return { x1: src.x, y1: src.y + halfH, x2: tgt.x, y2: tgt.y + halfH };
      }
    };

    const updateLinks = () => {
      links.attr('x1', (d) => getEndpoints(d).x1)
        .attr('y1', (d) => getEndpoints(d).y1)
        .attr('x2', (d) => getEndpoints(d).x2)
        .attr('y2', (d) => getEndpoints(d).y2);
      linkLabels.attr('x', (d) => { const ep = getEndpoints(d); return (ep.x1 + ep.x2) / 2; })
        .attr('y', (d) => { const ep = getEndpoints(d); return (ep.y1 + ep.y2) / 2 + (ep.y1 === ep.y2 ? 14 : 0); });
    };

    nodes.attr('transform', (d) => `translate(${d.x - 60}, ${d.y - 25})`);
    nodes.append('rect').attr('class', 'node-rect').attr('width', 120).attr('height', 50).attr('rx', 10)
      .attr('fill', (d) => d.type === 'Root Class' ? 'var(--primary-color)' : 'transparent')
      .attr('stroke', 'var(--primary-color)').attr('stroke-width', 2);

    updateLinks();

    nodes.append('text').attr('class', 'node-name')
      .attr('x', 60).attr('y', 22).attr('text-anchor', 'middle')
      .attr('fill', (d) => d.type === 'Root Class' ? '#fff' : '#E4E4E7')
      .attr('font-size', 14).attr('font-weight', 500)
      .text((d) => d.id);

    nodes.append('text').attr('class', 'node-type')
      .attr('x', 60).attr('y', 38).attr('text-anchor', 'middle')
      .attr('fill', (d) => d.type === 'Root Class' ? 'rgba(255,255,255,0.7)' : '#71717A')
      .attr('font-size', 12)
      .text((d) => d.type);

  }, [graphData]);

  // Update highlight when selection changes
  useEffect(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const linkLabels = linkLabelsRef.current;
    if (!nodes || !links || !linkLabels) return;

    if (!selected) {
      nodes.style('opacity', 1).style('filter', 'none');
      nodes.select('.node-rect')
        .attr('stroke', 'var(--primary-color)')
        .attr('stroke-width', 2);
      links.style('opacity', 1)
        .attr('stroke-width', 2);
      linkLabels.style('opacity', 1);
      return;
    }

    if (selectedType === 'Class') {
      nodes.style('opacity', (d) => d.id === selected ? 1 : 0.2)
        .style('filter', (d) => d.id === selected ? 'url(#glow)' : 'none');
      nodes.select('.node-rect')
        .attr('stroke-width', (d: { id: string }) => d.id === selected ? 3 : 2);

      links.style('opacity', (d) => (d.source === selected || d.target === selected) ? 1 : 0.1)
        .attr('stroke-width', (d) => (d.source === selected || d.target === selected) ? 3 : 2);
      linkLabels.style('opacity', (d) => (d.source === selected || d.target === selected) ? 1 : 0.1);

      const connectedNodes = new Set<string>();
      graphData.links.forEach((l) => {
        if (l.source === selected) connectedNodes.add(l.target);
        if (l.target === selected) connectedNodes.add(l.source);
      });
      nodes.style('opacity', (d) => {
        if (d.id === selected) return 1;
        if (connectedNodes.has(d.id)) return 0.6;
        return 0.15;
      });
    } else {
      const matchingLink = graphData.links.find((l) => l.label === selected);

      links.style('opacity', (d) => d.label === selected ? 1 : 0.1)
        .attr('stroke-width', (d) => d.label === selected ? 4 : 2);
      linkLabels.style('opacity', (d) => d.label === selected ? 1 : 0.1);

      nodes.style('opacity', (d) => {
        if (matchingLink && (d.id === matchingLink.source || d.id === matchingLink.target)) return 1;
        return 0.15;
      }).style('filter', (d) => {
        if (matchingLink && (d.id === matchingLink.source || d.id === matchingLink.target)) return 'url(#glow)';
        return 'none';
      });
      nodes.select('.node-rect')
        .attr('stroke-width', 2);
    }
  }, [selected, selectedType]);

  return <svg ref={svgRef} width="100%" height="100%" />;
}

function flattenTree(nodes: OntologyTreeNode[]): SearchItem[] {
  const result: SearchItem[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, type: node.type });
    if (node.children) result.push(...flattenTree(node.children));
  }
  return result;
}

function apiGraphToLocal(data: OntologyGraphData): GraphData {
  const spacing = 150;
  const cols = Math.max(3, Math.ceil(Math.sqrt(data.nodes.length)));
  return {
    nodes: data.nodes.map((n, i) => ({
      id: n.label || n.id,
      type: n.type || 'Class',
      x: n.x ?? (i % cols) * spacing + 100,
      y: n.y ?? Math.floor(i / cols) * spacing + 80,
    })),
    links: data.links.map((l) => ({
      source: typeof l.source === 'string' ? l.source : String(l.source),
      target: typeof l.target === 'string' ? l.target : String(l.target),
      label: l.label,
      style: l.style,
    })),
  };
}

export default function KnowledgeGraphPage() {
  const [selected, setSelected] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingTree, setLoadingTree] = useState(true);
  const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH);
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassDTO | null>(null);
  const { setBreadcrumbs } = useHeader();

  // Load ontology tree for search panel
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchOntologyTree();
        if (res.data) {
          setSearchResults(flattenTree(res.data));
        }
      } catch {
        // failed to load tree
      } finally {
        setLoadingTree(false);
      }
    })();
  }, []);

  // Load graph data
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchOntologyGraph(0);
        if (res.data) {
          setGraphData(apiGraphToLocal(res.data));
        }
      } catch {
        // failed to load graph
      }
    })();
  }, []);

  // Load class detail when selecting a class node
  useEffect(() => {
    if (!selected) { setSelectedClassDetail(null); return; }
    const item = searchResults.find((r) => r.name === selected);
    if (!item || item.type !== 'Class' || !item.id) { setSelectedClassDetail(null); return; }
    (async () => {
      try {
        const res = await getClass(item.id!);
        if (res.data) setSelectedClassDetail(res.data);
      } catch {
        setSelectedClassDetail(null);
      }
    })();
  }, [selected, searchResults]);

  const filteredResults = searchQuery
    ? searchResults.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchResults;

  const selectedItem = filteredResults.find((r) => r.name === selected) ?? null;

  const handleSelect = useCallback((name: string) => {
    setSelected((prev) => prev === name ? '' : name);
  }, []);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Ontologies' },
        { title: 'Knowledge Graph' },
      ]} />
    );
  }, [setBreadcrumbs]);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Search Panel */}
        <div style={{ width: 280, borderRight: '1px solid #303030', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #303030' }}>
            <Typography.Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 12 }}>Search Ontology</Typography.Text>
            <Input
              placeholder="Search by name..."
              prefix={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px' }}>
              <Typography.Text style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>Results</Typography.Text>
              <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{filteredResults.length} found</Typography.Text>
            </div>
            {loadingTree ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spin /></div>
            ) : filteredResults.map((item) => {
              const isActive = item.name === selected;
              return (
                <div
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    marginBottom: 4,
                    backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: isActive ? 'transparent' : (item.type === 'Relation' ? '#22D3EE' : '#A855F7'),
                      flexShrink: 0,
                    }}
                  />
                  <Typography.Text
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#fff' : undefined,
                      flex: 1,
                    }}
                  >
                    {item.name}
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: 11,
                      opacity: isActive ? 0.7 : 1,
                      color: isActive
                        ? '#fff'
                        : (item.type === 'Relation' ? '#22D3EE' : '#a1a1aa'),
                    }}
                  >
                    {item.type}
                  </Typography.Text>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph Canvas */}
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Knowledge Graph</Typography.Text>
            <div style={{ display: 'flex', gap: 8 }}>
              {[ZoomIn, ZoomOut, Maximize].map((Icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={16} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, border: '1px solid #303030', borderRadius: 12, overflow: 'hidden', backgroundColor: '#141414' }}>
            <GraphCanvas selected={selected || null} selectedType={selectedItem?.type ?? null} graphData={graphData} />
          </div>
        </div>

        {/* Properties Panel */}
        <div style={{ width: 320, borderLeft: '1px solid #303030', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #303030' }}>
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Class Properties</Typography.Text>
            <div
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <X size={18} color="#a1a1aa" />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {!selected ? (
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', padding: '40px 0' }}>
                Select a node to view details
              </Typography.Text>
            ) : selectedClassDetail ? (
              <>
                {/* Class Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)',
                    }}
                  >
                    <Typography.Text style={{ color: '#fff', fontWeight: 600 }}>{selectedClassDetail.name.charAt(0)}</Typography.Text>
                  </div>
                  <div>
                    <Typography.Text style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>{selectedClassDetail.name}</Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{selectedClassDetail.uri || 'No URI'}</Typography.Text>
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: '#303030' }} />

                {/* Basic Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Typography.Text style={{ fontSize: 14, fontWeight: 600 }}>Basic Information</Typography.Text>
                  {[
                    { label: 'Label', value: selectedClassDetail.name },
                    { label: 'URI', value: selectedClassDetail.uri || '--' },
                    { label: 'Description', value: selectedClassDetail.description || 'No description' },
                  ].map((prop) => (
                    <div key={prop.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{prop.label}</Typography.Text>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                        <Typography.Text style={{ fontSize: 14, lineHeight: prop.label === 'Description' ? '1.4' : undefined }}>
                          {prop.value}
                        </Typography.Text>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Typography.Text style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>{selected}</Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{selectedItem?.type ?? 'Unknown'}</Typography.Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
