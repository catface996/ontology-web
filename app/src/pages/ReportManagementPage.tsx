import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Breadcrumbs, Link, Typography, Button, TextField, InputAdornment, IconButton,
} from '@mui/material';
import {
  ChevronRight, ChevronLeft, Plus, Search, BarChart2, Users, PieChart,
  TrendingUp, Database, TriangleAlert, Zap, Globe, Ellipsis,
} from 'lucide-react';

/* ── Types ── */
type ReportStatus = 'Active' | 'Pending' | 'Draft';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  status: ReportStatus;
  updated: string;
}

/* ── Status config ── */
const statusConfig: Record<ReportStatus, { color: string; bg: string }> = {
  Active:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  Pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  Draft:   { color: '#a1a1aa', bg: 'rgba(161,161,170,0.12)' },
};

/* ── Mock data ── */
const reports: Report[] = [
  { id: 'sales-overview',      title: 'Sales Overview',     description: 'Monthly sales performance and trends analysis',      icon: BarChart2,       iconColor: '#8b5cf6', status: 'Active',  updated: 'Updated 2 hours ago' },
  { id: 'user-analytics',      title: 'User Analytics',     description: 'User behavior and engagement metrics',               icon: Users,           iconColor: '#22d3ee', status: 'Active',  updated: 'Updated 1 day ago' },
  { id: 'revenue-breakdown',   title: 'Revenue Breakdown',  description: 'Revenue distribution by category',                   icon: PieChart,        iconColor: '#f472b6', status: 'Pending', updated: 'Updated 3 days ago' },
  { id: 'growth-metrics',      title: 'Growth Metrics',     description: 'Key performance indicators and growth',              icon: TrendingUp,      iconColor: '#4ade80', status: 'Active',  updated: 'Updated 5 hours ago' },
  { id: 'data-quality',        title: 'Data Quality',       description: 'Data integrity and quality assessment',              icon: Database,        iconColor: '#a855f7', status: 'Draft',   updated: 'Updated 1 week ago' },
  { id: 'error-analysis',      title: 'Error Analysis',     description: 'System errors and exception tracking',               icon: TriangleAlert,   iconColor: '#ef4444', status: 'Active',  updated: 'Updated 12 hours ago' },
  { id: 'performance-stats',   title: 'Performance Stats',  description: 'System performance and latency metrics',             icon: Zap,             iconColor: '#f59e0b', status: 'Active',  updated: 'Updated 30 min ago' },
  { id: 'traffic-sources',     title: 'Traffic Sources',    description: 'Website traffic and referral analysis',              icon: Globe,           iconColor: '#38bdf8', status: 'Pending', updated: 'Updated 2 days ago' },
];

const PAGE_SIZE = 8;

/* ── Report Card ── */
function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
  const Icon = report.icon;
  const st = statusConfig[report.status];

  return (
    <Box
      onClick={onClick}
      sx={{
        flex: '1 1 0',
        minWidth: 220,
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#111118',
        border: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'text.secondary' },
      }}
    >
      {/* Header */}
      <Box display="flex" flexDirection="column" gap={1.5}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: `${report.iconColor}20`,
            }}
          >
            <Icon size={20} color={report.iconColor} />
          </Box>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <Ellipsis size={20} />
          </IconButton>
        </Box>
        <Typography fontSize={16} fontWeight={600}>{report.title}</Typography>
        <Typography fontSize={13} color="text.secondary">{report.description}</Typography>
      </Box>

      {/* Footer */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography fontSize={12} color="#71717a">{report.updated}</Typography>
        <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: st.bg }}>
          <Typography fontSize={11} fontWeight={500} sx={{ color: st.color }}>
            {report.status}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Page ── */
export default function ReportManagementPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Split into rows of 4
  const row1 = paged.slice(0, 4);
  const row2 = paged.slice(4, 8);

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
            Data
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Report Management
          </Typography>
        </Breadcrumbs>

        <Button variant="contained" size="small" startIcon={<Plus size={16} />}>
          New Report
        </Button>
      </Box>

      {/* Content */}
      <Box flex={1} p={3} display="flex" flexDirection="column" gap={3} overflow="auto">
        {/* Title row */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontSize={20} fontWeight={600}>All Reports</Typography>
          <TextField
            size="small"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#a1a1aa" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 240,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#1a1a24',
                fontSize: 14,
              },
            }}
          />
        </Box>

        {/* Cards grid */}
        <Box flex={1} display="flex" flexDirection="column" gap={2.5}>
          {row1.length > 0 && (
            <Box display="flex" gap={2.5}>
              {row1.map((r) => (
                <ReportCard key={r.title} report={r} onClick={() => navigate(`/report-management/${r.id}`)} />
              ))}
              {/* Filler to keep 4-column layout */}
              {row1.length < 4 && Array.from({ length: 4 - row1.length }).map((_, i) => (
                <Box key={`filler1-${i}`} sx={{ flex: '1 1 0', minWidth: 220 }} />
              ))}
            </Box>
          )}
          {row2.length > 0 && (
            <Box display="flex" gap={2.5}>
              {row2.map((r) => (
                <ReportCard key={r.title} report={r} onClick={() => navigate(`/report-management/${r.id}`)} />
              ))}
              {row2.length < 4 && Array.from({ length: 4 - row2.length }).map((_, i) => (
                <Box key={`filler2-${i}`} sx={{ flex: '1 1 0', minWidth: 220 }} />
              ))}
            </Box>
          )}
        </Box>

        {/* Pagination */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontSize={13} color="text.secondary">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} reports
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: '#1a1a24',
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { borderColor: 'text.secondary' },
              }}
            >
              <ChevronLeft size={16} color="#a1a1aa" />
            </Box>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <Box
                  key={p}
                  onClick={() => setPage(p)}
                  sx={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    cursor: 'pointer',
                    ...(active
                      ? { bgcolor: 'primary.main' }
                      : {
                          bgcolor: '#1a1a24',
                          border: 1,
                          borderColor: 'divider',
                          '&:hover': { borderColor: 'text.secondary' },
                        }),
                  }}
                >
                  <Typography fontSize={14} fontWeight={500} color={active ? '#fff' : 'text.secondary'}>
                    {p}
                  </Typography>
                </Box>
              );
            })}
            <Box
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: '#1a1a24',
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { borderColor: 'text.secondary' },
              }}
            >
              <ChevronRight size={16} color="#a1a1aa" />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
