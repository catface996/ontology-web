import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Typography, Flex, App, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Type, Hash, Calendar, List,
  Search, Plus, Pencil, Trash2,
  ArrowLeftRight, ChevronRight,
} from 'lucide-react';
import TableCard from '../components/TableCard';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listProperties, deleteProperty, type PropertyDTO } from '../services/coreService';

const dataTypeIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  String: Type,
  Integer: Hash,
  Float: Hash,
  Decimal: Hash,
  Date: Calendar,
  DateTime: Calendar,
  Boolean: Type,
  Text: Type,
  Enum: List,
};

export default function PropertiesPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const [data, setData] = useState<PropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const confirmModal = useModal();

  const loadData = async () => {
    if (!currentOntologyId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await listProperties({ ontologyId: currentOntologyId });
      setData(res.data ?? []);
    } catch {
      message.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, [currentOntologyId]);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        separator={<ChevronRight size={10} />}
        items={[
          { title: <Typography.Text type="secondary">Ontology</Typography.Text> },
          { title: <Typography.Text strong>Properties</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8} align="center">
        <Input
          placeholder="Search properties..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          allowClear
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/properties/new/edit')}
        >
          New Property
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate, search]);

  const handleDelete = (record: PropertyDTO) => {
    confirmModal.confirm.delete({
      title: `Delete "${record.name}"?`,
      description: 'This action cannot be undone. The property and all its related data will be permanently deleted.',
      confirmName: record.name,
      confirmLabel: 'the property name',
      onConfirm: async () => {
        try {
          await deleteProperty(record.id);
          message.success('Property deleted');
          void loadData();
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete property');
        }
      },
    });
  };

  const filtered = search
    ? data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  const columns: ColumnsType<PropertyDTO> = [
    {
      title: (
        <Flex align="center" gap={6}>
          <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>
            Property
          </Typography.Text>
          <ArrowLeftRight size={14} color="gray" />
        </Flex>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: unknown, record: PropertyDTO) => {
        const DataTypeIcon = dataTypeIcons[record.dataType] || Type;
        return (
          <Flex align="center" gap={10}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(var(--primary-rgb), 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <DataTypeIcon size={16} color="var(--primary-color)" />
            </div>
            <Typography.Text strong style={{ fontSize: 14 }}>{record.name}</Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Description</Typography.Text>,
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{text || '—'}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Data Type</Typography.Text>,
      dataIndex: 'dataType',
      key: 'dataType',
      width: 140,
      render: (dataType: string) => {
        const DtIcon = dataTypeIcons[dataType] || Type;
        return (
          <Flex align="center" gap={6} style={{ color: 'var(--primary-color)' }}>
            <DtIcon size={12} />
            <Typography.Text strong style={{ fontSize: 14, color: 'var(--primary-color)' }}>{dataType}</Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: unknown, record: PropertyDTO) => (
        <Flex justify="center" gap={4}>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<Pencil size={16} />} onClick={() => navigate(`/properties/${record.id}/edit`)} />
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
      <TableCard<PropertyDTO>
        columns={columns}
        dataSource={filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        rowKey="id"
        loading={loading}
        pagination={{
          count: filtered.length,
          page,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: setRowsPerPage,
          label: 'properties',
        }}
      />
    </div>
  );
}
