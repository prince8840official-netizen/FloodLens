import { forwardRef, type HTMLAttributes, type TableHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  striped?: boolean;
  hoverable?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data available',
  className,
  sortBy,
  sortOrder,
  onSort,
  striped = true,
  hoverable = true,
}: DataTableProps<T>) {
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      onSelectionChange?.(new Set());
    } else {
      onSelectionChange?.(new Set(data.map(keyExtractor)));
    }
  };

  const isSelected = (row: T) => selectedRows.has(keyExtractor(row));

  if (loading) {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={clsx(col.className)} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} className={clsx(col.className)}>
                    <div className="h-4 bg-flood-border/30 animate-pulse rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <div className="p-8 text-center text-flood-muted">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('table-container', className)}>
      <table className="table" role="grid">
        <thead>
          <tr>
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  ref={(el) => { if (el) el.indeterminate = selectedRows.size > 0 && selectedRows.size < data.length; }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className={clsx('cursor-pointer select-none', col.className, col.sortable && 'hover:text-flood-primary')}
                style={{ width: col.width }}
                onClick={() => col.sortable && onSort?.(col.key)}
                aria-sort={sortBy === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortBy === col.key && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              className={clsx(
                hoverable && 'hover:bg-flood-card/50',
                striped && index % 2 === 1 && 'bg-flood-card/30',
                onRowClick && 'cursor-pointer',
                isSelected(row) && 'bg-flood-primary/10'
              )}
              onClick={() => onRowClick?.(row)}
              onDoubleClick={() => onRowClick?.(row)}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && onRowClick) { e.preventDefault(); onRowClick(row); } }}
              role={onRowClick ? 'button' : undefined}
              aria-selected={isSelected(row)}
            >
              {selectable && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected(row)}
                    onChange={e => {
                      e.stopPropagation();
                      const newSelection = new Set(selectedRows);
                      if (newSelection.has(keyExtractor(row))) newSelection.delete(keyExtractor(row));
                      else newSelection.add(keyExtractor(row));
                      onSelectionChange?.(newSelection);
                    }}
                    className="w-4 h-4 rounded border-flood-border text-flood-primary focus:ring-flood-primary"
                    aria-label={`Select row ${index + 1}`}
                  />
                </td>
              )}
              {columns.map(col => (
                <td key={col.key} className={clsx(col.className)}>
                  {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SimpleTableProps {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export function SimpleTable({ headers, rows, className, striped = true, hoverable = true }: SimpleTableProps) {
  return (
    <div className={clsx('table-container', className)}>
      <table className="table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={clsx(hoverable && 'hover:bg-flood-card/50', striped && i % 2 === 1 && 'bg-flood-card/30')}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}