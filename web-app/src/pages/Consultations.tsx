import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  EditButton,
  DeleteButton,
  ViewButton
} from '@/components/ui'
import ConsultationForm from '@/components/consultation/ConsultationForm'
import { consultationService, userService } from '@/services'
import { ConsultationType, Consultation } from '@/types'

const PAGE_SIZE = 10


export default function Consultations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const queryClient = useQueryClient()
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: userService.getDoctors,
  })
  const page = parseInt(searchParams.get('page') || '0')

  const { data: consultations, isLoading } = useQuery({
    queryKey: ['consultations', 'upcoming', page],
    queryFn: () => consultationService.getUpcoming(page, PAGE_SIZE),
  })



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
        <Button onClick={() => {
          setSelectedConsultation(null)
          setIsReadOnly(false)
          setShowScheduleModal(true)
        }}>
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
                <TableCell header>Meeting Access</TableCell>
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
                    <TableCell>
                      <ViewButton tooltip="View Consultation" 
                      onClick={() => {
                        setSelectedConsultation(consultation)
                        setIsReadOnly(true)
                        setShowScheduleModal(true)
                      }} />
                      <EditButton
                        tooltip="Edit Consultation"
                        onClick={() => {
                          setSelectedConsultation(consultation)
                          setIsReadOnly(false)
                          setShowScheduleModal(true)
                        }}
                      />
                      <DeleteButton tooltip="Delete Consultation" onClick={() => {
                        setConsultationToDelete(consultation)
                        setShowDeleteConfirm(true)
                      }}/>
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
          setSelectedConsultation(null)
          setIsReadOnly(false)
        }}
        title={isReadOnly ? 'View Consultation' : 'Schedule Consultation'}
        size="lg"
        animation="flip"
      >
        <ConsultationForm
          initialData={selectedConsultation}
          readOnly={isReadOnly}
          onSuccess={() => {
            setShowScheduleModal(false)
          }}
          onCancel={() => {
            setShowScheduleModal(false)
            setSelectedConsultation(null)
            setIsReadOnly(false)
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setConsultationToDelete(null)
        }}
        title="Delete Consultation"
        size="sm"
        animation="flip"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the consultation with <strong>{consultationToDelete?.patient.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteConfirm(false)
                setConsultationToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (consultationToDelete) {
                  consultationService.delete(consultationToDelete.id).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['consultations', 'upcoming'] })
                    setShowDeleteConfirm(false)
                    setConsultationToDelete(null)
                  }).catch((error) => {
                    console.error('Failed to delete consultation:', error)
                  })
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
