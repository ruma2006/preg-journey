import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  }

  const style: React.CSSProperties = {
    width: width,
    height: height || (variant === 'text' ? '1em' : undefined),
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  )
}

// Pre-built skeleton components for common use cases

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center">
        <Skeleton variant="rounded" className="w-12 h-12" />
        <div className="ml-4 flex-1">
          <Skeleton variant="text" className="h-4 w-24 mb-2" />
          <Skeleton variant="text" className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonStatsCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center">
        <div className="flex-shrink-0 p-3 rounded-xl bg-gray-200 w-12 h-12" />
        <div className="ml-4">
          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-7 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton variant="text" className="h-4" width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </>
  )
}

export function SkeletonPatientCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div>
            <Skeleton variant="text" className="h-5 w-32 mb-1" />
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
        </div>
        <Skeleton variant="rounded" className="h-6 w-16" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <Skeleton variant="text" className="h-3 w-12 mb-1" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
        <div>
          <Skeleton variant="text" className="h-3 w-12 mb-1" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        <div>
          <Skeleton variant="text" className="h-3 w-12 mb-1" />
          <Skeleton variant="text" className="h-4 w-14" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <Skeleton variant="text" className="h-6 w-40 mb-4" />
          <Skeleton variant="rounded" className="h-64 w-full" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <Skeleton variant="text" className="h-6 w-40 mb-4" />
          <Skeleton variant="rounded" className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}
