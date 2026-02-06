import { useEffect, useRef } from 'react';
import { Box, Breadcrumbs, Link, Typography, TextField, InputAdornment, Button, IconButton } from '@mui/material';
import { Search, Plus, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import * as d3 from 'd3';

const searchResults = [
  { name: 'Entity', type: 'Root Class', active: true },
  { name: 'Person', type: 'Class' },
  { name: 'Organization', type: 'Class' },
  { name: 'Location', type: 'Class' },
  { name: 'Event', type: 'Class' },
  { name: 'Document', type: 'Class' },
];

const graphData = {
  nodes: [
    { id: 'Entity', type: 'Root Class', x: 250, y: 80 },
    { id: 'Person', type: 'Class', x: 100, y: 220 },
    { id: 'Organization', type: 'Class', x: 250, y: 220 },
    { id: 'Location', type: 'Class', x: 400, y: 220 },
  ],
  links: [
    { source: 'Entity', target: 'Person', label: 'subclass' },
    { source: 'Entity', target: 'Organization', label: 'subclass' },
    { source: 'Entity', target: 'Location', label: 'subclass' },
  ],
};

function GraphCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodesData = graphData.nodes.map((d) => ({ ...d }));
    const linksData = graphData.links.map((d) => ({ ...d }));

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 3]).on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);

    const g = svg.append('g');

    const links = g.selectAll('.link').data(linksData).enter().append('line')
      .attr('class', 'link').attr('stroke', '#8B5CF6').attr('stroke-width', 2);

    const linkLabels = g.selectAll('.link-label').data(linksData).enter().append('text')
      .attr('class', 'link-label').attr('text-anchor', 'middle').attr('fill', '#71717A').attr('font-size', 12).text((d) => d.label);

    const nodes = g.selectAll('.node').data(nodesData).enter().append('g')
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

    const updateLinks = () => {
      links.attr('x1', (d) => nodesData.find((n) => n.id === d.source)!.x)
        .attr('y1', (d) => nodesData.find((n) => n.id === d.source)!.y + 25)
        .attr('x2', (d) => nodesData.find((n) => n.id === d.target)!.x)
        .attr('y2', (d) => nodesData.find((n) => n.id === d.target)!.y - 25);
      linkLabels.attr('x', (d) => (nodesData.find((n) => n.id === d.source)!.x + nodesData.find((n) => n.id === d.target)!.x) / 2)
        .attr('y', (d) => (nodesData.find((n) => n.id === d.source)!.y + nodesData.find((n) => n.id === d.target)!.y) / 2);
    };

    nodes.attr('transform', (d) => `translate(${d.x - 60}, ${d.y - 25})`);
    nodes.append('rect').attr('width', 120).attr('height', 50).attr('rx', 10)
      .attr('fill', (d) => d.type === 'Root Class' ? '#8B5CF6' : 'transparent')
      .attr('stroke', '#8B5CF6').attr('stroke-width', 2);

    updateLinks();

    nodes.append('text')
      .attr('x', 60)
      .attr('y', 22)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => d.type === 'Root Class' ? '#fff' : '#E4E4E7')
      .attr('font-size', 14)
      .attr('font-weight', 500)
      .text((d) => d.id);

    nodes.append('text')
      .attr('x', 60)
      .attr('y', 38)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => d.type === 'Root Class' ? 'rgba(255,255,255,0.7)' : '#71717A')
      .attr('font-size', 12)
      .text((d) => d.type);

  }, []);

  return <svg ref={svgRef} width="100%" height="100%" />;
}

export default function KnowledgeGraphPage() {
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
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Search Ontology</Typography>
            <TextField fullWidth size="small" placeholder="Type to search..." sx={{ bgcolor: 'action.hover', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }} />
          </Box>
          <Box flex={1} overflow="auto" p={1.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center" px={0.5} py={1}>
              <Typography variant="caption" color="text.secondary">Results</Typography>
              <Typography variant="caption" color="text.secondary">{searchResults.length} items</Typography>
            </Box>
            {searchResults.map((item) => (
              <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1.25, borderRadius: 2, mb: 0.5, bgcolor: item.active ? 'primary.main' : 'transparent', color: item.active ? 'primary.contrastText' : 'text.primary', cursor: 'pointer', '&:hover': { bgcolor: item.active ? 'primary.main' : 'action.hover' } }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.active ? 'primary.contrastText' : 'primary.main' }} />
                <Box>
                  <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>{item.type}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Graph Canvas */}
        <Box flex={1} p={2.5} display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>Knowledge Graph</Typography>
            <Box display="flex" gap={0.5}>
              {[ZoomIn, ZoomOut, Maximize2].map((Icon, i) => (
                <IconButton key={i} size="small" sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}><Icon size={18} /></IconButton>
              ))}
            </Box>
          </Box>
          <Box flex={1} border={1} borderColor="divider" borderRadius={3} overflow="hidden" bgcolor="background.default">
            <GraphCanvas />
          </Box>
        </Box>

        {/* Properties Panel */}
        <Box width={320} borderLeft={1} borderColor="divider" display="flex" flexDirection="column">
          <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={2.5} borderBottom={1} borderColor="divider">
            <Typography variant="subtitle1" fontWeight={600}>Class Properties</Typography>
            <IconButton size="small"><X size={18} /></IconButton>
          </Box>
          <Box flex={1} overflow="auto" p={2.5} display="flex" flexDirection="column" gap={2.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="primary.contrastText" fontWeight={600}>E</Typography>
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>Entity</Typography>
                <Typography variant="caption" color="text.secondary">Root Class</Typography>
              </Box>
            </Box>
            <Box height={1} bgcolor="divider" />
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Basic Information</Typography>
              {[{ label: 'URI', value: 'ont:Entity' }, { label: 'Description', value: 'Base class for all entities' }, { label: 'Created', value: '2024-01-15' }].map((prop) => (
                <Box key={prop.label} mb={1}>
                  <Typography variant="caption" color="text.secondary">{prop.label}</Typography>
                  <Typography variant="body2">{prop.value}</Typography>
                </Box>
              ))}
            </Box>
            <Box height={1} bgcolor="divider" />
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Direct Subclasses</Typography>
              {['Person', 'Organization', 'Location'].map((name) => (
                <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1, mb: 1, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="body2">{name}</Typography>
                </Box>
              ))}
            </Box>
            <Box height={1} bgcolor="divider" />
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={600}>Related Properties</Typography>
                <Typography variant="caption" color="text.secondary">8 total</Typography>
              </Box>
              {['hasName', 'hasDescription', 'createdAt'].map((name) => (
                <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1, mb: 1, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: 'success.main' }} />
                  <Typography variant="body2">{name}</Typography>
                </Box>
              ))}
              <Button fullWidth variant="outlined" size="small">View All Properties</Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
