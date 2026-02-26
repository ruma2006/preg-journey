import { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ className, children, hover = false, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'bg-white rounded-xl shadow-sm border border-gray-200',
    elevated: 'bg-white rounded-xl shadow-md',
    outlined: 'bg-white rounded-xl border-2 border-gray-200',
  }

  return (
    <div
      className={clsx(
        variants[variant],
        'transition-all duration-300',
        hover && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: ReactNode
  children?: ReactNode
}

export function CardHeader({ className, title, subtitle, action, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={clsx('px-4 py-5 border-b border-gray-200 sm:px-6', className)}
      {...props}
    >
      {children || (
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
    </div>
  )
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={clsx('px-4 py-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={clsx('px-4 py-4 border-t border-gray-200 sm:px-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
