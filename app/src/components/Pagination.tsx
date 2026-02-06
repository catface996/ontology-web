import { Box, Typography, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
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

  const handleRowsChange = (e: SelectChangeEvent<number>) => {
    onRowsPerPageChange?.(Number(e.target.value));
  };

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
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1.5,
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        cursor: disabled ? 'default' : 'pointer',
        userSelect: 'none',
        transition: 'all 0.15s',
        ...(active
          ? { bgcolor: 'primary.main', color: '#fff' }
          : {
              border: 1,
              borderColor: 'divider',
              color: disabled ? 'text.disabled' : 'text.secondary',
              '&:hover': disabled
                ? {}
                : { bgcolor: 'action.hover', borderColor: 'text.secondary' },
            }),
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      height={56}
      px={2.5}
      sx={{ borderTop: 1, borderColor: 'divider' }}
    >
      {/* Left — info text */}
      <Typography fontSize={13} color="text.secondary">
        Showing {from}-{to} of {count.toLocaleString()} {label}
      </Typography>

      {/* Right — controls */}
      <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
        {/* Rows per page */}
        {onRowsPerPageChange && (
          <>
            <Typography fontSize={13} color="text.secondary" whiteSpace="nowrap" flexShrink={0}>
              Rows per page:
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={handleRowsChange}
              sx={{
                minWidth: 56,
                height: 32,
                borderRadius: 1.5,
                fontSize: 13,
                '& .MuiSelect-select': { py: 0.5, px: 1.25 },
              }}
            >
              {rowsPerPageOptions.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>

          </>
        )}

        {/* Page navigation */}
        <Box display="flex" alignItems="center" gap={0.5}>
          {/* Prev */}
          <PageBtn disabled={page === 0} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={16} />
          </PageBtn>

          {/* Page numbers */}
          {pages.map((p, i) =>
            p === '...' ? (
              <Typography
                key={`dots-${i}`}
                fontSize={13}
                color="text.secondary"
                sx={{ width: 32, textAlign: 'center', userSelect: 'none' }}
              >
                ...
              </Typography>
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
            <ChevronRight size={16} />
          </PageBtn>
        </Box>
      </Box>
    </Box>
  );
}
