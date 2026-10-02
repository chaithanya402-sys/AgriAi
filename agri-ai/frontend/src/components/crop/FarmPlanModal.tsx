import { X } from 'lucide-react'
import type { CropDetailInfo } from '@/data/cropDetailsData'
import { FarmPlanContent } from './FarmPlanContent'

export interface FarmPlanModalProps {
  cropDetails: CropDetailInfo
  farmName: string
  locationLabel: string
  area: number
  isOpen: boolean
  onClose: () => void
}

export function FarmPlanModal({
  cropDetails,
  farmName,
  locationLabel,
  area,
  isOpen,
  onClose,
}: FarmPlanModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-6xl my-auto rounded-3xl bg-[#F8FBF6] shadow-2xl border border-[#DCE8DE] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Absolute close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#17231A] border border-[#DCE8DE] transition-colors shadow-2xs"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto">
          <FarmPlanContent
            cropDetails={cropDetails}
            farmName={farmName}
            locationLabel={locationLabel}
            area={area}
            onBack={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  )
}
