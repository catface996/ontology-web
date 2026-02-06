import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, TextField, Button, Card,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  Chip,
} from '@mui/material';
import {
  ChevronRight, Save, Info, Type, Eye, Layers, Box as BoxIcon,
  ExternalLink, Plus, ToggleLeft, Hash, Calendar, List,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import {
  StringConstraints,
  BooleanConstraints,
  EnumConstraints,
  IntegerConstraints,
  DecimalConstraints,
  DateConstraints,
} from '../components/PropertyConstraints';

interface PropertyData {
  id: string;
  name: string;
  description: string;
  dataType: string;
  required: boolean;
  unique: boolean;
}

const existingProperties: Record<string, PropertyData> = {
  '1': { id: '1', name: 'name', description: 'The display name or title of an entity', dataType: 'String', required: true, unique: false },
  '2': { id: '2', name: 'email', description: 'Contact email address for persons and organizations', dataType: 'String', required: true, unique: true },
  '3': { id: '3', name: 'age', description: 'The age of a person in years', dataType: 'Integer', required: false, unique: false },
  '4': { id: '4', name: 'isActive', description: 'Whether the entity is currently active', dataType: 'Boolean', required: true, unique: false },
  '5': { id: '5', name: 'status', description: 'Current status of the entity', dataType: 'Enum', required: true, unique: false },
  '6': { id: '6', name: 'birthDate', description: 'Date of birth', dataType: 'Date', required: false, unique: false },
};

const dataTypes = ['String', 'Text', 'Integer', 'Decimal', 'Boolean', 'Date', 'DateTime', 'Enum'];

const dataTypeIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  String: Type,
  Text: Type,
  Integer: Hash,
  Decimal: Hash,
  Boolean: ToggleLeft,
  Date: Calendar,
  DateTime: Calendar,
  Enum: List,
};

const usageExamples = [
  { name: 'Person', icon: BoxIcon },
  { name: 'Organization', icon: BoxIcon },
  { name: 'Employee', icon: BoxIcon },
];

export default function PropertyEditorPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const isEditing = propertyId && propertyId !== 'new';
  const existingProperty = isEditing ? existingProperties[propertyId] : null;

  // Basic Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState('String');
  const [required, setRequired] = useState(true);
  const [unique, setUnique] = useState(false);

  // String/Text constraints
  const [minLength, setMinLength] = useState(0);
  const [maxLength, setMaxLength] = useState(255);

  // Boolean constraints
  const [defaultBoolValue, setDefaultBoolValue] = useState(false);

  // Enum constraints
  const [enumValues, setEnumValues] = useState<string[]>(['PENDING', 'ACTIVE', 'COMPLETED']);

  // Integer constraints
  const [minIntValue, setMinIntValue] = useState(0);
  const [maxIntValue, setMaxIntValue] = useState(999);

  // Decimal constraints
  const [precision, setPrecision] = useState(2);
  const [scale, setScale] = useState(2);
  const [minDecValue, setMinDecValue] = useState(0);
  const [maxDecValue, setMaxDecValue] = useState(999999999.99);

  // Date constraints
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [minDate, setMinDate] = useState('1900-01-01');
  const [maxDate, setMaxDate] = useState('2099-12-31');

  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (existingProperty) {
      setName(existingProperty.name);
      setDescription(existingProperty.description);
      setDataType(existingProperty.dataType);
      setRequired(existingProperty.required);
      setUnique(existingProperty.unique);
    }
  }, [existingProperty]);

  const uri = name ? `http://ontology.example.com/${name}` : '';

  const DataTypeIcon = dataTypeIcons[dataType] || Type;

  const renderConstraints = () => {
    switch (dataType) {
      case 'String':
      case 'Text':
        return (
          <StringConstraints
            minLength={minLength}
            maxLength={maxLength}
            onMinLengthChange={setMinLength}
            onMaxLengthChange={setMaxLength}
          />
        );
      case 'Boolean':
        return (
          <BooleanConstraints
            defaultValue={defaultBoolValue}
            onDefaultValueChange={setDefaultBoolValue}
          />
        );
      case 'Enum':
        return (
          <EnumConstraints
            enumValues={enumValues}
            onEnumValuesChange={setEnumValues}
          />
        );
      case 'Integer':
        return (
          <IntegerConstraints
            minValue={minIntValue}
            maxValue={maxIntValue}
            onMinValueChange={setMinIntValue}
            onMaxValueChange={setMaxIntValue}
          />
        );
      case 'Decimal':
        return (
          <DecimalConstraints
            precision={precision}
            scale={scale}
            minValue={minDecValue}
            maxValue={maxDecValue}
            onPrecisionChange={setPrecision}
            onScaleChange={setScale}
            onMinValueChange={setMinDecValue}
            onMaxValueChange={setMaxDecValue}
          />
        );
      case 'Date':
      case 'DateTime':
        return (
          <DateConstraints
            dateFormat={dateFormat}
            minDate={minDate}
            maxDate={maxDate}
            onDateFormatChange={setDateFormat}
            onMinDateChange={setMinDate}
            onMaxDateChange={setMaxDate}
          />
        );
      default:
        return null;
    }
  };

  const renderPreviewConstraints = () => {
    switch (dataType) {
      case 'String':
      case 'Text':
        return (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Length
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {minLength} - {maxLength}
            </Typography>
          </Box>
        );
      case 'Boolean':
        return (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Default Value
            </Typography>
            <Chip
              label={defaultBoolValue ? 'True' : 'False'}
              size="small"
              color={defaultBoolValue ? 'success' : 'default'}
              sx={{ height: 22, fontSize: 11 }}
            />
          </Box>
        );
      case 'Enum':
        return (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Values
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {enumValues.filter(v => v).length} options
            </Typography>
          </Box>
        );
      case 'Integer':
        return (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Range
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {minIntValue} - {maxIntValue}
            </Typography>
          </Box>
        );
      case 'Decimal':
        return (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Precision / Scale
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {precision} / {scale}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Range
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {minDecValue} - {maxDecValue}
              </Typography>
            </Box>
          </>
        );
      case 'Date':
      case 'DateTime':
        return (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Format
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {dateFormat}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Range
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {minDate} ~ {maxDate}
              </Typography>
            </Box>
          </>
        );
      default:
        return null;
    }
  };

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
              navigate('/properties');
            }}
          >
            Properties
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            {isEditing ? `Edit ${existingProperty?.name}` : 'Add New Property'}
          </Typography>
        </Breadcrumbs>
        <Box display="flex" gap={1.5}>
          <Button variant="outlined" onClick={() => navigate('/properties')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={() => setSuccessModalOpen(true)}
          >
            Save Property
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
                label="Property Name *"
                placeholder="e.g., email, birthDate, salary"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                fullWidth
                label="URI"
                placeholder="http://ontology.example.com/email"
                value={uri}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { color: 'text.secondary' } }}
              />
              <TextField
                fullWidth
                label="Description"
                placeholder="Describe the purpose of this property..."
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
          </Card>

          {/* Data Type & Constraints Card */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5} flexShrink={0}>
              <Type size={20} color="#8b5cf6" />
              <Typography variant="h6" fontWeight={600}>
                Data Type & Constraints
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={2} flex={1} overflow="auto">
              <FormControl fullWidth>
                <InputLabel>Data Type *</InputLabel>
                <Select
                  label="Data Type *"
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                >
                  {dataTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Constraints Section */}
              <Box pt={2} borderTop={1} borderColor="divider">
                <Typography variant="body2" fontWeight={500} mb={1.5}>
                  Constraints
                </Typography>
                <Box display="flex" gap={3} mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={required}
                        onChange={(e) => setRequired(e.target.checked)}
                      />
                    }
                    label="Required"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={unique}
                        onChange={(e) => setUnique(e.target.checked)}
                      />
                    }
                    label="Unique"
                  />
                </Box>

                {/* Data Type Specific Constraints */}
                {renderConstraints()}
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
                Property Preview
              </Typography>
            </Box>
            <Box bgcolor="action.hover" borderRadius={2} p={2}>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Property Name
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {name || 'propertyName'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Data Type
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <DataTypeIcon size={14} color="#8b5cf6" />
                    <Typography variant="body2" fontWeight={500}>
                      {dataType}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Constraints
                  </Typography>
                  <Box display="flex" gap={0.5}>
                    {required && (
                      <Chip label="Required" size="small" color="primary" sx={{ height: 22, fontSize: 11 }} />
                    )}
                    {unique && (
                      <Chip label="Unique" size="small" color="info" sx={{ height: 22, fontSize: 11 }} />
                    )}
                    {!required && !unique && (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </Box>
                </Box>
                {renderPreviewConstraints()}
              </Box>
            </Box>
          </Card>

          {/* Usage Examples Card */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3, flex: 1 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Layers size={20} color="#8b5cf6" />
              <Typography variant="h6" fontWeight={600}>
                Usage Examples
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {usageExamples.map((item) => (
                <Box
                  key={item.name}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor="action.hover"
                  borderRadius={2}
                  p={1.5}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.selected' } }}
                >
                  <Box display="flex" alignItems="center" gap={1.25}>
                    <item.icon size={16} color="#8b5cf6" />
                    <Typography variant="body2">{item.name}</Typography>
                  </Box>
                  <ExternalLink size={14} color="gray" />
                </Box>
              ))}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                border={1}
                borderColor="divider"
                borderRadius={2}
                p={1.5}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Plus size={14} color="gray" />
                <Typography variant="body2" color="text.secondary">
                  Add to Class
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      <SuccessModal
        open={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); navigate('/properties'); }}
      />
    </>
  );
}
