import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthResponse, UserRole } from '@/types'

interface AuthState {
  user: {
    id: number
    name: string
    email: string
    role: UserRole
  } | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (auth: AuthResponse) => void
  logout: () => void
  hasRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (auth: AuthResponse) => {
        set({
          user: {
            id: auth.userId,
            name: auth.name,
            email: auth.email,
            role: auth.role,
          },
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      hasRole: (roles: UserRole[]) => {
        const user = get().user
        if (!user) return false
        return roles.includes(user.role)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
