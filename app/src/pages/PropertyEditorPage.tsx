import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select, Checkbox, Tag } from 'antd';
import {
  ChevronRight, Save, Info, Eye, Boxes, Plus, Type as TypeIcon,
  Hash, Calendar, List, ArrowLeftRight,
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
import { useHeader } from '../contexts/HeaderContext';

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
  String: TypeIcon,
  Text: TypeIcon,
  Integer: Hash,
  Decimal: Hash,
  Boolean: TypeIcon,
  Date: Calendar,
  DateTime: Calendar,
  Enum: List,
};

const usageExamples = [
  { name: 'Person' },
  { name: 'Organization' },
  { name: 'Employee' },
];

export default function PropertyEditorPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
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

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/properties'); }}>Properties</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${existingProperty?.name}` : 'Add New Property'}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <div style={{ display: 'flex', gap: 12 }}>
        <Button onClick={() => navigate('/properties')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} onClick={() => setSuccessModalOpen(true)}>
          Save Property
        </Button>
      </div>
    );
  }, [setBreadcrumbs, setActions, navigate, isEditing, existingProperty?.name]);

  const uri = name ? `http://ontology.example.com/${name}` : '';

  const DataTypeIcon = dataTypeIcons[dataType] || TypeIcon;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Length</Typography.Text>
            <Typography.Text strong style={{ fontSize: 13 }}>{minLength} - {maxLength}</Typography.Text>
          </div>
        );
      case 'Boolean':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Default Value</Typography.Text>
            <Tag color={defaultBoolValue ? 'success' : 'default'}>{defaultBoolValue ? 'True' : 'False'}</Tag>
          </div>
        );
      case 'Enum':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Values</Typography.Text>
            <Typography.Text strong style={{ fontSize: 13 }}>{enumValues.filter(v => v).length} options</Typography.Text>
          </div>
        );
      case 'Integer':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Range</Typography.Text>
            <Typography.Text strong style={{ fontSize: 13 }}>{minIntValue} - {maxIntValue}</Typography.Text>
          </div>
        );
      case 'Decimal':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Precision / Scale</Typography.Text>
              <Typography.Text strong style={{ fontSize: 13 }}>{precision} / {scale}</Typography.Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Range</Typography.Text>
              <Typography.Text strong style={{ fontSize: 13 }}>{minDecValue} - {maxDecValue}</Typography.Text>
            </div>
          </>
        );
      case 'Date':
      case 'DateTime':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Format</Typography.Text>
              <Typography.Text strong style={{ fontSize: 13 }}>{dateFormat}</Typography.Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Range</Typography.Text>
              <Typography.Text strong style={{ fontSize: 13 }}>{minDate} ~ {maxDate}</Typography.Text>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'auto' }}>
        {/* Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Basic Info Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Info size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                Basic Information
              </Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Property Name *</label>
                <Input
                  placeholder="e.g., email, birthDate, salary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>URI</label>
                <Input
                  placeholder="http://ontology.example.com/email"
                  value={uri}
                  readOnly
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea
                  placeholder="Describe the purpose of this property..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Data Type & Constraints Card */}
          <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} styles={{ body: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexShrink: 0 }}>
              <TypeIcon size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                Data Type & Constraints
              </Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'auto' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Data Type *</label>
                <Select
                  style={{ width: '100%' }}
                  value={dataType}
                  onChange={(val) => setDataType(val)}
                  options={dataTypes.map((type) => ({ value: type, label: type }))}
                />
              </div>

              {/* Constraints Section */}
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                  Constraints
                </Typography.Text>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <Checkbox checked={required} onChange={(e) => setRequired(e.target.checked)}>
                    Required
                  </Checkbox>
                  <Checkbox checked={unique} onChange={(e) => setUnique(e.target.checked)}>
                    Unique
                  </Checkbox>
                </div>

                {/* Data Type Specific Constraints */}
                {renderConstraints()}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Preview Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Eye size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                Property Preview
              </Typography.Title>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>Property Name</Typography.Text>
                  <Typography.Text strong style={{ fontSize: 13 }}>{name || 'propertyName'}</Typography.Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>Data Type</Typography.Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DataTypeIcon size={14} color="var(--primary-color)" />
                    <Typography.Text strong style={{ fontSize: 13 }}>{dataType}</Typography.Text>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>Constraints</Typography.Text>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {required && <Tag color="purple">Required</Tag>}
                    {unique && <Tag color="blue">Unique</Tag>}
                    {!required && !unique && (
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>&mdash;</Typography.Text>
                    )}
                  </div>
                </div>
                {renderPreviewConstraints()}
              </div>
            </div>
          </Card>

          {/* Usage Examples Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Boxes size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                Usage Examples
              </Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {usageExamples.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Boxes size={16} color="var(--primary-color)" />
                    <Typography.Text style={{ fontSize: 13 }}>{item.name}</Typography.Text>
                  </div>
                  <ArrowLeftRight size={14} color="gray" />
                </div>
              ))}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 12, cursor: 'pointer',
                }}
              >
                <Plus size={14} color="gray" />
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>Add to Class</Typography.Text>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); navigate('/properties'); }}
      />
    </>
  );
}
