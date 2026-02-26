import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, ExclamationTriangleIcon, EyeIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
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
  Badge,
  Modal,
} from '@/components/ui'
import { alertService } from '@/services'
import { RiskAlert } from '@/types'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

export default function Alerts() {
  const queryClient = useQueryClient()
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null)
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [acknowledgmentNotes, setAcknowledgmentNotes] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [filter, setFilter] = useState<'all' | 'critical' | 'unacknowledged' | 'acknowledged'>('unacknowledged')
  const [selectedAlertForView, setSelectedAlertForView] = useState<RiskAlert | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', filter],
    queryFn: async () => {
      if (filter === 'critical') {
        return alertService.getCritical()
      }
      if (filter === 'unacknowledged') {
        return alertService.getUnacknowledgedOrdered()
      }
      if (filter === 'acknowledged') {
        const result = await alertService.getAcknowledged()
        return result.content
      }
      return alertService.getUnresolved()
    },
  })

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, notes, action }: { id: number; notes: string; action: string }) =>
      alertService.acknowledge(id, notes, action),
    onSuccess: () => {
      toast.success('Alert acknowledged successfully')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alertCount'] })
      setShowAcknowledgeModal(false)
      setSelectedAlert(null)
      setAcknowledgmentNotes('')
      setActionTaken('')
    },
    onError: () => {
      toast.error('Failed to acknowledge alert')
    },
  })

  const updateAcknowledgementMutation = useMutation({
    mutationFn: ({ id, notes, action }: { id: number; notes: string; action: string }) =>
      alertService.updateAcknowledgement(id, notes, action),
    onSuccess: () => {
      toast.success('Acknowledgement updated successfully')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      setShowEditModal(false)
      setSelectedAlert(null)
      setAcknowledgmentNotes('')
      setActionTaken('')
    },
    onError: () => {
      toast.error('Failed to update acknowledgement')
    },
  })

  const handleAcknowledge = () => {
    if (selectedAlert) {
      acknowledgeMutation.mutate({
        id: selectedAlert.id,
        notes: acknowledgmentNotes,
        action: actionTaken,
      })
    }
  }

  const handleUpdateAcknowledgement = () => {
    if (selectedAlert) {
      updateAcknowledgementMutation.mutate({
        id: selectedAlert.id,
        notes: acknowledgmentNotes,
        action: actionTaken,
      })
    }
  }

  const openAcknowledgeModal = (alert: RiskAlert) => {
    setSelectedAlert(alert)
    setAcknowledgmentNotes('')
    setActionTaken('')
    setShowAcknowledgeModal(true)
  }

  const openEditModal = (alert: RiskAlert) => {
    setSelectedAlert(alert)
    setAcknowledgmentNotes(alert.acknowledgmentNotes || '')
    setActionTaken(alert.actionTaken || '')
    setShowEditModal(true)
  }

  // Client-side search filtering
  const filteredAlerts = useMemo(() => {
    if (!alerts) return []
    if (!searchQuery.trim()) return alerts
    const query = searchQuery.toLowerCase()
    return alerts.filter(alert =>
      alert.patient.name.toLowerCase().includes(query) ||
      alert.patient.motherId.toLowerCase().includes(query) ||
      alert.title.toLowerCase().includes(query) ||
      (alert.description && alert.description.toLowerCase().includes(query))
    )
  }, [alerts, searchQuery])

  // Client-side pagination
  const paginatedAlerts = useMemo(() => {
    const startIndex = currentPage * PAGE_SIZE
    return filteredAlerts.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredAlerts, currentPage])

  const totalPages = Math.ceil(filteredAlerts.length / PAGE_SIZE)
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  // Reset page when filter or search changes
  const handleFilterChange = (newFilter: 'all' | 'critical' | 'unacknowledged' | 'acknowledged') => {
    setFilter(newFilter)
    setCurrentPage(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Alerts</h1>
          <p className="text-gray-500">Monitor and respond to patient alerts</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, Mother ID, alert title..."
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
          variant={filter === 'unacknowledged' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('unacknowledged')}
        >
          Unacknowledged
        </Button>
        <Button
          variant={filter === 'critical' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('critical')}
        >
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          Critical Only
        </Button>
        <Button
          variant={filter === 'acknowledged' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('acknowledged')}
        >
          <CheckIcon className="h-4 w-4 mr-1" />
          Acknowledged
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleFilterChange('all')}
        >
          All Unresolved
        </Button>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader title={`Alerts (${filteredAlerts.length})`} />
        <CardBody className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell header>Severity</TableCell>
                <TableCell header>Patient</TableCell>
                <TableCell header>Alert</TableCell>
                <TableCell header>Created</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableLoading columns={6} />
              ) : paginatedAlerts.length > 0 ? (
                paginatedAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <RiskBadge level={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{alert.patient.name}</p>
                        <p className="text-sm text-gray-500">{alert.patient.motherId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-500 truncate">{alert.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {alert.isAcknowledged ? (
                        <Badge variant="success">Acknowledged</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!alert.isAcknowledged ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openAcknowledgeModal(alert)}
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Acknowledge
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedAlertForView(alert)}
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditModal(alert)}
                              title="Edit Acknowledgement"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmpty
                  title="No alerts"
                  description={searchQuery ? 'Try adjusting your search' : 'All alerts have been addressed'}
                />
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {currentPage * PAGE_SIZE + 1} to{' '}
                {Math.min((currentPage + 1) * PAGE_SIZE, filteredAlerts.length)} of{' '}
                {filteredAlerts.length} alerts
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

      {/* Acknowledge Modal */}
      <Modal
        isOpen={showAcknowledgeModal}
        onClose={() => setShowAcknowledgeModal(false)}
        title="Acknowledge Alert"
        size="md"
        animation="flip"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <RiskBadge level={selectedAlert.severity} />
                <span className="font-semibold text-gray-900">{selectedAlert.title}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedAlert.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Patient: <span className="font-medium">{selectedAlert.patient.name}</span> ({selectedAlert.patient.motherId})
              </p>
            </div>

            {selectedAlert.recommendedAction && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-800">Recommended Action:</p>
                <p className="text-sm text-blue-700 mt-1">{selectedAlert.recommendedAction}</p>
              </div>
            )}

            <div>
              <label className="label">Action Taken *</label>
              <textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                rows={3}
                className="input"
                placeholder="Describe the action taken..."
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                value={acknowledgmentNotes}
                onChange={(e) => setAcknowledgmentNotes(e.target.value)}
                rows={2}
                className="input"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowAcknowledgeModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAcknowledge}
                loading={acknowledgeMutation.isPending}
                disabled={!actionTaken.trim()}
              >
                Acknowledge Alert
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Acknowledgement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Acknowledgement"
        size="md"
        animation="flip"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <RiskBadge level={selectedAlert.severity} />
                <span className="font-semibold text-gray-900">{selectedAlert.title}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedAlert.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Patient: <span className="font-medium">{selectedAlert.patient.name}</span> ({selectedAlert.patient.motherId})
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
              <p className="text-xs text-green-700">
                Acknowledged by: <span className="font-medium">{selectedAlert.acknowledgedBy?.name || 'Unknown'}</span>
                {selectedAlert.acknowledgedAt && (
                  <span className="ml-2">on {new Date(selectedAlert.acknowledgedAt).toLocaleString()}</span>
                )}
              </p>
            </div>

            <div>
              <label className="label">Action Taken *</label>
              <textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                rows={3}
                className="input"
                placeholder="Describe the action taken..."
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                value={acknowledgmentNotes}
                onChange={(e) => setAcknowledgmentNotes(e.target.value)}
                rows={2}
                className="input"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateAcknowledgement}
                loading={updateAcknowledgementMutation.isPending}
                disabled={!actionTaken.trim()}
              >
                Update Acknowledgement
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Alert Details Modal */}
      <Modal
        isOpen={!!selectedAlertForView}
        onClose={() => setSelectedAlertForView(null)}
        title="Alert Details"
        size="lg"
        animation="slide"
      >
        {selectedAlertForView && (
          <div className="space-y-4">
            {/* Alert Info */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <RiskBadge level={selectedAlertForView.severity} />
                <span className="font-semibold text-gray-900">{selectedAlertForView.title}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedAlertForView.description}</p>
              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">
                  Patient: <span className="font-medium text-gray-900">{selectedAlertForView.patient.name}</span>
                </p>
                <p className="text-gray-500">
                  Mother ID: <span className="font-medium text-gray-900">{selectedAlertForView.patient.motherId}</span>
                </p>
                <p className="text-gray-500">
                  Created: <span className="font-medium text-gray-900">{new Date(selectedAlertForView.createdAt).toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Acknowledgement Details */}
            {selectedAlertForView.isAcknowledged && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckIcon className="h-5 w-5" />
                  Acknowledgement Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-green-600 text-xs uppercase tracking-wide">Acknowledged by</p>
                      <p className="font-medium text-green-800">{selectedAlertForView.acknowledgedBy?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-green-600 text-xs uppercase tracking-wide">Acknowledged at</p>
                      <p className="font-medium text-green-800">
                        {selectedAlertForView.acknowledgedAt
                          ? new Date(selectedAlertForView.acknowledgedAt).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {selectedAlertForView.actionTaken && (
                    <div className="pt-3 border-t border-green-200">
                      <p className="text-green-600 text-xs uppercase tracking-wide mb-1">Action Taken</p>
                      <p className="text-green-800 bg-white/50 p-2 rounded">{selectedAlertForView.actionTaken}</p>
                    </div>
                  )}
                  {selectedAlertForView.acknowledgmentNotes && (
                    <div>
                      <p className="text-green-600 text-xs uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-green-800 bg-white/50 p-2 rounded">{selectedAlertForView.acknowledgmentNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resolution Details */}
            {selectedAlertForView.isResolved && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Resolution Details</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-700">
                    <span className="font-medium">Resolved at:</span>{' '}
                    {selectedAlertForView.resolvedAt
                      ? new Date(selectedAlertForView.resolvedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                  {selectedAlertForView.resolutionNotes && (
                    <div>
                      <p className="font-medium text-blue-800">Resolution Notes:</p>
                      <p className="text-blue-700 bg-white/50 p-2 rounded mt-1">{selectedAlertForView.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              {selectedAlertForView.isAcknowledged && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedAlertForView(null)
                    openEditModal(selectedAlertForView)
                  }}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="primary" onClick={() => setSelectedAlertForView(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
