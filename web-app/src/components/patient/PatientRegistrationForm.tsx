import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button, Input, Select } from '@/components/ui'
import { patientService } from '@/services'
import { PatientRegistrationRequest } from '@/types'

interface PatientRegistrationFormProps {
  onSuccess: () => void
}

const BLOOD_GROUPS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

// Calculate date limits
const today = new Date()
const tenMonthsAgo = new Date(today)
tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10)

const tenMonthsFromNow = new Date(today)
tenMonthsFromNow.setMonth(tenMonthsFromNow.getMonth() + 10)

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0]

export default function PatientRegistrationForm({ onSuccess }: PatientRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PatientRegistrationRequest>()

  const lmpDate = watch('lmpDate')

  // Auto-calculate EDD when LMP changes (280 days from LMP)
  const calculateEDD = (lmp: string) => {
    if (lmp) {
      const lmpDateObj = new Date(lmp)
      const eddDateObj = new Date(lmpDateObj)
      eddDateObj.setDate(eddDateObj.getDate() + 280) // 40 weeks
      return formatDateForInput(eddDateObj)
    }
    return ''
  }

  const mutation = useMutation({
    mutationFn: patientService.register,
    onSuccess: (data) => {
      toast.success(`Patient registered successfully! Mother ID: ${data.motherId}`)
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to register patient')
    },
  })

  const onSubmit = (data: PatientRegistrationRequest) => {
    mutation.mutate(data)
  }

  // Validation functions
  const validateLMPDate = (value: string | undefined) => {
    if (!value) return true // Optional field
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate > today) {
      return 'LMP date cannot be in the future'
    }

    const tenMonthsAgo = new Date(today)
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10)

    if (selectedDate < tenMonthsAgo) {
      return 'LMP date cannot be more than 10 months in the past'
    }

    return true
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Patient Name"
            required
            maxLength={100}
            {...register('name', {
              required: 'Name is required',
              maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
            })}
            error={errors.name?.message}
          />
          <Input
            label="Age"
            type="number"
            required
            {...register('age', {
              required: 'Age is required',
              min: { value: 12, message: 'Minimum age is 12' },
              max: { value: 60, message: 'Maximum age is 60' },
            })}
            error={errors.age?.message}
          />
          <Input
            label="Husband's Name"
            maxLength={100}
            {...register('husbandName', {
              maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
            })}
            error={errors.husbandName?.message}
          />
          <Input
            label="Date of Birth"
            type="date"
            max={formatDateForInput(today)}
            {...register('dateOfBirth')}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mobile Number"
            required
            maxLength={15}
            {...register('mobileNumber', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[0-9]{10,15}$/,
                message: 'Enter a valid 10-15 digit mobile number',
              },
            })}
            error={errors.mobileNumber?.message}
          />
          <Input
            label="Alternate Mobile"
            maxLength={15}
            {...register('alternateMobile', {
              pattern: {
                value: /^[0-9]{10,15}$/,
                message: 'Enter a valid mobile number',
              },
            })}
            error={errors.alternateMobile?.message}
          />
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="email@example.com"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
            error={errors.email?.message}
          />
          <Input
            label="Aadhaar Number (Optional)"
            maxLength={12}
            {...register('aadhaarNumber', {
              validate: (value) => {
                if (!value) return true
                return /^\d{12}$/.test(value) || 'Enter a valid 12-digit Aadhaar number'
              },
            })}
            error={errors.aadhaarNumber?.message}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Residence Address"
              required
              maxLength={500}
              {...register('residence', {
                required: 'Residence is required',
                maxLength: { value: 500, message: 'Address cannot exceed 500 characters' }
              })}
              error={errors.residence?.message}
            />
          </div>
          <Input
            label="District"
            maxLength={100}
            {...register('district', {
              maxLength: { value: 100, message: 'District cannot exceed 100 characters' }
            })}
            defaultValue="Nirmal"
            error={errors.district?.message}
          />
          <Input
            label="Mandal"
            maxLength={100}
            {...register('mandal', {
              maxLength: { value: 100, message: 'Mandal cannot exceed 100 characters' }
            })}
            error={errors.mandal?.message}
          />
          <Input
            label="Village"
            maxLength={100}
            {...register('village', {
              maxLength: { value: 100, message: 'Village cannot exceed 100 characters' }
            })}
            error={errors.village?.message}
          />
          <Input
            label="Pincode"
            maxLength={9}
            {...register('pincode', {
              maxLength: { value: 9, message: 'Pincode cannot exceed 9 characters' },
              pattern: {
                value: /^[0-9]{5,9}$/,
                message: 'Enter a valid pincode (5-9 digits)',
              },
            })}
            error={errors.pincode?.message}
            placeholder="e.g., 504001"
          />
        </div>
      </div>

      {/* Pregnancy Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pregnancy Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Last Menstrual Period (LMP)"
              type="date"
              max={formatDateForInput(today)}
              min={formatDateForInput(tenMonthsAgo)}
              {...register('lmpDate', {
                validate: validateLMPDate,
                onChange: (e) => {
                  const edd = calculateEDD(e.target.value)
                  if (edd) {
                    // The EDD will be auto-calculated on the backend
                  }
                }
              })}
              error={errors.lmpDate?.message}
            />
            <p className="mt-1 text-xs text-gray-500">
              Cannot be more than 10 months in the past
            </p>
          </div>
          <Select
            label="Blood Group"
            options={BLOOD_GROUPS}
            placeholder="Select blood group"
            {...register('bloodGroup')}
          />
          <Input
            label="Gravida (No. of Pregnancies)"
            type="number"
            min={0}
            {...register('gravida', {
              min: { value: 0, message: 'Cannot be negative' },
              max: { value: 20, message: 'Value seems too high' }
            })}
            error={errors.gravida?.message}
          />
          <Input
            label="Para (No. of Deliveries)"
            type="number"
            min={0}
            {...register('para', {
              min: { value: 0, message: 'Cannot be negative' },
              max: { value: 20, message: 'Value seems too high' }
            })}
            error={errors.para?.message}
          />
        </div>
        {lmpDate && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Estimated Due Date:</span>{' '}
              {new Date(calculateEDD(lmpDate)).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
              <span className="text-xs text-blue-500 ml-2">(auto-calculated from LMP)</span>
            </p>
          </div>
        )}
      </div>

      {/* Medical History */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasPreviousComplications"
              {...register('hasPreviousComplications')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="hasPreviousComplications" className="text-sm text-gray-700">
              Has previous pregnancy complications
            </label>
          </div>
          <div>
            <label className="label">Previous Complications Details</label>
            <textarea
              {...register('previousComplicationsDetails')}
              rows={2}
              className="input"
              placeholder="Describe any previous complications..."
              maxLength={1000}
            />
          </div>
          <div>
            <label className="label">Medical History</label>
            <textarea
              {...register('medicalHistory')}
              rows={2}
              className="input"
              placeholder="Any existing medical conditions (e.g., diabetes, hypertension)..."
              maxLength={1000}
            />
          </div>
          <div>
            <label className="label">Allergies</label>
            <textarea
              {...register('allergies')}
              rows={2}
              className="input"
              placeholder="Known allergies (e.g., medications, food)..."
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" loading={mutation.isPending}>
          Register Patient
        </Button>
      </div>
    </form>
  )
}
