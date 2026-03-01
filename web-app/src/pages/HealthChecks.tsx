import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
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
  Modal,
  ViewButton,
  EditButton,
  DeleteButton,
  Badge,
} from '@/components/ui'
import { healthCheckService } from '@/services'
import { HealthCheck } from '@/types'
import HealthCheckForm from '@/components/health-check/HealthCheckForm'

const PAGE_SIZE = 10

export default function HealthChecks() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedHealthCheck, setSelectedHealthCheck] = useState<HealthCheck | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const page = parseInt(searchParams.get('page') || '0')

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: healthCheckService.delete,
    onSuccess: () => {
      toast.success('Health check deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['healthChecks'] })
      setDeleteConfirmId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete health check')
    },
  })

  const { data: healthChecks, isLoading, refetch } = useQuery({
    queryKey: ['healthChecks', 'highRisk', page],
    queryFn: () => healthCheckService.getHighRisk(page, PAGE_SIZE),
  })

  const { data: dueToday } = useQuery({
    queryKey: ['healthChecks', 'dueToday'],
    queryFn: healthCheckService.getDueToday,
  })

  const handleSuccess = () => {
    setShowCreateModal(false)
    setSelectedHealthCheck(null)
    refetch()
  }

  const handleView = (check: HealthCheck) => {
    setSelectedHealthCheck(check)
    setShowViewModal(true)
  }

  const handleEdit = (check: HealthCheck) => {
    setSelectedHealthCheck(check)
    setShowCreateModal(true)
  }

  // Client-side search filtering
  const filteredHealthChecks = useMemo(() => {
    if (!healthChecks?.content || !searchQuery.trim()) {
      return healthChecks?.content || []
    }
    const query = searchQuery.toLowerCase()
    return healthChecks.content.filter(check =>
      check.patient.name.toLowerCase().includes(query) ||
      check.patient.motherId.toLowerCase().includes(query) ||
      (check.patient.mobileNumber && check.patient.mobileNumber.includes(query))
    )
  }, [healthChecks?.content, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is done client-side via useMemo
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) })
  }

  const formatValue = (value: number | undefined | null, unit?: string) => {
    if (value === undefined || value === null) return '-'
    return unit ? `${value} ${unit}` : value.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Checks</h1>
          <p className="text-gray-500">Perform and review patient health assessments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Health Check
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, Mother ID, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Due Today */}
      {dueToday && dueToday.length > 0 && (
        <Card>
          <CardHeader
            title={`Health Checks Due Today (${dueToday.length})`}
            subtitle="Patients scheduled for health check today"
          />
          <CardBody className="p-0">
            <div className="divide-y divide-gray-200">
              {dueToday.slice(0, 5).map((check) => (
                <div
                  key={check.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/patients/${check.patient.id}`)}
                >
                  <div>
                    <p className="font-medium text-gray-900">{check.patient.name}</p>
                    <p className="text-sm text-gray-500">
                      Mother ID: {check.patient.motherId}
                    </p>
                  </div>
                  <RiskBadge level={check.patient.currentRiskLevel} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent High Risk Health Checks */}
      <Card>
        <CardHeader
          title={`High Risk Health Checks (${healthChecks?.totalElements || 0})`}
          subtitle="Health checks with elevated risk levels"
        />
        <CardBody className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>Patient</TableCell>
                <TableCell header>Date</TableCell>
                <TableCell header>BP</TableCell>
                <TableCell header>Hemoglobin</TableCell>
                <TableCell header>Risk Score</TableCell>
                <TableCell header>Risk Level</TableCell>
                <TableCell header>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableLoading columns={7} />
              ) : filteredHealthChecks.length > 0 ? (
                filteredHealthChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{check.patient.name}</p>
                        <p className="text-sm text-gray-500">{check.patient.motherId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(check.checkDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {check.bpSystolic && check.bpDiastolic
                        ? `${check.bpSystolic}/${check.bpDiastolic}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {check.hemoglobin ? `${check.hemoglobin} g/dL` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{check.riskScore}</span>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={check.riskLevel} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ViewButton tooltip="View Details" onClick={() => handleView(check)} />
                        <EditButton tooltip="Edit Health Check" onClick={() => handleEdit(check)} />
                        <DeleteButton tooltip="Delete Health Check" onClick={() => setDeleteConfirmId(check.id)} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty
                  title="No health checks found"
                  description={searchQuery ? 'Try adjusting your search' : 'Perform a health check to see it here'}
                />
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {healthChecks && healthChecks.totalPages > 1 && !searchQuery && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {healthChecks.number * healthChecks.size + 1} to{' '}
                {Math.min((healthChecks.number + 1) * healthChecks.size, healthChecks.totalElements)} of{' '}
                {healthChecks.totalElements} health checks
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={healthChecks.first}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={healthChecks.last}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Health Check Modal (Create/Edit) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedHealthCheck(null)
        }}
        title={selectedHealthCheck ? "Edit Health Check" : "Perform Health Check"}
        size="xl"
      >
        <HealthCheckForm initialData={selectedHealthCheck || undefined} onSuccess={handleSuccess} />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedHealthCheck(null)
        }}
        title="Health Check Details"
        size="lg"
      >
        {selectedHealthCheck && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedHealthCheck.patient.name}</h4>
                  <p className="text-sm text-gray-500">Mother ID: {selectedHealthCheck.patient.motherId}</p>
                  <p className="text-sm text-gray-500">Mobile: {selectedHealthCheck.patient.mobileNumber}</p>
                </div>
                <RiskBadge level={selectedHealthCheck.riskLevel} />
              </div>
            </div>

            {/* Check Date & Risk */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Check Date</h4>
                <p className="text-gray-900">{new Date(selectedHealthCheck.checkDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Risk Score</h4>
                <p className="text-gray-900 font-medium">{selectedHealthCheck.riskScore}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Risk Level</h4>
                <RiskBadge level={selectedHealthCheck.riskLevel} />
              </div>
            </div>

            {/* Vital Signs */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b">Vital Signs</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Blood Pressure:</span>
                  <span className="ml-2 font-medium">
                    {selectedHealthCheck.bpSystolic && selectedHealthCheck.bpDiastolic
                      ? `${selectedHealthCheck.bpSystolic}/${selectedHealthCheck.bpDiastolic} mmHg`
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Pulse Rate:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.pulseRate, 'bpm')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Temperature:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.temperature, '°F')}</span>
                </div>
                <div>
                  <span className="text-gray-500">SpO2:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.spo2, '%')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Respiratory Rate:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.respiratoryRate, '/min')}</span>
                </div>
              </div>
            </div>

            {/* Blood Tests */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b">Blood Tests</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Hemoglobin:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.hemoglobin, 'g/dL')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Blood Sugar (Fasting):</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.bloodSugarFasting, 'mg/dL')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Blood Sugar (PP):</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.bloodSugarPP, 'mg/dL')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Blood Sugar (Random):</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.bloodSugarRandom, 'mg/dL')}</span>
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b">Physical & Fetal</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.weight, 'kg')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Fundal Height:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.fundalHeight, 'cm')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Fetal Heart Rate:</span>
                  <span className="ml-2 font-medium">{formatValue(selectedHealthCheck.fetalHeartRate, 'bpm')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Fetal Movement:</span>
                  <span className="ml-2 font-medium">{selectedHealthCheck.fetalMovement ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b">Symptoms & Observations</h4>
              <div className="flex flex-wrap gap-2">
                {selectedHealthCheck.swellingObserved && <Badge variant="warning">Swelling Observed</Badge>}
                {selectedHealthCheck.bleedingReported && <Badge variant="danger">Bleeding Reported</Badge>}
                {selectedHealthCheck.headacheReported && <Badge variant="warning">Headache</Badge>}
                {selectedHealthCheck.blurredVisionReported && <Badge variant="warning">Blurred Vision</Badge>}
                {selectedHealthCheck.abdominalPainReported && <Badge variant="warning">Abdominal Pain</Badge>}
                {!selectedHealthCheck.swellingObserved &&
                 !selectedHealthCheck.bleedingReported &&
                 !selectedHealthCheck.headacheReported &&
                 !selectedHealthCheck.blurredVisionReported &&
                 !selectedHealthCheck.abdominalPainReported && (
                  <span className="text-gray-500 text-sm">No symptoms reported</span>
                )}
              </div>
            </div>

            {/* Risk Factors */}
            {selectedHealthCheck.riskFactors && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Factors</h4>
                <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">{selectedHealthCheck.riskFactors}</p>
              </div>
            )}

            {/* Referral */}
            {selectedHealthCheck.referredToHospital && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 mb-1">Referred to Hospital</h4>
                <p className="text-amber-700">{selectedHealthCheck.referredToHospital}</p>
              </div>
            )}

            {/* Notes */}
            {selectedHealthCheck.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{selectedHealthCheck.notes}</p>
              </div>
            )}

            {/* Recommendations */}
            {selectedHealthCheck.recommendations && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                <p className="text-sm text-gray-600">{selectedHealthCheck.recommendations}</p>
              </div>
            )}

            {/* Photo */}
            {selectedHealthCheck.photoUrl && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Photo Documentation</h4>
                <img
                  src={selectedHealthCheck.photoUrl}
                  alt="Health check photo"
                  className="max-w-md max-h-64 object-contain rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjAwIDE1MCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzljYTNhZiIgZm9udC1zaXplPSIxNCI+SW1hZ2UgdW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+'
                    target.title = `Failed to load: ${selectedHealthCheck.photoUrl}`
                  }}
                />
              </div>
            )}

            {/* Next Check Date */}
            {selectedHealthCheck.nextCheckDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Next Check Date</h4>
                <p className="text-gray-900">{new Date(selectedHealthCheck.nextCheckDate).toLocaleDateString()}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedHealthCheck(null)
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedHealthCheck)
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Health Check"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this health check record? This action will mark the record as inactive.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (deleteConfirmId) {
                  deleteMutation.mutate(deleteConfirmId)
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
