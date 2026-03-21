import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Input, Select, Typography, Flex, Spin, Tag } from 'antd';
import {
  Search, ChevronLeft, ChevronRight, Zap, Plus,
} from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrentOntology } from '../contexts/OntologyContext';
import { listActionTypes, type ActionTypeDTO, type ActionStatus } from '../services/actionService';

/* -- Status config -- */
const statusConfig: Record<ActionStatus, { color: string; bg: string; label: string }> = {
  DRAFT: { color: '#a1a1aa', bg: 'rgba(161,161,170,0.12)', label: 'Draft' },
  PUBLISHED: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Published' },
  ARCHIVED: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'Archived' },
};

const PAGE_SIZE = 8;

/* -- Action Card -- */
function ActionCard({ action, onClick }: { action: ActionTypeDTO; onClick: () => void }) {
  const st = statusConfig[action.status];

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
              background: 'rgba(139, 92, 246, 0.2)',
              flexShrink: 0,
            }}
          >
            <Zap size={20} color="#8b5cf6" />
          </div>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600 }} ellipsis>{action.name}</Typography.Text>
        </Flex>
        <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }} ellipsis={{ rows: 2 }}>
          {action.description || 'No description'}
        </Typography.Text>
      </div>

      {/* Footer */}
      <Flex align="center" justify="space-between">
        <Flex gap={12} align="center">
          <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>
            {action.parameters.length} params
          </Typography.Text>
          <Typography.Text style={{ fontSize: 12, color: '#71717a' }}>
            {action.executionRules.length} rules
          </Typography.Text>
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

/* -- Header Actions (search + filter + new) -- */
function HeaderActions({
  searchRef,
  statusFilter,
  onStatusChange,
  onNew,
  isMobile,
}: {
  searchRef: React.RefObject<(value: string) => void>;
  statusFilter: ActionStatus | 'ALL';
  onStatusChange: (value: ActionStatus | 'ALL') => void;
  onNew: () => void;
  isMobile: boolean;
}) {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {!isMobile && (
        <>
          <Input
            placeholder="Search actions..."
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              searchRef.current?.(e.target.value);
            }}
            prefix={<Search size={16} color="#a1a1aa" />}
            style={{ width: 200, borderRadius: 8, background: '#1a1a24', fontSize: 13 }}
          />
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            style={{ width: 120 }}
            options={[
              { label: 'All Status', value: 'ALL' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        </>
      )}
      <Button type="primary" icon={<Plus size={14} />} onClick={onNew}>
        {!isMobile && 'New Action'}
      </Button>
    </div>
  );
}

/* -- Page -- */
export default function ActionsPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const { setBreadcrumbs, setActions } = useHeader();
  const { currentOntologyId } = useCurrentOntology();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [actions, setActionsList] = useState<ActionTypeDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchActions = useCallback(async (keyword: string, status: ActionStatus | 'ALL', pageNum: number) => {
    if (!currentOntologyId) {
      setActionsList([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await listActionTypes({
        name: keyword || undefined,
        status: status === 'ALL' ? undefined : status,
        page: pageNum - 1, // API uses 0-based page
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
      });
      if (res.data) {
        setActionsList(res.data.content);
        setTotal(res.data.totalElements);
      }
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentOntologyId]);

  // Initial load
  useEffect(() => {
    fetchActions('', 'ALL', 1);
  }, [fetchActions]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchActions(value, statusFilter, 1);
    }, 500);
  };

  const handleStatusChange = (value: ActionStatus | 'ALL') => {
    setStatusFilter(value);
    setPage(1);
    fetchActions(search, value, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchActions(search, statusFilter, newPage);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setBreadcrumbs(
      <Breadcrumb
        items={[
          { title: <a href="#">Tools</a> },
          { title: <Typography.Text strong>Actions</Typography.Text> },
        ]}
      />
    );
  }, [setBreadcrumbs]);

  const handleSearchRef = useRef(handleSearchChange);
  handleSearchRef.current = handleSearchChange;

  useEffect(() => {
    setActions(
      <HeaderActions
        searchRef={handleSearchRef}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onNew={() => navigate('/actions/new')}
        isMobile={isMobile}
      />
    );
    return () => setActions(null);
  }, [setActions, navigate, isMobile, statusFilter]);

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Scrollable area: title + cards */}
        <div style={{ flex: 1, padding: isMobile ? '12px 12px 0' : '24px 24px 0', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 24, overflow: 'auto' }}>
          {/* Title row */}
          <Typography.Text style={{ fontSize: isMobile ? 16 : 20, fontWeight: 600 }}>All Actions</Typography.Text>

          {/* Cards grid */}
          <Spin spinning={loading}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? 12 : 20,
              minHeight: 200
            }}>
              {actions.map((a) => (
                <ActionCard key={a.id} action={a} onClick={() => navigate(`/actions/${a.id}`)} />
              ))}
              {actions.length === 0 && !loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gridColumn: '1 / -1' }}>
                  <Typography.Text type="secondary">No actions found</Typography.Text>
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
              Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} actions
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
