import { AmmaRakshithaLogo, TelanganaLogo } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { Dialog, Transition } from '@headlessui/react'
import {
    BellAlertIcon,
    CalendarIcon,
    ChartBarIcon, ClipboardDocumentListIcon, HomeIcon, PhoneIcon, UserGroupIcon, UsersIcon, XMarkIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Patients', href: '/patients', icon: UserGroupIcon },
  { name: 'Health Checks', href: '/health-checks', icon: ClipboardDocumentListIcon },
  { name: 'Consultations', href: '/consultations', icon: CalendarIcon },
  { name: 'Follow-ups', href: '/follow-ups', icon: PhoneIcon },
  { name: 'Alerts', href: '/alerts', icon: BellAlertIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: [UserRole.ADMIN, UserRole.MEDICAL_OFFICER, UserRole.MCH_OFFICER] },
  { name: 'Users', href: '/users', icon: UsersIcon, roles: [UserRole.ADMIN] },
]

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { user, hasRole } = useAuthStore()

  const filteredNav = navigation.filter((item) => {
    if (!item.roles) return true
    return hasRole(item.roles)
  })

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 flex z-40">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-primary-800 to-primary-900">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 px-4">
                  <div className="flex items-center">
                    <AmmaRakshithaLogo size={42} variant="icon" />
                    <div className="ml-3">
                      <h1 className="text-white font-bold text-lg">Amma Rakshitha</h1>
                      <p className="text-primary-200 text-xs">Maternal Healthcare</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-2 space-y-1">
                  {filteredNav.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-white/10 text-white shadow-lg'
                            : 'text-primary-100 hover:bg-white/5 hover:text-white'
                        )
                      }
                    >
                      <item.icon className="mr-4 flex-shrink-0 h-6 w-6" />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Government Branding */}
              <div className="px-4 py-3 border-t border-primary-700/50">
                <div className="flex items-center gap-2">
                  <TelanganaLogo size={36} showText={false} />
                  <div>
                    <p className="text-[10px] font-medium text-primary-200">Govt. of Telangana</p>
                    <p className="text-[9px] text-primary-300">District Nirmal</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-shrink-0 flex border-t border-primary-700/50 p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center ring-2 ring-primary-400/30 overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img
                        src={`http://localhost:8080/api${user.profileImageUrl}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-primary-300 capitalize">
                      {user?.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>

          <div className="flex-shrink-0 w-14" />
        </div>
      </Dialog>
    </Transition.Root>
  )
}
