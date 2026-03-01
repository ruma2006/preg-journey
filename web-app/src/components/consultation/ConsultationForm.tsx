import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button, Input, Select, RiskBadge } from '@/components/ui'
import { consultationService, patientService, userService } from '@/services'
import { Consultation, ConsultationRequest, ConsultationType, Patient, User } from '@/types'
import { MagnifyingGlassIcon, VideoCameraIcon, CalendarIcon } from '@heroicons/react/24/outline'

const CONSULTATION_TYPES = [
  { value: ConsultationType.TELECONSULTATION, label: 'Teleconsultation (Video Call)' },
  { value: ConsultationType.IN_PERSON, label: 'In-Person Consultation' },
  { value: ConsultationType.EMERGENCY, label: 'Emergency Consultation' },
]

interface ConsultationFormProps {
  initialData?: Consultation | null
  readOnly?: boolean
  onSuccess: () => void
  onCancel: () => void
}

export default function ConsultationForm({
  initialData,
  readOnly = false,
  onSuccess,
  onCancel,
}: ConsultationFormProps) {
  const queryClient = useQueryClient()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [scheduleData, setScheduleData] = useState<Partial<ConsultationRequest>>({
    type: ConsultationType.TELECONSULTATION,
    scheduledAt: '',
    chiefComplaint: '',
  })

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['patientSearch', patientSearch],
    queryFn: () => patientService.search(patientSearch, 0, 10),
    enabled: patientSearch.length >= 2,
  })

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: userService.getDoctors,
  })

  const scheduleMutation = useMutation({
    mutationFn: (data: ConsultationRequest) => consultationService.schedule(data),
    onSuccess: () => {
      toast.success('Consultation scheduled successfully')
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      onSuccess()
    },
    onError: () => {
      toast.error('Failed to schedule consultation ')
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

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearch('')
  }

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !scheduleData.doctorId || !scheduleData.scheduledAt) {
      toast.error('Please fill all required fields')
      return
    }
    scheduleMutation.mutate({
        id: initialData?.id, // Include ID for updates
      patientId: selectedPatient.id,
      doctorId: scheduleData.doctorId!,
      type: scheduleData.type || ConsultationType.TELECONSULTATION,
      scheduledAt: scheduleData.scheduledAt,
      chiefComplaint: scheduleData.chiefComplaint,
      notes: scheduleData.notes,
    })
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  useEffect(() => {
    if (initialData) {
      setSelectedPatient(initialData.patient as Patient)
      setScheduleData({
        doctorId: initialData.doctor.id,
        type: initialData.type,
        scheduledAt: new Date(initialData.scheduledAt).toISOString().slice(0,16),
        chiefComplaint: initialData.chiefComplaint,
        notes: initialData.notes,
      })
    } else {
      resetForm()
    }
  }, [initialData])

  return (
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
            {!readOnly && (
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
          !readOnly && (
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
          )
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
        disabled={readOnly}
      />

      {/* Consultation Type */}
      <Select
        label="Consultation Type *"
        options={CONSULTATION_TYPES}
        value={scheduleData.type}
        onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value as ConsultationType })}
        required
        disabled={readOnly}
      />

      {/* Scheduled Date/Time */}
      <Input
        label="Scheduled Date & Time *"
        type="datetime-local"
        required
        min={getMinDateTime()}
        value={scheduleData.scheduledAt || ''}
        onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
        disabled={readOnly}
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
          disabled={readOnly}
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
          disabled={readOnly}
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
            onCancel()
            resetForm()
          }}
        >
          Cancel
        </Button>
        {!readOnly && (
          <Button
            type="submit"
            loading={scheduleMutation.isPending}
            disabled={!selectedPatient || !scheduleData.doctorId}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Schedule Consultation
          </Button>
        )}
      </div>
    </form>
  )
}
