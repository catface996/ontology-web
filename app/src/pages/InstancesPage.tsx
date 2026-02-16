import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Button, Checkbox, Typography, Flex, App, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  User, Building2, MapPin, Calendar,
  Search, Plus, LayoutGrid, List,
  Pencil, Share2, Trash2,
  Database, ArrowUpDown,
} from 'lucide-react';
import TableCard from '../components/TableCard';
import { useModal } from '../contexts/ModalContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import {
  listInstances, listClasses, deleteInstance,
  type InstanceDTO, type ClassDTO,
} from '../services/coreService';

/* -- Types -- */
interface InstanceRow {
  id: string;
  name: string;
  description: string;
  className: string;
  classIcon: React.ComponentType<{ size?: number; color?: string }>;
  relations: number;
  created: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

/* -- Icon palette -- */
const CLASS_ICONS: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; color: string }> = {
  person:       { icon: User, color: 'var(--primary-color)' },
  organization: { icon: Building2, color: '#22D3EE' },
  location:     { icon: MapPin, color: '#F472B6' },
  event:        { icon: Calendar, color: '#FBBF24' },
};
const PALETTE_COLORS = ['var(--primary-color)', '#22D3EE', '#F472B6', '#4ADE80', '#FBBF24', '#EC4899'];
const DEFAULT_ICON = { icon: Database, color: 'var(--primary-color)' };

function getClassVisual(className: string, index: number) {
  const key = className.toLowerCase();
  return CLASS_ICONS[key] ?? { ...DEFAULT_ICON, color: PALETTE_COLORS[index % PALETTE_COLORS.length] };
}

function dtoToRow(dto: InstanceDTO & Record<string, unknown>, classIndex: number): InstanceRow {
  const visual = getClassVisual(dto.className ?? '', classIndex);
  const relationCount = (dto.relationCount ?? dto.relation_count ?? 0) as number;
  const createdAt = (dto.createdAt ?? dto.created_at ?? '') as string;
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? '',
    className: dto.className ?? '',
    classIcon: visual.icon,
    relations: relationCount,
    created: createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    icon: visual.icon,
    color: visual.color,
  };
}

/* -- Page -- */
export default function InstancesPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();

  const [pageData, setPageData] = useState<InstanceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([]);
  const [activeClass, setActiveClass] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const confirmModal = useModal();

  // Build class options from API
  const loadClassOptions = useCallback(async () => {
    if (!currentOntologyId) return;
    try {
      const res = await listClasses({ ontologyId: currentOntologyId });
      const classes: ClassDTO[] = res.data ?? [];
      setClassOptions([
        { value: 'all', label: 'All Instances' },
        ...classes.map((c) => ({ value: String(c.id), label: c.name })),
      ]);
    } catch {
      setClassOptions([{ value: 'all', label: 'All Instances' }]);
    }
  }, [currentOntologyId]);

  // Load instances (server-side pagination)
  const loadInstances = useCallback(async (keyword: string, classId: string, p: number, size: number) => {
    if (!currentOntologyId) {
      setPageData([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: { ontologyId: number; classId?: number; keyword?: string; page: number; size: number } = {
        ontologyId: currentOntologyId,
        page: p + 1, // backend is 1-indexed
        size,
      };
      if (classId !== 'all') params.classId = Number(classId);
      if (keyword) params.keyword = keyword;
      const res = await listInstances(params);
      const pageResult = res.data;
      if (pageResult && pageResult.records) {
        setPageData(pageResult.records.map((dto, i) => dtoToRow(dto as InstanceDTO & Record<string, unknown>, i)));
        setTotal(pageResult.total);
      } else {
        setPageData([]);
        setTotal(0);
      }
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  // Initial load
  useEffect(() => {
    void loadClassOptions();
  }, [loadClassOptions]);

  // Load on filter/page change
  useEffect(() => {
    void loadInstances(search, activeClass, page, rowsPerPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClass, page, rowsPerPage, loadInstances]);

  // Debounced search — skip initial mount (effect above already loads data)
  const searchMounted = useRef(false);
  useEffect(() => {
    if (!searchMounted.current) {
      searchMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setPage(0);
      void loadInstances(search, activeClass, 0, rowsPerPage);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Header
  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Ontologies</a> },
          { title: <Typography.Text strong>Instances</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8} align="center">
        <Select
          value={activeClass}
          onChange={(val) => { setActiveClass(val); setPage(0); }}
          style={{ minWidth: 160 }}
          options={classOptions}
        />
        <Input
          placeholder="Search instances..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="header-view-toggle">
          {[
            { key: 'list', Icon: List },
            { key: 'grid', Icon: LayoutGrid },
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
          onClick={() => navigate('/instances/new/edit')}
        >
          New Instance
        </Button>
      </Flex>
    );
  }, [setBreadcrumbs, setActions, navigate, search, activeClass, classOptions, view]);

  // Delete handler
  const handleDelete = (record: InstanceRow) => {
    confirmModal.confirm.delete({
      title: `Delete "${record.name}"?`,
      description: 'This action cannot be undone. The instance and all its property values and relations will be permanently deleted.',
      confirmName: record.name,
      confirmLabel: 'the instance name',
      onConfirm: async () => {
        try {
          await deleteInstance(Number(record.id));
          message.success('Instance deleted');
          void loadInstances(search, activeClass, page, rowsPerPage);
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Failed to delete instance');
        }
      },
    });
  };

  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    setSelected(e.target.checked ? pageData.map((c) => c.id) : []);
  };

  const columns: ColumnsType<InstanceRow> = [
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
      render: (_: unknown, record: InstanceRow) => (
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
            Instance
          </Typography.Text>
          <ArrowUpDown size={14} color="gray" />
        </Flex>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: string, record: InstanceRow) => (
        <Flex align="center" gap={10} style={{ whiteSpace: 'nowrap' }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${record.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <record.icon size={16} color={record.color} />
          </div>
          <Typography.Text strong style={{ fontSize: 14 }} ellipsis>
            {record.name}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Description</Typography.Text>,
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Class</Typography.Text>,
      dataIndex: 'className',
      key: 'className',
      width: 140,
      render: (_: string, record: InstanceRow) => (
        <Flex align="center" gap={6} style={{ color: 'var(--primary-color)' }}>
          <record.classIcon size={12} />
          <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary-color)' }}>
            {record.className}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Relations</Typography.Text>,
      dataIndex: 'relations',
      key: 'relations',
      width: 100,
      align: 'center',
      render: (val: number) => (
        <span style={{ display: 'inline-block', borderRadius: 100, background: 'rgba(255,255,255,0.06)', padding: '4px 10px', fontSize: 13, fontWeight: 500 }}>
          {val}
        </span>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Created</Typography.Text>,
      dataIndex: 'created',
      key: 'created',
      width: 120,
      align: 'center',
      render: (text: string) => (
        <span style={{ display: 'inline-block', borderRadius: 100, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>
          {text || '--'}
        </span>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_: unknown, record: InstanceRow) => (
        <Flex justify="center" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<Share2 size={16} />}
            onClick={() => navigate(`/instances/${record.id}/topology`)}
          />
          <Button
            type="text"
            size="small"
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/instances/${record.id}/edit`)}
          />
          <Button type="text" size="small" icon={<Trash2 size={16} />} onClick={() => handleDelete(record)} />
        </Flex>
      ),
    },
  ];

  if (!currentOntologyId) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
        <Database size={48} color="#a1a1aa" />
        <Typography.Text style={{ fontSize: 16, color: '#a1a1aa' }}>No ontology selected</Typography.Text>
        <Button type="primary" onClick={() => navigate('/ontologies')}>Select an Ontology</Button>
      </div>
    );
  }

  return (
    <div className="list-page">
      <TableCard<InstanceRow>
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
          label: 'instances',
        }}
      />
    </div>
  );
}
