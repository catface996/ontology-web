import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Checkbox, Tag, Typography, Flex, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CornerDownRight,
  Search, Plus, Boxes, List, Pencil, Brain, Trash2, Share2,
  GitFork, File, ArrowLeftRight,
} from 'lucide-react';
import TableCard from '../components/TableCard';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listClasses, deleteClass, type ClassDTO } from '../services/coreService';
import { resolveClassIcon, DEFAULT_CLASS_COLOR } from '../utils/classIconMap';

interface ClassData {
  id: string;
  name: string;
  description: string;
  parent: string | null;
  childCount: number;
  instanceCount: number;
  status: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

function dtoToClassData(dto: ClassDTO): ClassData {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? '',
    parent: dto.parentClassName ?? null,
    childCount: dto.childCount ?? 0,
    instanceCount: dto.instanceCount ?? 0,
    status: dto.status ?? 'ACTIVE',
    icon: resolveClassIcon(dto.icon),
    color: dto.color || DEFAULT_CLASS_COLOR,
  };
}

const filters = [
  { key: 'all', label: 'All' },
  { key: 'root', label: 'Root', Icon: GitFork },
  { key: 'leaf', label: 'Leaf', Icon: File },
];

export default function ClassesPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const confirmModal = useModal();

  // Store all classes from API; pagination is client-side
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);

  const loadClasses = useCallback(async (keyword: string, filterKey: string) => {
    if (!currentOntologyId) {
      setAllClasses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listClasses({
        ontologyId: currentOntologyId,
        name: keyword || undefined,
        filter: filterKey === 'all' ? undefined : filterKey.toUpperCase(),
      });
      const list = res.data ?? [];
      setAllClasses(list.map(dtoToClassData));
    } catch {
      // Error handled below in the effect; keep existing data
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  // Load on filter change
  useEffect(() => {
    void loadClasses(search, filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, loadClasses]);

  // Debounced search — skip initial mount (effect 1 already loads data)
  const searchMounted = useRef(false);
  useEffect(() => {
    if (!searchMounted.current) {
      searchMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setPage(0);
      void loadClasses(search, filter);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Client-side pagination
  const classesData = allClasses.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const total = allClasses.length;

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Ontologies</a> },
          { title: <Typography.Text strong>Classes</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8} align="center">
        {/* Filter toggle */}
        <div className="header-filter-toggle">
          {filters.map((f) => (
            <div
              key={f.key}
              className={filter === f.key ? 'active' : ''}
              onClick={() => { setFilter(f.key); setPage(0); }}
            >
              {f.Icon && <f.Icon size={14} />}
              {f.label}
            </div>
          ))}
        </div>

        <Input
          placeholder="Search classes..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="header-view-toggle">
          {[
            { key: 'list', Icon: List },
            { key: 'grid', Icon: Boxes },
          ].map(({ key, Icon }) => (
            <div
              key={key}
              className={view === key ? 'active' : ''}
              onClick={() => setView(key)}
            >
              <Icon size={16} color={view === key ? undefined : 'gray'} />
            </div>
          ))}
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/classes/new/edit')}
        >
          New Class
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate, search, filter, view]);

  const handleDelete = (record: ClassData) => {
    confirmModal.confirm.delete({
      title: `Delete "${record.name}"?`,
      description: 'This action cannot be undone. The class and all its related data will be permanently deleted.',
      confirmName: record.name,
      confirmLabel: 'the class name',
      onConfirm: async () => {
        try {
          await deleteClass(Number(record.id));
          message.success('Class deleted');
          void loadClasses(search, filter);
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete class');
        }
      },
    });
  };

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? classesData.map((c) => c.id) : []);
  };

  const columns: ColumnsType<ClassData> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < classesData.length}
          checked={selected.length === classesData.length}
          onChange={handleSelectAll}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 40,
      render: (_: unknown, record: ClassData) => (
        <Checkbox
          checked={selected.includes(record.id)}
          onChange={() =>
            setSelected((p) =>
              p.includes(record.id) ? p.filter((i) => i !== record.id) : [...p, record.id]
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
      width: 200,
      render: (_: string, record: ClassData) => (
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${record.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <record.icon size={16} color={record.color} />
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
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Parent Class</Typography.Text>,
      dataIndex: 'parent',
      key: 'parent',
      width: 140,
      render: (parent: string | null) =>
        parent ? (
          <Flex align="center" gap={6} style={{ color: 'var(--primary-color)' }}>
            <CornerDownRight size={12} />
            <Typography.Text strong style={{ fontSize: 14, color: 'var(--primary-color)' }}>
              {parent}
            </Typography.Text>
          </Flex>
        ) : (
          <Typography.Text style={{ fontSize: 14, color: '#71717a' }}>—</Typography.Text>
        ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Children</Typography.Text>,
      dataIndex: 'childCount',
      key: 'childCount',
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
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Status</Typography.Text>,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (val: string) => (
        <Tag color={val === 'ACTIVE' ? 'green' : 'orange'}>{val}</Tag>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_: unknown, record: ClassData) => (
        <Flex justify="center" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<Share2 size={16} />}
            onClick={() => navigate(`/classes/${record.id}/topology`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Brain size={16} />}
            onClick={() => navigate(`/classes/${record.id}/logic`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/classes/${record.id}/edit`)}
          />
          <Button type="text" size="small" icon={<Trash2 size={16} />} onClick={() => handleDelete(record)} />
        </Flex>
      ),
    },
  ];

  if (!currentOntologyId) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
        <Boxes size={48} color="#a1a1aa" />
        <Typography.Text style={{ fontSize: 16, color: '#a1a1aa' }}>No ontology selected</Typography.Text>
        <Button type="primary" onClick={() => navigate('/ontologies')}>Select an Ontology</Button>
      </div>
    );
  }

  return (
    <div className="list-page">
      <TableCard<ClassData>
        columns={columns}
        dataSource={classesData}
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
          label: 'classes',
        }}
      />
    </div>
  );
}
