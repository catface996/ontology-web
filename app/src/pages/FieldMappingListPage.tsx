import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Tag, Typography, Flex, App, Tooltip, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Plus, Pencil, Trash2, Eye,
  ChevronRight, AlertTriangle, GitMerge,
} from 'lucide-react';
import TableCard from '../components/TableCard';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listDataSources, pageMappingConfigs, deleteMappingConfig } from '../services/dataSourceService';
import { listClasses } from '../services/coreService';
import type { DataSourceDTO, FieldMappingConfigDTO } from '../types/datasource';
import type { ClassDTO } from '../services/coreService';

export default function FieldMappingListPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const confirmModal = useModal();

  // Filter options
  const [dataSources, setDataSources] = useState<DataSourceDTO[]>([]);
  const [classes, setClasses] = useState<ClassDTO[]>([]);

  // Filter states
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<number | undefined>();
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();

  // Data states
  const [data, setData] = useState<FieldMappingConfigDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Load filter options
  useEffect(() => {
    if (!currentOntologyId) return;

    listDataSources({ ontologyId: currentOntologyId }).then((res) => {
      if (res.code === 'SUCCESS' && res.data) {
        setDataSources(res.data);
      }
    });

    listClasses({ ontologyId: currentOntologyId }).then((res) => {
      if (res.code === 'SUCCESS' && res.data) {
        setClasses(res.data);
      }
    });
  }, [currentOntologyId]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pageMappingConfigs({
        dataSourceId: selectedDataSourceId,
        targetClassId: selectedClassId,
        page: page + 1, // API is 1-indexed
        pageSize: rowsPerPage,
      });

      if (res.code === 'SUCCESS' && res.data) {
        setData(res.data.records);
        setTotal(res.data.total);
      } else {
        message.error(res.message || 'Failed to load mappings');
      }
    } catch {
      message.error('Failed to load mappings');
    } finally {
      setLoading(false);
    }
  }, [selectedDataSourceId, selectedClassId, page, rowsPerPage, message]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Header
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <Typography.Text type="secondary">Data</Typography.Text> },
          { title: <Typography.Text strong>Field Mapping</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8} align="center">
        <Select
          style={{ width: 180 }}
          placeholder="Data Source"
          allowClear
          value={selectedDataSourceId}
          onChange={(v) => {
            setSelectedDataSourceId(v);
            setPage(0);
          }}
          options={dataSources.map((ds) => ({
            value: ds.id,
            label: ds.name,
          }))}
        />
        <Select
          style={{ width: 180 }}
          placeholder="Target Class"
          allowClear
          value={selectedClassId}
          onChange={(v) => {
            setSelectedClassId(v);
            setPage(0);
          }}
          options={classes.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/field-mapping')}
        >
          New Mapping
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate, selectedDataSourceId, selectedClassId, dataSources, classes]);

  // Handle view details - navigate to view mode
  const handleViewDetails = (record: FieldMappingConfigDTO) => {
    navigate(`/field-mapping?dataSourceId=${record.dataSourceId}&sourceTable=${encodeURIComponent(record.sourceTable)}&targetClassId=${record.targetClassId}&mode=view`);
  };

  // Handle delete
  const handleDelete = (record: FieldMappingConfigDTO) => {
    confirmModal.confirm.delete({
      title: `Delete mapping "${record.sourceTable} → ${record.targetClassName}"?`,
      description: 'This action cannot be undone. All column mappings for this table-class combination will be permanently deleted.',
      confirmName: record.sourceTable,
      confirmLabel: 'the source table name',
      onConfirm: async () => {
        try {
          const res = await deleteMappingConfig(record.id);
          if (res.code === 'SUCCESS') {
            message.success('Mapping deleted');
            void loadData();
          } else {
            message.error(res.message || 'Failed to delete mapping');
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete mapping');
        }
      },
    });
  };

  const columns: ColumnsType<FieldMappingConfigDTO> = [
    {
      title: (
        <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>
          Mapping
        </Typography.Text>
      ),
      key: 'mapping',
      render: (_: unknown, record: FieldMappingConfigDTO) => (
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(var(--primary-rgb), 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <GitMerge size={16} color="var(--primary-color)" />
          </div>
          <div>
            <Typography.Text strong style={{ fontSize: 14 }}>
              {record.sourceTable}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12, color: '#a1a1aa', display: 'block' }}>
              {record.dataSourceName || `DataSource #${record.dataSourceId}`}
            </Typography.Text>
          </div>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Target Class</Typography.Text>,
      dataIndex: 'targetClassName',
      key: 'targetClassName',
      width: 160,
      render: (name: string, record) => (
        <Typography.Text style={{ fontSize: 14 }}>{name || `Class #${record.targetClassId}`}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Fields</Typography.Text>,
      dataIndex: 'mappingCount',
      key: 'mappingCount',
      width: 100,
      align: 'center',
      render: (count: number) => <Tag>{count ?? 0}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Status</Typography.Text>,
      dataIndex: 'hasTypeWarning',
      key: 'hasTypeWarning',
      width: 100,
      align: 'center',
      render: (hasWarning: boolean) =>
        hasWarning ? (
          <Tooltip title="Type mismatch detected">
            <AlertTriangle size={16} style={{ color: '#faad14' }} />
          </Tooltip>
        ) : (
          <Tag color="green">OK</Tag>
        ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Updated</Typography.Text>,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
      render: (date: string) => (
        <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
          {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_: unknown, record: FieldMappingConfigDTO) => (
        <Flex justify="center" gap={4}>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<Eye size={16} />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<Pencil size={16} />}
              onClick={() => navigate(`/field-mapping?dataSourceId=${record.dataSourceId}&sourceTable=${encodeURIComponent(record.sourceTable)}&targetClassId=${record.targetClassId}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" size="small" danger icon={<Trash2 size={16} />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <div className="list-page">
      <TableCard<FieldMappingConfigDTO>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          count: total,
          page,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: setRowsPerPage,
          label: 'mappings',
        }}
      />
    </div>
  );
}
