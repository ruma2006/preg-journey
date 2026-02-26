import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TourState {
  hasCompletedTour: boolean
  isTourActive: boolean
  currentStep: number
  setTourCompleted: () => void
  startTour: () => void
  endTour: () => void
  setCurrentStep: (step: number) => void
  resetTour: () => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      hasCompletedTour: false,
      isTourActive: false,
      currentStep: 0,

      setTourCompleted: () => {
        set({ hasCompletedTour: true, isTourActive: false })
      },

      startTour: () => {
        set({ isTourActive: true, currentStep: 0 })
      },

      endTour: () => {
        set({ isTourActive: false })
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step })
      },

      resetTour: () => {
        set({ hasCompletedTour: false, isTourActive: false, currentStep: 0 })
      },
    }),
    {
      name: 'tour-storage',
      partialize: (state) => ({
        hasCompletedTour: state.hasCompletedTour,
      }),
    }
  )
)
