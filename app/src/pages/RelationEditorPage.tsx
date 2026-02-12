import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select, Checkbox, Tooltip } from 'antd';
import {
  ChevronRight, Save, Info, ArrowLeftRight, Eye, Settings,
  Boxes, ArrowRight, Key, Brain,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useHeader } from '../contexts/HeaderContext';

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
  const { setBreadcrumbs, setActions } = useHeader();
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

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/relations'); }}>Relations</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${existingRelation?.name}` : 'Add New Relation'}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <>
        {isEditing && (
          <Button icon={<Brain size={16} />} onClick={() => navigate(`/relations/${relationId}/logic`)}>
            Logic Rules
          </Button>
        )}
        <Button onClick={() => navigate('/relations')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} onClick={() => setSuccessModalOpen(true)}>
          Save Relation
        </Button>
      </>
    );
  }, [setBreadcrumbs, setActions, navigate, isEditing, existingRelation?.name, relationId]);

  const handlePropertyChange = (key: string) => {
    setProperties((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const uri = name ? `http://ontology.example.com/${name}` : '';

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
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Relation Name *</label>
                <Input
                  placeholder="e.g., worksFor, hasParent, locatedIn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>URI</label>
                <Input
                  placeholder="http://ontology.example.com/worksFor"
                  value={uri}
                  readOnly
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea
                  placeholder="Describe the purpose of this relation..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Domain & Range Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <ArrowLeftRight size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                Domain & Range
              </Typography.Title>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              {/* Domain */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Domain (Source Class) *</label>
                  <Select
                    style={{ width: '100%' }}
                    value={domain}
                    onChange={(val) => {
                      setDomain(val);
                      setDomainField(availableFields[val]?.[0] || '');
                    }}
                    options={availableClasses.map((cls) => ({ value: cls, label: cls }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Source Field</label>
                  <Select
                    style={{ width: '100%' }}
                    value={domainField}
                    onChange={(val) => setDomainField(val)}
                    options={availableFields[domain]?.map((field) => ({ value: field, label: field })) || []}
                  />
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 32 }}>
                <ArrowRight size={24} color="gray" />
              </div>

              {/* Range */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Range (Target Class) *</label>
                  <Select
                    style={{ width: '100%' }}
                    value={range}
                    onChange={(val) => {
                      setRange(val);
                      setRangeField(availableFields[val]?.[0] || '');
                    }}
                    options={availableClasses.map((cls) => ({ value: cls, label: cls }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Target Field</label>
                  <Select
                    style={{ width: '100%' }}
                    value={rangeField}
                    onChange={(val) => setRangeField(val)}
                    options={availableFields[range]?.map((field) => ({ value: field, label: field })) || []}
                  />
                </div>
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
                Relation Preview
              </Typography.Title>
            </div>
            {/* Preview Content Container */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16 }}>
              {/* Preview Diagram - Single Line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Source Box */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--primary-color)', padding: '8px 12px', borderRadius: 6, flexShrink: 0,
                }}>
                  <Boxes size={14} color="white" />
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>
                    {domain}
                  </Typography.Text>
                </div>

                {/* Arrow Line with Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
                  <Typography.Text type="secondary" style={{
                    fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', maxWidth: 80,
                  }}>
                    {name || 'relation'}
                  </Typography.Text>
                  <ArrowRight size={16} color="gray" style={{ flexShrink: 0 }} />
                </div>

                {/* Target Box */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 6, flexShrink: 0,
                }}>
                  <Boxes size={14} />
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>
                    {range}
                  </Typography.Text>
                </div>
              </div>

              {/* Field Mapping Preview */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 4,
                }}>
                  <Key size={12} color="gray" />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {domainField}
                  </Typography.Text>
                </div>

                <ArrowRight size={12} color="gray" />

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 4,
                }}>
                  <Key size={12} color="gray" />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {rangeField}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Properties Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Settings size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                Properties
              </Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {relationProperties.map((prop) => (
                <div
                  key={prop.key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12,
                  }}
                >
                  <Checkbox
                    checked={properties[prop.key]}
                    onChange={() => handlePropertyChange(prop.key)}
                  >
                    <Typography.Text style={{ fontSize: 13 }}>{prop.label}</Typography.Text>
                  </Checkbox>
                  <Tooltip title={prop.tooltip}>
                    <Button type="text" size="small" icon={<Info size={14} color="gray" />} />
                  </Tooltip>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); navigate('/relations'); }}
      />
    </>
  );
}
