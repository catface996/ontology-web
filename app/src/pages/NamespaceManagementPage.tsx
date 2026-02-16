import { useState, useEffect } from 'react';
import { Breadcrumb, Typography, Button, Input, Spin, App } from 'antd';
import { Plus, Search, Pencil, Trash2, Lock, Globe } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { listNamespaces, deleteNamespace, type NamespaceDTO } from '../services/coreService';

/* -- Types -- */
type NamespaceType = 'Standard' | 'Custom';

interface NamespaceItem {
  id: number;
  prefix: string;
  uri: string;
  type: NamespaceType;
}

function dtoToNamespaceItem(dto: NamespaceDTO): NamespaceItem {
  return { id: dto.id, prefix: dto.prefix, uri: dto.uri, type: dto.type };
}

/* -- Page -- */
export default function NamespaceManagementPage() {
  const [search, setSearch] = useState('');
  const [namespaces, setNamespaces] = useState<NamespaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();

  const loadNamespaces = async () => {
    setLoading(true);
    try {
      const res = await listNamespaces();
      if (res.data) {
        setNamespaces(res.data.map(dtoToNamespaceItem));
      }
    } catch {
      message.error('Failed to load namespaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadNamespaces(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteNamespace(id);
      message.success('Namespace deleted');
      void loadNamespaces();
    } catch {
      message.error('Failed to delete namespace');
    }
  };

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb items={[
        { title: 'Settings' },
        { title: 'Namespace Management' },
      ]} />
    );
    setActions(
      <Button type="primary" icon={<Plus size={16} />}>
        Add Namespace
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  const filtered = namespaces.filter(
    (ns) =>
      ns.prefix.toLowerCase().includes(search.toLowerCase()) ||
      ns.uri.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ flex: 1, borderRadius: 12, border: '1px solid #303030', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Table Title + Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #303030' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={20} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>Registered Namespaces</Typography.Text>
              <div style={{ backgroundColor: '#1a1a24', borderRadius: 100, padding: '4px 10px' }}>
                <Typography.Text style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>{namespaces.length} namespaces</Typography.Text>
              </div>
            </div>
            <Input
              placeholder="Search namespaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={16} color="#a1a1aa" />}
              style={{ width: 260, backgroundColor: '#1a1a24', borderRadius: 8, fontSize: 13 }}
            />
          </div>

          {/* Column Headers */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #303030' }}>
            <div style={{ width: 120 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Prefix</Typography.Text></div>
            <div style={{ flex: 1 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>URI</Typography.Text></div>
            <div style={{ width: 100 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Type</Typography.Text></div>
            <div style={{ width: 80 }}><Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Actions</Typography.Text></div>
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>
            ) : filtered.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <Typography.Text style={{ color: '#a1a1aa' }}>No namespaces found</Typography.Text>
              </div>
            ) : filtered.map((ns) => (
              <div
                key={ns.prefix}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 24px',
                  borderBottom: '1px solid #303030',
                }}
              >
                {/* Prefix */}
                <div style={{ width: 120 }}>
                  <Typography.Text style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary-color)' }}>
                    {ns.prefix}
                  </Typography.Text>
                </div>

                {/* URI */}
                <div style={{ flex: 1 }}>
                  <Typography.Text style={{ fontSize: 13 }}>{ns.uri}</Typography.Text>
                </div>

                {/* Type */}
                <div style={{ width: 100 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      backgroundColor: ns.type === 'Standard' ? '#1a1a24' : '#000000',
                      borderRadius: 6,
                      padding: '2px 8px',
                    }}
                  >
                    <Typography.Text
                      style={{
                        fontSize: 11,
                        fontWeight: ns.type === 'Custom' ? 500 : 400,
                        color: ns.type === 'Custom' ? '#3b82f6' : '#a1a1aa',
                      }}
                    >
                      {ns.type}
                    </Typography.Text>
                  </span>
                </div>

                {/* Actions */}
                <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {ns.type === 'Standard' ? (
                    <Lock size={14} color="#a1a1aa" />
                  ) : (
                    <>
                      <Button type="text" size="small" icon={<Pencil size={16} />} />
                      <Button type="text" size="small" danger icon={<Trash2 size={16} />} onClick={() => void handleDelete(ns.id)} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
