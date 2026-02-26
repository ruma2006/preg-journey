import { Fragment, ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  animation?: 'scale' | 'flip' | 'slide' | 'bounce'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

const animations = {
  scale: {
    enter: 'ease-out duration-300',
    enterFrom: 'opacity-0 scale-75',
    enterTo: 'opacity-100 scale-100',
    leave: 'ease-in duration-200',
    leaveFrom: 'opacity-100 scale-100',
    leaveTo: 'opacity-0 scale-75',
  },
  flip: {
    enter: 'ease-out duration-500',
    enterFrom: 'opacity-0 [transform:rotateX(-90deg)_scale(0.9)]',
    enterTo: 'opacity-100 [transform:rotateX(0deg)_scale(1)]',
    leave: 'ease-in duration-300',
    leaveFrom: 'opacity-100 [transform:rotateX(0deg)_scale(1)]',
    leaveTo: 'opacity-0 [transform:rotateX(90deg)_scale(0.9)]',
  },
  slide: {
    enter: 'ease-out duration-400',
    enterFrom: 'opacity-0 translate-y-8',
    enterTo: 'opacity-100 translate-y-0',
    leave: 'ease-in duration-200',
    leaveFrom: 'opacity-100 translate-y-0',
    leaveTo: 'opacity-0 translate-y-8',
  },
  bounce: {
    enter: 'ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] duration-500',
    enterFrom: 'opacity-0 scale-50',
    enterTo: 'opacity-100 scale-100',
    leave: 'ease-in duration-200',
    leaveFrom: 'opacity-100 scale-100',
    leaveTo: 'opacity-0 scale-50',
  },
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  animation = 'flip'
}: ModalProps) {
  const anim = animations[animation]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto [perspective:1000px]">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter={anim.enter}
              enterFrom={anim.enterFrom}
              enterTo={anim.enterTo}
              leave={anim.leave}
              leaveFrom={anim.leaveFrom}
              leaveTo={anim.leaveTo}
            >
              <Dialog.Panel
                className={clsx(
                  'w-full transform overflow-hidden rounded-2xl bg-white text-left align-middle transition-all',
                  'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5',
                  sizes[size]
                )}
              >
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <div className="p-6">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
