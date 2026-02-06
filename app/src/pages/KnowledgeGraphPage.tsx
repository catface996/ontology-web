import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Breadcrumbs, Link, Typography, TextField, InputAdornment, Button } from '@mui/material';
import { Search, Plus, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, User, Building2, MapPin, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import * as d3 from 'd3';

interface SearchItem {
  name: string;
  type: 'Class' | 'Relation';
}

const searchResults: SearchItem[] = [
  { name: 'Entity', type: 'Class' },
  { name: 'Person', type: 'Class' },
  { name: 'Organization', type: 'Class' },
  { name: 'Location', type: 'Class' },
  { name: 'worksAt', type: 'Relation' },
  { name: 'locatedIn', type: 'Relation' },
];

interface LinkData {
  source: string;
  target: string;
  label: string;
  style: 'solid' | 'dashed';
}

const graphData = {
  nodes: [
    { id: 'Entity', type: 'Root Class', x: 250, y: 80 },
    { id: 'Person', type: 'Class', x: 100, y: 220 },
    { id: 'Organization', type: 'Class', x: 250, y: 220 },
    { id: 'Location', type: 'Class', x: 400, y: 220 },
  ],
  links: [
    { source: 'Entity', target: 'Person', label: 'subClassOf', style: 'solid' as const },
    { source: 'Entity', target: 'Organization', label: 'subClassOf', style: 'solid' as const },
    { source: 'Entity', target: 'Location', label: 'subClassOf', style: 'solid' as const },
    { source: 'Person', target: 'Organization', label: 'worksAt', style: 'dashed' as const },
    { source: 'Organization', target: 'Location', label: 'locatedIn', style: 'dashed' as const },
  ],
};

const subclasses = [
  { name: 'Person', icon: User },
  { name: 'Organization', icon: Building2 },
  { name: 'Location', icon: MapPin },
];

const relatedOntologies = [
  { name: 'worksAt', desc: 'Person → Organization', icon: ArrowRight, color: '#8b5cf6' },
  { name: 'locatedIn', desc: 'Organization → Location', icon: ArrowRight, color: '#8b5cf6' },
  { name: 'hasParent', desc: 'owl:Thing → Entity', icon: ArrowLeft, color: '#22D3EE' },
];

interface GraphCanvasProps {
  selected: string | null;
  selectedType: 'Class' | 'Relation' | null;
}

function GraphCanvas({ selected, selectedType }: GraphCanvasProps) {
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
      .attr('stroke', (d) => d.style === 'dashed' ? '#22D3EE' : '#8B5CF6')
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
      // Connection points are always at top or bottom center of the node
      const halfH = 25; // nodeH / 2
      if (src.y < tgt.y) {
        // source above target: source bottom → target top
        return { x1: src.x, y1: src.y + halfH, x2: tgt.x, y2: tgt.y - halfH };
      } else if (src.y > tgt.y) {
        // source below target: source top → target bottom
        return { x1: src.x, y1: src.y - halfH, x2: tgt.x, y2: tgt.y + halfH };
      } else {
        // same level: both use bottom center
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
      .attr('fill', (d) => d.type === 'Root Class' ? '#8B5CF6' : 'transparent')
      .attr('stroke', '#8B5CF6').attr('stroke-width', 2);

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

  }, []);

  // Update highlight when selection changes
  useEffect(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const linkLabels = linkLabelsRef.current;
    if (!nodes || !links || !linkLabels) return;

    if (!selected) {
      // Reset all to default
      nodes.style('opacity', 1).style('filter', 'none');
      nodes.select('.node-rect')
        .attr('stroke', '#8B5CF6')
        .attr('stroke-width', 2);
      links.style('opacity', 1)
        .attr('stroke-width', 2);
      linkLabels.style('opacity', 1);
      return;
    }

    if (selectedType === 'Class') {
      // Highlight matching node, dim others
      nodes.style('opacity', (d) => d.id === selected ? 1 : 0.2)
        .style('filter', (d) => d.id === selected ? 'url(#glow)' : 'none');
      nodes.select('.node-rect')
        .attr('stroke-width', (d: { id: string }) => d.id === selected ? 3 : 2);

      // Highlight links connected to this node, dim others
      links.style('opacity', (d) => (d.source === selected || d.target === selected) ? 1 : 0.1)
        .attr('stroke-width', (d) => (d.source === selected || d.target === selected) ? 3 : 2);
      linkLabels.style('opacity', (d) => (d.source === selected || d.target === selected) ? 1 : 0.1);

      // Keep connected nodes slightly more visible
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
      // Relation selected: highlight matching link
      const matchingLink = graphData.links.find((l) => l.label === selected);

      links.style('opacity', (d) => d.label === selected ? 1 : 0.1)
        .attr('stroke-width', (d) => d.label === selected ? 4 : 2);
      linkLabels.style('opacity', (d) => d.label === selected ? 1 : 0.1);

      // Highlight source/target nodes, dim others
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

export default function KnowledgeGraphPage() {
  const [selected, setSelected] = useState<string>('Entity');

  const selectedItem = searchResults.find((r) => r.name === selected) ?? null;

  const handleSelect = useCallback((name: string) => {
    setSelected((prev) => prev === name ? '' : name);
  }, []);

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">Ontologies</Link>
          <Typography color="text.primary" fontWeight={500}>Knowledge Graph</Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <TextField size="small" placeholder="Search classes..." sx={{ width: 240, bgcolor: 'action.hover', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }} />
          <Button variant="contained" startIcon={<Plus size={16} />}>New Class</Button>
        </Box>
      </Box>

      {/* Content */}
      <Box flex={1} display="flex" overflow="hidden">
        {/* Search Panel */}
        <Box width={280} borderRight={1} borderColor="divider" display="flex" flexDirection="column">
          <Box p={2} borderBottom={1} borderColor="divider">
            <Typography fontSize={14} fontWeight={600} mb={1.5}>Search Ontology</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name..."
              sx={{ bgcolor: 'action.hover', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
            />
          </Box>
          <Box flex={1} overflow="auto" p={1.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center" px={0.5} py={1}>
              <Typography fontSize={12} fontWeight={500} color="text.secondary">Results</Typography>
              <Typography fontSize={12} color="text.secondary">{searchResults.length} found</Typography>
            </Box>
            {searchResults.map((item) => {
              const isActive = item.name === selected;
              return (
                <Box
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: isActive ? 'primary.main' : 'action.hover' },
                    transition: 'background-color 0.15s',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '4px',
                      bgcolor: isActive ? 'transparent' : (item.type === 'Relation' ? '#22D3EE' : '#A855F7'),
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    fontSize={14}
                    fontWeight={isActive ? 500 : 400}
                    color={isActive ? 'primary.contrastText' : 'text.primary'}
                    sx={{ flex: 1 }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    fontSize={11}
                    sx={{
                      opacity: isActive ? 0.7 : 1,
                      color: isActive
                        ? 'primary.contrastText'
                        : (item.type === 'Relation' ? '#22D3EE' : 'text.secondary'),
                    }}
                  >
                    {item.type}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Graph Canvas */}
        <Box flex={1} p={2.5} display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontSize={16} fontWeight={600}>Knowledge Graph</Typography>
            <Box display="flex" gap={1}>
              {[ZoomIn, ZoomOut, Maximize2].map((Icon, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={16} />
                </Box>
              ))}
            </Box>
          </Box>
          <Box flex={1} border={1} borderColor="divider" borderRadius={3} overflow="hidden" bgcolor="background.default">
            <GraphCanvas selected={selected || null} selectedType={selectedItem?.type ?? null} />
          </Box>
        </Box>

        {/* Properties Panel */}
        <Box width={320} borderLeft={1} borderColor="divider" display="flex" flexDirection="column">
          <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={2.5} borderBottom={1} borderColor="divider">
            <Typography fontSize={16} fontWeight={600}>Class Properties</Typography>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              <X size={18} color="#a1a1aa" />
            </Box>
          </Box>
          <Box flex={1} overflow="auto" p={2.5} display="flex" flexDirection="column" gap={2.5}>
            {/* Class Header */}
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
                }}
              >
                <Typography color="primary.contrastText" fontWeight={600}>E</Typography>
              </Box>
              <Box>
                <Typography fontSize={18} fontWeight={600}>Entity</Typography>
                <Typography fontSize={12} color="text.secondary">owl:Thing</Typography>
              </Box>
            </Box>

            <Box height={1} bgcolor="divider" />

            {/* Basic Information */}
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Typography fontSize={14} fontWeight={600}>Basic Information</Typography>
              {[
                { label: 'Label', value: 'Entity' },
                { label: 'URI', value: 'http://ontology.io/Entity' },
                { label: 'Description', value: 'The root class for all entities in the knowledge graph.' },
              ].map((prop) => (
                <Box key={prop.label} display="flex" flexDirection="column" gap={0.5}>
                  <Typography fontSize={12} color="text.secondary">{prop.label}</Typography>
                  <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 1.5, py: 1.25 }}>
                    <Typography fontSize={14} sx={{ lineHeight: prop.label === 'Description' ? 1.4 : undefined }}>
                      {prop.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box height={1} bgcolor="divider" />

            {/* Direct Subclasses */}
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Typography fontSize={14} fontWeight={600}>Direct Subclasses</Typography>
              {subclasses.map((sub) => (
                <Box
                  key={sub.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <sub.icon size={16} />
                  <Typography fontSize={14}>{sub.name}</Typography>
                </Box>
              ))}
            </Box>

            <Box height={1} bgcolor="divider" />

            {/* Related Ontologies */}
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} fontWeight={600}>Related Ontologies</Typography>
                <Box sx={{ bgcolor: 'action.hover', borderRadius: 2.5, px: 1, py: 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography fontSize={12} fontWeight={500}>5</Typography>
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {relatedOntologies.map((rel) => (
                  <Box
                    key={rel.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <rel.icon size={14} color={rel.color} />
                    <Box flex={1} minWidth={0}>
                      <Typography fontSize={13} fontWeight={500}>{rel.name}</Typography>
                      <Typography fontSize={11} color="text.secondary">{rel.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                }}
              >
                <Typography fontSize={13}>View All Relations</Typography>
                <ExternalLink size={14} color="#a1a1aa" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
