import { AmmaRakshithaLogo, TelanganaLogo } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import {
    BellAlertIcon,
    CalendarIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    HomeIcon,
    PhoneIcon,
    UserGroupIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
  tourId?: string
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, tourId: 'sidebar-dashboard' },
  { name: 'Patients', href: '/patients', icon: UserGroupIcon, tourId: 'sidebar-patients' },
  { name: 'Health Checks', href: '/health-checks', icon: ClipboardDocumentListIcon, tourId: 'sidebar-health-checks' },
  { name: 'Consultations', href: '/consultations', icon: CalendarIcon, tourId: 'sidebar-consultations' },
  { name: 'Follow-ups', href: '/follow-ups', icon: PhoneIcon, tourId: 'sidebar-follow-ups' },
  { name: 'Alerts', href: '/alerts', icon: BellAlertIcon, tourId: 'sidebar-alerts' },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: [UserRole.ADMIN, UserRole.MEDICAL_OFFICER, UserRole.MCH_OFFICER], tourId: 'sidebar-reports' },
  { name: 'Users', href: '/users', icon: UsersIcon, roles: [UserRole.ADMIN] },
]

export default function Sidebar() {
  const { user, hasRole } = useAuthStore()

  const filteredNav = navigation.filter((item) => {
    if (!item.roles) return true
    return hasRole(item.roles)
  })

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-gradient-to-b from-primary-800 to-primary-900">
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
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {filteredNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                data-tour={item.tourId}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm'
                      : 'text-primary-100 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

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
                  <span className="text-white font-semibold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate max-w-[140px]">
                  {user?.name}
                </p>
                <p className="text-xs text-primary-300 capitalize">
                  {user?.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
