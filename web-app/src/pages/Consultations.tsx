import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, CalendarIcon, VideoCameraIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
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
} from '@/components/ui'
import { consultationService, userService, patientService } from '@/services'
import { ConsultationType, ConsultationRequest, Patient, User } from '@/types'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

const CONSULTATION_TYPES = [
  { value: ConsultationType.TELECONSULTATION, label: 'Teleconsultation (Video Call)' },
  { value: ConsultationType.IN_PERSON, label: 'In-Person Consultation' },
  { value: ConsultationType.EMERGENCY, label: 'Emergency Consultation' },
]

export default function Consultations() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [scheduleData, setScheduleData] = useState<Partial<ConsultationRequest>>({
    type: ConsultationType.TELECONSULTATION,
    scheduledAt: '',
    chiefComplaint: '',
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
      setShowScheduleModal(false)
      resetForm()
    },
    onError: () => {
      toast.error('Failed to schedule consultation')
    },
  })

  const resetForm = () => {
    setSelectedPatient(null)
    setPatientSearch('')
    setScheduleData({
      type: ConsultationType.TELECONSULTATION,
      scheduledAt: '',
      chiefComplaint: '',
    })
  }

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !scheduleData.doctorId || !scheduleData.scheduledAt) {
      toast.error('Please fill all required fields')
      return
    }
    scheduleMutation.mutate({
      patientId: selectedPatient.id,
      doctorId: scheduleData.doctorId,
      type: scheduleData.type || ConsultationType.TELECONSULTATION,
      scheduledAt: scheduleData.scheduledAt,
      chiefComplaint: scheduleData.chiefComplaint,
      notes: scheduleData.notes,
    })
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
                      {consultation.type === ConsultationType.TELECONSULTATION && consultation.videoRoomUrl && (
                        <Button variant="primary" size="sm">
                          <VideoCameraIcon className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
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

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false)
          resetForm()
        }}
        title="Schedule Consultation"
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
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  Change
                </Button>
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
          {scheduleData.type === ConsultationType.TELECONSULTATION && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <VideoCameraIcon className="h-4 w-4 inline mr-1" />
                A video room link will be generated automatically for teleconsultation.
              </p>
            </div>
          )}

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
              onClick={() => {
                setShowScheduleModal(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={scheduleMutation.isPending}
              disabled={!selectedPatient || !scheduleData.doctorId}
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Schedule Consultation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
