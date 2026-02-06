import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, InputAdornment, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Checkbox, IconButton, Chip, Card,
} from '@mui/material';
import {
  Search, Plus, ChevronRight, LayoutGrid, List, MoreHorizontal, Pencil,
  ChevronDown, ArrowUpDown, Type, Hash, Mail, MapPin, Calendar, AlignLeft,
} from 'lucide-react';

interface PropertyData {
  id: string;
  name: string;
  description: string;
  dataType: string;
  definedOn: string;
  required: boolean;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const propertiesData: PropertyData[] = [
  { id: '1', name: 'name', description: 'The display name or title of an entity', dataType: 'String', definedOn: 'Entity', required: true, icon: Type, color: '#8B5CF6' },
  { id: '2', name: 'email', description: 'Contact email address for persons and organizations', dataType: 'String', definedOn: 'Person', required: true, icon: Mail, color: '#22D3EE' },
  { id: '3', name: 'age', description: 'The age of a person in years', dataType: 'Integer', definedOn: 'Person', required: false, icon: Hash, color: '#F472B6' },
  { id: '4', name: 'address', description: 'Physical street address or location description', dataType: 'String', definedOn: 'Location', required: false, icon: MapPin, color: '#4ADE80' },
  { id: '5', name: 'foundedDate', description: 'The date when an organization was established', dataType: 'Date', definedOn: 'Organization', required: false, icon: Calendar, color: '#FBBF24' },
  { id: '6', name: 'description', description: 'A detailed text description of an entity', dataType: 'Text', definedOn: 'Entity', required: false, icon: AlignLeft, color: '#EC4899' },
];

const filters = [
  { key: 'all', label: 'All Properties', count: 64, icon: List },
  { key: 'string', label: 'String Props', count: 28, icon: Type },
  { key: 'number', label: 'Number Props', count: 18, icon: Hash },
];

const dataTypeIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  String: Type,
  Integer: Hash,
  Date: Calendar,
  Text: Type,
};

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>(['2']);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? propertiesData.map((p) => p.id) : []);
  };

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">Ontologies</Link>
          <Typography color="text.primary" fontWeight={500}>Properties</Typography>
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
            onClick={() => navigate('/properties/new/edit')}
            sx={{
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            }}
          >
            New Property
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
                  bgcolor: filter === f.key ? 'primary.main' : f.key === 'string' ? 'action.hover' : 'transparent',
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
                      indeterminate={selected.length > 0 && selected.length < propertiesData.length}
                      checked={selected.length === propertiesData.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 200 }}>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                        Property
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
                      Data Type
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Defined On
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5}>
                      Required
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
                {propertiesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                  const DataTypeIcon = dataTypeIcons[row.dataType] || Type;
                  return (
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
                        <Box display="flex" alignItems="center" gap={0.75} color="primary.main">
                          <DataTypeIcon size={12} />
                          <Typography variant="body2" fontWeight={500} color="primary.main">
                            {row.dataType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.definedOn}
                          size="small"
                          color="info"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.required ? 'Yes' : 'No'}
                          size="small"
                          color={row.required ? 'success' : 'default'}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/properties/${row.id}/edit`)}
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={64}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            labelDisplayedRows={({ from, to, count }) => `Showing ${from}-${to} of ${count} properties`}
          />
        </Card>
      </Box>
    </>
  );
}
