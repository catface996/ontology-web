import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, Button, Card, IconButton,
  Select, MenuItem, FormControl, InputLabel, Dialog,
} from '@mui/material';
import { ChevronRight, Save, Info, List, Plus, Pencil, Trash2, Eye, Box as BoxIcon, Boxes, User, Building2, MapPin, Calendar, FileText, Check } from 'lucide-react';

export interface ClassData {
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
  { id: '1', name: 'Entity', description: 'Base class for all entities in the knowledge graph', parent: null, properties: 5, instances: 0, icon: Boxes, color: '#8B5CF6' },
  { id: '2', name: 'Person', description: 'Represents a human individual with personal attributes', parent: 'Entity', properties: 12, instances: 1250, icon: User, color: '#22D3EE' },
  { id: '3', name: 'Organization', description: 'A company, institution, or group with a formal structure', parent: 'Entity', properties: 8, instances: 340, icon: Building2, color: '#F472B6' },
  { id: '4', name: 'Location', description: 'Geographic place or address with coordinates', parent: 'Entity', properties: 9, instances: 420, icon: MapPin, color: '#4ADE80' },
  { id: '5', name: 'Event', description: 'An occurrence that happens at a specific time and place', parent: 'Entity', properties: 6, instances: 156, icon: Calendar, color: '#FBBF24' },
  { id: '6', name: 'Document', description: 'A written or digital file containing structured information', parent: 'Entity', properties: 11, instances: 2100, icon: FileText, color: '#EC4899' },
];

const defaultProperties = [
  { name: 'name', type: 'string', constraint: 'required' },
  { name: 'email', type: 'string', constraint: 'unique' },
  { name: 'birthDate', type: 'date', constraint: 'optional' },
];

const defaultRelations = [
  { name: 'belongsTo', target: 'Organization', type: 'many-to-one' },
  { name: 'knows', target: 'Person', type: 'many-to-many' },
];

export default function ClassEditorPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const editingClass = classId && classId !== 'new' ? classesData.find(c => c.id === classId) : null;
  const isEditing = !!editingClass;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (editingClass) {
      setName(editingClass.name);
      setDescription(editingClass.description);
      setParent(editingClass.parent || '');
    }
  }, [editingClass]);

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#" onClick={(e) => { e.preventDefault(); navigate('/classes'); }}>Classes</Link>
          <Typography color="text.primary" fontWeight={500}>{isEditing ? `Edit ${editingClass?.name}` : 'Add New Class'}</Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <Button variant="outlined" onClick={() => navigate('/classes')}>Cancel</Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={() => setSuccessModalOpen(true)}>Save Class</Button>
        </Box>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" gap={3} overflow="auto">
        {/* Left Column */}
        <Box flex={1} display="flex" flexDirection="column" gap={3}>
          {/* Basic Info Card */}
          <Card variant="outlined" sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Info size={20} color="#8b5cf6" />
              <Typography variant="h6">Basic Information</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField fullWidth label="Class Name *" placeholder="e.g., Person, Organization, Product" value={name} onChange={(e) => setName(e.target.value)} />
              <TextField fullWidth label="URI" placeholder="http://ontology.example.com/Person" value={name ? `http://ontology.example.com/${name}` : ''} />
              <TextField fullWidth label="Description" placeholder="Describe the purpose and usage of this class..." multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              <FormControl fullWidth>
                <InputLabel>Parent Class</InputLabel>
                <Select label="Parent Class" value={parent} onChange={(e) => setParent(e.target.value)}>
                  <MenuItem value="">Select parent class (optional)</MenuItem>
                  <MenuItem value="Entity">Entity</MenuItem>
                  <MenuItem value="Thing">Thing</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Card>

          {/* Properties Card */}
          <Card variant="outlined" sx={{ p: 3, flex: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <List size={20} color="#8b5cf6" />
                <Typography variant="h6">Properties</Typography>
              </Box>
              <Button size="small" startIcon={<Plus size={14} />}>Add Property</Button>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {defaultProperties.map((prop) => (
                <Box key={prop.name} display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="action.hover" borderRadius={2}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{prop.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{prop.type} • {prop.constraint}</Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton size="small"><Pencil size={16} /></IconButton>
                    <IconButton size="small"><Trash2 size={16} /></IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>

        {/* Right Column */}
        <Box width={360} display="flex" flexDirection="column" gap={3}>
          {/* Preview Card */}
          <Card variant="outlined" sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Eye size={20} color="#8b5cf6" />
              <Typography variant="h6">Class Preview</Typography>
            </Box>
            <Box bgcolor="action.hover" borderRadius={2} p={2}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BoxIcon size={18} color="#8b5cf6" />
                <Typography fontWeight={600}>{name || 'ClassName'}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                {name ? `http://ontology.example.com/${name}` : 'http://ontology.example.com/...'}
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.5}>
                {defaultProperties.map((prop) => (
                  <Box key={prop.name} display="flex" alignItems="center" gap={1}>
                    <Box width={6} height={6} borderRadius="50%" bgcolor="primary.main" />
                    <Typography variant="body2">{prop.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{prop.type}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>

          {/* Relations Card */}
          <Card variant="outlined" sx={{ p: 3, flex: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Relations</Typography>
              <Button size="small" startIcon={<Plus size={14} />}>Add</Button>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {defaultRelations.map((rel) => (
                <Box key={rel.name} display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="action.hover" borderRadius={2}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{rel.name}</Typography>
                    <Typography variant="caption" color="text.secondary">→ {rel.target} • {rel.type}</Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton size="small"><Pencil size={16} /></IconButton>
                    <IconButton size="small"><Trash2 size={16} /></IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Success Modal */}
      <Dialog
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            width: 440,
            maxWidth: '90vw',
          },
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          p={4}
          pb={3}
        >
          {/* Icon */}
          <Box
            width={56}
            height={56}
            borderRadius="50%"
            bgcolor="rgba(34, 197, 94, 0.13)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Check size={28} color="#22C55E" />
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            fontWeight={600}
            textAlign="center"
            fontSize={20}
          >
            Operation Successful
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            lineHeight={1.6}
            px={2}
          >
            The operation has been completed successfully. Your changes have been saved.
          </Typography>
        </Box>

        {/* Actions */}
        <Box display="flex" justifyContent="center" px={4} pb={4}>
          <Button
            variant="contained"
            onClick={() => {
              setSuccessModalOpen(false);
              navigate('/classes');
            }}
            sx={{
              bgcolor: '#22C55E',
              '&:hover': { bgcolor: '#16A34A' },
              borderRadius: 2.5,
              height: 44,
              px: 3,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Done
          </Button>
        </Box>
      </Dialog>
    </>
  );
}
