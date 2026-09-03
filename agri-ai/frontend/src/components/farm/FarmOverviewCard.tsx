/**
 * Farm Overview Card — shown on the Dashboard.
 * Displays Farm Name, Farm ID (FARM###), State, District, Mandal, Village.
 * Latitude / Longitude are NEVER displayed.
 * Includes the dynamic AP district map on the right.
 */
import { Link } from 'react-router-dom'
import { Home, FileText, MapPin, Map, ChevronRight, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AndhraPradeshMap } from '@/components/maps/AndhraPradeshMap'
import type { Farm } from '@/types'

interface Props {
  farm: Farm
  activeState?: string | null
  activeDistrict?: string | null
  activeMandal?: string | null
  activeVillage?: string | null
  locationSource?: string
  locationLoading?: boolean
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 shrink-0 mt-0.5">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-neutral-400 leading-tight">{label}</p>
        <p className="text-sm font-semibold text-neutral-900 leading-snug">
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

export function FarmOverviewCard({
  farm,
  activeState,
  activeDistrict,
  activeMandal,
  activeVillage,
  locationSource,
  locationLoading,
}: Props) {
  // Derive display values — active location takes priority over saved farm values
  const displayState    = activeState    || farm.state    || null
  const displayDistrict = activeDistrict || farm.district || null
  const displayMandal   = activeMandal   || farm.mandal   || null
  const displayVillage  = activeVillage  || farm.village  || null

  // Format Farm ID like FARM001
  const farmId = `FARM${String(farm.id).padStart(3, '0')}`

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Left — farm info */}
          <div className="flex-1 p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Farm Overview</h3>
              {locationLoading && (
                <RefreshCw className="h-3.5 w-3.5 text-neutral-400 animate-spin" />
              )}
              {locationSource && !locationLoading && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 text-neutral-500">
                  <MapPin className="h-3 w-3" />
                  {locationSource === 'live' ? 'Live GPS' : locationSource === 'farm_saved' ? 'Saved Location' : 'Estimated'}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <InfoRow icon={Home}     label="Farm Name" value={farm.name} />
              <InfoRow icon={FileText} label="Farm ID"   value={farmId} />
              <InfoRow icon={MapPin}   label="State"     value={displayState} />
              <InfoRow icon={Map}      label="District"  value={displayDistrict} />
              {displayMandal && (
                <InfoRow icon={MapPin} label="Mandal"  value={displayMandal} />
              )}
              {displayVillage && (
                <InfoRow icon={MapPin} label="Village" value={displayVillage} />
              )}
            </div>

            <Link
              to="/dashboard/farms"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Farm Details
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right — AP map */}
          <div className="sm:w-48 lg:w-56 flex items-center justify-center bg-green-50/50 p-4 border-t sm:border-t-0 sm:border-l border-neutral-100">
            <AndhraPradeshMap
              activeDistrict={displayDistrict}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
