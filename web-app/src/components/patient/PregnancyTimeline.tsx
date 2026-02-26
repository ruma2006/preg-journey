import { useMemo } from 'react'
import clsx from 'clsx'
import { Patient, HealthCheck } from '@/types'
import {
  CalendarDaysIcon,
  HeartIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface PregnancyTimelineProps {
  patient: Patient
  healthChecks?: HealthCheck[]
}

interface Trimester {
  name: string
  weeks: string
  startWeek: number
  endWeek: number
  color: string
  bgColor: string
}

const TRIMESTERS: Trimester[] = [
  { name: '1st Trimester', weeks: 'Weeks 1-12', startWeek: 1, endWeek: 12, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { name: '2nd Trimester', weeks: 'Weeks 13-26', startWeek: 13, endWeek: 26, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { name: '3rd Trimester', weeks: 'Weeks 27-40', startWeek: 27, endWeek: 40, color: 'text-blue-600', bgColor: 'bg-blue-100' },
]

const TOTAL_WEEKS = 40

export default function PregnancyTimeline({ patient, healthChecks = [] }: PregnancyTimelineProps) {
  const { currentWeek, daysRemaining, progressPercent, currentTrimester } = useMemo(() => {
    if (!patient.lmpDate) {
      return { currentWeek: 0, daysRemaining: 0, progressPercent: 0, currentTrimester: null }
    }

    const lmpDate = new Date(patient.lmpDate)
    const today = new Date()
    const eddDate = patient.eddDate ? new Date(patient.eddDate) : new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000)

    const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
    const week = Math.floor(daysSinceLMP / 7) + 1
    const daysUntilEDD = Math.max(0, Math.floor((eddDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    const progress = Math.min(100, (week / TOTAL_WEEKS) * 100)

    const trimester = TRIMESTERS.find(t => week >= t.startWeek && week <= t.endWeek) || null

    return {
      currentWeek: Math.min(week, TOTAL_WEEKS),
      daysRemaining: daysUntilEDD,
      progressPercent: progress,
      currentTrimester: trimester,
    }
  }, [patient.lmpDate, patient.eddDate])

  // Map health checks to weeks
  const checkupWeeks = useMemo(() => {
    if (!patient.lmpDate || !healthChecks.length) return []

    const lmpDate = new Date(patient.lmpDate)
    return healthChecks.map(check => {
      const checkDate = new Date(check.checkDate)
      const daysSinceLMP = Math.floor((checkDate.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
      const week = Math.floor(daysSinceLMP / 7) + 1
      return {
        week: Math.min(Math.max(week, 1), TOTAL_WEEKS),
        date: check.checkDate,
        riskLevel: check.riskLevel,
      }
    })
  }, [patient.lmpDate, healthChecks])

  if (!patient.lmpDate) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">LMP date not recorded</p>
        <p className="text-sm text-gray-400">Add LMP date to see pregnancy timeline</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
          <p className="text-3xl font-bold text-primary-700">{currentWeek}</p>
          <p className="text-xs text-primary-600 font-medium">Current Week</p>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <p className="text-3xl font-bold text-purple-700">{currentTrimester?.name.split(' ')[0] || '-'}</p>
          <p className="text-xs text-purple-600 font-medium">Trimester</p>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
          <p className="text-3xl font-bold text-amber-700">{daysRemaining}</p>
          <p className="text-xs text-amber-600 font-medium">Days to EDD</p>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
          <p className="text-3xl font-bold text-green-700">{healthChecks.length}</p>
          <p className="text-xs text-green-600 font-medium">Health Checks</p>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        {/* Trimester Labels */}
        <div className="flex mb-2">
          {TRIMESTERS.map((trimester) => (
            <div
              key={trimester.name}
              className="flex-1 text-center"
              style={{ width: `${((trimester.endWeek - trimester.startWeek + 1) / TOTAL_WEEKS) * 100}%` }}
            >
              <span className={clsx('text-xs font-medium', trimester.color)}>
                {trimester.name}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar Background */}
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Trimester Sections */}
          <div className="absolute inset-0 flex">
            {TRIMESTERS.map((trimester, idx) => (
              <div
                key={trimester.name}
                className={clsx(
                  'h-full border-r border-white/50 last:border-r-0',
                  idx === 0 ? 'bg-pink-200' : idx === 1 ? 'bg-purple-200' : 'bg-blue-200'
                )}
                style={{ width: `${((trimester.endWeek - trimester.startWeek + 1) / TOTAL_WEEKS) * 100}%` }}
              />
            ))}
          </div>

          {/* Progress Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>

          {/* Current Position Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-primary-600 rounded-full shadow-lg transition-all duration-500 z-10"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />

          {/* Health Check Markers */}
          {checkupWeeks.map((check, idx) => (
            <div
              key={idx}
              className="absolute top-1/2 -translate-y-1/2 group"
              style={{ left: `${(check.week / TOTAL_WEEKS) * 100}%` }}
            >
              <div
                className={clsx(
                  'w-3 h-3 rounded-full border-2 border-white shadow cursor-pointer transition-transform hover:scale-150',
                  check.riskLevel === 'RED' ? 'bg-red-500' :
                  check.riskLevel === 'YELLOW' ? 'bg-yellow-500' : 'bg-green-500'
                )}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Week {check.week} - {new Date(check.date).toLocaleDateString()}
              </div>
            </div>
          ))}

          {/* EDD Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 right-0 transform translate-x-1/2"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <HeartIcon className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Week Labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Week 1</span>
          <span>Week 12</span>
          <span>Week 26</span>
          <span>Week 40 (EDD)</span>
        </div>
      </div>

      {/* Key Dates */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-pink-100 rounded-lg">
            <CalendarDaysIcon className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">LMP Date</p>
            <p className="font-medium text-gray-900">
              {new Date(patient.lmpDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-amber-100 rounded-lg">
            <HeartIcon className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Expected Delivery</p>
            <p className="font-medium text-gray-900">
              {patient.eddDate
                ? new Date(patient.eddDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not calculated'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Last Checkup</p>
            <p className="font-medium text-gray-900">
              {healthChecks.length > 0
                ? new Date(healthChecks[0].checkDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'No checkups yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Low Risk Check</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span>Moderate Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <HeartIcon className="w-2 h-2 text-white" />
          </div>
          <span>EDD</span>
        </div>
      </div>
    </div>
  )
}
