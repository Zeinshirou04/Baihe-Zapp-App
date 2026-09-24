"use client";
import { TableHTMLAttributes } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  keyAccessor,
  emptyMessage = 'No data',
  rowClassName,
  className = '',
  ...props
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full divide-y divide-ink/10 ${className}`} {...props}>
        <thead>
          <tr className="bg-ink/5">
            {columns.map(col => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium text-ink/50 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10 bg-white/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-ink/50">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr
                key={keyAccessor(row)}
                className={`${rowClassName?.(row) || ''} hover:bg-ink/5 transition-colors`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-ink ${col.className || ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}