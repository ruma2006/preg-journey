import { useMemo } from 'react'
import clsx from 'clsx'
import { FollowUp, FollowUpStatus } from '@/types'
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface FollowUpHeatmapProps {
  followUps: FollowUp[]
  month?: Date
  onMonthChange?: (month: Date) => void
  onDayClick?: (date: Date, count: number) => void
}

interface DayData {
  date: Date
  count: number
  completed: number
  pending: number
  overdue: number
  isCurrentMonth: boolean
  isToday: boolean
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-gray-100 hover:bg-gray-200'
  if (count <= 2) return 'bg-green-200 hover:bg-green-300'
  if (count <= 5) return 'bg-green-400 hover:bg-green-500'
  if (count <= 10) return 'bg-green-600 hover:bg-green-700 text-white'
  return 'bg-green-800 hover:bg-green-900 text-white'
}

function getStatusColors(data: DayData): string {
  if (data.count === 0) return 'bg-gray-100 hover:bg-gray-200'

  // If there are overdue, show red tint
  if (data.overdue > 0 && data.overdue >= data.pending) {
    return 'bg-red-400 hover:bg-red-500 text-white'
  }

  // If mostly pending, show yellow/amber
  if (data.pending > data.completed) {
    return 'bg-amber-400 hover:bg-amber-500'
  }

  // If mostly completed, show green
  return getIntensityClass(data.completed)
}

export default function FollowUpHeatmap({
  followUps,
  month: propMonth,
  onMonthChange,
  onDayClick,
}: FollowUpHeatmapProps) {
  const month = propMonth || new Date()

  const handlePrevMonth = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1)
    onMonthChange?.(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    onMonthChange?.(newMonth)
  }

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()

    // First day of the month
    const firstDay = new Date(year, monthIndex, 1)
    const startDayOfWeek = firstDay.getDay()

    // Last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Today for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Create a map of follow-ups by date
    const followUpsByDate = new Map<string, { total: number; completed: number; pending: number; overdue: number }>()

    followUps.forEach((followUp) => {
      const dateKey = followUp.scheduledDate.split('T')[0]
      const existing = followUpsByDate.get(dateKey) || { total: 0, completed: 0, pending: 0, overdue: 0 }

      existing.total++
      if (followUp.status === FollowUpStatus.COMPLETED) {
        existing.completed++
      } else if (followUp.status === FollowUpStatus.PENDING) {
        const scheduledDate = new Date(followUp.scheduledDate)
        if (scheduledDate < today) {
          existing.overdue++
        } else {
          existing.pending++
        }
      }

      followUpsByDate.set(dateKey, existing)
    })

    // Build calendar grid (6 weeks x 7 days)
    const days: DayData[] = []

    // Add days from previous month
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, monthIndex - 1, daysInPrevMonth - i)
      const dateKey = date.toISOString().split('T')[0]
      const data = followUpsByDate.get(dateKey) || { total: 0, completed: 0, pending: 0, overdue: 0 }

      days.push({
        date,
        count: data.total,
        completed: data.completed,
        pending: data.pending,
        overdue: data.overdue,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
      })
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day)
      const dateKey = date.toISOString().split('T')[0]
      const data = followUpsByDate.get(dateKey) || { total: 0, completed: 0, pending: 0, overdue: 0 }

      days.push({
        date,
        count: data.total,
        completed: data.completed,
        pending: data.pending,
        overdue: data.overdue,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
      })
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, monthIndex + 1, day)
      const dateKey = date.toISOString().split('T')[0]
      const data = followUpsByDate.get(dateKey) || { total: 0, completed: 0, pending: 0, overdue: 0 }

      days.push({
        date,
        count: data.total,
        completed: data.completed,
        pending: data.pending,
        overdue: data.overdue,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
      })
    }

    return days
  }, [month, followUps])

  // Summary stats for the month
  const monthStats = useMemo(() => {
    let total = 0
    let completed = 0
    let pending = 0
    let overdue = 0
    let busyDays = 0

    calendarData.forEach((day) => {
      if (day.isCurrentMonth) {
        total += day.count
        completed += day.completed
        pending += day.pending
        overdue += day.overdue
        if (day.count > 0) busyDays++
      }
    })

    return { total, completed, pending, overdue, busyDays }
  }, [calendarData, month])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <CalendarDaysIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Follow-up Calendar</h3>
            <p className="text-sm text-gray-500">Activity heatmap for scheduled follow-ups</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-lg font-medium text-gray-900 min-w-[160px] text-center">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-700">{monthStats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">{monthStats.completed}</p>
          <p className="text-xs text-green-600">Completed</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <p className="text-2xl font-bold text-amber-700">{monthStats.pending}</p>
          <p className="text-xs text-amber-600">Pending</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-700">{monthStats.overdue}</p>
          <p className="text-xs text-red-600">Overdue</p>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, idx) => (
          <button
            key={idx}
            onClick={() => onDayClick?.(day.date, day.count)}
            className={clsx(
              'aspect-square p-1 rounded-lg text-sm font-medium transition-all relative group',
              day.isCurrentMonth ? 'opacity-100' : 'opacity-40',
              day.isToday && 'ring-2 ring-primary-500 ring-offset-1',
              getStatusColors(day),
              day.count > 0 && 'cursor-pointer'
            )}
          >
            <span className="absolute top-1 left-2 text-xs">{day.date.getDate()}</span>
            {day.count > 0 && (
              <span className="absolute bottom-1 right-2 text-xs font-bold">
                {day.count}
              </span>
            )}

            {/* Tooltip */}
            {day.count > 0 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                <div className="font-medium mb-1">
                  {day.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className="space-y-0.5">
                  {day.completed > 0 && <div className="text-green-400">{day.completed} completed</div>}
                  {day.pending > 0 && <div className="text-amber-400">{day.pending} pending</div>}
                  {day.overdue > 0 && <div className="text-red-400">{day.overdue} overdue</div>}
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="font-medium">Intensity:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <span>None</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-200 rounded" />
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-400 rounded" />
          <span>3-5</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-600 rounded" />
          <span>6-10</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-800 rounded" />
          <span>10+</span>
        </div>
        <span className="mx-2">|</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-400 rounded" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-400 rounded" />
          <span>Overdue</span>
        </div>
      </div>
    </div>
  )
}
