import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Card, Tag, Spin, App } from 'antd';
import {
  ChevronRight, Save, Eye, Search, Plus, Trash2, Network, Boxes, ArrowLeftRight, Star,
} from 'lucide-react';
import SuccessModal from '../components/SuccessModal';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  getTopology, createTopology, updateTopology, listClasses,
  type TopologyDTO, type ClassDTO,
} from '../services/coreService';

export default function TopologyEditorPage() {
  const { topologyId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentOntologyId } = useCurrentOntology();
  const { setBreadcrumbs, setActions } = useHeader();

  const isEditing = topologyId !== undefined;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [includedClassIds, setIncludedClassIds] = useState<Set<number>>(new Set());
  const [apiTopology, setApiTopology] = useState<TopologyDTO | null>(null);
  const [centralClassId, setCentralClassId] = useState<number | null>(null);

  // Available classes
  const [allClasses, setAllClasses] = useState<ClassDTO[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchIncluded, setSearchIncluded] = useState('');

  // Load topology detail when editing
  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getTopology(Number(topologyId));
        if (!cancelled && res.data) {
          setApiTopology(res.data);
          setName(res.data.name);
          setDescription(res.data.description ?? '');
          setIncludedClassIds(new Set(res.data.classIds));
          setCentralClassId(res.data.centralClassId ?? null);
        }
      } catch {
        // fields stay empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [topologyId, isEditing]);

  // Load all classes for the ontology
  useEffect(() => {
    const ontologyId = apiTopology?.ontologyId ?? currentOntologyId;
    if (!ontologyId) {
      setLoadingClasses(false);
      return;
    }
    (async () => {
      setLoadingClasses(true);
      try {
        const res = await listClasses({ ontologyId });
        setAllClasses(res.data ?? []);
      } catch {
        // keep empty
      } finally {
        setLoadingClasses(false);
      }
    })();
  }, [apiTopology?.ontologyId, currentOntologyId]);

  const handleAddClass = useCallback((classId: number) => {
    setIncludedClassIds(prev => new Set([...prev, classId]));
  }, []);

  const handleRemoveClass = useCallback((classId: number) => {
    setIncludedClassIds(prev => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });
    setCentralClassId(prev => prev === classId ? null : prev);
  }, []);

  const handleSetCentralClass = useCallback((classId: number) => {
    setCentralClassId(prev => prev === classId ? null : classId);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { message.error('Topology name is required'); return; }
    const ontologyId = apiTopology?.ontologyId ?? currentOntologyId;
    if (!ontologyId) { message.error('No ontology selected'); return; }
    if (includedClassIds.size === 0) { message.error('Add at least one class'); return; }
    setSaving(true);
    try {
      if (isEditing && apiTopology) {
        await updateTopology({
          id: apiTopology.id,
          name,
          description,
          classIds: Array.from(includedClassIds),
          centralClassId,
        });
      } else {
        await createTopology({
          ontologyId,
          name,
          description,
          classIds: Array.from(includedClassIds),
          centralClassId,
        });
      }
      setSuccessModalOpen(true);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save topology');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Header
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/topology'); }}>Topology</a> },
          { title: <Typography.Text strong>{isEditing ? `Edit ${apiTopology?.name || name || 'Topology'}` : 'New Topology'}</Typography.Text> },
        ]}
      />,
    );
    setActions(
      <>
        {isEditing && apiTopology && (
          <Button icon={<Eye size={16} />} onClick={() => navigate(`/topology/${topologyId}/view`)}>
            View Topology
          </Button>
        )}
        <Button onClick={() => navigate('/topology')}>Cancel</Button>
        <Button type="primary" icon={<Save size={16} />} loading={saving} onClick={() => void handleSaveRef.current()}>
          Save
        </Button>
      </>,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, setActions, navigate, isEditing, apiTopology?.name, topologyId, name, saving]);

  // Derived lists
  const availableClasses = allClasses.filter(c => !includedClassIds.has(c.id));
  const includedClasses = allClasses.filter(c => includedClassIds.has(c.id));

  const filteredAvailable = searchAvailable
    ? availableClasses.filter(c => c.name.toLowerCase().includes(searchAvailable.toLowerCase()))
    : availableClasses;

  const filteredIncluded = searchIncluded
    ? includedClasses.filter(c => c.name.toLowerCase().includes(searchIncluded.toLowerCase()))
    : includedClasses;

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
        {/* Top section: Name, Description, Stats */}
        <Card style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Topology Name *</label>
                <Input
                  placeholder="e.g., HR Domain, Product Catalog"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Description</label>
                <Input.TextArea
                  placeholder="Describe the purpose of this topology..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingTop: 24 }}>
              <div style={{ textAlign: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                <Typography.Text style={{ fontSize: 24, fontWeight: 600, display: 'block' }}>
                  {includedClassIds.size}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>Classes</Typography.Text>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                <Typography.Text style={{ fontSize: 24, fontWeight: 600, display: 'block' }}>
                  {apiTopology?.instanceCount ?? 0}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>Instances</Typography.Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Dual-column class picker */}
        <div style={{ flex: 1, display: 'flex', gap: 24, minHeight: 0, overflow: 'hidden' }}>
          {/* Available Classes */}
          <Card
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 16, overflow: 'hidden' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Boxes size={18} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Available Classes</Typography.Title>
              <Tag style={{ marginLeft: 'auto' }}>{filteredAvailable.length}</Tag>
            </div>
            <Input
              placeholder="Search available classes..."
              prefix={<Search size={14} />}
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {loadingClasses ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spin /></div>
              ) : filteredAvailable.length === 0 ? (
                <Typography.Text style={{ fontSize: 13, color: '#71717a', textAlign: 'center', padding: 32 }}>
                  {searchAvailable ? 'No matching classes' : 'All classes have been added'}
                </Typography.Text>
              ) : (
                filteredAvailable.map(cls => (
                  <div
                    key={cls.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Boxes size={14} color="#a1a1aa" />
                    <Typography.Text style={{ fontSize: 13, flex: 1 }}>{cls.name}</Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{cls.description}</Typography.Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<Plus size={14} />}
                      onClick={() => handleAddClass(cls.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Included Classes */}
          <Card
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 16, overflow: 'hidden' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ArrowLeftRight size={18} color="var(--primary-color)" />
              <Typography.Title level={5} style={{ margin: 0 }}>Included Classes</Typography.Title>
              <Tag color="green" style={{ marginLeft: 'auto' }}>{includedClasses.length} Active</Tag>
            </div>
            <Input
              placeholder="Search included classes..."
              prefix={<Search size={14} />}
              value={searchIncluded}
              onChange={(e) => setSearchIncluded(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filteredIncluded.length === 0 ? (
                <Typography.Text style={{ fontSize: 13, color: '#71717a', textAlign: 'center', padding: 32 }}>
                  {searchIncluded ? 'No matching classes' : 'No classes added yet. Add classes from the left panel.'}
                </Typography.Text>
              ) : (
                filteredIncluded.map(cls => (
                  <div
                    key={cls.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Network size={14} color="var(--primary-color)" />
                    <Typography.Text strong style={{ fontSize: 13, flex: 1 }}>{cls.name}</Typography.Text>
                    {centralClassId === cls.id && (
                      <Tag color="gold" style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>Central</Tag>
                    )}
                    <Button
                      type="text"
                      size="small"
                      icon={
                        <Star
                          size={14}
                          fill={centralClassId === cls.id ? '#facc15' : 'none'}
                          color={centralClassId === cls.id ? '#facc15' : '#a1a1aa'}
                        />
                      }
                      onClick={() => handleSetCentralClass(cls.id)}
                      title={centralClassId === cls.id ? 'Unset central class' : 'Set as central class'}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => handleRemoveClass(cls.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        onClose={() => { setSuccessModalOpen(false); navigate('/topology'); }}
      />
    </>
  );
}
