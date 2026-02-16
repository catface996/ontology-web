import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, InputNumber, Button, Card, Select, Switch, Spin, App, Tag } from 'antd';
import {
  ChevronRight, Save, Database, FileText,
  Plus, Pencil, Trash2, Eye, Link2,
  User, Landmark, MapPin, Calendar, Folder,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getInstance, createInstance, updateInstance,
  listClasses, listClassProperties,
  listInstancePropertyValues, saveInstancePropertyValues,
  listInstanceRelations, bindInstanceRelation, unbindInstanceRelation,
  listInstances, listRelations,
  type ClassDTO, type ClassPropertyDTO,
  type InstancePropertyValueDTO, type InstanceRelationDTO, type InstanceDTO, type RelationDTO,
} from '../services/coreService';

/* -- Types -- */
interface PropertyField {
  propertyId: number;
  propertyName: string;
  dataType: string;
  isRequired: boolean;
  value: string;
}

interface RelationDisplay {
  id: number;
  relationId: number;
  relationName: string;
  targetInstanceName: string;
  targetClassName: string;
}

/* -- Icon palette -- */
const CLASS_ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  person: User,
  organization: Landmark,
  location: MapPin,
  event: Calendar,
  project: Folder,
};

function getClassIcon(className: string | undefined) {
  return CLASS_ICON_MAP[(className ?? '').toLowerCase()] ?? Database;
}

/* -- Page -- */
export default function InstanceEditorPage() {
  const { instanceId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const isNew = !instanceId || instanceId === 'new';

  // Form state
  const [name, setName] = useState('');
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [properties, setProperties] = useState<PropertyField[]>([]);
  const [relations, setRelations] = useState<RelationDisplay[]>([]);

  // Options
  const [classOptions, setClassOptions] = useState<ClassDTO[]>([]);
  const [relationOptions, setRelationOptions] = useState<RelationDTO[]>([]);
  const [instanceOptions, setInstanceOptions] = useState<{ id: number; classId: number; name: string; className: string }[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Add relation form
  const [addRelationOpen, setAddRelationOpen] = useState(false);
  const [newRelationId, setNewRelationId] = useState<number | undefined>(undefined);
  const [newTargetInstanceId, setNewTargetInstanceId] = useState<number | undefined>(undefined);
  const confirmModal = useModal();

  // Load class options + relation/instance options for Add Relation
  useEffect(() => {
    if (!currentOntologyId) { setLoading(false); return; }
    (async () => {
      try {
        const [classRes, relRes, instRes] = await Promise.allSettled([
          listClasses({ ontologyId: currentOntologyId }),
          listRelations({ ontologyId: currentOntologyId }),
          listInstances({ ontologyId: currentOntologyId, size: 1000 }),
        ]);
        if (classRes.status === 'fulfilled' && classRes.value.data) {
          setClassOptions(classRes.value.data);
        }
        if (relRes.status === 'fulfilled' && relRes.value.data) {
          setRelationOptions(relRes.value.data);
        }
        if (instRes.status === 'fulfilled' && instRes.value.data?.records) {
          setInstanceOptions(instRes.value.data.records.map((inst) => ({ id: inst.id, classId: inst.classId, name: inst.name, className: inst.className })));
        }
      } catch {
        // failed to load options
      }
    })();
  }, [currentOntologyId]);

  // Load existing instance data in edit mode
  useEffect(() => {
    if (isNew) { setLoading(false); return; }
    (async () => {
      try {
        const [instRes, propsRes, relsRes] = await Promise.allSettled([
          getInstance(Number(instanceId)),
          listInstancePropertyValues(Number(instanceId)),
          listInstanceRelations(Number(instanceId)),
        ]);
        if (instRes.status === 'fulfilled' && instRes.value.data) {
          const inst = instRes.value.data as InstanceDTO & Record<string, unknown>;
          setName(inst.name);
          setClassId(inst.classId);
          setDescription(inst.description ?? '');
          setDomain((inst.domain ?? '') as string);
        }
        if (propsRes.status === 'fulfilled' && propsRes.value.data) {
          setProperties(propsRes.value.data.map((pv: InstancePropertyValueDTO) => ({
            propertyId: pv.propertyId,
            propertyName: pv.propertyName,
            dataType: pv.dataType,
            isRequired: false,
            value: pv.value,
          })));
        }
        if (relsRes.status === 'fulfilled' && relsRes.value.data) {
          setRelations(relsRes.value.data.map((r: InstanceRelationDTO) => ({
            id: r.id,
            relationId: r.relationId,
            relationName: r.relationName,
            targetInstanceName: r.targetInstanceName,
            targetClassName: r.targetClassName,
          })));
        }
      } catch {
        message.error('Failed to load instance');
      } finally {
        setLoading(false);
      }
    })();
  }, [instanceId, isNew, message]);

  // Load class properties when class changes
  useEffect(() => {
    if (!classId) return;
    (async () => {
      try {
        const res = await listClassProperties(classId);
        if (res.data) {
          // Preserve existing values for properties that still exist
          setProperties((prev) => {
            const prevMap = new Map(prev.map((p) => [p.propertyId, p.value]));
            return res.data!.map((cp: ClassPropertyDTO) => ({
              propertyId: cp.propertyId,
              propertyName: cp.propertyName,
              dataType: cp.dataType,
              isRequired: cp.isRequired,
              value: prevMap.get(cp.propertyId) ?? '',
            }));
          });
        }
      } catch {
        // failed to load class properties
      }
    })();
  }, [classId]);

  // Header
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/instances'); }}>Instances</a> },
          { title: <Typography.Text strong>{isNew ? 'Add New Instance' : `Edit ${name}`}</Typography.Text> },
        ]}
      />
    );
    setActions(
      <>
        <Button onClick={() => navigate('/instances')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} loading={saving} onClick={handleSave}>
          Save Instance
        </Button>
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, setActions, navigate, isNew, name, saving]);

  // Save handler
  const handleSave = async () => {
    if (!name.trim()) { message.error('Instance name is required'); return; }
    if (!classId) { message.error('Please select a class'); return; }
    if (!currentOntologyId) { message.error('No ontology selected'); return; }

    setSaving(true);
    try {
      let savedId: number;
      if (isNew) {
        const res = await createInstance({
          ontologyId: currentOntologyId,
          classId,
          name: name.trim(),
          description: description.trim() || undefined,
          domain: domain || undefined,
        });
        savedId = res.data?.id ?? 0;
      } else {
        await updateInstance({
          id: Number(instanceId),
          name: name.trim(),
          classId,
          description: description.trim() || undefined,
          domain: domain || undefined,
        });
        savedId = Number(instanceId);
      }

      // Save property values
      if (savedId && properties.length > 0) {
        await saveInstancePropertyValues({
          instanceId: savedId,
          values: properties.map((p) => ({ propertyId: p.propertyId, value: p.value })),
        });
      }

      setSuccessModalOpen(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save instance');
    } finally {
      setSaving(false);
    }
  };

  // Add relation handler
  const handleAddRelation = async () => {
    if (!newRelationId || !newTargetInstanceId || isNew) return;
    try {
      await bindInstanceRelation({
        sourceInstanceId: Number(instanceId),
        relationId: newRelationId,
        targetInstanceId: newTargetInstanceId,
      });
      // Reload relations
      const res = await listInstanceRelations(Number(instanceId));
      if (res.data) {
        setRelations(res.data.map((r: InstanceRelationDTO) => ({
          id: r.id,
          relationName: r.relationName,
          targetInstanceName: r.targetInstanceName,
          targetClassName: r.targetClassName,
        })));
      }
      setAddRelationOpen(false);
      setNewRelationId(undefined);
      setNewTargetInstanceId(undefined);
      message.success('Relation added');
    } catch {
      message.error('Failed to add relation');
    }
  };

  // Remove relation handler
  const handleRemoveRelation = async (relationBindingId: number) => {
    try {
      await unbindInstanceRelation(relationBindingId);
      setRelations((prev) => prev.filter((r) => r.id !== relationBindingId));
      message.success('Relation removed');
    } catch {
      message.error('Failed to remove relation');
    }
  };

  // Update a property value
  const updatePropertyValue = (propertyId: number, value: string) => {
    setProperties((prev) => prev.map((p) => p.propertyId === propertyId ? { ...p, value } : p));
  };

  // Render property input based on dataType
  const renderPropertyInput = (field: PropertyField) => {
    const dt = (field.dataType ?? '').toLowerCase();
    if (dt.includes('integer') || dt.includes('decimal') || dt.includes('float') || dt.includes('double')) {
      return (
        <InputNumber
          style={{ width: '100%' }}
          value={field.value ? Number(field.value) : undefined}
          onChange={(val) => updatePropertyValue(field.propertyId, val != null ? String(val) : '')}
          placeholder={`Enter ${field.propertyName}...`}
        />
      );
    }
    if (dt.includes('boolean')) {
      return (
        <Switch
          checked={field.value === 'true'}
          onChange={(checked) => updatePropertyValue(field.propertyId, String(checked))}
        />
      );
    }
    if (dt.includes('date')) {
      return (
        <Input
          type="date"
          value={field.value}
          onChange={(e) => updatePropertyValue(field.propertyId, e.target.value)}
        />
      );
    }
    // Default: text input
    return (
      <Input
        value={field.value}
        onChange={(e) => updatePropertyValue(field.propertyId, e.target.value)}
        placeholder={`Enter ${field.propertyName}...`}
      />
    );
  };

  const selectedClassName = classOptions.find((c) => c.id === classId)?.name ?? '';
  const ClassIcon = getClassIcon(selectedClassName);

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

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
                  value={classId}
                  onChange={(val) => setClassId(val)}
                  placeholder="Select class"
                  options={classOptions.map((c) => ({ value: c.id, label: c.name }))}
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
                <Input
                  placeholder="e.g., Enterprise, Healthcare"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
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
                {properties.length > 0 && (
                  <div style={{ backgroundColor: '#1a1a24', borderRadius: 100, padding: '2px 10px' }}>
                    <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{properties.length} properties</Typography.Text>
                  </div>
                )}
              </div>
            </div>
            {!classId ? (
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>Select a class to load its properties</Typography.Text>
            ) : properties.length === 0 ? (
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>No properties defined for this class</Typography.Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {properties.map((field) => (
                  <div key={field.propertyId} style={{ padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography.Text strong style={{ fontSize: 13 }}>{field.propertyName}</Typography.Text>
                        {field.isRequired && <Typography.Text type="danger" style={{ fontSize: 11 }}>*</Typography.Text>}
                      </div>
                      <Typography.Text style={{ fontSize: 11, color: '#71717a' }}>{field.dataType}</Typography.Text>
                    </div>
                    {renderPropertyInput(field)}
                  </div>
                ))}
              </div>
            )}
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
                <ClassIcon size={18} color="var(--primary-color)" />
                <Typography.Text strong style={{ fontSize: 15 }}>{name || 'Instance Name'}</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                {selectedClassName || 'Class'}{domain ? ` \u2022 ${domain}` : ''}
              </Typography.Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {properties.filter((p) => p.value).map((prop) => (
                  <div key={prop.propertyId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }} />
                    <Typography.Text style={{ fontSize: 13 }}>{prop.propertyName}: {prop.value}</Typography.Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Relations Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link2 size={20} color="var(--primary-color)" />
                <Typography.Title level={5} style={{ margin: 0 }}>Relations</Typography.Title>
              </div>
              {!isNew && (
                <Button icon={<Plus size={16} />} onClick={() => setAddRelationOpen(true)}>Add Relation</Button>
              )}
            </div>

            {/* Add Relation Form */}
            {addRelationOpen && (() => {
              const selectedRelation = relationOptions.find((r) => r.id === newRelationId);
              // Filter relations: only show those whose domainClassId matches current instance's class (or has no domain constraint)
              const filteredRelations = relationOptions.filter(
                (r) => !r.domainClassId || !classId || r.domainClassId === classId
              );
              // Filter target instances: if selected relation has rangeClassId, only show matching instances
              const filteredInstances = instanceOptions
                .filter((inst) => inst.id !== Number(instanceId))
                .filter((inst) => !selectedRelation?.rangeClassId || inst.classId === selectedRelation.rangeClassId);
              // Domain mismatch warning
              const domainMismatch = selectedRelation?.domainClassId && classId && selectedRelation.domainClassId !== classId;

              return (
                <div style={{ padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select relation"
                    value={newRelationId}
                    onChange={(val) => { setNewRelationId(val); setNewTargetInstanceId(undefined); }}
                    options={filteredRelations.map((r) => ({ value: r.id, label: r.name }))}
                  />
                  {selectedRelation && (
                    <Tag style={{ fontSize: 11, alignSelf: 'flex-start' }}>
                      {({ ONE_TO_ONE: '1 : 1', ONE_TO_MANY: '1 : N', MANY_TO_ONE: 'N : 1', MANY_TO_MANY: 'N : N' } as Record<string, string>)[selectedRelation.cardinality] ?? selectedRelation.cardinality}
                    </Tag>
                  )}
                  {domainMismatch && (
                    <Typography.Text type="warning" style={{ fontSize: 12, color: '#fbbf24' }}>
                      Warning: This relation expects domain class "{selectedRelation?.domainClassName}", but current instance is "{selectedClassName}".
                    </Typography.Text>
                  )}
                  <Select
                    style={{ width: '100%' }}
                    placeholder={selectedRelation?.rangeClassId ? `Select ${selectedRelation.rangeClassName} instance` : 'Select target instance'}
                    showSearch
                    filterOption={(input, option) => (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())}
                    value={newTargetInstanceId}
                    onChange={(val) => setNewTargetInstanceId(val)}
                    options={filteredInstances.map((inst) => ({ value: inst.id, label: `${inst.name} (${inst.className})` }))}
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => { setAddRelationOpen(false); setNewRelationId(undefined); setNewTargetInstanceId(undefined); }}>Cancel</Button>
                    <Button size="small" type="primary" disabled={!newRelationId || !newTargetInstanceId} onClick={handleAddRelation}>Add</Button>
                  </div>
                </div>
              );
            })()}

            {isNew ? (
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>Save the instance first to manage relations</Typography.Text>
            ) : relations.length === 0 ? (
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>No relations yet</Typography.Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {relations.map((rel) => {
                  const TargetIcon = getClassIcon(rel.targetClassName);
                  return (
                    <div key={rel.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                      <TargetIcon size={16} color="var(--primary-color)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Typography.Text strong style={{ fontSize: 13 }}>{rel.targetInstanceName}</Typography.Text>
                          {(() => {
                            const relDef = relationOptions.find((r) => r.id === rel.relationId);
                            if (!relDef?.cardinality) return null;
                            const label = ({ ONE_TO_ONE: '1:1', ONE_TO_MANY: '1:N', MANY_TO_ONE: 'N:1', MANY_TO_MANY: 'N:N' } as Record<string, string>)[relDef.cardinality] ?? relDef.cardinality;
                            return <Tag style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>{label}</Tag>;
                          })()}
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {rel.relationName} &rarr; {rel.targetClassName}
                        </Typography.Text>
                      </div>
                      <Button type="text" size="small" icon={<Trash2 size={14} />} onClick={() => {
                        confirmModal.confirm.delete({
                          title: 'Delete Relation?',
                          description: `Are you sure you want to remove the relation "${rel.relationName}" to "${rel.targetInstanceName}"? This action cannot be undone.`,
                          confirmName: rel.targetInstanceName,
                          confirmLabel: 'the target instance name',
                          onConfirm: () => handleRemoveRelation(rel.id),
                        });
                      }} />
                    </div>
                  );
                })}
              </div>
            )}
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
