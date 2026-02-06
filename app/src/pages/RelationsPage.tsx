import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, InputAdornment, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Checkbox, IconButton, Chip, Card,
} from '@mui/material';
import {
  Search, Plus, ChevronRight, LayoutGrid, List, MoreHorizontal, Pencil,
  Link as LinkIcon, ArrowRight, Type, ChevronDown, MapPin, Users,
  Briefcase, CalendarCheck, PenTool,
} from 'lucide-react';

interface RelationData {
  id: string;
  name: string;
  description: string;
  domain: string;
  domainIcon?: React.ComponentType<{ size?: number; color?: string }>;
  range: string;
  usage: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const relationsData: RelationData[] = [
  {
    id: '1',
    name: 'worksFor',
    description: 'Indicates employment relationship between person and organization',
    domain: 'Person',
    range: 'Organization',
    usage: 1248,
    icon: ArrowRight,
    color: '#8B5CF6',
  },
  {
    id: '2',
    name: 'locatedIn',
    description: 'Specifies the physical location of an entity or place',
    domain: 'Entity',
    range: 'Location',
    usage: 856,
    icon: MapPin,
    color: '#22D3EE',
  },
  {
    id: '3',
    name: 'parentOf',
    description: 'Hierarchical relationship between parent and child person',
    domain: 'Person',
    range: 'Person',
    usage: 423,
    icon: Users,
    color: '#F472B6',
  },
  {
    id: '4',
    name: 'belongsTo',
    description: 'Indicates membership or ownership relationship',
    domain: 'Entity',
    range: 'Organization',
    usage: 267,
    icon: Briefcase,
    color: '#4ADE80',
  },
  {
    id: '5',
    name: 'occurredAt',
    description: 'Links an event to its time and date of occurrence',
    domain: 'Event',
    range: 'DateTime',
    usage: 156,
    icon: CalendarCheck,
    color: '#FBBF24',
  },
  {
    id: '6',
    name: 'createdBy',
    description: 'Identifies the author or creator of a document or entity',
    domain: 'Document',
    range: 'Person',
    usage: 89,
    icon: PenTool,
    color: '#EC4899',
  },
];

const filters = [
  { key: 'all', label: 'All Relations', count: 32, icon: LinkIcon },
  { key: 'object', label: 'Object Relations', count: 18, icon: ArrowRight },
  { key: 'data', label: 'Data Relations', count: 14, icon: Type },
];

export default function RelationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? relationsData.map((r) => r.id) : []);
  };

  const getUsageColor = (usage: number): 'success' | 'info' | 'warning' => {
    if (usage > 500) return 'success';
    if (usage > 100) return 'info';
    return 'warning';
  };

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">Ontologies</Link>
          <Typography color="text.primary" fontWeight={500}>Relations</Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search relations..."
            sx={{ width: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate('/relations/new/edit')}
            sx={{
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            }}
          >
            New Relation
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" flexDirection="column" gap={2.5}>
        {/* Toolbar */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1.5}>
            {filters.map((f) => (
              <Box
                key={f.key}
                onClick={() => setFilter(f.key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: filter === f.key ? 'primary.main' : 'action.hover',
                  color: filter === f.key ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': { bgcolor: filter === f.key ? 'primary.main' : 'action.selected' },
                }}
              >
                <f.icon size={16} />
                <Typography variant="body2" fontWeight={filter === f.key ? 500 : 400}>
                  {f.label}
                </Typography>
                <Typography variant="caption" sx={{ opacity: filter === f.key ? 0.7 : 1 }}>
                  {f.count}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box display="flex" gap={1.5} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: '#A855F7' }} />
              <Typography variant="body2">Enterprise</Typography>
              <ChevronDown size={16} />
            </Box>
            <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              {[
                { key: 'list', Icon: List },
                { key: 'grid', Icon: LayoutGrid },
              ].map(({ key, Icon }) => (
                <Box
                  key={key}
                  onClick={() => setView(key)}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    bgcolor: view === key ? 'action.selected' : 'transparent',
                  }}
                >
                  <Icon size={18} color={view === key ? undefined : 'gray'} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Table */}
        <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
          <TableContainer sx={{ flex: 1 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell padding="checkbox" sx={{ width: 40 }}>
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < relationsData.length}
                      checked={selected.length === relationsData.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 200 }}>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                        Relation
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Description
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Domain
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Range
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Usage
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relationsData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow
                    key={row.id}
                    selected={selected.includes(row.id)}
                    hover
                    sx={{
                      bgcolor: selected.includes(row.id) ? 'action.selected' : 'transparent',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onChange={() =>
                          setSelected((p) =>
                            p.includes(row.id) ? p.filter((i) => i !== row.id) : [...p, row.id]
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: `${row.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <row.icon size={16} color={row.color} />
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {row.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.domain}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.range}
                        size="small"
                        color="info"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.usage.toLocaleString()}
                        size="small"
                        color={getUsageColor(row.usage)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/relations/${row.id}/edit`)}
                          sx={{ width: 28, height: 28 }}
                        >
                          <Pencil size={14} />
                        </IconButton>
                        <IconButton size="small" sx={{ width: 28, height: 28 }}>
                          <MoreHorizontal size={14} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={32}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            labelDisplayedRows={({ from, to, count }) => `Showing ${from}-${to} of ${count} relations`}
          />
        </Card>
      </Box>
    </>
  );
}
