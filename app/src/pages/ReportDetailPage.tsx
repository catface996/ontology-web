import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import {
  Box, Breadcrumbs, Link, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  ChevronRight, ChevronLeft, BarChart2, DollarSign, ShoppingCart, Users, Target,
  TrendingUp, TrendingDown, Calendar, Timer, User, ChartLine,
  Table as TableIcon, FileText, Globe, Edit, Download, Share2, Trash2,
} from 'lucide-react';

/* ── Types ── */
type RowStatus = 'Completed' | 'Pending';

interface DataRow {
  date: string;
  region: string;
  revenue: string;
  orders: string;
  status: RowStatus;
}

interface MetricCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
}

interface RegionEntry {
  name: string;
  share: string;
  revenue: string;
}

/* ── Status config ── */
const statusColors: Record<RowStatus, { color: string; bg: string }> = {
  Completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  Pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

/* ── Mock data ── */
const metrics: MetricCard[] = [
  { label: 'Total Revenue', value: '$1,284,500', change: '+12.5% from last month', positive: true, icon: DollarSign, iconColor: '#8b5cf6' },
  { label: 'Total Orders', value: '8,432', change: '+8.2% from last month', positive: true, icon: ShoppingCart, iconColor: '#22d3ee' },
  { label: 'Avg. Order Value', value: '$152.40', change: '-3.1% from last month', positive: false, icon: Users, iconColor: '#f472b6' },
  { label: 'Conversion Rate', value: '3.24%', change: '+1.8% from last month', positive: true, icon: Target, iconColor: '#4ade80' },
];

const tableData: DataRow[] = [
  { date: 'Feb 5, 2025', region: 'North America', revenue: '$45,200', orders: '312', status: 'Completed' },
  { date: 'Feb 4, 2025', region: 'Europe', revenue: '$38,750', orders: '268', status: 'Completed' },
  { date: 'Feb 3, 2025', region: 'Asia Pacific', revenue: '$52,100', orders: '421', status: 'Pending' },
  { date: 'Feb 2, 2025', region: 'Latin America', revenue: '$28,900', orders: '195', status: 'Completed' },
  { date: 'Feb 1, 2025', region: 'Middle East', revenue: '$18,400', orders: '134', status: 'Completed' },
  { date: 'Jan 31, 2025', region: 'North America', revenue: '$56,800', orders: '389', status: 'Completed' },
  { date: 'Jan 30, 2025', region: 'Europe', revenue: '$41,350', orders: '276', status: 'Pending' },
];

const regions: RegionEntry[] = [
  { name: 'North America', share: '35% of total', revenue: '$449,575' },
  { name: 'Asia Pacific', share: '25% of total', revenue: '$399,360' },
  { name: 'Europe', share: '22% of total', revenue: '$361,090' },
  { name: 'Latin America', share: '10% of total', revenue: '$128,450' },
  { name: 'Middle East & Africa', share: '8% of total', revenue: '$64,125' },
];

const summaryParagraphs = [
  'This report provides a comprehensive analysis of monthly sales performance across all regions. Key findings indicate a strong upward trend in Q3, with July recording the highest revenue at $185,200.',
  'North America continues to lead in total revenue, contributing 35% of global sales. Asia Pacific showed the strongest growth at +18.5% YoY, driven primarily by expansion in Southeast Asian markets.',
  'Average order value declined slightly (-3.1%) due to promotional pricing in Q2, but conversion rates improved by 1.8%, resulting in net positive revenue growth.',
];

/* ── Chart data ── */
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const revenueData = [65, 78, 72, 95, 88, 110, 125, 140, 132, 155, 148, 185];
const profitData = [32, 40, 35, 52, 45, 60, 72, 82, 75, 90, 85, 108];
const yLabels = ['$200K', '$150K', '$100K', '$50K', '$0'];

function toY(val: number, h: number, pad: number): number {
  return pad + ((200 - val) / 200) * (h - pad);
}

function buildSmoothPath(data: number[], w: number, h: number, pad: number): string {
  const n = data.length;
  const dx = (w - 60) / (n - 1);
  const pts = data.map((v, i) => ({ x: 30 + i * dx, y: toY(v, h, pad) }));
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp = dx / 3;
    d += ` C ${pts[i].x + cp},${pts[i].y} ${pts[i + 1].x - cp},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

function buildAreaPath(data: number[], w: number, h: number, pad: number): string {
  const line = buildSmoothPath(data, w, h, pad);
  const n = data.length;
  const dx = (w - 60) / (n - 1);
  const lastX = 30 + (n - 1) * dx;
  return `${line} L ${lastX},${h} L 30,${h} Z`;
}

/* ── Trend Chart ── */
function TrendChart() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(7); // Aug default
  const chartW = 1060;
  const chartH = 276;
  const pad = 16;
  const n = revenueData.length;
  const dx = (chartW - 60) / (n - 1);

  const revPath = buildSmoothPath(revenueData, chartW, chartH, pad);
  const revArea = buildAreaPath(revenueData, chartW, chartH, pad);
  const profPath = buildSmoothPath(profitData, chartW, chartH, pad);
  const profArea = buildAreaPath(profitData, chartW, chartH, pad);

  const gridYs = [0, 1, 2, 3, 4].map((i) => pad + (i / 4) * (chartH - pad));

  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: '#111118',
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box
        display="flex" alignItems="center" justifyContent="space-between"
        sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ChartLine size={18} color="#8b5cf6" />
          <Typography fontSize={15} fontWeight={600}>Revenue Trend</Typography>
        </Box>
        <Box display="flex" gap={1}>
          {['Week', 'Month', 'Year'].map((tab, i) => (
            <Box
              key={tab}
              sx={{
                px: 1.5, py: 0.75, borderRadius: 1.5, cursor: 'pointer',
                ...(i === 0
                  ? { bgcolor: 'rgba(139,92,246,0.12)', color: '#c4b5fd' }
                  : { color: '#71717a' }),
                fontSize: 12, fontWeight: i === 0 ? 500 : 400,
              }}
            >
              <Typography fontSize={12} fontWeight={i === 0 ? 500 : 400} color="inherit">
                {tab}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box display="flex" gap={3} px={2.5} py={1} alignItems="center">
        <Box display="flex" gap={1} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
          <Typography fontSize={12} color="text.secondary">Revenue</Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22d3ee' }} />
          <Typography fontSize={12} color="text.secondary">Profit</Typography>
        </Box>
      </Box>

      {/* Chart body */}
      <Box display="flex">
        {/* Y Axis */}
        <Box
          sx={{
            width: 52, display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', py: '10px', pl: 2, pr: 0,
            height: chartH + 28,
          }}
        >
          {yLabels.map((l) => (
            <Typography key={l} fontSize={11} color="#52525b" textAlign="right">
              {l}
            </Typography>
          ))}
        </Box>

        {/* Plot + X Axis */}
        <Box flex={1} display="flex" flexDirection="column">
          <Box
            sx={{ position: 'relative', width: '100%', height: chartH, overflow: 'hidden' }}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <svg
              width="100%" height={chartH}
              viewBox={`0 0 ${chartW} ${chartH}`}
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {gridYs.map((y, i) => (
                <line key={i} x1={0} y1={y} x2={chartW} y2={y} stroke={i === 4 ? '#27273a' : '#1e1e2a'} strokeWidth={1} />
              ))}

              {/* Area fills */}
              <path d={revArea} fill="url(#revGrad)" />
              <path d={profArea} fill="url(#profGrad)" />

              {/* Lines */}
              <path d={revPath} fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              <path d={profPath} fill="none" stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

              {/* Hover hit areas */}
              {months.map((_, i) => {
                const cx = 30 + i * dx;
                return (
                  <rect
                    key={i}
                    x={cx - dx / 2}
                    y={0}
                    width={dx}
                    height={chartH}
                    fill="transparent"
                    onMouseEnter={() => setHoverIdx(i)}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}

              {/* Hover indicator */}
              {hoverIdx !== null && (() => {
                const cx = 30 + hoverIdx * dx;
                const ry = toY(revenueData[hoverIdx], chartH, pad);
                const py = toY(profitData[hoverIdx], chartH, pad);
                return (
                  <g>
                    <line x1={cx} y1={0} x2={cx} y2={chartH} stroke="#8b5cf650" strokeWidth={1} />
                    <circle cx={cx} cy={ry} r={6} fill="#8b5cf6" stroke="#111118" strokeWidth={2} />
                    <circle cx={cx} cy={py} r={6} fill="#22d3ee" stroke="#111118" strokeWidth={2} />
                  </g>
                );
              })()}
            </svg>

            {/* Tooltip */}
            {hoverIdx !== null && (() => {
              const cx = 30 + hoverIdx * dx;
              const pctX = (cx / chartW) * 100;
              const flipLeft = pctX > 75;
              return (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    ...(flipLeft ? { right: `${100 - pctX + 2}%` } : { left: `${pctX + 2}%` }),
                    bgcolor: '#1a1a28',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    minWidth: 160,
                  }}
                >
                  <Typography fontSize={11} fontWeight={500} color="#71717a">
                    {months[hoverIdx]} 2024
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
                    <Typography fontSize={12} fontWeight={500}>
                      Revenue: ${(revenueData[hoverIdx] * 1000).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22d3ee' }} />
                    <Typography fontSize={12} fontWeight={500}>
                      Profit: ${(profitData[hoverIdx] * 1000).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
          </Box>

          {/* X Axis */}
          <Box display="flex" justifyContent="space-between" px="30px" py={0.5} height={28} alignItems="center">
            {months.map((m, i) => (
              <Typography
                key={m} fontSize={11}
                color={hoverIdx === i ? '#8b5cf6' : '#52525b'}
                fontWeight={hoverIdx === i ? 500 : 400}
              >
                {m}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Page ── */
export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [tablePage, setTablePage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const totalPages = 3;

  return (
    <>
      {/* ── Header ── */}
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
          <Link underline="hover" color="text.secondary" href="#" onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>
            Data
          </Link>
          <Link underline="hover" color="text.secondary" href="#" onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>
            Report Management
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Sales Overview
          </Typography>
        </Breadcrumbs>

        <Box display="flex" gap={1}>
          <Button variant="outlined" size="small" startIcon={<Edit size={14} />}
            sx={{ borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.secondary' } }}
          >
            Edit
          </Button>
          <Button variant="outlined" size="small" startIcon={<Download size={14} />}
            sx={{ borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.secondary' } }}
          >
            Export
          </Button>
          <Button variant="outlined" size="small" startIcon={<Share2 size={14} />}
            sx={{ borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.secondary' } }}
          >
            Share
          </Button>
          <Button variant="outlined" size="small" startIcon={<Trash2 size={14} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ borderColor: '#ef444440', color: '#ef4444', '&:hover': { borderColor: '#ef4444', bgcolor: '#ef444410' } }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box flex={1} overflow="auto" p={3} display="flex" flexDirection="column" gap={3}>

        {/* ── Title Section ── */}
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 2.5, bgcolor: 'rgba(139,92,246,0.12)',
              }}
            >
              <BarChart2 size={22} color="#8b5cf6" />
            </Box>
            <Typography fontSize={22} fontWeight={600} fontFamily="JetBrains Mono, monospace">
              Sales Overview
            </Typography>
            <Box sx={{ px: 1.25, py: 0.5, borderRadius: 1, bgcolor: 'rgba(34,197,94,0.12)' }}>
              <Typography fontSize={11} fontWeight={500} color="#22c55e">Active</Typography>
            </Box>
          </Box>
          <Typography fontSize={14} color="text.secondary">
            Monthly sales performance and trends analysis across all regions
          </Typography>
          <Box display="flex" gap={2.5}>
            {[
              { icon: <Calendar size={14} color="#71717a" />, text: 'Created: Jan 15, 2025' },
              { icon: <Timer size={14} color="#71717a" />, text: 'Updated: 2 hours ago' },
              { icon: <User size={14} color="#71717a" />, text: 'Author: Admin' },
            ].map((meta) => (
              <Box key={meta.text} display="flex" alignItems="center" gap={0.75}>
                {meta.icon}
                <Typography fontSize={12} color="#71717a">{meta.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Metrics Row ── */}
        <Box display="flex" gap={2}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Box
                key={m.label}
                sx={{
                  flex: 1, p: 2.5, borderRadius: 3, bgcolor: '#111118',
                  border: 1, borderColor: 'divider',
                  display: 'flex', flexDirection: 'column', gap: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Icon size={16} color={m.iconColor} />
                  <Typography fontSize={13} color="text.secondary">{m.label}</Typography>
                </Box>
                <Typography fontSize={28} fontWeight={600} fontFamily="JetBrains Mono, monospace">
                  {m.value}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {m.positive
                    ? <TrendingUp size={14} color="#22c55e" />
                    : <TrendingDown size={14} color="#ef4444" />}
                  <Typography fontSize={12} color={m.positive ? '#22c55e' : '#ef4444'}>
                    {m.change}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── Chart Section ── */}
        <TrendChart />

        {/* ── Table Section ── */}
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: '#111118',
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Table header */}
          <Box display="flex" alignItems="center" gap={1} px={2.5} py={2} borderBottom={1} borderColor="divider">
            <TableIcon size={18} color="#8b5cf6" />
            <Typography fontSize={15} fontWeight={600}>Recent Data</Typography>
            <Box sx={{ px: 1, py: 0.375, borderRadius: 1, bgcolor: '#27273a' }}>
              <Typography fontSize={11} color="text.secondary">128 entries</Typography>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-head': { bgcolor: '#0d0d14', borderColor: 'divider', py: 1.25, px: 2.5 } }}>
                  <TableCell><Typography fontSize={12} fontWeight={500} color="#71717a">Date</Typography></TableCell>
                  <TableCell><Typography fontSize={12} fontWeight={500} color="#71717a">Region</Typography></TableCell>
                  <TableCell><Typography fontSize={12} fontWeight={500} color="#71717a">Revenue</Typography></TableCell>
                  <TableCell><Typography fontSize={12} fontWeight={500} color="#71717a">Orders</Typography></TableCell>
                  <TableCell><Typography fontSize={12} fontWeight={500} color="#71717a">Status</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, i) => {
                  const st = statusColors[row.status];
                  return (
                    <TableRow
                      key={i}
                      sx={{
                        '& .MuiTableCell-root': { borderColor: '#1e1e2a', py: 1.5, px: 2.5 },
                        '&:nth-of-type(even)': { bgcolor: 'transparent' },
                      }}
                    >
                      <TableCell><Typography fontSize={13}>{row.date}</Typography></TableCell>
                      <TableCell><Typography fontSize={13}>{row.region}</Typography></TableCell>
                      <TableCell>
                        <Typography fontSize={13} fontFamily="JetBrains Mono, monospace">{row.revenue}</Typography>
                      </TableCell>
                      <TableCell><Typography fontSize={13}>{row.orders}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', px: 1, py: 0.375, borderRadius: 1, bgcolor: st.bg }}>
                          <Typography fontSize={11} fontWeight={500} color={st.color}>{row.status}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table footer */}
          <Box
            display="flex" alignItems="center" justifyContent="space-between"
            px={2.5} py={1.5} borderTop={1} borderColor="divider"
          >
            <Typography fontSize={13} color="text.secondary">
              Showing 1-7 of 128 entries
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <PaginationBtn onClick={() => setTablePage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={16} color="#a1a1aa" />
              </PaginationBtn>
              {[1, 2, 3].map((p) => (
                <PaginationBtn key={p} active={p === tablePage} onClick={() => setTablePage(p)}>
                  <Typography fontSize={14} fontWeight={500} color={p === tablePage ? '#fff' : '#a1a1aa'}>
                    {p}
                  </Typography>
                </PaginationBtn>
              ))}
              <PaginationBtn onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={16} color="#a1a1aa" />
              </PaginationBtn>
            </Box>
          </Box>
        </Box>

        {/* ── Two Column Section ── */}
        <Box display="flex" gap={2.5}>
          {/* Report Summary */}
          <Box
            sx={{
              flex: 1, borderRadius: 3, bgcolor: '#111118',
              border: 1, borderColor: 'divider', overflow: 'hidden',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} px={2.5} py={2} borderBottom={1} borderColor="divider">
              <FileText size={18} color="#8b5cf6" />
              <Typography fontSize={15} fontWeight={600}>Report Summary</Typography>
            </Box>
            <Box p={2.5} display="flex" flexDirection="column" gap={2}>
              {summaryParagraphs.map((text, i) => (
                <Typography key={i} fontSize={13} color="text.secondary" lineHeight={1.7}>
                  {text}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Top Regions */}
          <Box
            sx={{
              width: 360, flexShrink: 0, borderRadius: 3, bgcolor: '#111118',
              border: 1, borderColor: 'divider', overflow: 'hidden',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} px={2.5} py={2} borderBottom={1} borderColor="divider">
              <Globe size={18} color="#8b5cf6" />
              <Typography fontSize={15} fontWeight={600}>Top Regions</Typography>
            </Box>
            <Box p={2.5} display="flex" flexDirection="column" gap={2}>
              {regions.map((r, i) => (
                <Box key={r.name}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography fontSize={13} fontWeight={500}>{r.name}</Typography>
                      <Typography fontSize={11} color="#71717a">{r.share}</Typography>
                    </Box>
                    <Typography fontSize={14} fontWeight={600} fontFamily="JetBrains Mono, monospace">
                      {r.revenue}
                    </Typography>
                  </Box>
                  {i < regions.length - 1 && (
                    <Box sx={{ mt: 2, height: 1, bgcolor: '#1e1e2a' }} />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Report?"
        description="This action cannot be undone. All data and configurations in this report will be permanently deleted."
        confirmName="Sales Overview"
        confirmLabel="the report name"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { setDeleteOpen(false); navigate('/report-management'); }}
      />
    </>
  );
}

/* ── Pagination button helper ── */
function PaginationBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
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
          : { bgcolor: '#1a1a24', border: 1, borderColor: 'divider', '&:hover': { borderColor: 'text.secondary' } }),
      }}
    >
      {children}
    </Box>
  );
}
