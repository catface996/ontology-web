import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Tag, Typography, Flex, App, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowRight, Search, Plus, Pencil, Trash2, Brain,
  ChevronRight,
} from 'lucide-react';
import TableCard from '../components/TableCard';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listRelations, deleteRelation, type RelationDTO } from '../services/coreService';

export default function RelationsPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const [data, setData] = useState<RelationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const confirmModal = useModal();

  const loadData = async () => {
    if (!currentOntologyId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await listRelations({ ontologyId: currentOntologyId });
      setData(res.data ?? []);
    } catch {
      message.error('Failed to load relations');
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
          { title: <Typography.Text strong>Relations</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8} align="center">
        <Input
          placeholder="Search relations..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          allowClear
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/relations/new/edit')}
        >
          New Relation
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate, search]);

  const handleDelete = (record: RelationDTO) => {
    confirmModal.confirm.delete({
      title: `Delete "${record.name}"?`,
      description: 'This action cannot be undone. The relation and all its related data will be permanently deleted.',
      confirmName: record.name,
      confirmLabel: 'the relation name',
      onConfirm: async () => {
        try {
          await deleteRelation(record.id);
          message.success('Relation deleted');
          void loadData();
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete relation');
        }
      },
    });
  };

  const filtered = search
    ? data.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : data;

  const columns: ColumnsType<RelationDTO> = [
    {
      title: (
        <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>
          Relation
        </Typography.Text>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: RelationDTO) => (
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(var(--primary-rgb), 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowRight size={16} color="var(--primary-color)" />
          </div>
          <Typography.Text strong style={{ fontSize: 14 }}>{record.name}</Typography.Text>
        </Flex>
      ),
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
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Source Class</Typography.Text>,
      dataIndex: 'domainClassName',
      key: 'domainClassName',
      width: 140,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: text ? undefined : '#a1a1aa' }}>{text || 'Any'}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Cardinality</Typography.Text>,
      dataIndex: 'cardinality',
      key: 'cardinality',
      width: 130,
      align: 'center',
      render: (val: string) => {
        const labels: Record<string, string> = {
          ONE_TO_ONE: '1 : 1',
          ONE_TO_MANY: '1 : N',
          MANY_TO_ONE: 'N : 1',
          MANY_TO_MANY: 'N : N',
        };
        return val ? <Tag>{labels[val] ?? val}</Tag> : <Typography.Text type="secondary">—</Typography.Text>;
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Target Class</Typography.Text>,
      dataIndex: 'rangeClassName',
      key: 'rangeClassName',
      width: 140,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: text ? undefined : '#a1a1aa' }}>{text || 'Any'}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Properties</Typography.Text>,
      key: 'properties',
      width: 200,
      render: (_: unknown, record: RelationDTO) => {
        const tags: string[] = [];
        if (record.isFunctional) tags.push('Functional');
        if (record.isInverseFunctional) tags.push('InvFunc');
        if (record.isSymmetric) tags.push('Symmetric');
        if (record.isTransitive) tags.push('Transitive');
        return tags.length > 0
          ? <Flex gap={4} wrap="wrap">{tags.map(t => <Tag key={t} style={{ fontSize: 11 }}>{t}</Tag>)}</Flex>
          : <Typography.Text type="secondary">—</Typography.Text>;
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_: unknown, record: RelationDTO) => (
        <Flex justify="center" gap={4}>
          <Tooltip title="Logic Rules">
            <Button type="text" size="small" icon={<Brain size={16} />} onClick={() => navigate(`/relations/${record.id}/logic`)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<Pencil size={16} />} onClick={() => navigate(`/relations/${record.id}/edit`)} />
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
      <TableCard<RelationDTO>
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
          label: 'relations',
        }}
      />
    </div>
  );
}
