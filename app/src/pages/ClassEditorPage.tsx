import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select } from 'antd';
import {
  ChevronRight, Save, Info, List, Plus, Pencil, Trash2, Eye,
  Boxes, User, Building2, MapPin, Calendar, FileText, Brain,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useHeader } from '../contexts/HeaderContext';

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
  { id: '1', name: 'Entity', description: 'Base class for all entities in the knowledge graph', parent: null, properties: 5, instances: 0, icon: Boxes, color: 'var(--primary-color)' },
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
  const { setBreadcrumbs, setActions } = useHeader();
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

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/classes'); }}>Classes</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${editingClass?.name}` : 'Add New Class'}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <>
        {isEditing && (
          <Button icon={<Brain size={16} />} onClick={() => navigate(`/classes/${classId}/logic`)}>
            Logic Rules
          </Button>
        )}
        <Button onClick={() => navigate('/classes')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} onClick={() => setSuccessModalOpen(true)}>Save Class</Button>
      </>
    );
  }, [setBreadcrumbs, setActions, navigate, isEditing, editingClass?.name, classId]);

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
              <Typography.Title level={5} style={{ margin: 0 }}>Basic Information</Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Class Name *</label>
                <Input placeholder="e.g., Person, Organization, Product" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>URI</label>
                <Input placeholder="http://ontology.example.com/Person" value={name ? `http://ontology.example.com/${name}` : ''} readOnly />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea placeholder="Describe the purpose and usage of this class..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Parent Class</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select parent class (optional)"
                  value={parent || undefined}
                  onChange={(val) => setParent(val)}
                  allowClear
                  onClear={() => setParent('')}
                  options={[
                    { value: 'Entity', label: 'Entity' },
                    { value: 'Thing', label: 'Thing' },
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Properties Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <List size={20} color="var(--primary-color)" />
                <Typography.Title level={5} style={{ margin: 0 }}>Properties</Typography.Title>
              </div>
              <Button icon={<Plus size={16} />}>Add Property</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {defaultProperties.map((prop) => (
                <div key={prop.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <div>
                    <Typography.Text strong style={{ fontSize: 13 }}>{prop.name}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{prop.type} &bull; {prop.constraint}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="text" size="small" icon={<Pencil size={16} />} />
                    <Button type="text" size="small" icon={<Trash2 size={16} />} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Preview Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Eye size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Class Preview</Typography.Title>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Boxes size={18} color="var(--primary-color)" />
                <Typography.Text strong style={{ fontSize: 15 }}>{name || 'ClassName'}</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                {name ? `http://ontology.example.com/${name}` : 'http://ontology.example.com/...'}
              </Typography.Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {defaultProperties.map((prop) => (
                  <div key={prop.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }} />
                    <Typography.Text style={{ fontSize: 13 }}>{prop.name}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{prop.type}</Typography.Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Relations Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>Relations</Typography.Title>
              <Button icon={<Plus size={16} />}>Add</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {defaultRelations.map((rel) => (
                <div key={rel.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <div>
                    <Typography.Text strong style={{ fontSize: 13 }}>{rel.name}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>&rarr; {rel.target} &bull; {rel.type}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="text" size="small" icon={<Pencil size={16} />} />
                    <Button type="text" size="small" icon={<Trash2 size={16} />} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); navigate('/classes'); }}
      />
    </>
  );
}
