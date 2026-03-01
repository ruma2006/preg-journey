import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, CalendarIcon, VideoCameraIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline'
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
  ConsultationStatusBadge,
  Badge,
  Modal,
  Input,
  Select,
  RiskBadge,
  ViewButton,
  EditButton,
  DeleteButton,
} from '@/components/ui'
import { consultationService, userService, patientService } from '@/services'
import { ConsultationType, ConsultationRequest, Patient, User, Consultation, TeleconsultationPlatform, ConsultationStatus } from '@/types'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

const CONSULTATION_TYPES = [
  { value: ConsultationType.TELECONSULTATION, label: 'Teleconsultation (Video Call)' },
  { value: ConsultationType.IN_PERSON, label: 'In-Person Consultation' },
  { value: ConsultationType.EMERGENCY, label: 'Emergency Consultation' },
]

const TELECONSULTATION_PLATFORMS = [
  { value: TeleconsultationPlatform.ZOOM, label: 'Zoom Call' },
  { value: TeleconsultationPlatform.GOOGLE_MEET, label: 'Google Meet' },
  { value: TeleconsultationPlatform.WHATSAPP, label: 'WhatsApp Call' },
  { value: TeleconsultationPlatform.OTHER, label: 'Other' },
]

export default function Consultations() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [scheduleData, setScheduleData] = useState<Partial<ConsultationRequest>>({
    type: ConsultationType.TELECONSULTATION,
    scheduledAt: '',
    chiefComplaint: '',
    teleconsultationPlatform: undefined,
    teleconsultationLink: '',
  })

  const page = parseInt(searchParams.get('page') || '0')

  const { data: consultations, isLoading } = useQuery({
    queryKey: ['consultations', 'upcoming', page],
    queryFn: () => consultationService.getUpcoming(page, PAGE_SIZE),
  })

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: userService.getDoctors,
  })

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['patientSearch', patientSearch],
    queryFn: () => patientService.search(patientSearch, 0, 10),
    enabled: patientSearch.length >= 2,
  })

  const scheduleMutation = useMutation({
    mutationFn: (data: ConsultationRequest) => consultationService.schedule(data),
    onSuccess: () => {
      toast.success('Consultation scheduled successfully')
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      closeModal()
    },
    onError: () => {
      toast.error('Failed to schedule consultation')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ConsultationRequest> }) =>
      consultationService.update(id, data),
    onSuccess: () => {
      toast.success('Consultation updated successfully')
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      closeModal()
    },
    onError: () => {
      toast.error('Failed to update consultation')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => consultationService.cancel(id, 'Cancelled by user', 'System'),
    onSuccess: () => {
      toast.success('Consultation cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      setShowDeleteModal(false)
      setSelectedConsultation(null)
    },
    onError: () => {
      toast.error('Failed to cancel consultation')
    },
  })

  const resetForm = () => {
    setSelectedPatient(null)
    setPatientSearch('')
    setScheduleData({
      type: ConsultationType.TELECONSULTATION,
      scheduledAt: '',
      chiefComplaint: '',
      teleconsultationPlatform: undefined,
      teleconsultationLink: '',
    })
    setIsEditing(false)
    setSelectedConsultation(null)
  }

  const closeModal = () => {
    setShowScheduleModal(false)
    resetForm()
  }

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !scheduleData.doctorId || !scheduleData.scheduledAt) {
      toast.error('Please fill all required fields')
      return
    }

    const requestData: ConsultationRequest = {
      patientId: selectedPatient.id,
      doctorId: scheduleData.doctorId,
      type: scheduleData.type || ConsultationType.TELECONSULTATION,
      scheduledAt: scheduleData.scheduledAt,
      chiefComplaint: scheduleData.chiefComplaint,
      notes: scheduleData.notes,
      teleconsultationPlatform: scheduleData.type === ConsultationType.TELECONSULTATION
        ? scheduleData.teleconsultationPlatform
        : undefined,
      teleconsultationLink: scheduleData.type === ConsultationType.TELECONSULTATION
        ? scheduleData.teleconsultationLink
        : undefined,
    }

    if (isEditing && selectedConsultation) {
      updateMutation.mutate({ id: selectedConsultation.id, data: requestData })
    } else {
      scheduleMutation.mutate(requestData)
    }
  }

  const handleView = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setShowViewModal(true)
  }

  const handleEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setSelectedPatient(consultation.patient)
    setScheduleData({
      doctorId: consultation.doctor.id,
      type: consultation.type,
      scheduledAt: consultation.scheduledAt.slice(0, 16),
      chiefComplaint: consultation.chiefComplaint || '',
      notes: consultation.notes || '',
      teleconsultationPlatform: consultation.teleconsultationPlatform,
      teleconsultationLink: consultation.teleconsultationLink || '',
    })
    setIsEditing(true)
    setShowScheduleModal(true)
  }

  const handleDelete = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setShowDeleteModal(true)
  }

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearch('')
  }

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  // Client-side search filtering
  const filteredConsultations = useMemo(() => {
    if (!consultations?.content || !searchQuery.trim()) {
      return consultations?.content || []
    }
    const query = searchQuery.toLowerCase()
    return consultations.content.filter(consultation =>
      consultation.patient.name.toLowerCase().includes(query) ||
      consultation.patient.motherId.toLowerCase().includes(query) ||
      consultation.doctor.name.toLowerCase().includes(query) ||
      (consultation.chiefComplaint && consultation.chiefComplaint.toLowerCase().includes(query))
    )
  }, [consultations?.content, searchQuery])

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) })
  }

  const getPlatformLabel = (platform?: TeleconsultationPlatform) => {
    const found = TELECONSULTATION_PLATFORMS.find(p => p.value === platform)
    return found?.label || platform || 'N/A'
  }

  const canModify = (consultation: Consultation) => {
    return consultation.status === ConsultationStatus.SCHEDULED
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-500">Schedule and manage doctor consultations</p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Schedule Consultation
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, Mother ID, doctor, or complaint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-semibold">{consultations?.totalElements || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <VideoCameraIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Available Doctors</p>
                <p className="text-2xl font-semibold">{doctors?.length || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Consultations Table */}
      <Card>
        <CardHeader title={`Upcoming Consultations (${consultations?.totalElements || 0})`} />
        <CardBody className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>Patient</TableCell>
                <TableCell header>Doctor</TableCell>
                <TableCell header>Type</TableCell>
                <TableCell header>Scheduled</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableLoading columns={6} />
              ) : filteredConsultations.length > 0 ? (
                filteredConsultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{consultation.patient.name}</p>
                        <p className="text-sm text-gray-500">{consultation.patient.motherId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{consultation.doctor.name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={consultation.type === ConsultationType.TELECONSULTATION ? 'info' : 'default'}
                      >
                        {consultation.type === ConsultationType.TELECONSULTATION && (
                          <VideoCameraIcon className="h-3 w-3 mr-1" />
                        )}
                        {consultation.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(consultation.scheduledAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <ConsultationStatusBadge status={consultation.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ViewButton tooltip="View Details" onClick={() => handleView(consultation)} />
                        {canModify(consultation) && (
                          <>
                            <EditButton tooltip="Edit Consultation" onClick={() => handleEdit(consultation)} />
                            <DeleteButton tooltip="Cancel Consultation" onClick={() => handleDelete(consultation)} />
                          </>
                        )}
                        {consultation.type === ConsultationType.TELECONSULTATION && consultation.videoRoomUrl && (
                          <a
                            href={consultation.videoRoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            <VideoCameraIcon className="h-3 w-3 mr-1" />
                            Join
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty
                  title="No consultations found"
                  description={searchQuery ? 'Try adjusting your search' : 'Schedule a consultation to see it here'}
                  action={
                    !searchQuery && (
                      <Button onClick={() => setShowScheduleModal(true)}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Schedule Consultation
                      </Button>
                    )
                  }
                />
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {consultations && consultations.totalPages > 1 && !searchQuery && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {consultations.number * consultations.size + 1} to{' '}
                {Math.min((consultations.number + 1) * consultations.size, consultations.totalElements)} of{' '}
                {consultations.totalElements} consultations
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={consultations.first}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={consultations.last}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Schedule/Edit Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={closeModal}
        title={isEditing ? "Edit Consultation" : "Schedule Consultation"}
        size="lg"
        animation="flip"
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="label">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                    <p className="text-sm text-gray-500">
                      Mother ID: {selectedPatient.motherId} | Mobile: {selectedPatient.mobileNumber}
                    </p>
                  </div>
                  <RiskBadge level={selectedPatient.currentRiskLevel} />
                </div>
                {!isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Change
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search patient by name, Mother ID, or Aadhaar..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
                {patientSearch.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">Searching...</div>
                    ) : searchResults?.content && searchResults.content.length > 0 ? (
                      searchResults.content.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                          onClick={() => selectPatient(patient)}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-500">
                              {patient.motherId} | {patient.mobileNumber}
                            </p>
                          </div>
                          <RiskBadge level={patient.currentRiskLevel} />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No patients found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor Selection */}
          <Select
            label="Select Doctor *"
            options={
              doctors?.map((doc: User) => ({
                value: doc.id.toString(),
                label: `Dr. ${doc.name} - ${doc.designation || doc.department || 'General'}`,
              })) || []
            }
            value={scheduleData.doctorId?.toString() || ''}
            onChange={(e) => setScheduleData({ ...scheduleData, doctorId: parseInt(e.target.value) })}
            required
            placeholder="Select a doctor"
          />

          {/* Consultation Type */}
          <Select
            label="Consultation Type *"
            options={CONSULTATION_TYPES}
            value={scheduleData.type}
            onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value as ConsultationType })}
            required
          />

          {/* Teleconsultation Platform & Link */}
          {scheduleData.type === ConsultationType.TELECONSULTATION && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 flex items-center gap-2">
                <VideoCameraIcon className="h-5 w-5" />
                Teleconsultation Details
              </h4>
              <Select
                label="Platform"
                options={TELECONSULTATION_PLATFORMS}
                value={scheduleData.teleconsultationPlatform || ''}
                onChange={(e) => setScheduleData({
                  ...scheduleData,
                  teleconsultationPlatform: e.target.value as TeleconsultationPlatform
                })}
                placeholder="Select platform"
              />
              <Input
                label="Meeting Link"
                type="url"
                placeholder="Paste the meeting link here (e.g., https://zoom.us/j/123456789)"
                value={scheduleData.teleconsultationLink || ''}
                onChange={(e) => setScheduleData({ ...scheduleData, teleconsultationLink: e.target.value })}
              />
              <p className="text-xs text-blue-600">
                If no link is provided, an internal video room will be generated automatically.
              </p>
            </div>
          )}

          {/* Scheduled Date/Time */}
          <Input
            label="Scheduled Date & Time *"
            type="datetime-local"
            required
            min={getMinDateTime()}
            value={scheduleData.scheduledAt || ''}
            onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
          />

          {/* Chief Complaint */}
          <div>
            <label className="label">Chief Complaint</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Describe the reason for consultation..."
              value={scheduleData.chiefComplaint || ''}
              onChange={(e) => setScheduleData({ ...scheduleData, chiefComplaint: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Any additional notes for the doctor..."
              value={scheduleData.notes || ''}
              onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
            />
          </div>

          {/* Type Info */}
          {scheduleData.type === ConsultationType.EMERGENCY && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                Emergency consultations will be prioritized and doctors will be notified immediately.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={scheduleMutation.isPending || updateMutation.isPending}
              disabled={!selectedPatient || !scheduleData.doctorId}
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              {isEditing ? 'Update Consultation' : 'Schedule Consultation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedConsultation(null)
        }}
        title="Consultation Details"
        size="lg"
      >
        {selectedConsultation && (
          <div className="space-y-6">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Patient</h4>
                <p className="font-medium text-gray-900">{selectedConsultation.patient.name}</p>
                <p className="text-sm text-gray-500">Mother ID: {selectedConsultation.patient.motherId}</p>
                <p className="text-sm text-gray-500">Mobile: {selectedConsultation.patient.mobileNumber}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Doctor</h4>
                <p className="font-medium text-gray-900">Dr. {selectedConsultation.doctor.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedConsultation.doctor.designation || selectedConsultation.doctor.department || 'General'}
                </p>
              </div>
            </div>

            {/* Consultation Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <Badge variant={selectedConsultation.type === ConsultationType.TELECONSULTATION ? 'info' : 'default'}>
                  {selectedConsultation.type.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <ConsultationStatusBadge status={selectedConsultation.status} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Scheduled At</h4>
                <p className="text-gray-900">{new Date(selectedConsultation.scheduledAt).toLocaleString()}</p>
              </div>
              {selectedConsultation.type === ConsultationType.TELECONSULTATION && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Platform</h4>
                  <p className="text-gray-900">{getPlatformLabel(selectedConsultation.teleconsultationPlatform)}</p>
                </div>
              )}
            </div>

            {/* Meeting Link */}
            {selectedConsultation.type === ConsultationType.TELECONSULTATION && selectedConsultation.videoRoomUrl && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Meeting Link</h4>
                <a
                  href={selectedConsultation.videoRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {selectedConsultation.videoRoomUrl}
                </a>
              </div>
            )}

            {/* Chief Complaint */}
            {selectedConsultation.chiefComplaint && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Chief Complaint</h4>
                <p className="text-gray-900">{selectedConsultation.chiefComplaint}</p>
              </div>
            )}

            {/* Notes */}
            {selectedConsultation.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                <p className="text-gray-900">{selectedConsultation.notes}</p>
              </div>
            )}

            {/* Diagnosis (if completed) */}
            {selectedConsultation.diagnosis && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Diagnosis</h4>
                <p className="text-gray-900">{selectedConsultation.diagnosis}</p>
              </div>
            )}

            {/* Treatment Plan (if completed) */}
            {selectedConsultation.treatmentPlan && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Treatment Plan</h4>
                <p className="text-gray-900">{selectedConsultation.treatmentPlan}</p>
              </div>
            )}

            {/* Prescriptions (if completed) */}
            {selectedConsultation.prescriptions && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Prescriptions</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedConsultation.prescriptions}</p>
              </div>
            )}

            {/* Cancellation Info */}
            {selectedConsultation.status === ConsultationStatus.CANCELLED && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-1">Cancellation Reason</h4>
                <p className="text-red-700">{selectedConsultation.cancellationReason || 'No reason provided'}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedConsultation(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete/Cancel Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedConsultation(null)
        }}
        title="Cancel Consultation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this consultation?
          </p>
          {selectedConsultation && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p><strong>Patient:</strong> {selectedConsultation.patient.name}</p>
              <p><strong>Doctor:</strong> Dr. {selectedConsultation.doctor.name}</p>
              <p><strong>Scheduled:</strong> {new Date(selectedConsultation.scheduledAt).toLocaleString()}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedConsultation(null)
              }}
            >
              Keep
            </Button>
            <Button
              variant="danger"
              loading={cancelMutation.isPending}
              onClick={() => {
                if (selectedConsultation) {
                  cancelMutation.mutate(selectedConsultation.id)
                }
              }}
            >
              Cancel Consultation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
