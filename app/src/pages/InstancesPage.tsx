import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, InputAdornment, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Checkbox, IconButton, Chip, Card,
} from '@mui/material';
import {
  Search, Plus, ChevronRight, LayoutGrid, List, MoreHorizontal, Share2, Pencil,
  Database, User, Building2, MapPin, Calendar, ChevronDown, ArrowUpDown,
} from 'lucide-react';

interface InstanceData {
  id: string;
  name: string;
  description: string;
  className: string;
  classIcon: React.ComponentType<{ size?: number; color?: string }>;
  relations: number;
  created: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const instancesData: InstanceData[] = [
  { id: '1', name: 'John Smith', description: 'Senior Software Engineer at Acme Corp', className: 'Person', classIcon: User, relations: 5, created: 'Jan 15, 2024', icon: User, color: '#8B5CF6' },
  { id: '2', name: 'Acme Corp', description: 'Global technology and innovation company', className: 'Organization', classIcon: Building2, relations: 12, created: 'Aug 20, 2023', icon: Building2, color: '#22D3EE' },
  { id: '3', name: 'New York', description: 'Major metropolitan city in the United States', className: 'Location', classIcon: MapPin, relations: 8, created: 'Jun 10, 2023', icon: MapPin, color: '#F472B6' },
  { id: '4', name: 'Jane Doe', description: 'Product Manager with 8 years experience', className: 'Person', classIcon: User, relations: 3, created: 'Feb 1, 2024', icon: User, color: '#4ADE80' },
  { id: '5', name: 'TechStart Inc', description: 'Innovative startup in AI and machine learning', className: 'Organization', classIcon: Building2, relations: 6, created: 'Jan 5, 2024', icon: Building2, color: '#FBBF24' },
  { id: '6', name: 'Annual Meeting', description: 'Yearly company-wide strategic planning event', className: 'Event', classIcon: Calendar, relations: 4, created: 'Jan 20, 2024', icon: Calendar, color: '#EC4899' },
];

const filters = [
  { key: 'all', label: 'All Instances', count: 2585, icon: Database },
  { key: 'person', label: 'Person', count: 524, icon: User },
  { key: 'organization', label: 'Organization', count: 312, icon: Building2 },
];

export default function InstancesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>(['2']);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? instancesData.map((c) => c.id) : []);
  };

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">Ontologies</Link>
          <Typography color="text.primary" fontWeight={500}>Instances</Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search instances..."
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
            onClick={() => navigate('/instances/new/edit')}
            sx={{
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            }}
          >
            New Instance
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
                  {f.count.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box display="flex" gap={1.5} alignItems="stretch" height={36}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    px: 1, cursor: 'pointer',
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
                      indeterminate={selected.length > 0 && selected.length < instancesData.length}
                      checked={selected.length === instancesData.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 260, whiteSpace: 'nowrap' }}>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                        Instance
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
                      Class
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Relations
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Created
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 110 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instancesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow
                    key={row.id}
                    selected={selected.includes(row.id)}
                    hover
                    sx={{
                      bgcolor: selected.includes(row.id) ? 'action.selected' : undefined,
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
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
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
                            flexShrink: 0,
                          }}
                        >
                          <row.icon size={16} color={row.color} />
                        </Box>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {row.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {row.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.75} color="primary.main">
                        <row.classIcon size={12} />
                        <Typography variant="body2" fontWeight={500} color="primary.main">
                          {row.className}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.relations}
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
                        label={row.created}
                        size="small"
                        sx={{
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/instances/${row.id}/topology`)}
                          sx={{ width: 28, height: 28 }}
                        >
                          <Share2 size={14} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/instances/${row.id}/edit`)}
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
            count={2585}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            labelDisplayedRows={({ from, to, count }) => `Showing ${from}-${to} of ${count.toLocaleString()} instances`}
          />
        </Card>
      </Box>
    </>
  );
}
