import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Checkbox, Tag, Card, Typography, Flex, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Plus, Network, Pencil, Share2, Trash2, ArrowLeftRight, List, LayoutGrid } from 'lucide-react';
import TableCard from '../components/TableCard';
import Pagination from '../components/Pagination';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listTopologies, deleteTopology, type TopologyDTO } from '../services/coreService';

export default function TopologyListPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const confirmModal = useModal();

  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [allTopologies, setAllTopologies] = useState<TopologyDTO[]>([]);

  const loadTopologies = useCallback(async (keyword: string) => {
    if (!currentOntologyId) {
      setAllTopologies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listTopologies({
        ontologyId: currentOntologyId,
        keyword: keyword || undefined,
      });
      setAllTopologies(res.data ?? []);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  // Load on mount / ontology change
  useEffect(() => {
    void loadTopologies(search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTopologies]);

  // Debounced search — skip initial mount (effect above already loads data)
  const searchMounted = useRef(false);
  useEffect(() => {
    if (!searchMounted.current) {
      searchMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setPage(0);
      void loadTopologies(search);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Client-side pagination
  const total = allTopologies.length;
  const pageData = allTopologies.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Header
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: 'Ontologies' },
          { title: <Typography.Text strong>Topology</Typography.Text> },
        ]}
      />,
    );
    setActions(
      <Flex gap={8}>
        <Input
          placeholder="Search topologies..."
          prefix={<Search size={16} />}
          style={{ width: 240 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/topology/new')}
        >
          New Topology
        </Button>
        <div className="header-view-toggle">
          {([
            { key: 'list' as const, Icon: List },
            { key: 'grid' as const, Icon: LayoutGrid },
          ]).map(({ key, Icon }) => (
            <div
              key={key}
              className={view === key ? 'active' : ''}
              onClick={() => setView(key)}
            >
              <Icon size={16} color={view === key ? undefined : 'gray'} />
            </div>
          ))}
        </div>
      </Flex>,
    );
  }, [setBreadcrumbs, setActions, navigate, search, view]);

  const handleDelete = (record: TopologyDTO) => {
    confirmModal.confirm.delete({
      title: `Delete "${record.name}"?`,
      description: 'This action cannot be undone. The topology will be permanently deleted.',
      confirmName: record.name,
      confirmLabel: 'the topology name',
      onConfirm: async () => {
        try {
          await deleteTopology(record.id);
          message.success('Topology deleted');
          void loadTopologies(search);
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete topology');
        }
      },
    });
  };

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? pageData.map((t) => t.id) : []);
  };

  const columns: ColumnsType<TopologyDTO> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < pageData.length}
          checked={selected.length === pageData.length && pageData.length > 0}
          onChange={handleSelectAll}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_: unknown, record: TopologyDTO) => (
        <Checkbox
          checked={selected.includes(record.id)}
          onChange={() =>
            setSelected((p) =>
              p.includes(record.id) ? p.filter((i) => i !== record.id) : [...p, record.id],
            )
          }
        />
      ),
    },
    {
      title: (
        <Flex align="center" gap={6}>
          <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>
            Name
          </Typography.Text>
          <ArrowLeftRight size={14} color="gray" />
        </Flex>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (_: string, record: TopologyDTO) => (
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(var(--primary-color-rgb, 99, 102, 241), 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Network size={16} color="var(--primary-color)" />
          </div>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {record.name}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Description</Typography.Text>,
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: '#a1a1aa' }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Classes</Typography.Text>,
      dataIndex: 'classCount',
      key: 'classCount',
      width: 100,
      align: 'center',
      render: (val: number) => <Tag>{val}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Instances</Typography.Text>,
      dataIndex: 'instanceCount',
      key: 'instanceCount',
      width: 100,
      align: 'center',
      render: (val: number) => <Tag>{val}</Tag>,
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_: unknown, record: TopologyDTO) => (
        <Flex justify="center" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<Share2 size={16} />}
            onClick={() => navigate(`/topology/${record.id}/view`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/topology/${record.id}/edit`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Trash2 size={16} />}
            onClick={() => handleDelete(record)}
          />
        </Flex>
      ),
    },
  ];

  if (!currentOntologyId) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
        <Network size={48} color="#a1a1aa" />
        <Typography.Text style={{ fontSize: 16, color: '#a1a1aa' }}>No ontology selected</Typography.Text>
        <Button type="primary" onClick={() => navigate('/ontologies')}>Select an Ontology</Button>
      </div>
    );
  }

  return (
    <div className="list-page">
      {view === 'list' ? (
        <TableCard<TopologyDTO>
          columns={columns}
          dataSource={pageData}
          rowKey="id"
          loading={loading}
          rowClassName={(record, index) =>
            selected.includes(record.id) ? 'ant-table-row-selected' : index % 2 === 1 ? 'ant-table-row-striped' : ''
          }
          pagination={{
            count: total,
            page,
            rowsPerPage,
            onPageChange: setPage,
            onRowsPerPageChange: setRowsPerPage,
            label: 'topologies',
          }}
        />
      ) : (
        /* Grid / Card view */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #27273a', borderRadius: 8 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignContent: 'start' }}>
            {pageData.map((record) => (
              <Card
                key={record.id}
                hoverable
                style={{ borderColor: '#27273a' }}
                styles={{ body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 16 } }}
              >
                {/* Card header */}
                <Flex align="center" gap={12}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(var(--primary-color-rgb, 99, 102, 241), 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Network size={20} color="var(--primary-color)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong style={{ fontSize: 15, display: 'block' }} ellipsis>
                      {record.name}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: '#71717a' }} ellipsis>
                      {record.description || 'No description'}
                    </Typography.Text>
                  </div>
                </Flex>

                {/* Stats */}
                <Flex gap={12}>
                  <Tag>{record.classCount} classes</Tag>
                  <Tag>{record.instanceCount} instances</Tag>
                </Flex>

                {/* Actions */}
                <Flex justify="space-between" align="center" style={{ borderTop: '1px solid #27273a', paddingTop: 12 }}>
                  <Flex gap={4}>
                    <Button
                      type="text"
                      size="small"
                      icon={<Share2 size={14} />}
                      onClick={() => navigate(`/topology/${record.id}/view`)}
                      style={{ color: '#a1a1aa' }}
                    >
                      View
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      icon={<Pencil size={14} />}
                      onClick={() => navigate(`/topology/${record.id}/edit`)}
                      style={{ color: '#a1a1aa' }}
                    >
                      Edit
                    </Button>
                  </Flex>
                  <Button
                    type="text"
                    size="small"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDelete(record)}
                    style={{ color: '#ef4444' }}
                  />
                </Flex>
              </Card>
            ))}
          </div>
          <Pagination
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            label="topologies"
          />
        </div>
      )}
    </div>
  );
}
