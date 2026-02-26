import { HTMLAttributes } from 'react'
import clsx from 'clsx'
import { RiskLevel, PatientStatus, ConsultationStatus, FollowUpStatus } from '@/types'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-600',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Risk Level Badge
export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = {
    [RiskLevel.GREEN]: { variant: 'success' as const, label: 'Stable' },
    [RiskLevel.YELLOW]: { variant: 'warning' as const, label: 'Moderate' },
    [RiskLevel.RED]: { variant: 'danger' as const, label: 'Severe' },
  }

  const { variant, label } = config[level]

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <span className={clsx(
        'w-2 h-2 rounded-full',
        level === RiskLevel.GREEN && 'bg-green-500',
        level === RiskLevel.YELLOW && 'bg-yellow-500',
        level === RiskLevel.RED && 'bg-red-500'
      )} />
      {label}
    </Badge>
  )
}

// Patient Status Badge
export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const config = {
    [PatientStatus.ACTIVE]: { variant: 'success' as const, label: 'Active' },
    [PatientStatus.UNDER_OBSERVATION]: { variant: 'warning' as const, label: 'Under Observation' },
    [PatientStatus.DISCHARGED]: { variant: 'info' as const, label: 'Discharged' },
    [PatientStatus.REFERRED]: { variant: 'gray' as const, label: 'Referred' },
    [PatientStatus.INACTIVE]: { variant: 'gray' as const, label: 'Inactive' },
  }

  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

// Consultation Status Badge
export function ConsultationStatusBadge({ status }: { status: ConsultationStatus }) {
  const config = {
    [ConsultationStatus.SCHEDULED]: { variant: 'info' as const, label: 'Scheduled' },
    [ConsultationStatus.IN_PROGRESS]: { variant: 'warning' as const, label: 'In Progress' },
    [ConsultationStatus.COMPLETED]: { variant: 'success' as const, label: 'Completed' },
    [ConsultationStatus.CANCELLED]: { variant: 'gray' as const, label: 'Cancelled' },
    [ConsultationStatus.NO_SHOW]: { variant: 'danger' as const, label: 'No Show' },
  }

  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

// Follow Up Status Badge
export function FollowUpStatusBadge({ status }: { status: FollowUpStatus }) {
  const config = {
    [FollowUpStatus.PENDING]: { variant: 'warning' as const, label: 'Pending' },
    [FollowUpStatus.COMPLETED]: { variant: 'success' as const, label: 'Completed' },
    [FollowUpStatus.NO_ANSWER]: { variant: 'danger' as const, label: 'No Answer' },
    [FollowUpStatus.RESCHEDULED]: { variant: 'info' as const, label: 'Rescheduled' },
    [FollowUpStatus.CANCELLED]: { variant: 'gray' as const, label: 'Cancelled' },
  }

  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
