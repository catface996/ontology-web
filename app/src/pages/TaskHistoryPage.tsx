import { useState } from 'react';
import {
  Box, Breadcrumbs, Link, Typography, IconButton,
} from '@mui/material';
import {
  ChevronRight, SlidersHorizontal, Search, Eye, RefreshCw, Square,
  Database, Upload, Boxes, Link as LinkIcon,
} from 'lucide-react';
import Pagination from '../components/Pagination';

/* ── Types ── */
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

/* ── Status config ── */
const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  in_progress: { label: 'In Progress', color: '#8B5CF6', bg: '#8B5CF620' },
  completed:   { label: 'Completed',   color: '#22C55E', bg: '#22C55E20' },
  failed:      { label: 'Failed',      color: '#EF4444', bg: '#EF444420' },
};

/* ── Mock data ── */
const allTasks: TaskItem[] = [
  {
    id: 1, icon: Database, iconColor: '#8B5CF6',
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

/* ── Main component ── */
export default function TaskHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredTasks =
    activeFilter === 'all'
      ? allTasks
      : allTasks.filter((t) => t.status === activeFilter);

  return (
    <>
      {/* Header */}
      <Box
        height={64}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        borderBottom={1}
        borderColor="divider"
      >
        <Breadcrumbs separator={<ChevronRight size={14} />}>
          <Link underline="hover" color="text.secondary" href="#">
            Agent
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Task History
          </Typography>
        </Breadcrumbs>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <SlidersHorizontal size={16} />
          <Typography variant="body2" fontWeight={500} fontSize={14}>
            Filter
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} p={3} display="flex" flexDirection="column" gap={2} overflow="hidden">
        {/* Toolbar */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* Filter Tabs */}
          <Box display="flex" gap={1}>
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.value;
              return (
                <Box
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 100,
                    bgcolor: active ? 'primary.main' : 'action.hover',
                    color: active ? '#fff' : 'text.primary',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: active ? 'primary.dark' : 'action.selected' },
                  }}
                >
                  <Typography fontSize={13} fontWeight={500}>
                    {tab.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Search */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Search size={16} color="#a1a1aa" />
            <Typography fontSize={13} color="text.secondary">
              Search tasks...
            </Typography>
          </Box>
        </Box>

        {/* Task List Card */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2.5,
              py: 2,
              bgcolor: 'action.hover',
              borderRadius: '12px 12px 0 0',
            }}
          >
            <Typography fontSize={12} fontWeight={600} color="text.secondary" sx={{ width: 350 }}>
              Task
            </Typography>
            <Typography fontSize={12} fontWeight={600} color="text.secondary" sx={{ width: 120 }}>
              Status
            </Typography>
            <Typography fontSize={12} fontWeight={600} color="text.secondary" sx={{ width: 150 }}>
              Started
            </Typography>
            <Typography fontSize={12} fontWeight={600} color="text.secondary" sx={{ width: 100 }}>
              Duration
            </Typography>
            <Typography fontSize={12} fontWeight={600} color="text.secondary" sx={{ width: 100 }}>
              Actions
            </Typography>
          </Box>

          {/* Table Body */}
          <Box flex={1} overflow="auto">
            {filteredTasks.map((task, idx) => {
              const st = statusConfig[task.status];
              const Icon = task.icon;
              const isLast = idx === filteredTasks.length - 1;
              return (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2.5,
                    py: 2,
                    ...(!isLast && {
                      borderBottom: 1,
                      borderColor: 'divider',
                    }),
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Task */}
                  <Box sx={{ width: 350, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon size={16} color={task.iconColor} />
                      <Typography fontSize={14} fontWeight={500}>
                        {task.title}
                      </Typography>
                    </Box>
                    <Typography fontSize={12} color="text.secondary">
                      {task.description}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={{ width: 120, display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 100,
                        bgcolor: st.bg,
                        color: st.color,
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1,
                      }}
                    >
                      {st.label}
                    </Box>
                  </Box>

                  {/* Started */}
                  <Typography fontSize={13} sx={{ width: 150 }}>
                    {task.started}
                  </Typography>

                  {/* Duration */}
                  <Typography fontSize={13} sx={{ width: 100 }}>
                    {task.duration}
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ width: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" sx={{ p: 0.5 }}>
                      <Eye size={18} color="#a1a1aa" />
                    </IconButton>
                    {task.status === 'in_progress' ? (
                      <IconButton size="small" sx={{ p: 0.5 }}>
                        <Square size={18} color="#EF4444" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" sx={{ p: 0.5 }}>
                        <RefreshCw
                          size={18}
                          color={task.status === 'failed' ? '#8B5CF6' : '#a1a1aa'}
                        />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Pagination */}
          <Pagination
            count={24}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            label="tasks"
          />
        </Box>
      </Box>
    </>
  );
}
