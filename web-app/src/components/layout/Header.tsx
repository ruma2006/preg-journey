import { alertService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { useTourStore } from '@/store/tourStore'
import { Menu, Transition } from '@headlessui/react'
import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    BellIcon,
    QuestionMarkCircleIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { resetTour, startTour } = useTourStore()
  const navigate = useNavigate()

  const { data: alertCount = 0 } = useQuery({
    queryKey: ['alertCount'],
    queryFn: alertService.countCritical,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRestartTour = () => {
    resetTour()
    navigate('/')
    // Small delay to ensure we're on the dashboard before starting
    setTimeout(() => {
      startTour()
    }, 500)
  }

  const hasCriticalAlerts = alertCount > 0

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Page title - can be customized per page */}
            <div className="ml-4 md:ml-0">
              <h1 className="text-xl font-semibold text-gray-900">
                Government of Telangana - Nirmal District
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              type="button"
              className={clsx(
                'relative p-2 rounded-full transition-colors duration-200',
                hasCriticalAlerts
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                  : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              )}
              onClick={() => navigate('/alerts')}
            >
              <BellIcon className={clsx('h-6 w-6', hasCriticalAlerts && 'animate-bounce')} />
              {alertCount > 0 && (
                <span
                  className={clsx(
                    'absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs font-bold',
                    hasCriticalAlerts && 'pulse-critical-badge'
                  )}
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
              {hasCriticalAlerts && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
              )}
            </button>

            {/* User Menu */}
            <Menu as="div" className="relative" data-tour="header-user">
              <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img
                      src={`http://localhost:8080/api${user.profileImageUrl}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-1"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/profile')}
                        className={clsx(
                          'flex items-center w-full px-4 py-2.5 text-sm text-gray-700 transition-colors',
                          active && 'bg-gray-50'
                        )}
                      >
                        <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Your Profile
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleRestartTour}
                        className={clsx(
                          'flex items-center w-full px-4 py-2.5 text-sm text-gray-700 transition-colors',
                          active && 'bg-gray-50'
                        )}
                      >
                        <QuestionMarkCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Restart Tour
                      </button>
                    )}
                  </Menu.Item>
                  <div className="my-1 border-t border-gray-100" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={clsx(
                          'flex items-center w-full px-4 py-2.5 text-sm text-red-600 transition-colors',
                          active && 'bg-red-50'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}
