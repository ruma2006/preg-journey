import { ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [displayLocation, setDisplayLocation] = useState(location)

  useEffect(() => {
    if (location !== displayLocation) {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setDisplayLocation(location)
        setIsVisible(true)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [location, displayLocation])

  return (
    <div
      className={clsx(
        'transition-all duration-300 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        className
      )}
    >
      {children}
    </div>
  )
}
