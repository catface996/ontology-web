import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Breadcrumb, Typography, Button } from 'antd';
import {
  ChevronRight, ChevronLeft, Activity, DollarSign,
  ShoppingCart, Users, Target,
  TrendingUp, TrendingDown, Calendar, Clock,
  User, LineChart, Table, FileText,
  Globe, Pencil, Download, Share2,
  Trash2,
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
  { label: 'Total Revenue', value: '$1,284,500', change: '+12.5% from last month', positive: true, icon: DollarSign, iconColor: 'var(--primary-color)' },
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
    <div
      style={{
        borderRadius: 12,
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LineChart size={18} color="var(--primary-color)" />
          <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Revenue Trend</Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Week', 'Month', 'Year'].map((tab, i) => (
            <div
              key={tab}
              style={{
                padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                ...(i === 0
                  ? { background: 'rgba(139,92,246,0.12)', color: '#c4b5fd' }
                  : { color: '#71717a' }),
                fontSize: 12, fontWeight: i === 0 ? 500 : 400,
              }}
            >
              <Typography.Text style={{ fontSize: 12, fontWeight: i === 0 ? 500 : 400, color: 'inherit' }}>
                {tab}
              </Typography.Text>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, padding: '8px 20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-color)' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Revenue</Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22d3ee' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Profit</Typography.Text>
        </div>
      </div>

      {/* Chart body */}
      <div style={{ display: 'flex' }}>
        {/* Y Axis */}
        <div
          style={{
            width: 52, display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: '10px 0 10px 16px',
            height: chartH + 28,
          }}
        >
          {yLabels.map((l) => (
            <Typography.Text key={l} style={{ fontSize: 11, color: '#52525b', textAlign: 'right' }}>
              {l}
            </Typography.Text>
          ))}
        </div>

        {/* Plot + X Axis */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{ position: 'relative', width: '100%', height: chartH, overflow: 'hidden' }}
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
                  <stop offset="0%" stopColor="var(--primary-color)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity={0} />
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
              <path d={revPath} fill="none" stroke="var(--primary-color)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
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
                    <line x1={cx} y1={0} x2={cx} y2={chartH} stroke="rgba(var(--primary-rgb), 0.31)" strokeWidth={1} />
                    <circle cx={cx} cy={ry} r={6} fill="var(--primary-color)" stroke="#111118" strokeWidth={2} />
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
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    ...(flipLeft ? { right: `${100 - pctX + 2}%` } : { left: `${pctX + 2}%` }),
                    background: '#1a1a28',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    minWidth: 160,
                  }}
                >
                  <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: '#71717a' }}>
                    {months[hoverIdx]} 2024
                  </Typography.Text>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-color)' }} />
                    <Typography.Text style={{ fontSize: 12, fontWeight: 500 }}>
                      Revenue: ${(revenueData[hoverIdx] * 1000).toLocaleString()}
                    </Typography.Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} />
                    <Typography.Text style={{ fontSize: 12, fontWeight: 500 }}>
                      Profit: ${(profitData[hoverIdx] * 1000).toLocaleString()}
                    </Typography.Text>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* X Axis */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 30px', height: 28, alignItems: 'center' }}>
            {months.map((m, i) => (
              <Typography.Text
                key={m}
                style={{
                  fontSize: 11,
                  color: hoverIdx === i ? 'var(--primary-color)' : '#52525b',
                  fontWeight: hoverIdx === i ? 500 : 400,
                }}
              >
                {m}
              </Typography.Text>
            ))}
          </div>
        </div>
      </div>
    </div>
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
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Breadcrumb
          separator={<ChevronRight size={10} />}
          items={[
            { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>Data</a> },
            { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>Report Management</a> },
            { title: <Typography.Text strong>Sales Overview</Typography.Text> },
          ]}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<Pencil size={16} />}>Edit</Button>
          <Button icon={<Download size={16} />}>Export</Button>
          <Button icon={<Share2 size={16} />}>Share</Button>
          <Button danger icon={<Trash2 size={16} />} onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Title Section ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, background: 'rgba(139,92,246,0.12)',
              }}
            >
              <Activity size={22} color="var(--primary-color)" />
            </div>
            <Typography.Text style={{ fontSize: 22, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              Sales Overview
            </Typography.Text>
            <div style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.12)' }}>
              <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: '#22c55e' }}>Active</Typography.Text>
            </div>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            Monthly sales performance and trends analysis across all regions
          </Typography.Text>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { icon: <Calendar size={14} color="#71717a" />, text: 'Created: Jan 15, 2025' },
              { icon: <Clock size={14} color="#71717a" />, text: 'Updated: 2 hours ago' },
              { icon: <User size={14} color="#71717a" />, text: 'Author: Admin' },
            ].map((meta) => (
              <div key={meta.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {meta.icon}
                <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{meta.text}</Typography.Text>
              </div>
            ))}
          </div>
        </div>

        {/* ── Metrics Row ── */}
        <div style={{ display: 'flex', gap: 16 }}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                style={{
                  flex: 1, padding: 20, borderRadius: 12, background: '#111118',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={16} color={m.iconColor} />
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>{m.label}</Typography.Text>
                </div>
                <Typography.Text style={{ fontSize: 28, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                  {m.value}
                </Typography.Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {m.positive
                    ? <TrendingUp size={14} color="#22c55e" />
                    : <TrendingDown size={14} color="#ef4444" />}
                  <Typography.Text style={{ fontSize: 12, color: m.positive ? '#22c55e' : '#ef4444' }}>
                    {m.change}
                  </Typography.Text>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Chart Section ── */}
        <TrendChart />

        {/* ── Table Section ── */}
        <div
          style={{
            borderRadius: 12,
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <Table size={18} color="var(--primary-color)" />
            <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Recent Data</Typography.Text>
            <div style={{ padding: '3px 8px', borderRadius: 4, background: '#27273a' }}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>128 entries</Typography.Text>
            </div>
          </div>

          {/* Table */}
          <div>
            {/* Table Head */}
            <div style={{ display: 'flex', padding: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
              {['Date', 'Region', 'Revenue', 'Orders', 'Status'].map((h) => (
                <div key={h} style={{ flex: 1 }}>
                  <Typography.Text style={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>{h}</Typography.Text>
                </div>
              ))}
            </div>
            {/* Table Body */}
            {tableData.map((row, i) => {
              const st = statusColors[row.status];
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', padding: '8px 20px', alignItems: 'center',
                    background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ flex: 1 }}><Typography.Text style={{ fontSize: 13 }}>{row.date}</Typography.Text></div>
                  <div style={{ flex: 1 }}><Typography.Text style={{ fontSize: 13 }}>{row.region}</Typography.Text></div>
                  <div style={{ flex: 1 }}><Typography.Text style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{row.revenue}</Typography.Text></div>
                  <div style={{ flex: 1 }}><Typography.Text style={{ fontSize: 13 }}>{row.orders}</Typography.Text></div>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 4, background: st.bg }}>
                      <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: st.color }}>{row.status}</Typography.Text>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table footer */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Showing 1-7 of 128 entries
            </Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PaginationBtn onClick={() => setTablePage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={16} color="#a1a1aa" />
              </PaginationBtn>
              {[1, 2, 3].map((p) => (
                <PaginationBtn key={p} active={p === tablePage} onClick={() => setTablePage(p)}>
                  <Typography.Text style={{ fontSize: 14, fontWeight: 500, color: p === tablePage ? '#fff' : '#a1a1aa' }}>
                    {p}
                  </Typography.Text>
                </PaginationBtn>
              ))}
              <PaginationBtn onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={16} color="#a1a1aa" />
              </PaginationBtn>
            </div>
          </div>
        </div>

        {/* ── Two Column Section ── */}
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Report Summary */}
          <div
            style={{
              flex: 1, borderRadius: 12, background: '#111118',
              border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
              <FileText size={18} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Report Summary</Typography.Text>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {summaryParagraphs.map((text, i) => (
                <Typography.Text key={i} type="secondary" style={{ fontSize: 13, lineHeight: 1.7 }}>
                  {text}
                </Typography.Text>
              ))}
            </div>
          </div>

          {/* Top Regions */}
          <div
            style={{
              width: 360, flexShrink: 0, borderRadius: 12, background: '#111118',
              border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
              <Globe size={18} color="var(--primary-color)" />
              <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>Top Regions</Typography.Text>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {regions.map((r, i) => (
                <div key={r.name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</Typography.Text>
                      <br />
                      <Typography.Text style={{ fontSize: 11, color: '#71717a' }}>{r.share}</Typography.Text>
                    </div>
                    <Typography.Text style={{ fontSize: 14, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                      {r.revenue}
                    </Typography.Text>
                  </div>
                  {i < regions.length - 1 && (
                    <div style={{ marginTop: 16, height: 1, background: '#1e1e2a' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
    <div
      onClick={onClick}
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
          : { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.12)' }),
      }}
    >
      {children}
    </div>
  );
}
