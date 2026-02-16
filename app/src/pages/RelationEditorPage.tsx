import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Select, Checkbox, Tooltip, Spin, App } from 'antd';
import {
  ChevronRight, Save, Info, ArrowLeftRight, Eye, Settings,
  Boxes, ArrowRight, Brain,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getRelation, createRelation, updateRelation, listClasses,
  type RelationDTO, type ClassDTO,
} from '../services/coreService';

const relationProperties = [
  { key: 'isFunctional', label: 'Functional', tooltip: 'Each source entity can be related to at most one target entity' },
  { key: 'isInverseFunctional', label: 'Inverse Functional', tooltip: 'Each target entity can be related to at most one source entity' },
  { key: 'isSymmetric', label: 'Symmetric', tooltip: 'If A is related to B, then B is also related to A' },
  { key: 'isTransitive', label: 'Transitive', tooltip: 'If A is related to B and B is related to C, then A is related to C' },
];

export default function RelationEditorPage() {
  const { relationId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const isEditing = relationId && relationId !== 'new';

  const [loading, setLoading] = useState(!!isEditing);
  const [saving, setSaving] = useState(false);
  const [apiRelation, setApiRelation] = useState<RelationDTO | null>(null);
  const [classOptions, setClassOptions] = useState<{ value: number; label: string }[]>([]);

  const [name, setName] = useState('');
  const [uri, setUri] = useState('');
  const [description, setDescription] = useState('');
  const [domainClassId, setDomainClassId] = useState<number | null>(null);
  const [rangeClassId, setRangeClassId] = useState<number | null>(null);
  const [cardinality, setCardinality] = useState('MANY_TO_MANY');
  const [props, setProps] = useState<Record<string, boolean>>({
    isFunctional: false,
    isInverseFunctional: false,
    isSymmetric: false,
    isTransitive: false,
  });
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Load class options
  useEffect(() => {
    const ontologyId = apiRelation?.ontologyId ?? currentOntologyId;
    if (!ontologyId) return;
    (async () => {
      try {
        const res = await listClasses({ ontologyId });
        if (res.data) {
          setClassOptions(res.data.map((c: ClassDTO) => ({ value: c.id, label: c.name })));
        }
      } catch { /* ignore */ }
    })();
  }, [apiRelation?.ontologyId, currentOntologyId]);

  // Load relation when editing
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const res = await getRelation(Number(relationId));
        if (res.data) {
          const r = res.data;
          setApiRelation(r);
          setName(r.name);
          setUri(r.uri ?? '');
          setDescription(r.description ?? '');
          setDomainClassId(r.domainClassId ?? null);
          setRangeClassId(r.rangeClassId ?? null);
          setCardinality(r.cardinality ?? 'MANY_TO_MANY');
          setProps({
            isFunctional: r.isFunctional ?? false,
            isInverseFunctional: r.isInverseFunctional ?? false,
            isSymmetric: r.isSymmetric ?? false,
            isTransitive: r.isTransitive ?? false,
          });
        }
      } catch {
        message.error('Failed to load relation');
      } finally {
        setLoading(false);
      }
    })();
  }, [relationId, isEditing]);

  const handleSave = async () => {
    if (!name.trim()) { message.error('Relation name is required'); return; }
    const ontologyId = apiRelation?.ontologyId ?? currentOntologyId;
    if (!ontologyId) { message.error('No ontology selected'); return; }
    setSaving(true);
    try {
      const payload = {
        name, uri, description,
        domainClassId, rangeClassId,
        cardinality,
        isFunctional: props.isFunctional,
        isInverseFunctional: props.isInverseFunctional,
        isSymmetric: props.isSymmetric,
        isTransitive: props.isTransitive,
      };
      if (isEditing) {
        await updateRelation({ id: Number(relationId), ...payload });
      } else {
        await createRelation({ ontologyId, ...payload });
      }
      setSuccessModalOpen(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save relation');
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
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/relations'); }}>Relations</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${apiRelation?.name || name || 'Relation'}` : 'Add New Relation'}</Typography.Text> },
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
        <Button type="primary" icon={<Save size={16} />} loading={saving} onClick={() => void handleSaveRef.current()}>
          Save Relation
        </Button>
      </>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, setActions, navigate, isEditing, apiRelation?.name, name, relationId, saving]);

  const autoUri = name ? `http://ontology.example.com/${name}` : '';

  const domainLabel = classOptions.find(c => c.value === domainClassId)?.label ?? '—';
  const rangeLabel = classOptions.find(c => c.value === rangeClassId)?.label ?? '—';

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
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Relation Name *</label>
                <Input placeholder="e.g., worksFor, hasParent, locatedIn" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>URI</label>
                <Input placeholder="http://ontology.example.com/worksFor" value={uri || autoUri} onChange={(e) => setUri(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea placeholder="Describe the purpose of this relation..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Domain & Range Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <ArrowLeftRight size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>Domain & Range</Typography.Title>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Domain (Source Class)</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select source class"
                  value={domainClassId ?? undefined}
                  onChange={(val) => setDomainClassId(val ?? null)}
                  options={classOptions}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 28 }}>
                <ArrowRight size={24} color="gray" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Range (Target Class)</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select target class"
                  value={rangeClassId ?? undefined}
                  onChange={(val) => setRangeClassId(val ?? null)}
                  options={classOptions}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Cardinality</label>
              <Select
                style={{ width: '100%' }}
                value={cardinality}
                onChange={(val) => setCardinality(val)}
                options={[
                  { value: 'ONE_TO_ONE', label: 'One to One' },
                  { value: 'ONE_TO_MANY', label: 'One to Many' },
                  { value: 'MANY_TO_ONE', label: 'Many to One' },
                  { value: 'MANY_TO_MANY', label: 'Many to Many' },
                ]}
              />
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Preview Card */}
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Eye size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>Relation Preview</Typography.Title>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--primary-color)', padding: '8px 12px', borderRadius: 6, minWidth: 0, flex: 1 }}>
                  <Boxes size={14} color="white" style={{ flexShrink: 0 }} />
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domainLabel}</Typography.Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 60 }}>
                    {name || 'relation'}
                  </Typography.Text>
                  <ArrowRight size={16} color="gray" style={{ flexShrink: 0 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: 6, minWidth: 0, flex: 1 }}>
                  <Boxes size={14} style={{ flexShrink: 0 }} />
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rangeLabel}</Typography.Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Properties Card */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Settings size={20} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0, fontWeight: 600 }}>Properties</Typography.Title>
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
                    checked={props[prop.key]}
                    onChange={() => setProps(prev => ({ ...prev, [prop.key]: !prev[prop.key] }))}
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

      <SuccessModal open={successModalOpen} onClose={() => { setSuccessModalOpen(false); navigate('/relations'); }} />
    </>
  );
}
