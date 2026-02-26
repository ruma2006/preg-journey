import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button, Input, TelanganaLogo, AmmaRakshithaLogo } from '@/components/ui'
import { authService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { AuthRequest } from '@/types'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthRequest>()

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data)
      toast.success('Login successful!')
      navigate('/')
    },
    onError: () => {
      toast.error('Invalid email or password')
    },
  })

  const onSubmit = (data: AuthRequest) => {
    loginMutation.mutate(data)
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-4">
            <TelanganaLogo size={70} showText={false} />
            <div>
              <h1 className="text-white font-bold text-2xl">Amma Rakshitha</h1>
              <p className="text-primary-200 text-sm">Maternal Healthcare Management</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <AmmaRakshithaLogo size={200} variant="full" />
          <h2 className="text-3xl font-bold mb-4 text-white text-center mt-8">
            Digital Health Record & High-Risk Patient Management
          </h2>
          <p className="text-primary-200 text-lg text-center max-w-md">
            A comprehensive system for managing maternal health care, identifying high-risk patients,
            and ensuring timely medical interventions.
          </p>

          <div className="mt-8 flex gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-primary-200 text-sm">Patient Monitoring</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">Real-time</p>
              <p className="text-primary-200 text-sm">Risk Assessment</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">Automated</p>
              <p className="text-primary-200 text-sm">Follow-up Tracking</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-primary-200 text-sm">
          <TelanganaLogo size={50} showText={false} />
          <div>
            <p className="font-medium text-white">Government of Telangana</p>
            <p>District Administration, Nirmal</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TelanganaLogo size={50} showText={false} />
              <AmmaRakshithaLogo size={60} variant="icon" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Amma Rakshitha</h1>
            <p className="text-gray-500">Maternal Healthcare Management</p>
            <p className="text-xs text-gray-400 mt-1">Government of Telangana, District Nirmal</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-1">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="mt-1 text-sm text-primary-600 hover:text-primary-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'} password
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loginMutation.isPending}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Demo Credentials
              </p>
              <div className="text-xs text-gray-600 space-y-1.5">
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Admin:</span>
                  <span className="font-mono text-gray-500">admin@ammarakshitha.gov.in / Admin@123</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Doctor:</span>
                  <span className="font-mono text-gray-500">doctor@ammarakshitha.gov.in / Doctor@123</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Help Desk:</span>
                  <span className="font-mono text-gray-500">helpdesk@ammarakshitha.gov.in / Help@123</span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            "Every Mother, Every Child - Safe & Healthy"
          </p>
        </div>
      </div>
    </div>
  )
}
