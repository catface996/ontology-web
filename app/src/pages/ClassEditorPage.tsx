import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select, Checkbox, Tag, Spin, App } from 'antd';
import {
  ChevronRight, Save, Info, List, Plus, Trash2, Eye,
  Boxes, Brain, ArrowLeftRight,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getClass, createClass, updateClass, listClasses,
  listProperties, listRelations,
  listClassProperties, bindClassProperties, unbindClassProperty,
  type ClassDTO, type PropertyDTO, type RelationDTO,
  type ClassPropertyDTO,
} from '../services/coreService';

export default function ClassEditorPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentOntologyId } = useCurrentOntology();
  const { setBreadcrumbs, setActions } = useHeader();
  const isEditing = classId !== undefined && classId !== 'new';
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [apiClass, setApiClass] = useState<ClassDTO | null>(null);
  const [name, setName] = useState('');
  const [uri, setUri] = useState('');
  const [description, setDescription] = useState('');
  const [parentClassId, setParentClassId] = useState<number | null>(null);
  const [parentOptions, setParentOptions] = useState<{ value: number; label: string }[]>([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Property bind/unbind state
  const [boundProperties, setBoundProperties] = useState<ClassPropertyDTO[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyDTO[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(undefined);
  const [bindIsRequired, setBindIsRequired] = useState(false);
  const [bindIsUnique, setBindIsUnique] = useState(false);
  const [bindDefaultValue, setBindDefaultValue] = useState('');

  // Relations (read-only, filtered from all ontology relations)
  const [allRelations, setAllRelations] = useState<RelationDTO[]>([]);

  // Load class detail when editing
  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getClass(Number(classId));
        if (!cancelled && res.data) {
          setApiClass(res.data);
          setName(res.data.name);
          setUri(res.data.uri ?? '');
          setDescription(res.data.description ?? '');
          setParentClassId(res.data.parentClassId ?? null);
        }
      } catch {
        // fields stay empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [classId, isEditing]);

  // Load parent class options
  useEffect(() => {
    const ontologyId = apiClass?.ontologyId ?? currentOntologyId;
    if (!ontologyId) return;
    (async () => {
      try {
        const res = await listClasses({ ontologyId });
        if (res.data) {
          const opts = res.data
            .filter(c => !isEditing || c.id !== Number(classId))
            .map(c => ({ value: c.id, label: c.name }));
          setParentOptions(opts);
        }
      } catch { /* keep defaults */ }
    })();
  }, [apiClass?.ontologyId, currentOntologyId, isEditing, classId]);

  // Load available properties + relations for the ontology
  useEffect(() => {
    const ontologyId = apiClass?.ontologyId ?? currentOntologyId;
    if (!ontologyId) return;
    (async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          listProperties({ ontologyId }),
          listRelations({ ontologyId }),
        ]);
        setAllProperties(pRes.data ?? []);
        setAllRelations(rRes.data ?? []);
      } catch { /* ignore */ }
    })();
  }, [apiClass?.ontologyId, currentOntologyId]);

  // Load bound properties when editing
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const cpRes = await listClassProperties(Number(classId));
        setBoundProperties(cpRes.data ?? []);
      } catch { /* ignore */ }
    })();
  }, [classId, isEditing]);

  const handleBindProperty = async () => {
    if (!selectedPropertyId || !isEditing) return;
    try {
      await bindClassProperties(Number(classId), [{ propertyId: selectedPropertyId, isRequired: bindIsRequired, isUnique: bindIsUnique, defaultValue: bindDefaultValue || undefined }]);
      message.success('Property bound');
      setSelectedPropertyId(undefined);
      setBindIsRequired(false);
      setBindIsUnique(false);
      setBindDefaultValue('');
      const res = await listClassProperties(Number(classId));
      setBoundProperties(res.data ?? []);
    } catch {
      message.error('Failed to bind property');
    }
  };

  const handleUnbindProperty = async (propertyId: number) => {
    if (!isEditing) return;
    try {
      await unbindClassProperty(Number(classId), propertyId);
      setBoundProperties(prev => prev.filter(p => p.propertyId !== propertyId));
    } catch {
      message.error('Failed to unbind property');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { message.error('Class name is required'); return; }
    if (!uri.trim()) { message.error('URI is required'); return; }
    const ontologyId = apiClass?.ontologyId ?? currentOntologyId;
    if (!ontologyId) { message.error('No ontology selected'); return; }
    setSaving(true);
    try {
      if (isEditing && apiClass) {
        await updateClass({ id: apiClass.id, name, uri, description, parentClassId: parentClassId ?? undefined });
      } else {
        await createClass({ ontologyId, name, uri, description, parentClassId: parentClassId ?? undefined });
      }
      setSuccessModalOpen(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save class');
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
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/classes'); }}>Classes</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${apiClass?.name || name || 'Class'}` : 'Add New Class'}</Typography.Text> },
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
        <Button type="primary" icon={<Save size={16} />} loading={saving} onClick={() => void handleSaveRef.current()}>Save Class</Button>
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, setActions, navigate, isEditing, apiClass?.name, classId, name, saving]);

  // Filter out already-bound items from dropdown options
  const availableProperties = allProperties.filter(p => !boundProperties.some(bp => bp.propertyId === p.id));
  const availablePropertyOptions = availableProperties.map(p => ({ value: p.id, label: p.name }));

  // Relations where this class is domain or range
  const classRelations = isEditing
    ? allRelations.filter(r => r.domainClassId === Number(classId) || r.rangeClassId === Number(classId))
    : [];

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
              <Typography.Title level={5} style={{ margin: 0 }}>Basic Information</Typography.Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Class Name *</label>
                <Input placeholder="e.g., Person, Organization, Product" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>URI *</label>
                <Input placeholder="http://ontology.example.com/Person" value={uri} onChange={(e) => setUri(e.target.value)} />
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
                  value={parentClassId ?? undefined}
                  onChange={(val) => setParentClassId(val ?? null)}
                  allowClear
                  onClear={() => setParentClassId(null)}
                  options={parentOptions}
                />
              </div>
            </div>
          </Card>

          {/* Properties Card — bind/unbind mode */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <List size={20} color="var(--primary-color)" />
                <Typography.Title level={5} style={{ margin: 0 }}>Properties</Typography.Title>
              </div>
            </div>

            {/* Add property dropdown (editing mode only) */}
            {isEditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Select
                    style={{ flex: 1 }}
                    placeholder="Select a property to bind..."
                    value={selectedPropertyId}
                    onChange={(val) => setSelectedPropertyId(val)}
                    options={availablePropertyOptions}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    optionRender={(option) => {
                      const prop = availableProperties.find(p => p.id === option.value);
                      if (!prop) return option.label;
                      const meta: string[] = [prop.dataType];
                      if (prop.constraints) meta.push(prop.constraints);
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '2px 0' }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{prop.name}</span>
                          <span style={{ fontSize: 12, color: '#a1a1aa' }}>{meta.join(' · ')}</span>
                        </div>
                      );
                    }}
                  />
                  <Button icon={<Plus size={16} />} onClick={() => void handleBindProperty()} disabled={!selectedPropertyId}>
                    Bind
                  </Button>
                </div>
                {selectedPropertyId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Checkbox checked={bindIsRequired} onChange={(e) => setBindIsRequired(e.target.checked)}>
                        <Typography.Text style={{ fontSize: 13 }}>Required</Typography.Text>
                      </Checkbox>
                      <Checkbox checked={bindIsUnique} onChange={(e) => setBindIsUnique(e.target.checked)}>
                        <Typography.Text style={{ fontSize: 13 }}>Unique</Typography.Text>
                      </Checkbox>
                    </div>
                    <Input
                      placeholder="Default value (optional)"
                      value={bindDefaultValue}
                      onChange={(e) => setBindDefaultValue(e.target.value)}
                      style={{ maxWidth: 280 }}
                    />
                  </div>
                )}
              </div>
            )}

            {!isEditing && (
              <Typography.Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                Save the class first, then you can bind properties.
              </Typography.Text>
            )}

            {/* Bound properties list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {boundProperties.length === 0 && isEditing && (
                <Typography.Text type="secondary" style={{ fontSize: 13, textAlign: 'center', padding: 16 }}>No properties bound yet</Typography.Text>
              )}
              {boundProperties.map((bp) => (
                <div key={bp.propertyId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <Typography.Text strong style={{ fontSize: 13 }}>{bp.propertyName}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{bp.dataType}</Typography.Text>
                  {bp.isRequired && <Tag color="purple" style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>Required</Tag>}
                  {bp.isUnique && <Tag color="blue" style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>Unique</Tag>}
                  {bp.defaultValue && <Tag style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>Default: {bp.defaultValue}</Tag>}
                  <div style={{ flex: 1 }} />
                  <Button type="text" size="small" icon={<Trash2 size={14} />} onClick={() => void handleUnbindProperty(bp.propertyId)} />
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
                {uri || 'http://ontology.example.com/...'}
              </Typography.Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {boundProperties.map((bp) => (
                  <div key={bp.propertyId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }} />
                    <Typography.Text style={{ fontSize: 13 }}>{bp.propertyName}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{bp.dataType}</Typography.Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Relations Card — read-only */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <ArrowLeftRight size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Relations</Typography.Title>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {classRelations.length === 0 ? (
                <Typography.Text type="secondary" style={{ fontSize: 13, textAlign: 'center', padding: 16 }}>
                  {isEditing ? 'No relations reference this class' : 'Save the class first to see related relations'}
                </Typography.Text>
              ) : classRelations.map((rel) => {
                const cardLabel = rel.cardinality ? ({ ONE_TO_ONE: '1:1', ONE_TO_MANY: '1:N', MANY_TO_ONE: 'N:1', MANY_TO_MANY: 'N:N' } as Record<string, string>)[rel.cardinality] ?? rel.cardinality : null;
                return (
                  <div key={rel.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                    <Typography.Text strong style={{ fontSize: 13 }}>{rel.name}</Typography.Text>
                    {cardLabel && <Tag style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>{cardLabel}</Tag>}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{rel.domainClassName ?? '—'} → {rel.rangeClassName ?? '—'}</Typography.Text>
                  </div>
                );
              })}
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
