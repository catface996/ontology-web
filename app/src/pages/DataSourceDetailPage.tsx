import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Typography, Button, Spin, Tag, Table, Flex, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ChevronRight, Database, Pencil, Trash2, Key,
  Calendar, Clock, Server, TableProperties,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { useModal } from '../contexts/ModalContext';
import { getDataSource, deleteDataSource } from '../services/dataSourceService';
import type { DataSourceDTO, DataSourceStatus, ColumnSchema, TableSchema } from '../types/datasource';

/* -- Status config -- */
const statusConfig: Record<DataSourceStatus, { label: string; color: string; tagColor: string }> = {
  CONNECTED:  { label: 'Connected',  color: '#22C55E', tagColor: 'success' },
  NOT_TESTED: { label: 'Not Tested', color: '#6B7280', tagColor: 'default' },
  ERROR:      { label: 'Error',      color: '#EF4444', tagColor: 'error' },
};

const defaultBrandColor: Record<string, string> = {
  postgresql: '#336791',
  mysql: '#4479A1',
};

/* -- Column table columns -- */
const columnTableColumns: ColumnsType<ColumnSchema> = [
  {
    title: 'Column',
    dataIndex: 'columnName',
    key: 'columnName',
    width: 200,
    render: (name: string, record: ColumnSchema) => (
      <Flex align="center" gap={6}>
        <Typography.Text style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{name}</Typography.Text>
        {record.isPrimaryKey && <Key size={12} color="#fbbf24" />}
      </Flex>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'dataType',
    key: 'dataType',
    width: 160,
    render: (type: string) => (
      <Tag style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{type}</Tag>
    ),
  },
  {
    title: 'Nullable',
    dataIndex: 'nullable',
    key: 'nullable',
    width: 100,
    align: 'center',
    render: (nullable: boolean) => (
      <Typography.Text style={{ fontSize: 12, color: nullable ? '#a1a1aa' : '#ef4444' }}>
        {nullable ? 'YES' : 'NO'}
      </Typography.Text>
    ),
  },
  {
    title: 'Position',
    dataIndex: 'ordinalPosition',
    key: 'ordinalPosition',
    width: 80,
    align: 'center',
    render: (pos: number) => (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>{pos}</Typography.Text>
    ),
  },
];

/* -- Page -- */
export default function DataSourceDetailPage() {
  const navigate = useNavigate();
  const { datasourceId } = useParams();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const confirmModal = useModal();

  const [ds, setDs] = useState<DataSourceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!datasourceId) return;
    setLoading(true);
    getDataSource(Number(datasourceId))
      .then((res) => {
        if (res.code === 'SUCCESS' && res.data) {
          setDs(res.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [datasourceId]);

  // Header
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/data-sources'); }}>Integrations</a> },
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/data-sources'); }}>Data Sources</a> },
          { title: <Typography.Text strong>{ds?.name ?? 'Detail'}</Typography.Text> },
        ]}
      />,
    );
    setActions(
      <Flex gap={8}>
        <Button icon={<Pencil size={16} />} onClick={() => navigate(`/data-sources/add?id=${datasourceId}`)}>Edit</Button>
        <Button danger icon={<Trash2 size={16} />} onClick={handleDelete}>Delete</Button>
      </Flex>,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds?.name, datasourceId]);

  const handleDelete = () => {
    if (!ds) return;
    confirmModal.confirm.delete({
      title: `Delete "${ds.name}"?`,
      description: 'This action cannot be undone. The data source and all associated field mappings will be permanently deleted.',
      confirmName: ds.name,
      confirmLabel: 'the data source name',
      onConfirm: async () => {
        try {
          await deleteDataSource(ds.id);
          message.success(`"${ds.name}" deleted`);
          navigate('/data-sources');
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete');
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !ds) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Database size={48} color="#a1a1aa" />
        <Typography.Text type="secondary" style={{ fontSize: 16 }}>Data source not found</Typography.Text>
        <Button type="primary" onClick={() => navigate('/data-sources')}>Back to Data Sources</Button>
      </div>
    );
  }

  const brandColor = ds.brandColor || defaultBrandColor[ds.subtype] || '#6B7280';
  const st = statusConfig[ds.status] ?? statusConfig.NOT_TESTED;
  const tables: TableSchema[] = ds.schemaJson?.tables ?? [];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>

      {/* ── Title Section ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Flex align="center" gap={12}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: `${brandColor}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Database size={22} color={brandColor} />
          </div>
          <Typography.Text style={{ fontSize: 22, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            {ds.name}
          </Typography.Text>
          <Tag color={st.tagColor}>
            <Flex align="center" gap={4}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
              {st.label}
            </Flex>
          </Tag>
        </Flex>
        <Flex gap={20}>
          {[
            { icon: <Calendar size={14} color="#71717a" />, text: `Created: ${formatDate(ds.createdAt)}` },
            { icon: <Clock size={14} color="#71717a" />, text: `Last tested: ${formatDate(ds.lastTestedAt)}` },
          ].map((meta) => (
            <Flex key={meta.text} align="center" gap={6}>
              {meta.icon}
              <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{meta.text}</Typography.Text>
            </Flex>
          ))}
        </Flex>
        {ds.status === 'ERROR' && ds.lastErrorMessage && (
          <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Typography.Text style={{ fontSize: 12, color: '#ef4444' }}>
              Error: {ds.lastErrorMessage}
            </Typography.Text>
          </div>
        )}
      </div>

      {/* ── Connection Info Card ── */}
      <div style={{ borderRadius: 12, background: '#111118', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
        <Flex align="center" gap={8} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <Server size={18} color="var(--primary-color)" />
          <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Connection Details</Typography.Text>
        </Flex>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { label: 'Database Type', value: ds.subtype.toUpperCase() },
            { label: 'Host', value: ds.host },
            { label: 'Port', value: String(ds.port) },
            { label: 'Database', value: ds.databaseName },
            { label: 'Username', value: ds.username },
            { label: 'Status', value: st.label },
          ].map((item) => (
            <div key={item.label}>
              <Typography.Text style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.label}
              </Typography.Text>
              <Typography.Text style={{ display: 'block', fontSize: 14, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                {item.value}
              </Typography.Text>
            </div>
          ))}
        </div>
      </div>

      {/* ── Schema Section ── */}
      <div style={{ borderRadius: 12, background: '#111118', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
        <Flex align="center" justify="space-between" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <Flex align="center" gap={8}>
            <TableProperties size={18} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Database Schema</Typography.Text>
            {tables.length > 0 && (
              <Tag>{tables.length} tables</Tag>
            )}
          </Flex>
          {ds.schemaDiscoveredAt && (
            <Typography.Text style={{ fontSize: 11, color: '#71717a' }}>
              Discovered: {formatDate(ds.schemaDiscoveredAt)}
            </Typography.Text>
          )}
        </Flex>

        {tables.length === 0 ? (
          /* Empty state */
          <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <TableProperties size={40} color="#3f3f46" />
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              No schema discovered yet
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12, color: '#52525b', textAlign: 'center', maxWidth: 400 }}>
              Schema discovery is performed by the Database Agent. Use the Agent to connect to this data source and discover its schema automatically.
            </Typography.Text>
          </div>
        ) : (
          /* Schema tables with expandable rows */
          <div style={{ maxHeight: 600, overflow: 'auto' }}>
          <Table<TableSchema>
            dataSource={tables}
            rowKey="tableName"
            pagination={false}
            size="small"
            style={{ background: 'transparent' }}
            expandable={{
              expandedRowRender: (table) => (
                <Table<ColumnSchema>
                  dataSource={table.columns}
                  columns={columnTableColumns}
                  rowKey="columnName"
                  pagination={false}
                  size="small"
                  style={{ margin: '0 0 0 20px' }}
                />
              ),
              defaultExpandAllRows: tables.length <= 5,
            }}
            columns={[
              {
                title: 'Table Name',
                dataIndex: 'tableName',
                key: 'tableName',
                render: (name: string) => (
                  <Flex align="center" gap={8}>
                    <TableProperties size={14} color="#71717a" />
                    <Typography.Text style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
                      {name}
                    </Typography.Text>
                  </Flex>
                ),
              },
              {
                title: 'Schema',
                dataIndex: 'schemaName',
                key: 'schemaName',
                width: 150,
                render: (schema: string) => (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {schema || '-'}
                  </Typography.Text>
                ),
              },
              {
                title: 'Columns',
                key: 'columnCount',
                width: 100,
                align: 'center',
                render: (_: unknown, record: TableSchema) => (
                  <Tag>{record.columns.length}</Tag>
                ),
              },
            ]}
          />
          </div>
        )}
      </div>
    </div>
  );
}
