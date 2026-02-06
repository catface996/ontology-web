import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, Button, Card, IconButton,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  ChevronRight, Save, Database, FileText, Plus, Pencil, Trash2, Eye,
  User, Building2, MapPin, Folder, Calendar,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';

interface PropertyValue {
  key: string;
  value: string;
}

interface RelationItem {
  name: string;
  relation: string;
  targetType: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

interface InstanceData {
  id: string;
  name: string;
  className: string;
  description: string;
  domain: string;
  properties: PropertyValue[];
  relations: RelationItem[];
}

const instancesMap: Record<string, InstanceData> = {
  '1': {
    id: '1', name: 'John Smith', className: 'Person', description: 'Senior Software Engineer at Acme Corp', domain: 'Enterprise',
    properties: [
      { key: 'email', value: 'john@acme.com' },
      { key: 'birthDate', value: '1985-03-15' },
      { key: 'phone', value: '+1 555-0123' },
    ],
    relations: [
      { name: 'Acme Corp', relation: 'worksFor', targetType: 'Organization', icon: Building2, color: '#22D3EE' },
      { name: 'New York', relation: 'livesIn', targetType: 'Location', icon: MapPin, color: '#F472B6' },
      { name: 'Project X', relation: 'worksOn', targetType: 'Project', icon: Folder, color: '#4ADE80' },
    ],
  },
  '2': {
    id: '2', name: 'Acme Corp', className: 'Organization', description: 'Global technology and innovation company', domain: 'Enterprise',
    properties: [
      { key: 'industry', value: 'Technology' },
      { key: 'founded', value: '1998-06-15' },
      { key: 'employees', value: '5,200' },
    ],
    relations: [
      { name: 'John Smith', relation: 'employs', targetType: 'Person', icon: User, color: '#8B5CF6' },
      { name: 'New York', relation: 'locatedIn', targetType: 'Location', icon: MapPin, color: '#F472B6' },
    ],
  },
};

const classOptions = ['Person', 'Organization', 'Location', 'Event', 'Document'];
const domainOptions = ['Enterprise', 'Healthcare', 'Finance', 'IoT & Sensors'];

export default function InstanceEditorPage() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const editingInstance = instanceId && instanceId !== 'new' ? instancesMap[instanceId] : null;
  const isEditing = !!editingInstance;

  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [properties, setProperties] = useState<PropertyValue[]>([]);
  const [relations, setRelations] = useState<RelationItem[]>([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (editingInstance) {
      setName(editingInstance.name);
      setClassName(editingInstance.className);
      setDescription(editingInstance.description);
      setDomain(editingInstance.domain);
      setProperties(editingInstance.properties);
      setRelations(editingInstance.relations);
    }
  }, [editingInstance]);

  return (
    <>
      {/* Header */}
      <Box height={64} display="flex" alignItems="center" justifyContent="space-between" px={3} borderBottom={1} borderColor="divider">
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#" onClick={(e) => { e.preventDefault(); navigate('/instances'); }}>
            Instances
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            {isEditing ? `Edit ${editingInstance?.name}` : 'Add New Instance'}
          </Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <Button variant="outlined" onClick={() => navigate('/instances')}>Cancel</Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={() => setSuccessModalOpen(true)}>
            Save Instance
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" gap={3} overflow="auto">
        {/* Left Column */}
        <Box flex={1} display="flex" flexDirection="column" gap={3}>
          {/* Basic Information Card */}
          <Card variant="outlined" sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Database size={20} color="#8b5cf6" />
              <Typography variant="h6">Basic Information</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Instance Name *"
                placeholder="e.g., John Smith, Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Class *</InputLabel>
                <Select label="Class *" value={className} onChange={(e) => setClassName(e.target.value)}>
                  {classOptions.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                placeholder="Brief description of this instance..."
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Domain</InputLabel>
                <Select label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)}>
                  <MenuItem value="">Select domain (optional)</MenuItem>
                  {domainOptions.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Card>

          {/* Property Values Card */}
          <Card variant="outlined" sx={{ p: 3, flex: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <FileText size={20} color="#8b5cf6" />
                <Typography variant="h6">Property Values</Typography>
              </Box>
              <Button size="small" startIcon={<Plus size={14} />}>Add Value</Button>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {properties.map((prop) => (
                <Box key={prop.key} display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="action.hover" borderRadius={2}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{prop.key}</Typography>
                    <Typography variant="caption" color="text.secondary">{prop.value}</Typography>
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
          {/* Instance Preview Card */}
          <Card variant="outlined" sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Eye size={20} color="#8b5cf6" />
              <Typography variant="h6">Instance Preview</Typography>
            </Box>
            <Box bgcolor="action.hover" borderRadius={2} p={2}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <User size={18} color="#8b5cf6" />
                <Typography fontWeight={600}>{name || 'Instance Name'}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                {className || 'Class'}{domain ? ` • ${domain} Domain` : ''}
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.5}>
                {properties.map((prop) => (
                  <Box key={prop.key} display="flex" alignItems="center" gap={1}>
                    <Box width={6} height={6} borderRadius="50%" bgcolor="primary.main" />
                    <Typography variant="body2">{prop.key}: {prop.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>

          {/* Relations Card */}
          <Card variant="outlined" sx={{ p: 3, flex: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Relations</Typography>
              <Button size="small" startIcon={<Plus size={14} />}>Add Relation</Button>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {relations.map((rel) => (
                <Box key={rel.name} display="flex" alignItems="center" gap={1.5} p={1.5} bgcolor="action.hover" borderRadius={2}>
                  <rel.icon size={16} color={rel.color} />
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={500}>{rel.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rel.relation} → {rel.targetType}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>

      <SuccessModal
        open={successModalOpen}
        title="Instance Saved"
        description="The instance has been saved successfully. Your changes have been applied."
        onClose={() => { setSuccessModalOpen(false); navigate('/instances'); }}
      />
    </>
  );
}
