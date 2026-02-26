import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon,
  KeyIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
  TableLoading,
  Badge,
  Modal,
} from '@/components/ui'
import { userService } from '@/services'
import { User, UserRole } from '@/types'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const roleColors: Record<UserRole, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  [UserRole.ADMIN]: 'danger',
  [UserRole.MEDICAL_OFFICER]: 'info',
  [UserRole.MCH_OFFICER]: 'success',
  [UserRole.DOCTOR]: 'info',
  [UserRole.HELP_DESK]: 'warning',
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.MEDICAL_OFFICER]: 'Medical Officer',
  [UserRole.MCH_OFFICER]: 'MCH Officer',
  [UserRole.DOCTOR]: 'Doctor',
  [UserRole.HELP_DESK]: 'Help Desk',
}

export default function Users() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.HELP_DESK,
    department: '',
    designation: '',
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowCreateModal(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (id: number) => userService.resetPassword(id),
    onSuccess: (password) => {
      setNewPassword(password)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Password reset successfully')
    },
    onError: () => {
      toast.error('Failed to reset password')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowDeleteModal(false)
      setSelectedUser(null)
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      activate ? userService.activate(id) : userService.deactivate(id),
    onSuccess: (_, { activate }) => {
      toast.success(`User ${activate ? 'activated' : 'deactivated'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error('Failed to update user status')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: UserRole.HELP_DESK,
      department: '',
      designation: '',
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const openResetModal = (user: User) => {
    setSelectedUser(user)
    setNewPassword(null)
    setShowResetModal(true)
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleResetPassword = () => {
    if (selectedUser) {
      resetPasswordMutation.mutate(selectedUser.id)
    }
  }

  const handleDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id)
    }
  }

  // Only admins can access this page
  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage system users and their access</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader
          title={`Users (${users?.totalElements || 0})`}
          subtitle="System users and their roles"
        />
        <CardBody className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>User</TableCell>
                <TableCell header>Email</TableCell>
                <TableCell header>Phone</TableCell>
                <TableCell header>Role</TableCell>
                <TableCell header>Department</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableLoading columns={7} />
              ) : users?.content && users.content.length > 0 ? (
                users.content.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        {user.designation && (
                          <p className="text-sm text-gray-500">{user.designation}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openResetModal(user)}
                          title="Reset Password"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: user.id,
                              activate: !user.isActive,
                            })
                          }
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
                            title="Delete User"
                          >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty
                  title="No users found"
                  description="Start by adding a new user"
                  action={
                    <Button onClick={() => setShowCreateModal(true)}>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add User
                    </Button>
                  }
                />
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Phone *</label>
            <input
              type="tel"
              required
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Password *</label>
            <input
              type="password"
              required
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Role *</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Department</label>
            <input
              type="text"
              className="input"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Designation</label>
            <input
              type="text"
              className="input"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false)
          setNewPassword(null)
        }}
        title="Reset Password"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Reset password for <strong>{selectedUser.name}</strong> ({selectedUser.email})?
            </p>

            {newPassword ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800 mb-2">New temporary password:</p>
                <p className="font-mono text-lg font-bold text-green-900 bg-white p-2 rounded border">
                  {newPassword}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Please share this password securely with the user. They should change it on first login.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                A new temporary password will be generated. The user will need to use this password to login.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowResetModal(false)
                  setNewPassword(null)
                }}
              >
                {newPassword ? 'Close' : 'Cancel'}
              </Button>
              {!newPassword && (
                <Button
                  onClick={handleResetPassword}
                  loading={resetPasswordMutation.isPending}
                >
                  Reset Password
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. Consider deactivating the user instead.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
