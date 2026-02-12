import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Input, Typography, Flex } from 'antd';
import {
  BarChart2, Users, PieChart,
  TrendingUp, Database, TriangleAlert, Zap, Globe,
  Plus, Search, ChevronLeft, ChevronRight, Ellipsis,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';

/* -- Types -- */
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

/* -- Status config -- */
const statusConfig: Record<ReportStatus, { color: string; bg: string }> = {
  Active:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  Pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  Draft:   { color: '#a1a1aa', bg: 'rgba(161,161,170,0.12)' },
};

/* -- Mock data -- */
const reports: Report[] = [
  { id: 'sales-overview',      title: 'Sales Overview',     description: 'Monthly sales performance and trends analysis',      icon: BarChart2,       iconColor: 'var(--primary-color)', status: 'Active',  updated: 'Updated 2 hours ago' },
  { id: 'user-analytics',      title: 'User Analytics',     description: 'User behavior and engagement metrics',               icon: Users,           iconColor: '#22d3ee', status: 'Active',  updated: 'Updated 1 day ago' },
  { id: 'revenue-breakdown',   title: 'Revenue Breakdown',  description: 'Revenue distribution by category',                   icon: PieChart,        iconColor: '#f472b6', status: 'Pending', updated: 'Updated 3 days ago' },
  { id: 'growth-metrics',      title: 'Growth Metrics',     description: 'Key performance indicators and growth',              icon: TrendingUp,      iconColor: '#4ade80', status: 'Active',  updated: 'Updated 5 hours ago' },
  { id: 'data-quality',        title: 'Data Quality',       description: 'Data integrity and quality assessment',              icon: Database,        iconColor: '#a855f7', status: 'Draft',   updated: 'Updated 1 week ago' },
  { id: 'error-analysis',      title: 'Error Analysis',     description: 'System errors and exception tracking',               icon: TriangleAlert,   iconColor: '#ef4444', status: 'Active',  updated: 'Updated 12 hours ago' },
  { id: 'performance-stats',   title: 'Performance Stats',  description: 'System performance and latency metrics',             icon: Zap,             iconColor: '#f59e0b', status: 'Active',  updated: 'Updated 30 min ago' },
  { id: 'traffic-sources',     title: 'Traffic Sources',    description: 'Website traffic and referral analysis',              icon: Globe,           iconColor: '#38bdf8', status: 'Pending', updated: 'Updated 2 days ago' },
];

const PAGE_SIZE = 8;

/* -- Report Card -- */
function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
  const Icon = report.icon;
  const st = statusConfig[report.status];

  return (
    <div
      onClick={onClick}
      style={{
        flex: '1 1 0',
        minWidth: 220,
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 12,
        background: '#111118',
        border: '1px solid #27273a',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Flex align="center" justify="space-between">
          <div
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              background: `${report.iconColor}20`,
            }}
          >
            <Icon size={20} color={report.iconColor} />
          </div>
          <Button type="text" size="small" icon={<Ellipsis size={20} />} />
        </Flex>
        <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>{report.title}</Typography.Text>
        <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>{report.description}</Typography.Text>
      </div>

      {/* Footer */}
      <Flex align="center" justify="space-between">
        <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{report.updated}</Typography.Text>
        <div style={{ padding: '4px 8px', borderRadius: 4, background: st.bg }}>
          <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: st.color }}>
            {report.status}
          </Typography.Text>
        </div>
      </Flex>
    </div>
  );
}

/* -- Page -- */
export default function ReportManagementPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
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

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Data</a> },
          { title: <Typography.Text strong>Report Management</Typography.Text> },
        ]}
      />
    );
    setActions(
      <Button type="primary" icon={<Plus size={16} />}>
        New Report
      </Button>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        {/* Title row */}
        <Flex align="center" justify="space-between">
          <Typography.Text style={{ fontSize: 20, fontWeight: 600 }}>All Reports</Typography.Text>
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            prefix={<Search size={16} color="#a1a1aa" />}
            style={{ width: 240, borderRadius: 8, background: '#1a1a24', fontSize: 14 }}
          />
        </Flex>

        {/* Cards grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {row1.length > 0 && (
            <Flex gap={20}>
              {row1.map((r) => (
                <ReportCard key={r.title} report={r} onClick={() => navigate(`/report-management/${r.id}`)} />
              ))}
              {/* Filler to keep 4-column layout */}
              {row1.length < 4 && Array.from({ length: 4 - row1.length }).map((_, i) => (
                <div key={`filler1-${i}`} style={{ flex: '1 1 0', minWidth: 220 }} />
              ))}
            </Flex>
          )}
          {row2.length > 0 && (
            <Flex gap={20}>
              {row2.map((r) => (
                <ReportCard key={r.title} report={r} onClick={() => navigate(`/report-management/${r.id}`)} />
              ))}
              {row2.length < 4 && Array.from({ length: 4 - row2.length }).map((_, i) => (
                <div key={`filler2-${i}`} style={{ flex: '1 1 0', minWidth: 220 }} />
              ))}
            </Flex>
          )}
        </div>

        {/* Pagination */}
        <Flex align="center" justify="space-between">
          <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} reports
          </Typography.Text>
          <Flex align="center" gap={8}>
            <div
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                background: '#1a1a24',
                border: '1px solid #27273a',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={12} color="#a1a1aa" />
            </div>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <div
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    cursor: 'pointer',
                    ...(active
                      ? { background: 'var(--primary-color)' }
                      : {
                          background: '#1a1a24',
                          border: '1px solid #27273a',
                        }),
                  }}
                >
                  <Typography.Text style={{ fontSize: 14, fontWeight: 500, color: active ? '#fff' : '#a1a1aa' }}>
                    {p}
                  </Typography.Text>
                </div>
              );
            })}
            <div
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                background: '#1a1a24',
                border: '1px solid #27273a',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={12} color="#a1a1aa" />
            </div>
          </Flex>
        </Flex>
      </div>
    </>
  );
}
