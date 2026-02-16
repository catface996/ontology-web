import { Card, Table, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Pagination from './Pagination';

interface TableCardProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey: string;
  loading?: boolean;
  rowClassName?: (record: T, index: number) => string;
  /** Pagination config */
  pagination: {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    label?: string;
  };
}

export default function TableCard<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  rowClassName,
  pagination,
}: TableCardProps<T>) {
  return (
    <Card
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
    >
      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table<T>
            columns={columns}
            dataSource={dataSource}
            rowKey={rowKey}
            pagination={false}
            size="middle"
            sticky
            rowClassName={rowClassName}
          />
        </div>
      )}
      <Pagination
        count={pagination.count}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        onPageChange={pagination.onPageChange}
        onRowsPerPageChange={pagination.onRowsPerPageChange}
        label={pagination.label}
      />
    </Card>
  );
}
