import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select, Spin, App } from 'antd';
import {
  ChevronRight, Save, Info, Eye, Plus, Type as TypeIcon,
  Hash, Calendar, List,
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
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getProperty, createProperty, updateProperty,
  type PropertyDTO,
} from '../services/coreService';

const dataTypes = ['String', 'Text', 'Integer', 'Decimal', 'Boolean', 'Date', 'DateTime', 'Enum'];

const dataTypeIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  String: TypeIcon, Text: TypeIcon, Integer: Hash, Decimal: Hash,
  Boolean: TypeIcon, Date: Calendar, DateTime: Calendar, Enum: List,
};

export default function PropertyEditorPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const isEditing = propertyId && propertyId !== 'new';

  const [loading, setLoading] = useState(!!isEditing);
  const [saving, setSaving] = useState(false);
  const [apiProperty, setApiProperty] = useState<PropertyDTO | null>(null);

  // Basic Info
  const [name, setName] = useState('');
  const [uri, setUri] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState('String');

  // Constraint state
  const [minLength, setMinLength] = useState(0);
  const [maxLength, setMaxLength] = useState(255);
  const [defaultBoolValue, setDefaultBoolValue] = useState(false);
  const [enumValues, setEnumValues] = useState<string[]>(['']);
  const [minIntValue, setMinIntValue] = useState(0);
  const [maxIntValue, setMaxIntValue] = useState(999);
  const [precision, setPrecision] = useState(2);
  const [scale, setScale] = useState(2);
  const [minDecValue, setMinDecValue] = useState(0);
  const [maxDecValue, setMaxDecValue] = useState(999999999.99);
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [minDate, setMinDate] = useState('1900-01-01');
  const [maxDate, setMaxDate] = useState('2099-12-31');

  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Load property when editing
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const res = await getProperty(Number(propertyId));
        if (res.data) {
          const p = res.data;
          setApiProperty(p);
          setName(p.name);
          setUri(p.uri ?? '');
          setDescription(p.description ?? '');
          setDataType(p.dataType ?? 'String');
          // Parse constraints JSON
          if (p.constraints) {
            try {
              const c = JSON.parse(p.constraints);
              if (c.minLength !== undefined) setMinLength(c.minLength);
              if (c.maxLength !== undefined) setMaxLength(c.maxLength);
              if (c.defaultBoolValue !== undefined) setDefaultBoolValue(c.defaultBoolValue);
              if (c.enumValues) setEnumValues(c.enumValues);
              if (c.minValue !== undefined) setMinIntValue(c.minValue);
              if (c.maxValue !== undefined) setMaxIntValue(c.maxValue);
              if (c.precision !== undefined) setPrecision(c.precision);
              if (c.scale !== undefined) setScale(c.scale);
              if (c.minDecValue !== undefined) setMinDecValue(c.minDecValue);
              if (c.maxDecValue !== undefined) setMaxDecValue(c.maxDecValue);
              if (c.dateFormat) setDateFormat(c.dateFormat);
              if (c.minDate) setMinDate(c.minDate);
              if (c.maxDate) setMaxDate(c.maxDate);
            } catch { /* ignore parse errors */ }
          }
        }
      } catch {
        message.error('Failed to load property');
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId, isEditing]);

  const buildConstraintsJson = (): string | undefined => {
    switch (dataType) {
      case 'String': case 'Text':
        return JSON.stringify({ minLength, maxLength });
      case 'Boolean':
        return JSON.stringify({ defaultBoolValue });
      case 'Enum':
        return JSON.stringify({ enumValues: enumValues.filter(v => v) });
      case 'Integer':
        return JSON.stringify({ minValue: minIntValue, maxValue: maxIntValue });
      case 'Decimal':
        return JSON.stringify({ precision, scale, minDecValue, maxDecValue });
      case 'Date': case 'DateTime':
        return JSON.stringify({ dateFormat, minDate, maxDate });
      default:
        return undefined;
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { message.error('Property name is required'); return; }
    const ontologyId = apiProperty?.ontologyId ?? currentOntologyId;
    if (!ontologyId) { message.error('No ontology selected'); return; }
    setSaving(true);
    try {
      const constraints = buildConstraintsJson();
      if (isEditing) {
        await updateProperty({ id: Number(propertyId), name, uri, description, dataType, constraints });
      } else {
        await createProperty({ ontologyId, name, uri, description, dataType, constraints });
      }
      setSuccessModalOpen(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/properties'); }}>Properties</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${apiProperty?.name || name || 'Property'}` : 'Add New Property'}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <div style={{ display: 'flex', gap: 12 }}>
        <Button onClick={() => navigate('/properties')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} loading={saving} onClick={() => void handleSaveRef.current()}>
          Save Property
        </Button>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, setActions, navigate, isEditing, apiProperty?.name, name, saving]);

  const autoUri = name ? `http://ontology.example.com/${name}` : '';
  const DataTypeIcon = dataTypeIcons[dataType] || TypeIcon;

  const renderConstraints = () => {
    switch (dataType) {
      case 'String': case 'Text':
        return <StringConstraints minLength={minLength} maxLength={maxLength} onMinLengthChange={setMinLength} onMaxLengthChange={setMaxLength} />;
      case 'Boolean':
        return <BooleanConstraints defaultValue={defaultBoolValue} onDefaultValueChange={setDefaultBoolValue} />;
      case 'Enum':
        return <EnumConstraints enumValues={enumValues} onEnumValuesChange={setEnumValues} />;
      case 'Integer':
        return <IntegerConstraints minValue={minIntValue} maxValue={maxIntValue} onMinValueChange={setMinIntValue} onMaxValueChange={setMaxIntValue} />;
      case 'Decimal':
        return <DecimalConstraints precision={precision} scale={scale} minValue={minDecValue} maxValue={maxDecValue} onPrecisionChange={setPrecision} onScaleChange={setScale} onMinValueChange={setMinDecValue} onMaxValueChange={setMaxDecValue} />;
      case 'Date': case 'DateTime':
        return <DateConstraints dateFormat={dateFormat} minDate={minDate} maxDate={maxDate} onDateFormatChange={setDateFormat} onMinDateChange={setMinDate} onMaxDateChange={setMaxDate} />;
      default: return null;
    }
  };

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'auto' }}>
        {/* Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Basic Info Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Info size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>Basic Information</Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Property Name *</label>
                <Input placeholder="e.g., email, birthDate, salary" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>URI</label>
                <Input placeholder="http://ontology.example.com/email" value={uri || autoUri} onChange={(e) => setUri(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea placeholder="Describe the purpose of this property..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Data Type & Constraints Card */}
          <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} styles={{ body: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexShrink: 0 }}>
              <TypeIcon size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>Data Type & Constraints</Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'auto' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Data Type *</label>
                <Select style={{ width: '100%' }} value={dataType} onChange={(val) => setDataType(val)} options={dataTypes.map((t) => ({ value: t, label: t }))} />
              </div>
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Constraints</Typography.Text>
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
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>Property Preview</Typography.Title>
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
                  <Typography.Text style={{ fontSize: 13 }}>{buildConstraintsJson() ?? '—'}</Typography.Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SuccessModal open={successModalOpen} onClose={() => { setSuccessModalOpen(false); navigate('/properties'); }} />
    </>
  );
}
