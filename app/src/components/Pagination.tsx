import { Typography, Select, Flex } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Types ── */
interface PaginationProps {
  /** Total item count */
  count: number;
  /** Current page (0-indexed) */
  page: number;
  /** Rows per page */
  rowsPerPage: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when rows-per-page changes; if omitted the selector is hidden */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Item label shown in "Showing 1-10 of 48 {label}" */
  label?: string;
  /** Available rows-per-page options */
  rowsPerPageOptions?: number[];
}

/* ── Helpers ── */
function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  if (pages[pages.length - 1] !== total) pages.push(total);
  return pages;
}

/* ── Component ── */
export default function Pagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  label = 'items',
  rowsPerPageOptions = [10, 25, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const currentPage = page + 1; // 1-indexed for display
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);
  const pages = buildPageNumbers(currentPage, totalPages);

  /* ── Page button ── */
  const PageBtn = ({
    children,
    active,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        cursor: disabled ? 'default' : 'pointer',
        userSelect: 'none',
        transition: 'all 0.15s',
        ...(active
          ? { background: 'var(--primary-color)', color: '#fff' }
          : {
              border: '1px solid #27273a',
              color: disabled ? '#71717a' : '#a1a1aa',
            }),
      }}
    >
      {children}
    </div>
  );

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{ height: 56, padding: '0 20px', borderTop: '1px solid #27273a', marginTop: 'auto', flexShrink: 0 }}
    >
      {/* Left — info text */}
      <Typography.Text style={{ fontSize: 13, color: '#a1a1aa' }}>
        Showing {from}-{to} of {count.toLocaleString()} {label}
      </Typography.Text>

      {/* Right — controls */}
      <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
        {/* Rows per page */}
        {onRowsPerPageChange && (
          <>
            <Typography.Text style={{ fontSize: 13, color: '#a1a1aa', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Rows per page:
            </Typography.Text>
            <Select
              value={rowsPerPage}
              onChange={(val) => onRowsPerPageChange(val)}
              style={{ minWidth: 56 }}
              options={rowsPerPageOptions.map((opt) => ({ label: opt, value: opt }))}
            />
          </>
        )}

        {/* Page navigation */}
        <Flex align="center" gap={4}>
          {/* Prev */}
          <PageBtn disabled={page === 0} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={12} />
          </PageBtn>

          {/* Page numbers */}
          {pages.map((p, i) =>
            p === '...' ? (
              <Typography.Text
                key={`dots-${i}`}
                style={{ fontSize: 13, color: '#a1a1aa', width: 32, textAlign: 'center', userSelect: 'none' }}
              >
                ...
              </Typography.Text>
            ) : (
              <PageBtn
                key={p}
                active={p === currentPage}
                onClick={() => onPageChange(p - 1)}
              >
                {p}
              </PageBtn>
            ),
          )}

          {/* Next */}
          <PageBtn
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={12} />
          </PageBtn>
        </Flex>
      </Flex>
    </Flex>
  );
}
