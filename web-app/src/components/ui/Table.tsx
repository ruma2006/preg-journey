import { ReactNode } from 'react'
import clsx from 'clsx'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children, className }: TableProps) {
  return <thead className={clsx('bg-gray-50', className)}>{children}</thead>
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={clsx('bg-white divide-y divide-gray-200', className)}>{children}</tbody>
}

export function TableRow({ children, className, onClick }: TableProps & { onClick?: () => void }) {
  return (
    <tr
      className={clsx(onClick && 'cursor-pointer hover:bg-gray-50', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
  header?: boolean
}

export function TableCell({ children, className, header }: TableCellProps) {
  if (header) {
    return (
      <th
        scope="col"
        className={clsx(
          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
          className
        )}
      >
        {children}
      </th>
    )
  }

  return (
    <td className={clsx('px-6 py-4 whitespace-nowrap text-left text-sm text-gray-900', className)}>
      {children}
    </td>
  )
}

// Empty State
interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function TableEmpty({ title, description, action }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        <div className="text-gray-500">
          <p className="text-lg font-medium">{title}</p>
          {description && <p className="mt-1 text-sm">{description}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </td>
    </tr>
  )
}

// Loading State
export function TableLoading({ columns = 5 }: { columns?: number }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
