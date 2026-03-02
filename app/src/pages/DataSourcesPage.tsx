import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Card, Tag, Typography, Flex, Spin, Modal, message } from 'antd';
import { Plus, Database, Trash2, Pencil } from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listDataSources, deleteDataSource } from '../services/dataSourceService';
import type { DataSourceDTO, DataSourceStatus } from '../types/datasource';

/* -- Status config -- */
const statusConfig: Record<DataSourceStatus, { label: string; color: string; tagColor: string }> = {
  CONNECTED:  { label: 'Connected',  color: '#22C55E', tagColor: 'success' },
  NOT_TESTED: { label: 'Not Tested', color: '#6B7280', tagColor: 'default' },
  ERROR:      { label: 'Error',      color: '#EF4444', tagColor: 'error' },
};

/* -- Default brand colors by subtype -- */
const defaultBrandColor: Record<string, string> = {
  postgresql: '#336791',
  mysql: '#4479A1',
};

/* -- Page -- */
export default function DataSourcesPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();

  const [dataSources, setDataSources] = useState<DataSourceDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDataSources = useCallback(async () => {
    if (!currentOntologyId) return;
    setLoading(true);
    try {
      const res = await listDataSources({ ontologyId: currentOntologyId });
      setDataSources(res.data ?? []);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load data sources');
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Integrations</a> },
          { title: <Typography.Text strong>Data Sources</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Button
        type="primary"
        icon={<Plus size={16} />}
        onClick={() => navigate('/data-sources/add')}
      >
        Add Connection
      </Button>
    );
  }, [setBreadcrumbs, setActions, navigate]);

  const handleViewDetail = (ds: DataSourceDTO) => {
    navigate(`/data-sources/${ds.id}`);
  };

  const handleEdit = (ds: DataSourceDTO) => {
    navigate(`/data-sources/add?id=${ds.id}`);
  };

  const handleDelete = (ds: DataSourceDTO) => {
    Modal.confirm({
      title: 'Delete Data Source',
      content: `Are you sure you want to delete "${ds.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteDataSource(ds.id);
          message.success(`"${ds.name}" deleted successfully`);
          fetchDataSources();
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete data source');
        }
      },
    });
  };

  const connectedCount = dataSources.filter((d) => d.status === 'CONNECTED').length;

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Spin size="large" />
          </div>
        ) : dataSources.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16 }}>
            <Database size={48} color="#6B7280" />
            <Typography.Text type="secondary" style={{ fontSize: 16 }}>
              No data sources configured yet
            </Typography.Text>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => navigate('/data-sources/add')}
            >
              Add Your First Connection
            </Button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #27273a', borderRadius: 8 }}>
            <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignContent: 'start' }}>
              {dataSources.map((ds) => {
                const brandColor = ds.brandColor || defaultBrandColor[ds.subtype] || '#6B7280';
                const st = statusConfig[ds.status] ?? statusConfig.NOT_TESTED;
                return (
                  <Card
                    key={ds.id}
                    hoverable
                    onClick={() => handleViewDetail(ds)}
                    style={{ borderColor: '#27273a', cursor: 'pointer' }}
                    styles={{ body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 16 } }}
                  >
                    {/* Card header */}
                    <Flex align="center" gap={12}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `${brandColor}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Database size={20} color={brandColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography.Text strong style={{ fontSize: 15, display: 'block' }} ellipsis>
                          {ds.name}
                        </Typography.Text>
                        <Typography.Text style={{ fontSize: 12, color: '#71717a' }} ellipsis>
                          {ds.host}:{ds.port}/{ds.databaseName}
                        </Typography.Text>
                      </div>
                    </Flex>

                    {/* Stats */}
                    <Flex gap={12}>
                      <Tag>{ds.subtype.toUpperCase()}</Tag>
                      <Tag color={st.tagColor}>
                        <Flex align="center" gap={4}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
                          {st.label}
                        </Flex>
                      </Tag>
                    </Flex>

                    {/* Actions */}
                    <Flex justify="space-between" align="center" style={{ borderTop: '1px solid #27273a', paddingTop: 12 }} onClick={(e) => e.stopPropagation()}>
                      <Flex gap={4}>
                        <Button
                          type="text"
                          size="small"
                          icon={<Pencil size={14} />}
                          onClick={() => handleEdit(ds)}
                          style={{ color: '#a1a1aa' }}
                        >
                          Edit
                        </Button>
                      </Flex>
                      <Button
                        type="text"
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDelete(ds)}
                        style={{ color: '#ef4444' }}
                      />
                    </Flex>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
