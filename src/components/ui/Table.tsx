import { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface TableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Table component - Data table container
 */
export const Table = ({ children, className = '' }: TableProps) => (
  <div className="overflow-x-auto">
    <table className={clsx('min-w-full divide-y divide-gray-200', className)}>
      {children}
    </table>
  </div>
);

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export const TableHeader = ({ children, className = '' }: TableHeaderProps) => (
  <thead className={clsx('bg-gray-50', className)}>
    {children}
  </thead>
);

export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export const TableBody = ({ children, className = '' }: TableBodyProps) => (
  <tbody className={clsx('bg-white divide-y divide-gray-200', className)}>
    {children}
  </tbody>
);

export interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const TableRow = ({
  children,
  className = '',
  onClick,
  hover = true
}: TableRowProps) => (
  <tr
    onClick={onClick}
    className={clsx(
      hover && 'hover:bg-gray-50 transition-colors',
      onClick && 'cursor-pointer',
      className
    )}
  >
    {children}
  </tr>
);

export interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export const TableHead = ({ children, className = '' }: TableHeadProps) => (
  <th
    scope="col"
    className={clsx(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      className
    )}
  >
    {children}
  </th>
);

export interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export const TableCell = ({ children, className = '' }: TableCellProps) => (
  <td className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
    {children}
  </td>
);

export interface TableEmptyProps {
  children: ReactNode;
  colSpan?: number;
  className?: string;
}

export const TableEmpty = ({ children, colSpan = 6, className = '' }: TableEmptyProps) => (
  <tr>
    <td colSpan={colSpan} className={clsx('px-6 py-12 text-center', className)}>
      <div className="text-gray-500">
        {children}
      </div>
    </td>
  </tr>
);
