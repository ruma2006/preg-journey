import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
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
  EditButton,
  DeleteButton,
} from '@/components/ui'
import { healthCheckService } from '@/services'
import { HealthCheck } from '@/types'
import HealthCheckForm from '@/components/health-check/HealthCheckForm'

const PAGE_SIZE = 10

export default function HealthChecks() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedHealthCheck, setSelectedHealthCheck] = useState<HealthCheck | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const page = parseInt(searchParams.get('page') || '0')

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
                <TableLoading columns={6} />
              ) : filteredHealthChecks.length > 0 ? (
                filteredHealthChecks.map((check) => (
                  <TableRow
                    key={check.id}
                    // onClick={() => navigate(`/patients/${check.patient.id}`)}
                  >
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
                      <EditButton tooltip="Edit Health Check" onClick={() => {
                        setSelectedHealthCheck(check)
                        setShowCreateModal(true)
                      }}/>
                      <DeleteButton tooltip="Delete Health Check" onClick={() => {
                        // Implement delete functionality here
                      }}/>
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

      {/* Health Check Modal */}
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
    </div>
  )
}
