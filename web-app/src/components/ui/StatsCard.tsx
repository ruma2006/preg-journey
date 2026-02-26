import { ReactNode } from 'react'
import clsx from 'clsx'
import AnimatedCounter from './AnimatedCounter'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  onClick?: () => void
  animate?: boolean
}

const colors = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  gray: 'bg-gray-50 text-gray-600',
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  color = 'blue',
  onClick,
  animate = true
}: StatsCardProps) {
  const isNumeric = typeof value === 'number' || !isNaN(Number(value))
  const numericValue = typeof value === 'number' ? value : Number(value)

  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && (
          <div className={clsx(
            'flex-shrink-0 p-3 rounded-xl transition-transform duration-300',
            colors[color],
            onClick && 'group-hover:scale-110'
          )}>
            {icon}
          </div>
        )}
        <div className={clsx(icon && 'ml-4')}>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <div className="flex items-baseline">
            {animate && isNumeric ? (
              <AnimatedCounter
                value={numericValue}
                className="text-2xl font-semibold text-gray-900"
                duration={1200}
              />
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            )}
            {change && (
              <p
                className={clsx(
                  'ml-2 text-sm font-medium',
                  change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change.type === 'increase' ? '+' : '-'}
                {Math.abs(change.value)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
