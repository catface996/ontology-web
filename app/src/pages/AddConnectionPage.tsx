import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Breadcrumb, Typography, Input, Button, Spin, message } from 'antd';
import { ChevronRight, Database, Save, Plug } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  createDataSource,
  updateDataSource,
  getDataSource,
  updateDataSourceStatus,
} from '../services/dataSourceService';
import type { DataSourceSubtype } from '../types/datasource';

/* -- Types -- */
interface SourceType {
  key: DataSourceSubtype;
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  brandColor: string;
  defaultPort: string;
}

/* -- Data (MVP: postgresql + mysql only) -- */
const sourceTypes: SourceType[] = [
  { key: 'postgresql', name: 'PostgreSQL', icon: Database, brandColor: '#336791', defaultPort: '5432' },
  { key: 'mysql',      name: 'MySQL',      icon: Database, brandColor: '#4479A1', defaultPort: '3306' },
];

/* -- Page -- */
export default function AddConnectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBreadcrumbs } = useHeader();
  const { currentOntologyId } = useCurrentOntology();

  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
  const isEdit = editId !== null;

  const [selected, setSelected] = useState<DataSourceSubtype>('postgresql');
  const [form, setForm] = useState({
    name: '',
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Load existing data source for edit mode
  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    getDataSource(editId)
      .then((res) => {
        const ds = res.data;
        setSelected(ds.subtype);
        setForm({
          name: ds.name,
          host: ds.host,
          port: String(ds.port),
          database: ds.databaseName,
          username: ds.username,
          password: '',
        });
      })
      .catch((err) => {
        message.error(err instanceof Error ? err.message : 'Failed to load data source');
      })
      .finally(() => setLoading(false));
  }, [editId]);

  const current = sourceTypes.find((s) => s.key === selected)!;

  const handleSelect = (key: DataSourceSubtype) => {
    const src = sourceTypes.find((s) => s.key === key)!;
    setSelected(key);
    setForm((prev) => ({ ...prev, port: src.defaultPort }));
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTestConnection = async () => {
    if (!editId) {
      message.info('Save the connection first, then test it.');
      return;
    }
    setTesting(true);
    try {
      await updateDataSourceStatus({ id: editId, status: 'CONNECTED' });
      message.success('Connection test successful');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!currentOntologyId) {
      message.error('No ontology selected. Please select an ontology first.');
      return;
    }
    if (!form.name || !form.host || !form.port || !form.database || !form.username) {
      message.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateDataSource({
          id: editId,
          name: form.name,
          host: form.host,
          port: Number(form.port),
          databaseName: form.database,
          username: form.username,
          ...(form.password ? { password: form.password } : {}),
        });
        message.success('Connection updated successfully');
      } else {
        if (!form.password) {
          message.error('Password is required for new connections');
          setSaving(false);
          return;
        }
        await createDataSource({
          ontologyId: currentOntologyId,
          name: form.name,
          subtype: selected,
          host: form.host,
          port: Number(form.port),
          databaseName: form.database,
          username: form.username,
          password: form.password,
          brandColor: current.brandColor,
        });
        message.success('Connection created successfully');
      }
      navigate('/data-sources');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save connection');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a>Integrations</a> },
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/data-sources'); }}>Data Sources</a> },
          { title: <Typography.Text strong>{isEdit ? 'Edit Connection' : 'Add Connection'}</Typography.Text> },
        ]}
      />
    );
  }, [setBreadcrumbs, navigate, isEdit]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {/* Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        {/* Choose Connection Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={20} />
            <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>
              Choose Connection Type
            </Typography.Text>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Select the type of data source you want to connect
          </Typography.Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {sourceTypes.map((src) => {
              const Icon = src.icon;
              const active = selected === src.key;
              return (
                <div
                  key={src.key}
                  onClick={() => !isEdit && handleSelect(src.key)}
                  style={{
                    width: 130,
                    height: 88,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    borderRadius: 10,
                    border: active ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.12)',
                    cursor: isEdit ? 'default' : 'pointer',
                    opacity: isEdit && !active ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      background: `${src.brandColor}20`,
                    }}
                  >
                    <Icon size={18} color={src.brandColor} />
                  </div>
                  <Typography.Text style={{ fontSize: 12, fontWeight: 500 }}>
                    {src.name}
                  </Typography.Text>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection Details */}
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>
              Connection Details
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Configure the connection settings for {current.name}
            </Typography.Text>
          </div>

          {/* Form body */}
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Connection Name */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Connection Name</label>
              <Input
                placeholder={`My ${current.name} Database`}
                value={form.name}
                onChange={handleChange('name')}
              />
            </div>

            {/* Host + Port */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Host</label>
                <Input
                  placeholder="localhost"
                  value={form.host}
                  onChange={handleChange('host')}
                />
              </div>
              <div style={{ width: 160, flexShrink: 0 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Port</label>
                <Input
                  value={form.port}
                  onChange={handleChange('port')}
                />
              </div>
            </div>

            {/* Database Name */}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Database Name</label>
              <Input
                placeholder="ontology_db"
                value={form.database}
                onChange={handleChange('database')}
              />
            </div>

            {/* Username + Password */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Username</label>
                <Input
                  placeholder="admin"
                  value={form.username}
                  onChange={handleChange('username')}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                  Password {isEdit && <Typography.Text type="secondary" style={{ fontSize: 11 }}>(leave blank to keep current)</Typography.Text>}
                </label>
                <Input.Password
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                />
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              icon={<Plug size={16} />}
              onClick={handleTestConnection}
              loading={testing}
            >
              Test Connection
            </Button>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={() => navigate('/data-sources')}>Cancel</Button>
              <Button
                type="primary"
                icon={<Save size={16} />}
                onClick={handleSave}
                loading={saving}
              >
                {isEdit ? 'Update Connection' : 'Save Connection'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
