import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select } from 'antd';
import {
  ChevronRight, Save, Database, FileText,
  Plus, Pencil, Trash2, Eye,
  User, Landmark, MapPin, Folder,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useHeader } from '../contexts/HeaderContext';

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
      { name: 'Acme Corp', relation: 'worksFor', targetType: 'Organization', icon: Landmark, color: '#22D3EE' },
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
      { name: 'John Smith', relation: 'employs', targetType: 'Person', icon: User, color: 'var(--primary-color)' },
      { name: 'New York', relation: 'locatedIn', targetType: 'Location', icon: MapPin, color: '#F472B6' },
    ],
  },
};

const classOptions = ['Person', 'Organization', 'Location', 'Event', 'Document'];
const domainOptions = ['Enterprise', 'Healthcare', 'Finance', 'IoT & Sensors'];

export default function InstanceEditorPage() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
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

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/instances'); }}>Instances</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${editingInstance?.name}` : 'Add New Instance'}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <>
        <Button onClick={() => navigate('/instances')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} onClick={() => setSuccessModalOpen(true)}>
          Save Instance
        </Button>
      </>
    );
  }, [setBreadcrumbs, setActions, navigate, isEditing, editingInstance?.name]);

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 24, overflow: 'auto' }}>
        {/* Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Basic Information Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Database size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Basic Information</Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Instance Name *</label>
                <Input
                  placeholder="e.g., John Smith, Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Class *</label>
                <Select
                  style={{ width: '100%' }}
                  value={className || undefined}
                  onChange={(val) => setClassName(val)}
                  placeholder="Select class"
                  options={classOptions.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea
                  placeholder="Brief description of this instance..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Domain</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select domain (optional)"
                  value={domain || undefined}
                  onChange={(val) => setDomain(val)}
                  allowClear
                  onClear={() => setDomain('')}
                  options={domainOptions.map((d) => ({ value: d, label: d }))}
                />
              </div>
            </div>
          </Card>

          {/* Property Values Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={20} color="var(--primary-color)" />
                <Typography.Title level={5} style={{ margin: 0 }}>Property Values</Typography.Title>
              </div>
              <Button icon={<Plus size={16} />}>Add Value</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {properties.map((prop) => (
                <div key={prop.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <div>
                    <Typography.Text strong style={{ fontSize: 13 }}>{prop.key}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{prop.value}</Typography.Text>
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
          {/* Instance Preview Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Eye size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Instance Preview</Typography.Title>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <User size={18} color="var(--primary-color)" />
                <Typography.Text strong style={{ fontSize: 15 }}>{name || 'Instance Name'}</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                {className || 'Class'}{domain ? ` \u2022 ${domain} Domain` : ''}
              </Typography.Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {properties.map((prop) => (
                  <div key={prop.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }} />
                    <Typography.Text style={{ fontSize: 13 }}>{prop.key}: {prop.value}</Typography.Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Relations Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>Relations</Typography.Title>
              <Button icon={<Plus size={16} />}>Add Relation</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {relations.map((rel) => {
                const RelIcon = rel.icon;
                return (
                  <div key={rel.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                    <RelIcon size={16} color={rel.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography.Text strong style={{ fontSize: 13 }}>{rel.name}</Typography.Text>
                      <br />
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {rel.relation} &rarr; {rel.targetType}
                      </Typography.Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        title="Instance Saved"
        description="The instance has been saved successfully. Your changes have been applied."
        onClose={() => { setSuccessModalOpen(false); navigate('/instances'); }}
      />
    </>
  );
}
