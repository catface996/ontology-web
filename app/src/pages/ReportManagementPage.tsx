import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Input, Typography, Flex, Spin } from 'antd';
import {
  BarChart2, Users, PieChart,
  TrendingUp, Database, TriangleAlert, Zap, Globe,
  Search, ChevronLeft, ChevronRight, FileText, LayoutTemplate,
  User, Clock,
} from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listReports, type ReportDTO } from '../services/coreService';

/* -- Icon map -- */
const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  BarChart2, Users, PieChart, TrendingUp, Database, TriangleAlert, Zap, Globe, FileText,
};

/* -- Status config -- */
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Active' },
  PENDING: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'Pending' },
  DRAFT:   { color: '#a1a1aa', bg: 'rgba(161,161,170,0.12)', label: 'Draft' },
};

const PAGE_SIZE = 8;

/* -- Report Card -- */
function ReportCard({ report, onClick }: { report: ReportDTO; onClick: () => void }) {
  const Icon = iconMap[report.icon] || FileText;
  const st = statusConfig[report.status] || statusConfig.DRAFT;

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 180,
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
        <Flex align="center" gap={12}>
          <div
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              background: `${report.iconColor}20`,
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={report.iconColor} />
          </div>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600 }} ellipsis>{report.title}</Typography.Text>
        </Flex>
        <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>{report.description}</Typography.Text>
      </div>

      {/* Footer */}
      <Flex align="center" justify="space-between">
        <Flex gap={12} align="center">
          <Flex gap={4} align="center">
            <Clock size={12} color="#71717a" />
            <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{formatDate(report.createdAt || report.updatedAt)}</Typography.Text>
          </Flex>
          {report.createdBy && (
            <Flex gap={4} align="center">
              <User size={12} color="#71717a" />
              <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{report.createdBy}</Typography.Text>
            </Flex>
          )}
        </Flex>
        <div style={{ padding: '4px 8px', borderRadius: 4, background: st.bg }}>
          <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: st.color }}>
            {st.label}
          </Typography.Text>
        </div>
      </Flex>
    </div>
  );
}

/* -- Header Search (lives in header actions slot) -- */
function HeaderSearch({ searchRef, onTemplates, isMobile }: { searchRef: React.RefObject<(value: string) => void>; onTemplates: () => void; isMobile: boolean }) {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {!isMobile && (
        <Input
          placeholder="Search reports..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            searchRef.current(e.target.value);
          }}
          prefix={<Search size={16} color="#a1a1aa" />}
          style={{ width: 220, borderRadius: 8, background: '#1a1a24', fontSize: 13 }}
        />
      )}
      <Button
        icon={<LayoutTemplate size={14} />}
        onClick={onTemplates}
      >
        {!isMobile && 'Templates'}
      </Button>
    </div>
  );
}

/* -- Page -- */
export default function ReportManagementPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchReports = useCallback(async (keyword: string, pageNum: number) => {
    if (!currentOntologyId) {
      setReports([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await listReports({ ontologyId: currentOntologyId, keyword: keyword || undefined, page: pageNum, pageSize: PAGE_SIZE });
      if (res.data) {
        setReports(res.data.records);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  // Initial load
  useEffect(() => {
    fetchReports('', 1);
  }, [fetchReports]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchReports(value, 1);
    }, 500);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchReports(search, newPage);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Data</a> },
          { title: <Typography.Text strong>Report Management</Typography.Text> },
        ]}
      />
    );
  }, [setBreadcrumbs]);

  const handleSearchRef = useRef(handleSearchChange);
  handleSearchRef.current = handleSearchChange;

  useEffect(() => {
    setActions(<HeaderSearch searchRef={handleSearchRef} onTemplates={() => navigate('/report-templates')} isMobile={isMobile} />);
    return () => setActions(null);
  }, [setActions, navigate, isMobile]);

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable area: title + cards */}
        <div style={{ flex: 1, padding: isMobile ? '12px 12px 0' : '24px 24px 0', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 24, overflow: 'auto' }}>
          {/* Title row */}
          <Typography.Text style={{ fontSize: isMobile ? 16 : 20, fontWeight: 600 }}>All Reports</Typography.Text>

          {/* Cards grid */}
          <Spin spinning={loading}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? 12 : 20,
              minHeight: 200
            }}>
              {reports.map((r) => (
                <ReportCard key={r.id} report={r} onClick={() => navigate(`/report-management/${r.id}`)} />
              ))}
              {reports.length === 0 && !loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gridColumn: '1 / -1' }}>
                  <Typography.Text type="secondary">No reports found</Typography.Text>
                </div>
              )}
            </div>
          </Spin>
        </div>

        {/* Pagination - fixed at bottom */}
        <Flex
          align="center"
          justify="space-between"
          style={{ padding: isMobile ? '12px' : '16px 24px', borderTop: '1px solid #27273a', flexShrink: 0 }}
        >
          {!isMobile && (
            <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
              Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} reports
            </Typography.Text>
          )}
          <Flex align="center" gap={8} style={isMobile ? { margin: '0 auto' } : undefined}>
            <PaginationBtn onClick={() => handlePageChange(Math.max(1, page - 1))}>
              <ChevronLeft size={12} color="#a1a1aa" />
            </PaginationBtn>
            {isMobile ? (
              <PaginationBtn active onClick={() => {}}>
                <Typography.Text style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
                  {page}
                </Typography.Text>
              </PaginationBtn>
            ) : (
              Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const active = p === page;
                return (
                  <PaginationBtn key={p} active={active} onClick={() => handlePageChange(p)}>
                    <Typography.Text style={{ fontSize: 14, fontWeight: 500, color: active ? '#fff' : '#a1a1aa' }}>
                      {p}
                    </Typography.Text>
                  </PaginationBtn>
                );
              })
            )}
            <PaginationBtn onClick={() => handlePageChange(Math.min(totalPages, page + 1))}>
              <ChevronRight size={12} color="#a1a1aa" />
            </PaginationBtn>
          </Flex>
        </Flex>
      </div>
    </>
  );
}

/* -- Pagination button helper -- */
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
          : {
              background: '#1a1a24',
              border: '1px solid #27273a',
            }),
      }}
    >
      {children}
    </div>
  );
}
