import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Tag, Spin, Modal, App, Flex } from 'antd';
import {
  ChevronRight, Pencil, Trash2, Info, FileText, BarChart3,
  Activity, Globe, Boxes, ArrowLeftRight, List, Database, Share2,
} from 'lucide-react';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { getOntology, deleteOntology, listNamespaces, type OntologyDTO, type NamespaceDTO } from '../services/coreService';

function normalizeStatus(raw: string | undefined): 'Published' | 'Draft' {
  if (!raw) return 'Draft';
  return raw.toLowerCase() === 'published' ? 'Published' : 'Draft';
}

function normalizeDTO(dto: OntologyDTO & Record<string, unknown>): OntologyDTO {
  return {
    ...dto,
    status: normalizeStatus(dto.status),
    classCount: (dto.classCount ?? dto.class_count ?? 0) as number,
    relationCount: (dto.relationCount ?? dto.relation_count ?? 0) as number,
    propertyCount: (dto.propertyCount ?? dto.property_count ?? 0) as number,
    instanceCount: (dto.instanceCount ?? dto.instance_count ?? 0) as number,
    createdAt: (dto.createdAt ?? dto.created_at ?? '') as string,
    updatedAt: (dto.updatedAt ?? dto.updated_at ?? '') as string,
  };
}

/* -- Page -- */
export default function OntologyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setCurrentOntology } = useCurrentOntology();
  const [ontology, setOntology] = useState<OntologyDTO | null>(null);
  const [namespaces, setNamespaces] = useState<NamespaceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load from API + set global ontology context
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const [ontRes, nsRes] = await Promise.allSettled([
          getOntology(Number(id)),
          listNamespaces(),
        ]);
        if (ontRes.status === 'fulfilled' && ontRes.value.data) {
          const normalized = normalizeDTO(ontRes.value.data as OntologyDTO & Record<string, unknown>);
          setOntology(normalized);
          setCurrentOntology({ id: normalized.id, name: normalized.name, version: normalized.version ?? '', status: normalized.status ?? '' });
        }
        if (nsRes.status === 'fulfilled' && nsRes.value.data) {
          setNamespaces(nsRes.value.data);
        }
      } catch {
        message.error('Failed to load ontology details');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteOntology(Number(id));
      message.success('Ontology deleted');
      navigate('/ontologies');
    } catch {
      message.error('Failed to delete ontology');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

  if (!ontology) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography.Text style={{ color: '#a1a1aa' }}>Ontology not found</Typography.Text>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const stats = [
    { label: 'Classes', value: ontology.classCount, icon: <Boxes size={18} color="var(--primary-color)" /> },
    { label: 'Relations', value: ontology.relationCount, icon: <ArrowLeftRight size={18} color="#22d3ee" /> },
    { label: 'Properties', value: ontology.propertyCount, icon: <List size={18} color="#fbbf24" /> },
    { label: 'Instances', value: ontology.instanceCount.toLocaleString(), icon: <Database size={18} color="#4ade80" /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Flex align="center" justify="space-between" style={{ height: 64, padding: '0 24px', borderBottom: '1px solid #1e1e2a', flexShrink: 0 }}>
        <Flex align="center" gap={16}>
          <Flex align="center" gap={8} onClick={() => navigate('/ontologies')} style={{ cursor: 'pointer' }}>
            <Share2 size={24} color="#e4e4e7" />
            <Typography.Text style={{ fontSize: 18, fontWeight: 600, color: '#e4e4e7' }}>Ontology</Typography.Text>
          </Flex>
          <Breadcrumb
            separator={<ChevronRight size={12} />}
            items={[
              { title: <a onClick={(e) => { e.preventDefault(); navigate('/ontologies'); }}>Ontologies</a> },
              { title: <Typography.Text strong>{ontology.name}</Typography.Text> },
            ]}
          />
        </Flex>
        <Flex gap={8}>
          <Button icon={<Pencil size={16} />} onClick={() => navigate(`/ontologies/${id}/edit`)}>
            Edit
          </Button>
          <Button danger icon={<Trash2 size={16} />} onClick={() => setDeleteModalOpen(true)}>
            Delete
          </Button>
        </Flex>
      </Flex>

      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', gap: 24 }}>
        {/* Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Basic Information Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Info size={20} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>Basic Information</Typography.Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Name', value: ontology.name },
                { label: 'URI Prefix', value: ontology.uri, isUri: true },
                { label: 'Status', value: ontology.status, isStatus: true },
                { label: 'Version', value: ontology.version },
                { label: 'Created', value: formatDate(ontology.createdAt) },
              ].map((field, i, arr) => (
                <div key={field.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{field.label}</Typography.Text>
                    {field.isStatus ? (
                      <Tag
                        color={ontology.status === 'Published' ? 'green' : 'orange'}
                        style={{ borderRadius: 20, margin: 0, fontSize: 11, fontWeight: 600 }}
                      >
                        {ontology.status}
                      </Tag>
                    ) : field.isUri ? (
                      <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary-color)' }}>{field.value}</Typography.Text>
                    ) : (
                      <Typography.Text style={{ fontSize: 14, fontWeight: 500 }}>{field.value}</Typography.Text>
                    )}
                  </div>
                  {i < arr.length - 1 && <div style={{ height: 1, backgroundColor: '#27273a', marginTop: 16 }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Description Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={20} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>Description</Typography.Text>
            </div>
            <Typography.Text style={{ fontSize: 14, color: '#a1a1aa', lineHeight: '1.6' }}>
              {ontology.description}
            </Typography.Text>
          </div>

          {/* Statistics Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BarChart3 size={20} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>Statistics</Typography.Text>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {stats.map((s) => (
                <div key={s.label} style={{ flex: 1, padding: 20, borderRadius: 10, backgroundColor: '#1a1a24', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Typography.Text style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</Typography.Text>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>{s.label}</Typography.Text>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Activity Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Activity size={20} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>Recent Activity</Typography.Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', padding: '16px 0' }}>
                No recent activity
              </Typography.Text>
            </div>
          </div>

          {/* Namespaces Card */}
          <div style={{ borderRadius: 12, border: '1px solid #27273a', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={20} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>Namespaces</Typography.Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {namespaces.length === 0 ? (
                <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', textAlign: 'center', padding: '16px 0' }}>
                  No namespaces configured
                </Typography.Text>
              ) : namespaces.map((ns) => (
                <div key={ns.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, backgroundColor: '#1a1a24' }}>
                  <Typography.Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-color)', fontFamily: 'JetBrains Mono, monospace', width: 48 }}>
                    {ns.prefix}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', flex: 1 }}>{ns.uri}</Typography.Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Ontology"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={() => void handleDelete()}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleting }}
        destroyOnHidden
      >
        <Typography.Text>
          Are you sure you want to delete <strong>{ontology.name}</strong>? This action cannot be undone.
        </Typography.Text>
      </Modal>
    </div>
  );
}
