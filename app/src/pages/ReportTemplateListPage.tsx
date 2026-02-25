import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Input, Typography, Flex, Spin } from 'antd';
import {
  BarChart2, Users, PieChart,
  TrendingUp, Database, TriangleAlert, Zap, Globe,
  Search, ChevronLeft, ChevronRight, FileText, Plus,
} from 'lucide-react';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listReportTemplates, type ReportTemplateDTO } from '../services/coreService';

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

/* -- Template Card -- */
function TemplateCard({ template, onClick }: { template: ReportTemplateDTO; onClick: () => void }) {
  const Icon = iconMap[template.icon] || FileText;
  const st = statusConfig[template.status] || statusConfig.DRAFT;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Updated ${minutes} min ago`;
    if (hours < 24) return `Updated ${hours} hours ago`;
    if (days < 7) return `Updated ${days} days ago`;
    return `Updated ${date.toLocaleDateString()}`;
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={10} style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                background: `${template.iconColor || '#8b5cf6'}20`,
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={template.iconColor || '#8b5cf6'} />
            </div>
            <Typography.Text
              style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {template.title}
            </Typography.Text>
          </Flex>
          <Typography.Text style={{ fontSize: 11, color: '#71717a', flexShrink: 0, marginLeft: 8 }}>
            v{template.majorVersion}.{template.minorVersion}
          </Typography.Text>
        </Flex>
        <div
          style={{
            fontSize: 13,
            color: '#a1a1aa',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            lineHeight: 1.5,
          }}
        >
          {template.description}
        </div>
      </div>

      {/* Footer */}
      <Flex align="center" justify="space-between">
        <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>{formatTime(template.updatedAt)}</Typography.Text>
        <div style={{ padding: '4px 8px', borderRadius: 4, background: st.bg }}>
          <Typography.Text style={{ fontSize: 11, fontWeight: 500, color: st.color }}>
            {st.label}
          </Typography.Text>
        </div>
      </Flex>
    </div>
  );
}

/* -- Header Actions -- */
function HeaderActions({
  searchRef,
  onNew,
}: {
  searchRef: React.RefObject<(value: string) => void>;
  onNew: () => void;
}) {
  const [value, setValue] = useState('');
  return (
    <Flex align="center" gap={8}>
      <Input
        placeholder="Search templates..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          searchRef.current(e.target.value);
        }}
        prefix={<Search size={16} color="#a1a1aa" />}
        style={{ width: 220, borderRadius: 8, background: '#1a1a24', fontSize: 13 }}
      />
      <div
        onClick={onNew}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 8,
          background: 'var(--primary-color)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <Plus size={14} color="#fff" />
        <Typography.Text style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>New Template</Typography.Text>
      </div>
    </Flex>
  );
}

/* -- Page -- */
export default function ReportTemplateListPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [templates, setTemplates] = useState<ReportTemplateDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTemplates = useCallback(async (keyword: string, pageNum: number) => {
    if (!currentOntologyId) {
      setTemplates([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await listReportTemplates({ ontologyId: currentOntologyId, keyword: keyword || undefined, page: pageNum, pageSize: PAGE_SIZE });
      if (res.data) {
        setTemplates(res.data.records);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  // Initial load
  useEffect(() => {
    fetchTemplates('', 1);
  }, [fetchTemplates]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTemplates(value, 1);
    }, 500);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTemplates(search, newPage);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Split into rows of 4
  const row1 = templates.slice(0, 4);
  const row2 = templates.slice(4, 8);

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>Data</a> },
          { title: <a onClick={(e) => { e.preventDefault(); navigate('/report-management'); }}>Report Management</a> },
          { title: <Typography.Text strong>Templates</Typography.Text> },
        ]}
      />
    );
  }, [setBreadcrumbs, navigate]);

  const handleSearchRef = useRef(handleSearchChange);
  handleSearchRef.current = handleSearchChange;

  useEffect(() => {
    setActions(
      <HeaderActions
        searchRef={handleSearchRef}
        onNew={() => navigate('/report-templates/new')}
      />
    );
    return () => setActions(null);
  }, [setActions, navigate]);

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable area: title + cards */}
        <div style={{ flex: 1, padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
          {/* Title row */}
          <Typography.Text style={{ fontSize: 20, fontWeight: 600 }}>All Templates</Typography.Text>

          {/* Cards grid */}
          <Spin spinning={loading}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minHeight: 200 }}>
              {row1.length > 0 && (
                <Flex gap={20}>
                  {row1.map((t) => (
                    <TemplateCard key={t.id} template={t} onClick={() => navigate(`/report-templates/${t.id}`)} />
                  ))}
                  {row1.length < 4 && Array.from({ length: 4 - row1.length }).map((_, i) => (
                    <div key={`filler1-${i}`} style={{ flex: '1 1 0', minWidth: 220 }} />
                  ))}
                </Flex>
              )}
              {row2.length > 0 && (
                <Flex gap={20}>
                  {row2.map((t) => (
                    <TemplateCard key={t.id} template={t} onClick={() => navigate(`/report-templates/${t.id}`)} />
                  ))}
                  {row2.length < 4 && Array.from({ length: 4 - row2.length }).map((_, i) => (
                    <div key={`filler2-${i}`} style={{ flex: '1 1 0', minWidth: 220 }} />
                  ))}
                </Flex>
              )}
              {templates.length === 0 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
                  <FileText size={40} color="#71717a" />
                  <Typography.Text type="secondary">No templates found. Create your first template to get started.</Typography.Text>
                </div>
              )}
            </div>
          </Spin>
        </div>

        {/* Pagination - fixed at bottom */}
        <Flex
          align="center"
          justify="space-between"
          style={{ padding: '16px 24px', borderTop: '1px solid #27273a', flexShrink: 0 }}
        >
          <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
            Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} templates
          </Typography.Text>
          <Flex align="center" gap={8}>
            <PaginationBtn onClick={() => handlePageChange(Math.max(1, page - 1))}>
              <ChevronLeft size={12} color="#a1a1aa" />
            </PaginationBtn>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <PaginationBtn key={p} active={active} onClick={() => handlePageChange(p)}>
                  <Typography.Text style={{ fontSize: 14, fontWeight: 500, color: active ? '#fff' : '#a1a1aa' }}>
                    {p}
                  </Typography.Text>
                </PaginationBtn>
              );
            })}
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
