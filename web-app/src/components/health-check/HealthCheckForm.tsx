import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button, Input } from '@/components/ui'
import { healthCheckService, patientService, userService } from '@/services'
import { HealthCheckRequest, HealthCheck, Patient, User } from '@/types'

interface HealthCheckFormProps {
  patientId?: number
  initialData?: HealthCheck
  onSuccess: () => void
}

export default function HealthCheckForm({ patientId, initialData, onSuccess }: HealthCheckFormProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false)
  const [autoFollowUpEnabled, setAutoFollowUpEnabled] = useState(true)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpAssigneeId, setFollowUpAssigneeId] = useState<number | undefined>()
  const [followUpNotes, setFollowUpNotes] = useState('')

  const { data: searchResults } = useQuery({
    queryKey: ['patientSearch', searchQuery],
    queryFn: () => patientService.search(searchQuery),
    enabled: searchQuery.length >= 3 && !selectedPatient,
  })

  // Fetch helpdesk users for assignee dropdown
  const { data: helpdeskUsers } = useQuery({
    queryKey: ['helpdeskUsers'],
    queryFn: userService.getHelpDeskUsers,
  })

  // Set selected patient and form data when editing
  useEffect(() => {
    if (initialData) {
      setSelectedPatient(initialData.patient)
    }
  }, [initialData])

  const {
    register,
    handleSubmit,
    formState: { errors: _errors },
    reset,
  } = useForm<HealthCheckRequest>({
    defaultValues: initialData ? {
      id: initialData.id,
      patientId: initialData.patient.id,
      bpSystolic: initialData.bpSystolic,
      bpDiastolic: initialData.bpDiastolic,
      pulseRate: initialData.pulseRate,
      temperature: initialData.temperature,
      respiratoryRate: initialData.respiratoryRate,
      spo2: initialData.spo2,
      hemoglobin: initialData.hemoglobin,
      bloodSugarFasting: initialData.bloodSugarFasting,
      bloodSugarPP: initialData.bloodSugarPP,
      bloodSugarRandom: initialData.bloodSugarRandom,
      weight: initialData.weight,
      height: initialData.height,
      fundalHeight: initialData.fundalHeight,
      fetalHeartRate: initialData.fetalHeartRate,
      fetalMovement: initialData.fetalMovement,
      urineAlbumin: initialData.urineAlbumin,
      urineSugar: initialData.urineSugar,
      symptoms: initialData.symptoms,
      swellingObserved: initialData.swellingObserved,
      bleedingReported: initialData.bleedingReported,
      headacheReported: initialData.headacheReported,
      blurredVisionReported: initialData.blurredVisionReported,
      abdominalPainReported: initialData.abdominalPainReported,
      notes: initialData.notes,
      recommendations: initialData.recommendations,
      nextCheckDate: initialData.nextCheckDate,
      checkDate: initialData.checkDate,
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: healthCheckService.perform,
    onSuccess: (data) => {
      const riskMsg = data.riskLevel === 'RED' ? 'SEVERE RISK DETECTED!' :
                      data.riskLevel === 'YELLOW' ? 'Moderate risk detected' :
                      'Patient is stable'

      let followUpMsg = ''
      if (scheduleFollowUp && followUpDate) {
        followUpMsg = ' Follow-up scheduled.'
      } else if (autoFollowUpEnabled && (data.riskLevel === 'RED' || data.riskLevel === 'YELLOW')) {
        followUpMsg = ' Auto follow-up created based on risk level.'
      }

      toast.success(`Health check completed. ${riskMsg}${followUpMsg}`)
      onSuccess()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to perform health check')
    },
  })

  const onSubmit = (data: HealthCheckRequest) => {
    if (!selectedPatient && !patientId) {
      toast.error('Please select a patient')
      return
    }
    mutation.mutate({
      ...data,
      patientId: patientId || selectedPatient!.id,
      scheduleFollowUp,
      followUpDate: scheduleFollowUp ? followUpDate : undefined,
      followUpAssigneeId: scheduleFollowUp ? followUpAssigneeId : undefined,
      followUpNotes: scheduleFollowUp ? followUpNotes : undefined,
      autoFollowUpEnabled,
    })
  }

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Patient Selection */}
      {!patientId && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Patient</h3>
          {selectedPatient ? (
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedPatient.name}</p>
                <p className="text-sm text-gray-500">
                  Mother ID: {selectedPatient.motherId} | Age: {selectedPatient.age}
                </p>
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
            <div>
              <Input
                label="Search Patient"
                placeholder="Enter name, Mother ID, or mobile number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults?.content && searchResults.content.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.content.map((patient) => (
                    <div
                      key={patient.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setSearchQuery('')
                      }}
                    >
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {patient.motherId} | {patient.mobileNumber}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Vital Signs */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="BP Systolic (mmHg)"
            type="number"
            {...register('bpSystolic', { min: 60, max: 250 })}
          />
          <Input
            label="BP Diastolic (mmHg)"
            type="number"
            {...register('bpDiastolic', { min: 40, max: 150 })}
          />
          <Input
            label="Pulse Rate (bpm)"
            type="number"
            {...register('pulseRate', { min: 40, max: 200 })}
          />
          <Input
            label="Temperature (F)"
            type="number"
            step="0.1"
            {...register('temperature')}
          />
          <Input
            label="SpO2 (%)"
            type="number"
            {...register('spo2', { min: 70, max: 100 })}
          />
          <Input
            label="Respiratory Rate"
            type="number"
            {...register('respiratoryRate')}
          />
        </div>
      </div>

      {/* Blood Tests */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Blood Tests</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Hemoglobin (g/dL)"
            type="number"
            step="0.1"
            {...register('hemoglobin')}
          />
          <Input
            label="Blood Sugar Fasting"
            type="number"
            {...register('bloodSugarFasting')}
          />
          <Input
            label="Blood Sugar PP"
            type="number"
            {...register('bloodSugarPP')}
          />
          <Input
            label="Blood Sugar Random"
            type="number"
            {...register('bloodSugarRandom')}
          />
        </div>
      </div>

      {/* Physical Measurements */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Physical & Fetal</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            {...register('weight')}
          />
          <Input
            label="Fundal Height (cm)"
            type="number"
            step="0.1"
            {...register('fundalHeight')}
          />
          <Input
            label="Fetal Heart Rate"
            type="number"
            {...register('fetalHeartRate')}
          />
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="fetalMovement"
              {...register('fetalMovement')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="fetalMovement" className="ml-2 text-sm text-gray-700">
              Fetal Movement Present
            </label>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Symptoms & Observations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: 'swellingObserved', label: 'Swelling/Edema Observed' },
            { id: 'bleedingReported', label: 'Bleeding Reported' },
            { id: 'headacheReported', label: 'Severe Headache' },
            { id: 'blurredVisionReported', label: 'Blurred Vision' },
            { id: 'abdominalPainReported', label: 'Abdominal Pain' },
          ].map((symptom) => (
            <div key={symptom.id} className="flex items-center">
              <input
                type="checkbox"
                id={symptom.id}
                {...register(symptom.id as keyof HealthCheckRequest)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor={symptom.id} className="ml-2 text-sm text-gray-700">
                {symptom.label}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="label">Other Symptoms</label>
          <textarea
            {...register('symptoms')}
            rows={2}
            className="input"
            placeholder="Describe any other symptoms..."
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes & Recommendations</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="input"
          placeholder="Additional notes and recommendations..."
        />
      </div>

      {/* Follow-up Scheduling */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Follow-up Scheduling</h3>

        {/* Auto Follow-up Info */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                id="autoFollowUpEnabled"
                checked={autoFollowUpEnabled}
                onChange={(e) => setAutoFollowUpEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="autoFollowUpEnabled" className="text-sm font-medium text-blue-800">
                Enable Automatic Follow-up Based on Risk Level
              </label>
              <p className="text-xs text-blue-600 mt-1">
                RED risk: Follow-up in 2 days | YELLOW risk: Follow-up in 5 days
              </p>
            </div>
          </div>
        </div>

        {/* Manual Follow-up */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="scheduleFollowUp"
              checked={scheduleFollowUp}
              onChange={(e) => setScheduleFollowUp(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="scheduleFollowUp" className="ml-2 text-sm font-medium text-gray-900">
              Schedule Manual Follow-up Call
            </label>
          </div>

          {scheduleFollowUp && (
            <div className="space-y-4 pl-6 border-l-2 border-primary-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Follow-up Date *</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={getMinDate()}
                    className="input"
                    required={scheduleFollowUp}
                  />
                </div>
                <div>
                  <label className="label">Assign To</label>
                  <select
                    value={followUpAssigneeId || ''}
                    onChange={(e) => setFollowUpAssigneeId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="input"
                  >
                    <option value="">Current User (Default)</option>
                    {helpdeskUsers?.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.designation || user.department || 'Help Desk'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Follow-up Notes</label>
                <textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  rows={2}
                  className="input"
                  placeholder="Notes for the follow-up call..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Info box */}
        {!scheduleFollowUp && autoFollowUpEnabled && (
          <p className="mt-3 text-sm text-gray-500">
            A follow-up will be automatically scheduled if the patient is assessed as moderate or high risk.
          </p>
        )}
        {scheduleFollowUp && (
          <p className="mt-3 text-sm text-amber-600">
            Manual follow-up will override automatic scheduling for this health check.
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={mutation.isPending}>
          Complete Health Check
        </Button>
      </div>
    </form>
  )
}
