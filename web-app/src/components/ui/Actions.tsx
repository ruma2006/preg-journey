import { ButtonHTMLAttributes, forwardRef } from 'react'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: 'edit' | 'delete' | 'view'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'danger' | 'secondary'
  tooltip?: string
}

const EditButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', variant = 'primary', tooltip, onClick, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'text-gray-700 hover:bg-blue-100 hover:text-blue-600 focus:ring-blue-500',
      danger: 'text-gray-700 hover:bg-red-100 hover:text-red-600 focus:ring-red-500',
      secondary: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    }

    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    }

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        title={tooltip}
        {...props}
      >
        <PencilIcon className={iconSizes[size]} />
      </button>
    )
  }
)

EditButton.displayName = 'EditButton'

const DeleteButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', variant = 'danger', tooltip, onClick, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'text-gray-700 hover:bg-blue-100 hover:text-blue-600 focus:ring-blue-500',
      danger: 'text-gray-700 hover:bg-red-100 hover:text-red-600 focus:ring-red-500',
      secondary: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    }

    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    }

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        title={tooltip}
        {...props}
      >
        <TrashIcon className={iconSizes[size]} />
      </button>
    )
  }
)

DeleteButton.displayName = 'DeleteButton'

const ViewButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', variant = 'secondary', tooltip, onClick, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'text-gray-700 hover:bg-blue-100 hover:text-blue-600 focus:ring-blue-500',
      danger: 'text-gray-700 hover:bg-red-100 hover:text-red-600 focus:ring-red-500',
      secondary: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    }

    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    }

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        title={tooltip}
        {...props}
      >
        <EyeIcon className={iconSizes[size]} />
      </button>
    )
  }
)

ViewButton.displayName = 'ViewButton'

export { EditButton, DeleteButton, ViewButton }
export type { IconButtonProps }
