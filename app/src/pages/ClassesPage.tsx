import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, InputAdornment, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Checkbox, IconButton, Chip, Card,
} from '@mui/material';
import {
  Search, Plus, ChevronRight, LayoutGrid, List, MoreHorizontal, Pencil,
  Layers, GitBranch, File, ChevronDown, ArrowUpDown, CornerDownRight,
  Box as BoxIcon, User, Building2, MapPin, Calendar, FileText,
} from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  description: string;
  parent: string | null;
  properties: number;
  instances: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const classesData: ClassData[] = [
  { id: '1', name: 'Entity', description: 'Base class for all entities in the knowledge graph', parent: null, properties: 8, instances: 1248, icon: BoxIcon, color: '#8B5CF6' },
  { id: '2', name: 'Person', description: 'Represents a human individual with personal attributes', parent: 'Entity', properties: 12, instances: 524, icon: User, color: '#22D3EE' },
  { id: '3', name: 'Organization', description: 'A company, institution, or group with a formal structure', parent: 'Entity', properties: 15, instances: 312, icon: Building2, color: '#F472B6' },
  { id: '4', name: 'Location', description: 'Geographic place or address with coordinates', parent: 'Entity', properties: 9, instances: 412, icon: MapPin, color: '#4ADE80' },
  { id: '5', name: 'Event', description: 'An occurrence that happens at a specific time and place', parent: 'Entity', properties: 7, instances: 89, icon: Calendar, color: '#FBBF24' },
  { id: '6', name: 'Document', description: 'A written or digital file containing structured information', parent: 'Entity', properties: 11, instances: 0, icon: FileText, color: '#EC4899' },
];

const filters = [
  { key: 'all', label: 'All Classes', count: 48, icon: Layers },
  { key: 'root', label: 'Root Classes', count: 12, icon: GitBranch },
  { key: 'leaf', label: 'Leaf Classes', count: 28, icon: File },
];

export default function ClassesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>(['2']); // Person is selected by default
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? classesData.map((c) => c.id) : []);
  };

  const getInstancesColor = (instances: number): 'success' | 'info' | 'warning' => {
    if (instances === 0) return 'info';
    if (instances < 100) return 'warning';
    return 'success';
  };

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">Ontologies</Link>
          <Typography color="text.primary" fontWeight={500}>Classes</Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search classes..."
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
            onClick={() => navigate('/classes/new/edit')}
            sx={{
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            }}
          >
            New Class
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
                      indeterminate={selected.length > 0 && selected.length < classesData.length}
                      checked={selected.length === classesData.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 200 }}>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                        Name
                      </Typography>
                      <ArrowUpDown size={14} color="gray" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Description
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Parent Class
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Properties
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Instances
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
                {classesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow
                    key={row.id}
                    selected={selected.includes(row.id)}
                    hover
                    sx={{
                      bgcolor: selected.includes(row.id) ? 'action.selected' : index % 2 === 1 ? 'action.hover' : 'transparent',
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
                      {row.parent ? (
                        <Box display="flex" alignItems="center" gap={0.75} color="primary.main">
                          <CornerDownRight size={12} />
                          <Typography variant="body2" fontWeight={500} color="primary.main">
                            {row.parent}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.properties}
                        size="small"
                        sx={{
                          bgcolor: 'action.hover',
                          color: 'text.primary',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.instances.toLocaleString()}
                        size="small"
                        color={getInstancesColor(row.instances)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/classes/${row.id}/edit`)}
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
            count={48}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            labelDisplayedRows={({ from, to, count }) => `Showing ${from}-${to} of ${count} classes`}
          />
        </Card>
      </Box>
    </>
  );
}
