import { Button, Card, CardBody, CardFooter, CardHeader, Input } from '@/components/ui'
import { userService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { User } from '@/types'
import { CameraIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function Profile() {
  const updateUser = useAuthStore((state) => state.updateUser)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoFileName, setPhotoFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const userData = await userService.getMe()
        setCurrentUser(userData)
        setFormData({
          name: userData.name ?? '',
          email: userData.email ?? '',
          phone: userData.phone ?? '',
          department: userData.department ?? '',
          designation: userData.designation ?? '',
        })
        
        // Update auth store with profile image URL
        if (userData.profileImageUrl) {
          updateUser({ profileImageUrl: userData.profileImageUrl })
          setPhotoPreview(userData.profileImageUrl)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [updateUser])

  useEffect(() => {
    return () => {
      // Only revoke blob URLs from file selection, not server URLs
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const initials = useMemo(() => {
    const name = currentUser?.name?.trim() || 'User'
    const parts = name.split(' ').filter(Boolean)
    const first = parts[0]?.[0] ?? 'U'
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
    return `${first}${last}`.toUpperCase()
  }, [currentUser?.name])

  // Check if profile form has changes
  const hasProfileChanges = useMemo(() => {
    if (!currentUser) return false
    return (
      formData.name !== (currentUser.name ?? '') ||
      formData.phone !== (currentUser.phone ?? '') ||
      formData.department !== (currentUser.department ?? '') ||
      formData.designation !== (currentUser.designation ?? '')
    )
  }, [formData, currentUser])

  // Check if all password fields are filled
  const canChangePassword = useMemo(() => {
    return (
      passwordData.currentPassword.trim() !== '' &&
      passwordData.newPassword.trim() !== '' &&
      passwordData.confirmPassword.trim() !== ''
    )
  }, [passwordData])

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Please select a JPG, JPEG, or PNG image')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    // Only revoke blob URLs from previous file selections
    if (photoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoPreview(URL.createObjectURL(file))
    setPhotoFile(file)
    setPhotoFileName(file.name)
  }

  const handleRemovePhoto = () => {
    // Only revoke blob URLs from file selection
    if (photoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoPreview(currentUser?.profileImageUrl ?? null)
    setPhotoFile(null)
    setPhotoFileName(null)
  }

  const handleUploadPhoto = async () => {
    if (!photoFile) {
      toast.error('Please select a photo first')
      return
    }

    try {
      setIsUploadingPhoto(true)
      const updatedUser = await userService.uploadProfilePhoto(photoFile)
      setCurrentUser(updatedUser)
      
      // Update auth store with new profile image URL
      if (updatedUser.profileImageUrl) {
        updateUser({ profileImageUrl: updatedUser.profileImageUrl })
        setPhotoPreview(updatedUser.profileImageUrl)
      }
      
      setPhotoFile(null)
      setPhotoFileName(null)
      toast.success('Profile photo updated successfully')
    } catch (error) {
      console.error('Failed to upload photo:', error)
      toast.error('Failed to upload photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required')
      return
    }

    if (!/^\d{10,15}$/.test(formData.phone)) {
      toast.error('Phone number must be 10-15 digits')
      return
    }

    try {
      setIsSaving(true)
      const updatedUser = await userService.updateMe({
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
      })
      setCurrentUser(updatedUser)
      
      // Update auth store with new user information
      updateUser({ name: updatedUser.name })
      
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      const errorMsg = error.response?.data?.message || 'Failed to update profile'
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()

    // Validation
    if (!passwordData.currentPassword.trim()) {
      toast.error('Current password is required')
      return
    }

    if (!passwordData.newPassword.trim()) {
      toast.error('New password is required')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    try {
      setIsChangingPassword(true)
      await userService.changeMyPassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      toast.success('Password changed successfully')
    } catch (error: any) {
      console.error('Failed to change password:', error)
      const errorMsg = error.response?.data?.message || 'Failed to change password'
      toast.error(errorMsg)
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Review and update your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Profile Photo" subtitle="Upload a professional photo" />
          <CardBody>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                  {photoPreview ? (
                    <img
                      src={
                        photoPreview.startsWith('/uploads')
                          ? `http://localhost:8080/api${photoPreview}`
                          : photoPreview
                      }
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl font-semibold">{initials}</span>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50">
                  <CameraIcon className="h-5 w-5 text-gray-500" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'Your name'}</p>
                <p className="text-xs text-gray-500">{currentUser?.role.replace('_', ' ').toLowerCase()}</p>
              </div>
              {photoFileName ? (
                <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <span className="truncate max-w-[140px]">{photoFileName}</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Remove photo"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">PNG or JPG up to 5MB</p>
              )}
            </div>
          </CardBody>
          <CardFooter className="flex justify-center">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleUploadPhoto}
              disabled={!photoFile || isUploadingPhoto}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {isUploadingPhoto ? 'Uploading...' : 'Update Photo'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Personal Details" subtitle="Keep your profile information up to date" />
          <form onSubmit={handleSubmit}>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
                <Input
                  label="Role"
                  value={currentUser?.role.replace('_', ' ').toLowerCase() ?? ''}
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Department"
                  placeholder="Enter your department"
                  value={formData.department}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
                <Input
                  label="Designation"
                  placeholder="Enter your designation"
                  value={formData.designation}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, designation: event.target.value }))
                  }
                />
              </div>
            </CardBody>
            <CardFooter className="flex justify-end gap-3">
              <Button 
                variant="secondary" 
                type="button"
                onClick={() => {
                  if (currentUser) {
                    setFormData({
                      name: currentUser.name ?? '',
                      email: currentUser.email ?? '',
                      phone: currentUser.phone ?? '',
                      department: currentUser.department ?? '',
                      designation: currentUser.designation ?? '',
                    })
                  }
                }}
                disabled={!hasProfileChanges}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !hasProfileChanges}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader 
          title="Change Password" 
          subtitle="Update your account password" 
        />
        <form onSubmit={handleChangePassword}>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(event) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: event.target.value }))
                }
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
              />
            </div>
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters and different from your current password
            </p>
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              type="button"
              onClick={() => setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              })}
              disabled={!canChangePassword}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isChangingPassword || !canChangePassword}>
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
