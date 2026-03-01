import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PhoneIcon, CheckIcon, MagnifyingGlassIcon, CalendarDaysIcon, TableCellsIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
  RiskBadge,
  FollowUpStatusBadge,
  Modal,
  ViewButton,
  EditButton,
  DeleteButton,
} from '@/components/ui'
import { FollowUpHeatmap } from '@/components/follow-up'
import { followUpService } from '@/services'
import { FollowUp, FollowUpStatus, FollowUpUpdateRequest } from '@/types'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

type ViewMode = 'list' | 'calendar'

export default function FollowUps() {
  const queryClient = useQueryClient()
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [filter, setFilter] = useState<'today' | 'overdue' | 'upcoming' | 'past'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: followUps, isLoading } = useQuery({
    queryKey: ['followUps', filter],
    queryFn: () => {
      if (filter === 'today') {
        return followUpService.getToday()
      }
      if (filter === 'overdue') {
        return followUpService.getOverdue()
      }
      if (filter === 'upcoming') {
        return followUpService.getUpcoming()
      }
      if (filter === 'past') {
        return followUpService.getPast()
      }
      return followUpService.getToday() // Default
    },
  })

  // Query for calendar view - get follow-ups for selected month range
  const { data: calendarFollowUps } = useQuery({
    queryKey: ['calendarFollowUps', calendarMonth.getFullYear(), calendarMonth.getMonth()],
    queryFn: () => {
      const startDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
      const endDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
      return followUpService.getByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
    },
    enabled: viewMode === 'calendar',
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FollowUpUpdateRequest }) =>
      followUpService.update(id, data),
    onSuccess: async (updatedFollowUp) => {
      // Upload photo if selected
      if (photoFile) {
        try {
          await followUpService.uploadPhoto(updatedFollowUp.id, photoFile)
          toast.success('Follow-up updated with photo')
        } catch {
          toast.error('Follow-up updated but photo upload failed')
        }
      } else {
        toast.success('Follow-up updated successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['followUps'] })
      setShowUpdateModal(false)
      setSelectedFollowUp(null)
      setPhotoFile(null)
      setPhotoPreview(null)
    },
    onError: () => {
      toast.error('Failed to update follow-up')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => followUpService.delete(id),
    onSuccess: () => {
      toast.success('Follow-up deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['followUps'] })
      setShowDeleteModal(false)
      setSelectedFollowUp(null)
    },
    onError: () => {
      toast.error('Failed to delete follow-up')
    },
  })

  // Helper function to check if a follow-up can be edited/deleted (within 1 month)
  const canEditOrDelete = (followUp: FollowUp): boolean => {
    const createdAt = new Date(followUp.createdAt)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    return createdAt >= oneMonthAgo
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB')
        return
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Only JPG and PNG images are allowed')
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const [updateForm, setUpdateForm] = useState<FollowUpUpdateRequest>({
    status: FollowUpStatus.COMPLETED,
    patientCondition: '',
    symptomsReported: '',
    medicationCompliance: true,
    concernsRaised: '',
    adviceGiven: '',
    requiresDoctorConsultation: false,
    requiresImmediateAttention: false,
    notes: '',
  })

  const openUpdateModal = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp)
    setUpdateForm({
      status: FollowUpStatus.COMPLETED,
      patientCondition: '',
      symptomsReported: '',
      medicationCompliance: true,
      concernsRaised: '',
      adviceGiven: '',
      requiresDoctorConsultation: false,
      requiresImmediateAttention: false,
      notes: '',
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowUpdateModal(true)
  }

  const handleUpdate = () => {
    if (selectedFollowUp) {
      updateMutation.mutate({
        id: selectedFollowUp.id,
        data: updateForm,
      })
    }
  }

  // Client-side search and pagination
  const filteredFollowUps = useMemo(() => {
    if (!followUps) return []
    if (!searchQuery.trim()) return followUps
    const query = searchQuery.toLowerCase()
    return followUps.filter(followUp =>
      followUp.patient.name.toLowerCase().includes(query) ||
      followUp.patient.motherId.toLowerCase().includes(query) ||
      followUp.patient.mobileNumber.includes(query)
    )
  }, [followUps, searchQuery])

  // Client-side pagination
  const paginatedFollowUps = useMemo(() => {
    const startIndex = currentPage * PAGE_SIZE
    return filteredFollowUps.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredFollowUps, currentPage])

  const totalPages = Math.ceil(filteredFollowUps.length / PAGE_SIZE)
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  // Reset page when filter or search changes
  const handleFilterChange = (newFilter: 'today' | 'overdue' | 'upcoming' | 'past') => {
    setFilter(newFilter)
    setCurrentPage(0)
  }

  // Open edit modal for past follow-up
  const openEditModal = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp)
    setUpdateForm({
      status: followUp.status,
      patientCondition: followUp.patientCondition || '',
      symptomsReported: followUp.symptomsReported || '',
      medicationCompliance: followUp.medicationCompliance ?? true,
      concernsRaised: followUp.concernsRaised || '',
      adviceGiven: followUp.adviceGiven || '',
      requiresDoctorConsultation: followUp.requiresDoctorConsultation || false,
      requiresImmediateAttention: followUp.requiresImmediateAttention || false,
      notes: followUp.notes || '',
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowUpdateModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-gray-500">Manage patient follow-up calls</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white shadow text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TableCellsIcon className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white shadow text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <FollowUpHeatmap
          followUps={calendarFollowUps || []}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          onDayClick={(date, count) => {
            if (count > 0) {
              toast.success(`${count} follow-ups on ${date.toLocaleDateString()}`)
            }
          }}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
      <>
      {/* Search */}
      <Card>
        <CardBody>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, Mother ID, or mobile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0)
              }}
              className="input pl-10"
            />
          </div>
        </CardBody>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'today' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('today')}
        >
          Today's Follow-ups
        </Button>
        <Button
          variant={filter === 'overdue' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('overdue')}
        >
          Overdue
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'past' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('past')}
        >
          Past
        </Button>
      </div>

      {/* Follow-ups Table */}
      <Card>
        <CardHeader title={`Follow-ups (${filteredFollowUps.length})`} />
        <CardBody className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>Patient</TableCell>
                <TableCell header>Contact</TableCell>
                <TableCell header>Risk Level</TableCell>
                <TableCell header>Scheduled</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Attempts</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableLoading columns={7} />
              ) : paginatedFollowUps.length > 0 ? (
                paginatedFollowUps.map((followUp) => (
                  <TableRow key={followUp.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{followUp.patient.name}</p>
                        <p className="text-sm text-gray-500">{followUp.patient.motherId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${followUp.patient.mobileNumber}`}
                        className="text-primary-600 hover:text-primary-500 flex items-center gap-1"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        {followUp.patient.mobileNumber}
                      </a>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={followUp.patient.currentRiskLevel} />
                    </TableCell>
                    <TableCell>
                      {new Date(followUp.scheduledDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <FollowUpStatusBadge status={followUp.status} />
                    </TableCell>
                    <TableCell>{followUp.attemptCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {followUp.status === FollowUpStatus.PENDING && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openUpdateModal(followUp)}
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {followUp.status !== FollowUpStatus.PENDING && (
                          <>
                            <ViewButton
                              tooltip="View Details"
                              onClick={() => {
                                setSelectedFollowUp(followUp)
                                setShowViewModal(true)
                              }}
                            />
                            {canEditOrDelete(followUp) ? (
                              <>
                                <EditButton
                                  tooltip="Edit Follow-up"
                                  onClick={() => openEditModal(followUp)}
                                />
                                <DeleteButton
                                  tooltip="Delete Follow-up"
                                  onClick={() => {
                                    setSelectedFollowUp(followUp)
                                    setShowDeleteModal(true)
                                  }}
                                />
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 ml-2">Read-only (older than 1 month)</span>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty
                  title="No follow-ups"
                  description={searchQuery ? 'Try adjusting your search' : (
                    filter === 'today' ? "No follow-ups scheduled for today" :
                    filter === 'overdue' ? "No overdue follow-ups" :
                    filter === 'upcoming' ? "No upcoming follow-ups scheduled" :
                    filter === 'past' ? "No past follow-ups recorded" : "No follow-ups"
                  )}
                />
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {currentPage * PAGE_SIZE + 1} to{' '}
                {Math.min((currentPage + 1) * PAGE_SIZE, filteredFollowUps.length)} of{' '}
                {filteredFollowUps.length} follow-ups
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isFirstPage}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isLastPage}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
      </>
      )}

      {/* Update Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Complete Follow-up Call"
        size="lg"
      >
        {selectedFollowUp && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{selectedFollowUp.patient.name}</p>
              <p className="text-sm text-gray-500">
                {selectedFollowUp.patient.motherId} | {selectedFollowUp.patient.mobileNumber}
              </p>
            </div>

            <div>
              <label className="label">Call Status</label>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as FollowUpStatus })}
                className="input"
              >
                <option value={FollowUpStatus.COMPLETED}>Completed</option>
                <option value={FollowUpStatus.NO_ANSWER}>No Answer</option>
                <option value={FollowUpStatus.RESCHEDULED}>Rescheduled</option>
              </select>
            </div>

            {updateForm.status === FollowUpStatus.COMPLETED && (
              <>
                <div>
                  <label className="label">Patient Condition</label>
                  <textarea
                    value={updateForm.patientCondition}
                    onChange={(e) => setUpdateForm({ ...updateForm, patientCondition: e.target.value })}
                    rows={2}
                    className="input"
                    placeholder="How is the patient feeling?"
                  />
                </div>

                <div>
                  <label className="label">Symptoms Reported</label>
                  <textarea
                    value={updateForm.symptomsReported}
                    onChange={(e) => setUpdateForm({ ...updateForm, symptomsReported: e.target.value })}
                    rows={2}
                    className="input"
                    placeholder="Any symptoms reported..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="medicationCompliance"
                      checked={updateForm.medicationCompliance}
                      onChange={(e) => setUpdateForm({ ...updateForm, medicationCompliance: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="medicationCompliance" className="ml-2 text-sm text-gray-700">
                      Taking medications as prescribed
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requiresDoctorConsultation"
                      checked={updateForm.requiresDoctorConsultation}
                      onChange={(e) => setUpdateForm({ ...updateForm, requiresDoctorConsultation: e.target.checked })}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresDoctorConsultation" className="ml-2 text-sm text-gray-700">
                      Requires Doctor Consultation
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requiresImmediateAttention"
                      checked={updateForm.requiresImmediateAttention}
                      onChange={(e) => setUpdateForm({ ...updateForm, requiresImmediateAttention: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresImmediateAttention" className="ml-2 text-sm text-red-700 font-medium">
                      Requires Immediate Attention
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">Advice Given</label>
                  <textarea
                    value={updateForm.adviceGiven}
                    onChange={(e) => setUpdateForm({ ...updateForm, adviceGiven: e.target.value })}
                    rows={2}
                    className="input"
                    placeholder="Advice provided to the patient..."
                  />
                </div>

                {/* Photo Upload Section */}
                <div>
                  <label className="label">Photo with Patient (Optional)</label>
                  <div className="mt-1">
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
                      >
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                        <span className="mt-1 text-xs text-gray-500">Upload Photo</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="mt-1 text-xs text-gray-500">JPG or PNG, max 5MB</p>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="label">Notes</label>
              <textarea
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                rows={2}
                className="input"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} loading={updateMutation.isPending}>
                Save Follow-up
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal for Completed Follow-ups */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Follow-up Details"
        size="lg"
      >
        {selectedFollowUp && (
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{selectedFollowUp.patient.name}</p>
              <p className="text-sm text-gray-500">
                {selectedFollowUp.patient.motherId} | {selectedFollowUp.patient.mobileNumber}
              </p>
            </div>

            {/* Follow-up Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                <p className="text-gray-900">{new Date(selectedFollowUp.scheduledDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p><FollowUpStatusBadge status={selectedFollowUp.status} /></p>
              </div>
              {selectedFollowUp.callCompletedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Call Completed</label>
                  <p className="text-gray-900">{new Date(selectedFollowUp.callCompletedAt).toLocaleString()}</p>
                </div>
              )}
              {selectedFollowUp.callDurationSeconds && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Call Duration</label>
                  <p className="text-gray-900">{Math.floor(selectedFollowUp.callDurationSeconds / 60)}m {selectedFollowUp.callDurationSeconds % 60}s</p>
                </div>
              )}
            </div>

            {/* Patient Condition */}
            {selectedFollowUp.patientCondition && (
              <div>
                <label className="text-sm font-medium text-gray-500">Patient Condition</label>
                <p className="text-gray-900 mt-1">{selectedFollowUp.patientCondition}</p>
              </div>
            )}

            {/* Symptoms Reported */}
            {selectedFollowUp.symptomsReported && (
              <div>
                <label className="text-sm font-medium text-gray-500">Symptoms Reported</label>
                <p className="text-gray-900 mt-1">{selectedFollowUp.symptomsReported}</p>
              </div>
            )}

            {/* Medication Compliance */}
            <div>
              <label className="text-sm font-medium text-gray-500">Medication Compliance</label>
              <p className={`mt-1 ${selectedFollowUp.medicationCompliance ? 'text-green-600' : 'text-red-600'}`}>
                {selectedFollowUp.medicationCompliance ? 'Yes - Taking as prescribed' : 'No - Not compliant'}
              </p>
            </div>

            {/* Concerns Raised */}
            {selectedFollowUp.concernsRaised && (
              <div>
                <label className="text-sm font-medium text-gray-500">Concerns Raised</label>
                <p className="text-gray-900 mt-1">{selectedFollowUp.concernsRaised}</p>
              </div>
            )}

            {/* Advice Given */}
            {selectedFollowUp.adviceGiven && (
              <div>
                <label className="text-sm font-medium text-gray-500">Advice Given</label>
                <p className="text-gray-900 mt-1">{selectedFollowUp.adviceGiven}</p>
              </div>
            )}

            {/* Flags */}
            <div className="flex flex-wrap gap-2">
              {selectedFollowUp.requiresDoctorConsultation && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Requires Doctor Consultation
                </span>
              )}
              {selectedFollowUp.requiresImmediateAttention && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Requires Immediate Attention
                </span>
              )}
            </div>

            {/* Photo */}
            {selectedFollowUp.photoUrl && (
              <div>
                <label className="text-sm font-medium text-gray-500">Photo with Patient</label>
                <div className="mt-2">
                  <img
                    src={selectedFollowUp.photoUrl}
                    alt="Patient photo"
                    className="max-h-64 rounded-lg border object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjAwIDE1MCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzljYTNhZiIgZm9udC1zaXplPSIxNCI+SW1hZ2UgdW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+'
                      target.title = `Failed to load: ${selectedFollowUp.photoUrl}`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedFollowUp.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-gray-900 mt-1">{selectedFollowUp.notes}</p>
              </div>
            )}

            {/* Next Follow-up */}
            {selectedFollowUp.nextFollowUpDate && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-blue-700">Next Follow-up Scheduled</label>
                <p className="text-blue-900">{new Date(selectedFollowUp.nextFollowUpDate).toLocaleDateString()}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
              {canEditOrDelete(selectedFollowUp) && (
                <Button
                  onClick={() => {
                    setShowViewModal(false)
                    openEditModal(selectedFollowUp)
                  }}
                >
                  Edit
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
        title="Delete Follow-up"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this follow-up record? This action cannot be undone.
          </p>
          {selectedFollowUp && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedFollowUp.patient.name}</p>
              <p className="text-sm text-gray-500">
                Scheduled: {new Date(selectedFollowUp.scheduledDate).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (selectedFollowUp) {
                  deleteMutation.mutate(selectedFollowUp.id)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
