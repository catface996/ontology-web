import { useState, useEffect } from 'react';
import { Breadcrumb, Button, Typography, Flex } from 'antd';
import {
  SlidersHorizontal, Search, Square,
  Database, Upload, Boxes, Link as LinkIcon,
  Eye, Redo,
} from 'lucide-react';
import Pagination from '../components/Pagination';
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
  { value: 'all', label: 'All Tasks' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'failed', label: 'Failed' },
];

/* -- Main component -- */
export default function TaskHistoryPage() {
  const { setBreadcrumbs, setActions } = useHeader();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
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
      <Button icon={<SlidersHorizontal size={16} />}>
        Filter
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  const filteredTasks =
    activeFilter === 'all'
      ? allTasks
      : allTasks.filter((t) => t.status === activeFilter);

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        {/* Toolbar */}
        <Flex align="center" justify="space-between">
          {/* Filter Tabs */}
          <Flex gap={8}>
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.value;
              return (
                <div
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 100,
                    background: active ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)',
                    color: active ? '#fff' : undefined,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: 'inherit' }}>
                    {tab.label}
                  </Typography.Text>
                </div>
              );
            })}
          </Flex>

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <Search size={16} color="#a1a1aa" />
            <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
              Search tasks...
            </Typography.Text>
          </div>
        </Flex>

        {/* Task List Card */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 12,
            border: '1px solid #27273a',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '12px 12px 0 0',
            }}
          >
            <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', width: 350 }}>
              Task
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', width: 120 }}>
              Status
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', width: 150 }}>
              Started
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', width: 100 }}>
              Duration
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', width: 100 }}>
              Actions
            </Typography.Text>
          </div>

          {/* Table Body */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredTasks.map((task, idx) => {
              const st = statusConfig[task.status];
              const Icon = task.icon;
              const isLast = idx === filteredTasks.length - 1;
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    ...(!isLast && {
                      borderBottom: '1px solid #27273a',
                    }),
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Task */}
                  <div style={{ width: 350, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Flex align="center" gap={8}>
                      <Icon size={16} color={task.iconColor} />
                      <Typography.Text style={{ fontSize: 14, fontWeight: 500 }}>
                        {task.title}
                      </Typography.Text>
                    </Flex>
                    <Typography.Text style={{ fontSize: 12, color: '#a1a1aa' }}>
                      {task.description}
                    </Typography.Text>
                  </div>

                  {/* Status */}
                  <div style={{ width: 120, display: 'flex', alignItems: 'center' }}>
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
                  </div>

                  {/* Started */}
                  <Typography.Text style={{ fontSize: 13, width: 150 }}>
                    {task.started}
                  </Typography.Text>

                  {/* Duration */}
                  <Typography.Text style={{ fontSize: 13, width: 100 }}>
                    {task.duration}
                  </Typography.Text>

                  {/* Actions */}
                  <Flex style={{ width: 100 }} align="center" gap={8}>
                    <Button type="text" size="small" icon={<Eye size={16} color="#a1a1aa" />} />
                    {task.status === 'in_progress' ? (
                      <Button type="text" size="small" icon={<Square size={18} color="#EF4444" />} />
                    ) : (
                      <Button
                        type="text"
                        size="small"
                        icon={
                          <Redo
                            size={16}
                            color={task.status === 'failed' ? 'var(--primary-color)' : '#a1a1aa'}
                          />
                        }
                      />
                    )}
                  </Flex>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            count={24}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            label="tasks"
          />
        </div>
      </div>
    </>
  );
}
