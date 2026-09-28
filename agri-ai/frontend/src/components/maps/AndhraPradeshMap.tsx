import React, { useMemo, useState } from 'react'
import { MapPin, Layers } from 'lucide-react'

interface MapLocation {
  name: string
  lat: number
  lon: number
  zoom: number
  radius: number
  popupHtml: string
  subtitle: string
}

interface DistrictCoord {
  name: string
  lat: number
  lon: number
  zoom: number
}

// Known mandal and village coordinates for precise location detection
const MANDAL_COORDS: Record<string, DistrictCoord> = {
  atmakur: { name: 'Atmakur', lat: 14.3850, lon: 79.9050, zoom: 14 },
  gudur: { name: 'Gudur', lat: 14.2833, lon: 79.8167, zoom: 14 },
  chintapalli: { name: 'Chintapalli', lat: 14.5333, lon: 79.8500, zoom: 14 },
  kaviti: { name: 'Kaviti', lat: 14.6500, lon: 79.9333, zoom: 14 },
  rapur: { name: 'Rapur', lat: 14.3667, lon: 79.7500, zoom: 14 },
}

const DISTRICT_COORDS: Record<string, DistrictCoord> = {
  vizianagaram: { name: 'Vizianagaram', lat: 18.1124, lon: 83.3956, zoom: 12 },
  srikakulam: { name: 'Srikakulam', lat: 18.2970, lon: 83.8968, zoom: 12 },
  visakhapatnam: { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, zoom: 12 },
  anakapalli: { name: 'Anakapalli', lat: 17.6913, lon: 83.0039, zoom: 12 },
  allurisitharamaraju: { name: 'Alluri Sitharama Raju', lat: 18.0667, lon: 82.5333, zoom: 11 },
  parvathipurammanyam: { name: 'Parvathipuram Manyam', lat: 18.7758, lon: 83.4286, zoom: 12 },
  kakinada: { name: 'Kakinada', lat: 16.9891, lon: 82.2475, zoom: 12 },
  eastgodavari: { name: 'East Godavari', lat: 17.0005, lon: 81.8040, zoom: 12 },
  drbrambedkarkonaseema: { name: 'Dr. B.R. Ambedkar Konaseema', lat: 16.5744, lon: 81.9961, zoom: 12 },
  westgodavari: { name: 'West Godavari', lat: 16.5449, lon: 81.5212, zoom: 12 },
  eluru: { name: 'Eluru', lat: 16.7107, lon: 81.0952, zoom: 12 },
  ntrdistrict: { name: 'NTR District', lat: 16.5062, lon: 80.6480, zoom: 12 },
  krishna: { name: 'Krishna', lat: 16.1809, lon: 81.1303, zoom: 12 },
  guntur: { name: 'Guntur', lat: 16.3067, lon: 80.4365, zoom: 12 },
  palnadu: { name: 'Palnadu', lat: 16.2333, lon: 79.9167, zoom: 11 },
  bapatla: { name: 'Bapatla', lat: 15.9042, lon: 80.4674, zoom: 12 },
  nellore: { name: 'Nellore', lat: 14.4426, lon: 79.9865, zoom: 12 },
  prakasam: { name: 'Prakasam', lat: 15.5057, lon: 80.0499, zoom: 11 },
  tirupati: { name: 'Tirupati', lat: 13.6288, lon: 79.4192, zoom: 12 },
  chittoor: { name: 'Chittoor', lat: 13.2172, lon: 79.1003, zoom: 12 },
  annamayya: { name: 'Annamayya', lat: 14.0167, lon: 78.7500, zoom: 11 },
  ysrkadapa: { name: 'YSR Kadapa', lat: 14.4673, lon: 78.8242, zoom: 12 },
  kurnool: { name: 'Kurnool', lat: 15.8281, lon: 78.0373, zoom: 12 },
  nandyal: { name: 'Nandyal', lat: 15.4882, lon: 78.4836, zoom: 12 },
  srisathyasai: { name: 'Sri Sathya Sai', lat: 14.1667, lon: 77.8000, zoom: 11 },
  ananthapuramu: { name: 'Ananthapuramu', lat: 14.6819, lon: 77.6006, zoom: 12 },
}

const DEFAULT_AP: DistrictCoord = {
  name: 'Vizianagaram',
  lat: 18.1124,
  lon: 83.3956,
  zoom: 12,
}

function normalise(name?: string | null): string {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function matchDistrict(active?: string | null): DistrictCoord {
  const norm = normalise(active)
  if (norm && DISTRICT_COORDS[norm]) {
    return DISTRICT_COORDS[norm]
  }
  for (const [key, val] of Object.entries(DISTRICT_COORDS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val
    }
  }
  return DEFAULT_AP
}

function resolveMapLocation({
  district,
  mandal,
  village,
  latitude,
  longitude,
  farmName,
}: {
  district?: string | null
  mandal?: string | null
  village?: string | null
  latitude?: number | null
  longitude?: number | null
  farmName?: string | null
}): MapLocation {
  const dNorm = (district || '').toLowerCase().trim()
  const mNorm = (mandal || '').toLowerCase().trim().replace('ll', 'l')
  const vNorm = (village || '').toLowerCase().trim()

  const displayName = farmName ? `${farmName}` : 'Farm Location'
  const displayVillage = village || (vNorm.includes('tekkali') ? 'Tekkali' : null)
  const displayMandal = mandal || (mNorm.includes('nelimarla') ? 'Nellimarla' : null)
  const displayDistrict = district || 'Vizianagaram'

  // Build a rich Leaflet popup string
  const popupHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; min-width: 140px;">
      <strong style="color: #15803d; font-size: 13px; display: block; margin-bottom: 2px;">🌾 ${displayName}</strong>
      ${displayVillage ? '<div style="color: #1f2937;"><b>Village:</b> ' + displayVillage + '</div>' : ''}
      ${displayMandal ? '<div style="color: #1f2937;"><b>Mandal:</b> ' + displayMandal + '</div>' : ''}
      <div style="color: #4b5563;"><b>District:</b> ${displayDistrict}</div>
      <div style="color: #16a34a; font-weight: 500; font-size: 11px; margin-top: 2px;">Andhra Pradesh</div>
    </div>
  `.replace(/\s+/g, ' ').trim()

  // 0. Check if mandal/village match known coordinates (most precise)
  if (mandal) {
    const mandalMatch = Object.entries(MANDAL_COORDS).find(
      ([key]) => key === mNorm || mNorm.includes(key) || key.includes(mNorm)
    )
    if (mandalMatch) {
      const mandalData = mandalMatch[1]
      return {
        name: displayVillage
          ? `${displayVillage}, ${displayMandal || mandalData.name}`
          : `${displayMandal || mandalData.name}, ${displayDistrict}`,
        lat: latitude ?? mandalData.lat,
        lon: longitude ?? mandalData.lon,
        zoom: 14,
        radius: displayVillage ? 350 : 1500,
        popupHtml,
        subtitle: [displayVillage, displayMandal, displayDistrict].filter(Boolean).join(', '),
      }
    }
  }

  // 1. Explicit valid coordinates provided (from farm model or live GPS)
  if (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude > 12 &&
    latitude < 21 &&
    longitude > 76 &&
    longitude < 86
  ) {
    const isTekkaliArea =
      (latitude >= 18.17 && latitude <= 18.21 && longitude >= 83.37 && longitude <= 83.41) ||
      (latitude >= 17.87 && latitude <= 17.92 && longitude >= 83.28 && longitude <= 83.32) ||
      vNorm.includes('tekkali') ||
      mNorm.includes('nelimarla')

    const headerTitle = displayVillage
      ? `${displayVillage}${displayMandal ? ', ' + displayMandal : ''}`
      : displayMandal
        ? `${displayMandal}, ${displayDistrict}`
        : `${displayDistrict}`

    return {
      name: headerTitle,
      lat: latitude,
      lon: longitude,
      zoom: isTekkaliArea ? 15 : 14,
      radius: isTekkaliArea ? 350 : 600,
      popupHtml,
      subtitle: [displayVillage, displayMandal, displayDistrict].filter(Boolean).join(', '),
    }
  }

  // 2. Specific known campus / village locations: Centurion University Tekkali in Nelimarla
  if (vNorm.includes('tekkali') || (dNorm.includes('vizianagaram') && mNorm.includes('nelimarla'))) {
    return {
      name: 'Tekkali, Nellimarla',
      lat: 18.1898,
      lon: 83.3885,
      zoom: 15,
      radius: 350,
      popupHtml,
      subtitle: 'Tekkali, Nellimarla — Vizianagaram',
    }
  }

  if (mNorm.includes('nelimarla')) {
    return {
      name: 'Nellimarla Mandal',
      lat: 18.1667,
      lon: 83.4333,
      zoom: 13,
      radius: 1800,
      popupHtml,
      subtitle: 'Nellimarla, Vizianagaram',
    }
  }

  // 3. District centroid fallback
  const base = matchDistrict(district)
  return {
    name: base.name,
    lat: base.lat,
    lon: base.lon,
    zoom: base.zoom || 12,
    radius: 3000,
    popupHtml,
    subtitle: `${base.name}, Andhra Pradesh`,
  }
}

interface Props {
  activeDistrict?: string | null
  activeState?: string | null
  mandal?: string | null
  village?: string | null
  latitude?: number | null
  longitude?: number | null
  farmName?: string | null
  className?: string
}

export function AndhraPradeshMap({
  activeDistrict,
  activeState,
  mandal,
  village,
  latitude,
  longitude,
  farmName,
  className = '',
}: Props) {
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets')

  const matched = useMemo(() => {
    return resolveMapLocation({
      district: activeDistrict,
      mandal,
      village,
      latitude,
      longitude,
      farmName,
    })
  }, [activeDistrict, mandal, village, latitude, longitude, farmName])

  // Real map HTML using Leaflet with Street & Satellite tile layers
  const mapSrcDoc = useMemo(() => {
    const isSat = mapType === 'satellite'
    const tileUrl = isSat
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const tileAttr = isSat ? '© Esri World Imagery' : '© OpenStreetMap'

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      margin: 0; padding: 0; width: 100%; height: 100%; background: #e8f5e9;
    }
    .custom-marker {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; position: relative;
    }
    .pulse {
      position: absolute; width: 34px; height: 34px; border-radius: 50%;
      background: rgba(21, 128, 61, 0.4); animation: pulse 2s infinite ease-out;
    }
    .pin {
      position: relative; width: 22px; height: 22px; border-radius: 50%;
      background: #15803d; border: 2.5px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 11px;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .leaflet-control-attribution { font-size: 8px !important; background: rgba(255,255,255,0.7) !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${matched.lat}, ${matched.lon}], ${matched.zoom});
    L.tileLayer('${tileUrl}', {
      maxZoom: 18,
      attribution: '${tileAttr}'
    }).addTo(map);

    L.circle([${matched.lat}, ${matched.lon}], {
      color: '#15803d',
      fillColor: '#4ade80',
      fillOpacity: 0.18,
      weight: 2,
      radius: ${matched.radius}
    }).addTo(map);

    var icon = L.divIcon({
      className: 'custom-marker',
      html: '<div class="pulse"></div><div class="pin">🌾</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    var marker = L.marker([${matched.lat}, ${matched.lon}], { icon: icon }).addTo(map);
    marker.bindPopup(${JSON.stringify(matched.popupHtml)}).openPopup();
  </script>
</body>
</html>`
  }, [matched, mapType])

  return (
    <div
      className={`relative flex flex-col bg-white rounded-xl border border-emerald-200 overflow-hidden shadow-sm ${className}`}
      aria-label="Real Andhra Pradesh Farm Location Map"
    >
      {/* Real Map Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/80 border-b border-emerald-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
          <span className="text-xs font-bold text-emerald-900 truncate" title={matched.name}>
            {matched.name}
          </span>
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
            AP
          </span>
        </div>

        {/* Toggle Layer Button */}
        <button
          type="button"
          onClick={() => setMapType((prev) => (prev === 'streets' ? 'satellite' : 'streets'))}
          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded border transition-colors ${
            mapType === 'satellite'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Toggle Satellite / Street Map"
        >
          <Layers className="h-3 w-3" />
          {mapType === 'satellite' ? 'Sat' : 'Map'}
        </button>
      </div>

      {/* Real Leaflet Map iframe */}
      <div className="relative w-full h-[220px] bg-emerald-50">
        <iframe
          key={`${matched.lat}-${matched.lon}-${mapType}`}
          srcDoc={mapSrcDoc}
          title={`Real Map of ${matched.name}`}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50/90 border-t border-neutral-100 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1 truncate mr-2" title={`Real-time GIS: ${matched.subtitle}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span className="truncate">Real-time GIS: {matched.name}</span>
        </span>
        <span className="text-emerald-700 font-medium shrink-0">Andhra Pradesh</span>
      </div>
    </div>
  )
}
