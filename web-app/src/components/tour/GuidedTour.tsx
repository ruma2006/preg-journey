import { useEffect, useState } from 'react'
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride'
import { useTourStore } from '@/store/tourStore'
import { useAuthStore } from '@/store/authStore'

const tourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h2 className="text-xl font-bold text-primary-700 mb-2">Welcome to Amma Rakshitha!</h2>
        <p className="text-gray-600">
          Let us show you around the maternal healthcare management system.
          This quick tour will help you get started.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-dashboard"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Dashboard</h3>
        <p className="text-gray-600 text-sm">
          Your home base! View key statistics, high-risk patients, critical alerts,
          and today's activities at a glance.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-patients"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Patients</h3>
        <p className="text-gray-600 text-sm">
          Register new patients, view patient records, track pregnancy progress,
          and manage patient information.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-health-checks"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Health Checks</h3>
        <p className="text-gray-600 text-sm">
          Record vital signs, symptoms, and health observations.
          The system automatically calculates risk levels based on your inputs.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-consultations"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Consultations</h3>
        <p className="text-gray-600 text-sm">
          Schedule and manage doctor consultations.
          Track consultation outcomes and follow-up requirements.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-follow-ups"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Follow-ups</h3>
        <p className="text-gray-600 text-sm">
          Manage patient follow-up calls. View today's pending calls,
          overdue follow-ups, and upcoming scheduled calls.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-alerts"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Alerts</h3>
        <p className="text-gray-600 text-sm">
          Critical notifications about high-risk patients,
          missed appointments, and urgent situations requiring attention.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="header-search"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Quick Search</h3>
        <p className="text-gray-600 text-sm">
          Quickly find patients by name, Mother ID, or mobile number.
          Search from anywhere in the application.
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="header-user"]',
    content: (
      <div>
        <h3 className="font-semibold text-primary-700 mb-1">Your Profile</h3>
        <p className="text-gray-600 text-sm">
          Access your profile settings and logout option.
          You can also restart this tour anytime from here.
        </p>
      </div>
    ),
    placement: 'bottom-end',
  },
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h2 className="text-xl font-bold text-primary-700 mb-2">You're all set!</h2>
        <p className="text-gray-600 mb-3">
          You're ready to start using Amma Rakshitha.
          Remember, you can restart this tour anytime from the user menu.
        </p>
        <div className="bg-primary-50 rounded-lg p-3 text-sm text-primary-700">
          <strong>Quick tip:</strong> Start by registering a patient or checking
          today's pending follow-ups on the Dashboard.
        </div>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
]

export default function GuidedTour() {
  const { hasCompletedTour, isTourActive, setTourCompleted, startTour, endTour } = useTourStore()
  const { isAuthenticated } = useAuthStore()
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Start tour for first-time users after a short delay to let the UI render
    if (isAuthenticated && !hasCompletedTour && !isTourActive) {
      const timer = setTimeout(() => {
        startTour()
        setRun(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, hasCompletedTour, isTourActive, startTour])

  useEffect(() => {
    if (isTourActive) {
      setRun(true)
    }
  }, [isTourActive])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, type } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setTourCompleted()
      setRun(false)
    }

    if (action === ACTIONS.CLOSE || (type === EVENTS.STEP_AFTER && action === ACTIONS.SKIP)) {
      endTour()
      setRun(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleJoyrideCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      styles={{
        options: {
          primaryColor: '#7c3aed', // primary-600
          backgroundColor: '#ffffff',
          textColor: '#374151',
          arrowColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
        },
        tooltipContent: {
          fontSize: 14,
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: '#7c3aed',
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 10,
          fontSize: 14,
        },
        buttonSkip: {
          color: '#9ca3af',
          fontSize: 13,
        },
        spotlight: {
          borderRadius: 8,
        },
        beacon: {
          display: 'none',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  )
}
