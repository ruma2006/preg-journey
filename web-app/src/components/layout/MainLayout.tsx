import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileSidebar from './MobileSidebar'
import Footer from './Footer'
import { PageTransition } from '@/components/ui'
import { GuidedTour } from '@/components/tour'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      {/* Guided Tour for first-time users */}
      <GuidedTour />

      <div className="h-screen flex overflow-hidden bg-gray-50">
        {/* Mobile sidebar */}
        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-180px)]">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </>
  )
}
