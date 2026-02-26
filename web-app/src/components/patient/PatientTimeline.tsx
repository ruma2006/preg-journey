import { useMemo } from 'react'
import {
  ClipboardDocumentCheckIcon,
  PhoneIcon,
  VideoCameraIcon,
  BellAlertIcon,
  UserPlusIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import {
  Patient,
  HealthCheck,
  Consultation,
  FollowUp,
  RiskAlert,
  RiskLevel,
  ConsultationStatus,
  FollowUpStatus,
  DeliveryOutcome,
} from '@/types'

// Timeline event types
type TimelineEventType =
  | 'registration'
  | 'health_check'
  | 'consultation'
  | 'follow_up'
  | 'alert'
  | 'delivery'

interface TimelineEvent {
  id: string
  type: TimelineEventType
  date: Date
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  status?: string
  statusColor?: string
  details?: Record<string, string | number | boolean | undefined>
  riskLevel?: RiskLevel
  data?: HealthCheck | Consultation | FollowUp | RiskAlert
}

interface PatientTimelineProps {
  patient: Patient
  healthChecks?: HealthCheck[]
  consultations?: Consultation[]
  followUps?: FollowUp[]
  alerts?: RiskAlert[]
  maxItems?: number
  showFilters?: boolean
}

const getRiskColorClasses = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.RED:
      return { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' }
    case RiskLevel.YELLOW:
      return { bg: 'bg-yellow-100', text: 'text-yellow-600', dot: 'bg-yellow-500' }
    case RiskLevel.GREEN:
      return { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' }
  }
}

const getConsultationStatusInfo = (status: ConsultationStatus) => {
  switch (status) {
    case ConsultationStatus.COMPLETED:
      return { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' }
    case ConsultationStatus.SCHEDULED:
      return { label: 'Scheduled', color: 'text-blue-600', bg: 'bg-blue-100' }
    case ConsultationStatus.IN_PROGRESS:
      return { label: 'In Progress', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    case ConsultationStatus.CANCELLED:
      return { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100' }
    case ConsultationStatus.NO_SHOW:
      return { label: 'No Show', color: 'text-red-600', bg: 'bg-red-100' }
    default:
      return { label: status, color: 'text-gray-600', bg: 'bg-gray-100' }
  }
}

const getFollowUpStatusInfo = (status: FollowUpStatus) => {
  switch (status) {
    case FollowUpStatus.COMPLETED:
      return { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircleIcon }
    case FollowUpStatus.PENDING:
      return { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: ClockIcon }
    case FollowUpStatus.NO_ANSWER:
      return { label: 'No Answer', color: 'text-red-600', bg: 'bg-red-100', icon: XCircleIcon }
    case FollowUpStatus.RESCHEDULED:
      return { label: 'Rescheduled', color: 'text-blue-600', bg: 'bg-blue-100', icon: ArrowPathIcon }
    case FollowUpStatus.CANCELLED:
      return { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100', icon: XCircleIcon }
    default:
      return { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: ClockIcon }
  }
}

const getDeliveryInfo = (outcome: DeliveryOutcome) => {
  switch (outcome) {
    case DeliveryOutcome.SUCCESSFUL:
      return { label: 'Successful Delivery', color: 'text-green-600', bg: 'bg-green-100', icon: HeartSolidIcon }
    case DeliveryOutcome.MOTHER_MORTALITY:
      return { label: 'Mother Mortality', color: 'text-red-600', bg: 'bg-red-100', icon: HeartIcon }
    case DeliveryOutcome.BABY_MORTALITY:
      return { label: 'Baby Mortality', color: 'text-red-600', bg: 'bg-red-100', icon: HeartIcon }
    case DeliveryOutcome.BOTH_MORTALITY:
      return { label: 'Both Mortality', color: 'text-red-600', bg: 'bg-red-100', icon: HeartIcon }
    default:
      return { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100', icon: ClockIcon }
  }
}

export default function PatientTimeline({
  patient,
  healthChecks = [],
  consultations = [],
  followUps = [],
  alerts = [],
  maxItems,
}: PatientTimelineProps) {
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = []

    // Add registration event
    events.push({
      id: 'registration',
      type: 'registration',
      date: new Date(patient.registrationDate),
      title: 'Patient Registered',
      description: `${patient.name} was registered in the system`,
      icon: UserPlusIcon,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      details: {
        'Mother ID': patient.motherId,
        'Risk Level': patient.currentRiskLevel,
      },
    })

    // Add health checks
    healthChecks.forEach((hc) => {
      const riskColors = getRiskColorClasses(hc.riskLevel)
      events.push({
        id: `hc-${hc.id}`,
        type: 'health_check',
        date: new Date(hc.checkDate),
        title: 'Health Check',
        description: hc.notes || `Routine health check - Risk Score: ${hc.riskScore}`,
        icon: ClipboardDocumentCheckIcon,
        iconBg: riskColors.bg,
        iconColor: riskColors.text,
        riskLevel: hc.riskLevel,
        details: {
          'BP': hc.bpSystolic && hc.bpDiastolic ? `${hc.bpSystolic}/${hc.bpDiastolic} mmHg` : undefined,
          'Hemoglobin': hc.hemoglobin ? `${hc.hemoglobin} g/dL` : undefined,
          'Weight': hc.weight ? `${hc.weight} kg` : undefined,
          'Risk Score': hc.riskScore,
        },
        data: hc,
      })
    })

    // Add consultations
    consultations.forEach((c) => {
      const statusInfo = getConsultationStatusInfo(c.status)
      events.push({
        id: `consultation-${c.id}`,
        type: 'consultation',
        date: new Date(c.scheduledAt),
        title: `${c.type === 'TELECONSULTATION' ? 'Tele' : c.type === 'EMERGENCY' ? 'Emergency' : 'In-Person'} Consultation`,
        description: c.chiefComplaint || `Consultation with Dr. ${c.doctor?.name || 'Unknown'}`,
        icon: VideoCameraIcon,
        iconBg: statusInfo.bg,
        iconColor: statusInfo.color,
        status: statusInfo.label,
        statusColor: statusInfo.color,
        details: {
          'Doctor': c.doctor?.name,
          'Diagnosis': c.diagnosis,
          'Status': statusInfo.label,
        },
        data: c,
      })
    })

    // Add follow-ups
    followUps.forEach((f) => {
      const statusInfo = getFollowUpStatusInfo(f.status)
      events.push({
        id: `followup-${f.id}`,
        type: 'follow_up',
        date: new Date(f.scheduledDate),
        title: 'Follow-up Call',
        description: f.patientCondition || f.notes || `Follow-up by ${f.assignedTo?.name || 'Staff'}`,
        icon: PhoneIcon,
        iconBg: statusInfo.bg,
        iconColor: statusInfo.color,
        status: statusInfo.label,
        statusColor: statusInfo.color,
        details: {
          'Assigned To': f.assignedTo?.name,
          'Attempts': f.attemptCount,
          'Status': statusInfo.label,
        },
        data: f,
      })
    })

    // Add alerts
    alerts.forEach((a) => {
      const riskColors = getRiskColorClasses(a.severity)
      events.push({
        id: `alert-${a.id}`,
        type: 'alert',
        date: new Date(a.createdAt),
        title: a.title,
        description: a.description,
        icon: a.severity === RiskLevel.RED ? ExclamationTriangleIcon : BellAlertIcon,
        iconBg: riskColors.bg,
        iconColor: riskColors.text,
        riskLevel: a.severity,
        status: a.isResolved ? 'Resolved' : a.isAcknowledged ? 'Acknowledged' : 'Active',
        statusColor: a.isResolved ? 'text-green-600' : a.isAcknowledged ? 'text-blue-600' : 'text-red-600',
        details: {
          'Alert Type': a.alertType.replace(/_/g, ' '),
          'Severity': a.severity,
          'Resolved': a.isResolved ? 'Yes' : 'No',
        },
        data: a,
      })
    })

    // Add delivery event if completed
    if (patient.deliveryOutcome && patient.deliveryOutcome !== DeliveryOutcome.PENDING) {
      const deliveryInfo = getDeliveryInfo(patient.deliveryOutcome)
      events.push({
        id: 'delivery',
        type: 'delivery',
        date: new Date(patient.deliveryDate || patient.deliveryCompletedAt || new Date()),
        title: deliveryInfo.label,
        description: patient.deliveryNotes || `Delivery type: ${patient.deliveryType}`,
        icon: deliveryInfo.icon,
        iconBg: deliveryInfo.bg,
        iconColor: deliveryInfo.color,
        details: {
          'Delivery Type': patient.deliveryType,
          'Baby Gender': patient.babyGender,
          'Baby Weight': patient.babyWeight ? `${patient.babyWeight} kg` : undefined,
          'Hospital': patient.deliveryHospital,
        },
      })
    }

    // Sort by date (newest first)
    events.sort((a, b) => b.date.getTime() - a.date.getTime())

    // Limit items if specified
    if (maxItems) {
      return events.slice(0, maxItems)
    }

    return events
  }, [patient, healthChecks, consultations, followUps, alerts, maxItems])

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return 'Today'
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ClockIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p>No timeline events yet</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timelineEvents.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {/* Connector line */}
              {eventIdx !== timelineEvents.length - 1 && (
                <span
                  className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}

              <div className="relative flex items-start space-x-4">
                {/* Icon */}
                <div className="relative">
                  <div
                    className={clsx(
                      'flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white',
                      event.iconBg
                    )}
                  >
                    <event.icon className={clsx('h-5 w-5', event.iconColor)} aria-hidden="true" />
                  </div>
                  {/* Risk indicator dot for health checks and alerts */}
                  {event.riskLevel && (
                    <span
                      className={clsx(
                        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
                        getRiskColorClasses(event.riskLevel).dot
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(event.date)} at {formatTime(event.date)}
                      </p>
                    </div>
                    {event.status && (
                      <span
                        className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          event.statusColor,
                          event.statusColor?.includes('green') && 'bg-green-100',
                          event.statusColor?.includes('yellow') && 'bg-yellow-100',
                          event.statusColor?.includes('red') && 'bg-red-100',
                          event.statusColor?.includes('blue') && 'bg-blue-100',
                          event.statusColor?.includes('gray') && 'bg-gray-100'
                        )}
                      >
                        {event.status}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.description}</p>

                  {/* Details */}
                  {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(event.details).map(
                        ([key, value]) =>
                          value !== undefined && (
                            <span key={key} className="text-xs text-gray-500">
                              <span className="font-medium">{key}:</span>{' '}
                              <span className="text-gray-700">{String(value)}</span>
                            </span>
                          )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Timeline end marker */}
      <div className="relative flex items-center justify-center pt-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <span className="relative bg-white px-3 text-xs text-gray-500">
          {timelineEvents.length} event{timelineEvents.length !== 1 ? 's' : ''} in timeline
        </span>
      </div>
    </div>
  )
}
