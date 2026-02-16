import { useState, useEffect } from 'react';
import { Breadcrumb, Button, Input, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search, Square,
  Database, Upload, Boxes, Link as LinkIcon,
  Eye, Redo,
} from 'lucide-react';
import TableCard from '../components/TableCard';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
type TaskStatus = 'in_progress' | 'completed' | 'failed';
type FilterTab = 'all' | 'completed' | 'in_progress' | 'failed';

interface TaskItem {
  id: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  title: string;
  description: string;
  status: TaskStatus;
  started: string;
  duration: string;
}

/* -- Status config -- */
const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  in_progress: { label: 'In Progress', color: 'var(--primary-color)', bg: 'rgba(var(--primary-rgb), 0.13)' },
  completed:   { label: 'Completed',   color: '#22C55E', bg: '#22C55E20' },
  failed:      { label: 'Failed',      color: '#EF4444', bg: '#EF444420' },
};

/* -- Mock data -- */
const allTasks: TaskItem[] = [
  {
    id: 1, icon: Database, iconColor: 'var(--primary-color)',
    title: 'Create 10 Person Instances',
    description: 'Generate sample Person data with name, email, organization',
    status: 'in_progress', started: 'Today, 10:32 AM', duration: '2m 15s',
  },
  {
    id: 2, icon: Upload, iconColor: '#22C55E',
    title: 'Import RDF Data',
    description: 'Import enterprise ontology from RDF/XML file',
    status: 'completed', started: 'Today, 10:15 AM', duration: '5m 42s',
  },
  {
    id: 3, icon: Boxes, iconColor: '#22C55E',
    title: 'Create Organization Class',
    description: 'Define Organization class with properties and relations',
    status: 'completed', started: 'Today, 9:48 AM', duration: '1m 23s',
  },
  {
    id: 4, icon: LinkIcon, iconColor: '#EF4444',
    title: 'Auto-generate Relations',
    description: 'Analyze data and suggest potential relations between classes',
    status: 'failed', started: 'Yesterday, 4:22 PM', duration: '0m 45s',
  },
  {
    id: 5, icon: LinkIcon, iconColor: '#22C55E',
    title: 'Define worksFor Relation',
    description: 'Create worksFor relation between Person and Organization',
    status: 'completed', started: 'Yesterday, 3:15 PM', duration: '0m 58s',
  },
];

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'failed', label: 'Failed' },
];

/* -- Main component -- */
export default function TaskHistoryPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Agent</a> },
          { title: <Typography.Text strong>Task History</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Flex gap={8} align="center">
        <div className="header-filter-toggle">
          {filterTabs.map((tab) => (
            <div
              key={tab.value}
              className={activeFilter === tab.value ? 'active' : ''}
              onClick={() => { setActiveFilter(tab.value); setPage(0); }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <Input
          placeholder="Search tasks..."
          prefix={<Search size={16} />}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
      </Flex>
    );
  }, [setBreadcrumbs, setActions, activeFilter, search]);

  const filteredTasks = allTasks
    .filter((t) => activeFilter === 'all' || t.status === activeFilter)
    .filter((t) =>
      !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    );

  const columns: ColumnsType<TaskItem> = [
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Task</Typography.Text>,
      dataIndex: 'title',
      key: 'title',
      render: (_: unknown, record: TaskItem) => {
        const Icon = record.icon;
        return (
          <Flex align="center" gap={10}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${record.iconColor}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Icon size={16} color={record.iconColor} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography.Text strong style={{ fontSize: 14 }}>
                {record.title}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>
                {record.description}
              </Typography.Text>
            </div>
          </Flex>
        );
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Status</Typography.Text>,
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: TaskStatus) => {
        const st = statusConfig[status];
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: 100,
              background: st.bg,
              color: st.color,
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {st.label}
          </span>
        );
      },
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Started</Typography.Text>,
      dataIndex: 'started',
      key: 'started',
      width: 160,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 13 }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Duration</Typography.Text>,
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 13 }}>{text}</Typography.Text>
      ),
    },
    {
      title: <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: 0.5 }}>Actions</Typography.Text>,
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: unknown, record: TaskItem) => (
        <Flex justify="center" gap={4}>
          <Button type="text" size="small" icon={<Eye size={16} />} />
          {record.status === 'in_progress' ? (
            <Button type="text" size="small" icon={<Square size={18} color="#EF4444" />} />
          ) : (
            <Button
              type="text"
              size="small"
              icon={
                <Redo
                  size={16}
                  color={record.status === 'failed' ? 'var(--primary-color)' : undefined}
                />
              }
            />
          )}
        </Flex>
      ),
    },
  ];

  return (
    <div className="list-page">
      <TableCard<TaskItem>
        columns={columns}
        dataSource={filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        rowKey="id"
        pagination={{
          count: filteredTasks.length,
          page,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: setRowsPerPage,
          label: 'tasks',
        }}
      />
    </div>
  );
}
