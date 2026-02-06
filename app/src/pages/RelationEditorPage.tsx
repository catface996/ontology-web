import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, Button, Card,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  IconButton, Tooltip,
} from '@mui/material';
import {
  ChevronRight, Save, Info, Link as LinkIcon, Eye, Settings2,
  Box as BoxIcon, ArrowRight, Key,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';

interface RelationData {
  id: string;
  name: string;
  description: string;
  domain: string;
  range: string;
  domainField: string;
  rangeField: string;
}

const existingRelations: Record<string, RelationData> = {
  '1': { id: '1', name: 'worksFor', description: 'Indicates employment relationship between person and organization', domain: 'Person', range: 'Organization', domainField: 'employerId', rangeField: 'id' },
  '2': { id: '2', name: 'locatedIn', description: 'Specifies the physical location of an entity or place', domain: 'Entity', range: 'Location', domainField: 'locationId', rangeField: 'id' },
  '3': { id: '3', name: 'parentOf', description: 'Hierarchical relationship between parent and child person', domain: 'Person', range: 'Person', domainField: 'parentId', rangeField: 'id' },
};

const availableClasses = ['Entity', 'Person', 'Organization', 'Location', 'Event', 'Document'];

const availableFields: Record<string, string[]> = {
  'Entity': ['id', 'name', 'createdAt', 'updatedAt'],
  'Person': ['id', 'name', 'email', 'employerId', 'parentId', 'birthDate'],
  'Organization': ['id', 'name', 'foundedDate', 'industry', 'locationId'],
  'Location': ['id', 'name', 'latitude', 'longitude', 'address'],
  'Event': ['id', 'name', 'startDate', 'endDate', 'locationId'],
  'Document': ['id', 'title', 'content', 'authorId', 'createdAt'],
};

const relationProperties = [
  { key: 'functional', label: 'Functional', tooltip: 'Each source entity can be related to at most one target entity' },
  { key: 'inverseFunctional', label: 'Inverse Functional', tooltip: 'Each target entity can be related to at most one source entity' },
  { key: 'symmetric', label: 'Symmetric', tooltip: 'If A is related to B, then B is also related to A' },
  { key: 'transitive', label: 'Transitive', tooltip: 'If A is related to B and B is related to C, then A is related to C' },
];

export default function RelationEditorPage() {
  const { relationId } = useParams();
  const navigate = useNavigate();
  const isEditing = relationId && relationId !== 'new';
  const existingRelation = isEditing ? existingRelations[relationId] : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Person');
  const [range, setRange] = useState('Organization');
  const [domainField, setDomainField] = useState('employerId');
  const [rangeField, setRangeField] = useState('id');
  const [properties, setProperties] = useState<Record<string, boolean>>({
    functional: true,
    inverseFunctional: false,
    symmetric: false,
    transitive: false,
  });
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (existingRelation) {
      setName(existingRelation.name);
      setDescription(existingRelation.description);
      setDomain(existingRelation.domain);
      setRange(existingRelation.range);
      setDomainField(existingRelation.domainField);
      setRangeField(existingRelation.rangeField);
    }
  }, [existingRelation]);

  const handlePropertyChange = (key: string) => {
    setProperties((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const uri = name ? `http://ontology.example.com/${name}` : '';

  return (
    <>
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link
            underline="hover"
            color="text.secondary"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/relations');
            }}
          >
            Relations
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            {isEditing ? `Edit ${existingRelation?.name}` : 'Add New Relation'}
          </Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <Button variant="outlined" onClick={() => navigate('/relations')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={() => setSuccessModalOpen(true)}
          >
            Save Relation
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" gap={3} overflow="auto">
        {/* Left Column */}
        <Box flex={1} display="flex" flexDirection="column" gap={3}>
          {/* Basic Info Card */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Info size={20} color="#8b5cf6" />
              <Typography variant="h6" fontWeight={600}>
                Basic Information
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Relation Name *"
                placeholder="e.g., worksFor, hasParent, locatedIn"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                fullWidth
                label="URI"
                placeholder="http://ontology.example.com/worksFor"
                value={uri}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { color: 'text.secondary' } }}
              />
              <TextField
                fullWidth
                label="Description"
                placeholder="Describe the purpose of this relation..."
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
          </Card>

          {/* Domain & Range Card */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3, flex: 1 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <LinkIcon size={20} color="#8b5cf6" />
              <Typography variant="h6" fontWeight={600}>
                Domain & Range
              </Typography>
            </Box>
            <Box display="flex" gap={3} alignItems="flex-start">
              {/* Domain */}
              <Box flex={1} display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Domain (Source Class) *</InputLabel>
                  <Select
                    label="Domain (Source Class) *"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setDomainField(availableFields[e.target.value]?.[0] || '');
                    }}
                    startAdornment={
                      <BoxIcon size={16} color="#8b5cf6" style={{ marginRight: 8 }} />
                    }
                  >
                    {availableClasses.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        {cls}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Source Field</InputLabel>
                  <Select
                    label="Source Field"
                    value={domainField}
                    onChange={(e) => setDomainField(e.target.value)}
                  >
                    {availableFields[domain]?.map((field) => (
                      <MenuItem key={field} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Arrow */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                pt={2}
              >
                <ArrowRight size={24} color="gray" />
              </Box>

              {/* Range */}
              <Box flex={1} display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Range (Target Class) *</InputLabel>
                  <Select
                    label="Range (Target Class) *"
                    value={range}
                    onChange={(e) => {
                      setRange(e.target.value);
                      setRangeField(availableFields[e.target.value]?.[0] || '');
                    }}
                    startAdornment={
                      <BoxIcon size={16} color="#8b5cf6" style={{ marginRight: 8 }} />
                    }
                  >
                    {availableClasses.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        {cls}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Target Field</InputLabel>
                  <Select
                    label="Target Field"
                    value={rangeField}
                    onChange={(e) => setRangeField(e.target.value)}
                  >
                    {availableFields[range]?.map((field) => (
                      <MenuItem key={field} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Right Column */}
        <Box width={360} display="flex" flexDirection="column" gap={3}>
          {/* Preview Card */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Eye size={20} color="#8b5cf6" />
              <Typography variant="h6" fontWeight={600}>
                Relation Preview
              </Typography>
            </Box>
            {/* Preview Content Container */}
            <Box bgcolor="action.hover" borderRadius={2} p={2}>
              {/* Preview Diagram - Single Line */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                {/* Source Box */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  bgcolor="primary.main"
                  px={1.5}
                  py={1}
                  borderRadius={1.5}
                  flexShrink={0}
                >
                  <BoxIcon size={14} color="white" />
                  <Typography fontSize={13} fontWeight={500} color="primary.contrastText">
                    {domain}
                  </Typography>
                </Box>

                {/* Arrow Line with Label */}
                <Box display="flex" alignItems="center" gap={0.5} px={1}>
                  <Typography
                    fontSize={12}
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 80,
                    }}
                  >
                    {name || 'relation'}
                  </Typography>
                  <ArrowRight size={16} color="gray" style={{ flexShrink: 0 }} />
                </Box>

                {/* Target Box */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  border={1}
                  borderColor="divider"
                  px={1.5}
                  py={1}
                  borderRadius={1.5}
                  flexShrink={0}
                >
                  <BoxIcon size={14} />
                  <Typography fontSize={13} fontWeight={500}>
                    {range}
                  </Typography>
                </Box>
              </Box>

              {/* Field Mapping Preview */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                mt={2}
                pt={1.5}
                borderTop={1}
                borderColor="divider"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  bgcolor="background.paper"
                  px={1}
                  py={0.5}
                  borderRadius={1}
                >
                  <Key size={12} color="gray" />
                  <Typography fontSize={11} color="text.secondary">
                    {domainField}
                  </Typography>
                </Box>

                <ArrowRight size={12} color="gray" />

                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  bgcolor="background.paper"
                  px={1}
                  py={0.5}
                  borderRadius={1}
                >
                  <Key size={12} color="gray" />
                  <Typography fontSize={11} color="text.secondary">
                    {rangeField}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Properties Card */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3, flex: 1 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Settings2 size={20} color="#8b5cf6" />
              <Typography variant="h6" fontWeight={600}>
                Properties
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {relationProperties.map((prop) => (
                <Box
                  key={prop.key}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor="action.hover"
                  borderRadius={2}
                  p={1.5}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={properties[prop.key]}
                        onChange={() => handlePropertyChange(prop.key)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">{prop.label}</Typography>
                    }
                    sx={{ m: 0 }}
                  />
                  <Tooltip title={prop.tooltip} arrow>
                    <IconButton size="small">
                      <Info size={14} color="gray" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>

      <SuccessModal
        open={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); navigate('/relations'); }}
      />
    </>
  );
}
