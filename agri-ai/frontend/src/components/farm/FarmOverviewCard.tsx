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
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'
import type { Farm } from '@/types'

interface Props {
  farm: Farm
  activeState?: string | null
  activeDistrict?: string | null
  activeMandal?: string | null
  activeVillage?: string | null
  locationSource?: string
  locationLoading?: boolean
  className?: string
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
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-neutral-400 leading-tight truncate">{label}</p>
        <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug truncate">
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
  className,
}: Props) {
  const { t } = useLanguage()

  // Derive display values — active location takes priority over saved farm values
  const displayState    = activeState    || farm.state    || null
  const displayDistrict = activeDistrict || farm.district || null
  const displayMandal   = activeMandal   || farm.mandal   || null
  const displayVillage  = activeVillage  || farm.village  || null

  // Format Farm ID like FARM001
  const farmId = `FARM${String(farm.id).padStart(3, '0')}`

  return (
    <Card className={cn('overflow-hidden flex flex-col', className)}>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 items-stretch">
          {/* Left — farm info: compact, neat 40-42% width */}
          <div className="w-full md:w-[42%] lg:w-[40%] p-3.5 sm:p-4 space-y-3 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('dashboard.farmOverview', 'Farm Overview')}
                </h3>
                {locationLoading && (
                  <RefreshCw className="h-3.5 w-3.5 text-neutral-400 animate-spin" />
                )}
                {locationSource && !locationLoading && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1 text-neutral-500">
                    <MapPin className="h-2.5 w-2.5" />
                    {locationSource === 'live' ? t('dashboard.liveGps', 'Live GPS') : locationSource === 'farm_saved' ? t('dashboard.savedLocation', 'Saved Location') : t('dashboard.estimated', 'Estimated')}
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <InfoRow icon={Home}     label={t('dashboard.farmName', 'Farm Name')} value={farm.name} />
                <InfoRow icon={FileText} label={t('dashboard.farmId', 'Farm ID')}   value={farmId} />
                <InfoRow icon={MapPin}   label={t('dashboard.state', 'State')}     value={displayState} />
                <InfoRow icon={Map}      label={t('dashboard.district', 'District')}  value={displayDistrict} />
                {displayMandal && (
                  <InfoRow icon={MapPin} label={t('dashboard.mandal', 'Mandal')}  value={displayMandal} />
                )}
                {displayVillage && (
                  <InfoRow icon={MapPin} label={t('dashboard.village', 'Village')} value={displayVillage} />
                )}
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard/farms"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-2xs"
              >
                {t('dashboard.manageFarms', 'Manage Farms / Edit Details')}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right — Dominant map: occupies 58-60% width with maximum visual area */}
          <div className="w-full md:w-[58%] lg:w-[60%] flex flex-col justify-center bg-green-50/40 p-2 sm:p-2.5 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800">
            <AndhraPradeshMap
              activeDistrict={displayDistrict}
              activeState={displayState}
              mandal={displayMandal}
              village={displayVillage}
              latitude={farm.latitude}
              longitude={farm.longitude}
              farmName={farm.name}
              className="w-full h-full min-h-[250px] sm:min-h-[280px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
