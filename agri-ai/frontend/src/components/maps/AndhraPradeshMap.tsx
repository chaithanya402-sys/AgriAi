/**
 * Andhra Pradesh district SVG map.
 * Highlights the active district and shows a pin at approximate centroid.
 * Does NOT display lat/lon to the user.
 */
import React, { useMemo } from 'react'

// Approximate district centroids (normalised to 0-1 within AP bounding box)
// Bounding box: lat 12.6–19.1, lon 76.8–84.8
const AP_BOUNDS = { latMin: 12.6, latMax: 19.1, lonMin: 76.8, lonMax: 84.8 }
const SVG_W = 220
const SVG_H = 320

function toSVG(lat: number, lon: number) {
  const x = ((lon - AP_BOUNDS.lonMin) / (AP_BOUNDS.lonMax - AP_BOUNDS.lonMin)) * SVG_W
  const y = ((AP_BOUNDS.latMax - lat) / (AP_BOUNDS.latMax - AP_BOUNDS.latMin)) * SVG_H
  return { x, y }
}

interface DistrictInfo {
  name: string
  lat: number
  lon: number
}

const DISTRICTS: DistrictInfo[] = [
  { name: 'Srikakulam',                     lat: 18.3, lon: 83.9 },
  { name: 'Vizianagaram',                   lat: 18.1, lon: 83.4 },
  { name: 'Visakhapatnam',                  lat: 17.7, lon: 83.2 },
  { name: 'Anakapalli',                     lat: 17.7, lon: 82.9 },
  { name: 'Alluri Sitharama Raju (ASR)',    lat: 17.8, lon: 82.0 },
  { name: 'Parvathipuram Manyam',           lat: 18.8, lon: 83.5 },
  { name: 'Kakinada',                       lat: 17.0, lon: 82.2 },
  { name: 'East Godavari',                  lat: 17.3, lon: 82.0 },
  { name: 'Dr. B.R. Ambedkar Konaseema',    lat: 16.9, lon: 81.9 },
  { name: 'West Godavari',                  lat: 16.9, lon: 81.3 },
  { name: 'Eluru',                          lat: 16.7, lon: 81.1 },
  { name: 'NTR District',                   lat: 16.5, lon: 80.6 },
  { name: 'Krishna',                        lat: 16.4, lon: 81.0 },
  { name: 'Guntur',                         lat: 16.3, lon: 80.4 },
  { name: 'Palnadu',                        lat: 16.2, lon: 79.6 },
  { name: 'Bapatla',                        lat: 15.9, lon: 80.5 },
  { name: 'Nellore (SPSR Nellore)',         lat: 14.4, lon: 79.9 },
  { name: 'Prakasam',                       lat: 15.3, lon: 79.6 },
  { name: 'Tirupati',                       lat: 13.6, lon: 79.4 },
  { name: 'Chittoor',                       lat: 13.2, lon: 79.1 },
  { name: 'Annamayya',                      lat: 13.9, lon: 78.9 },
  { name: 'YSR Kadapa',                     lat: 14.5, lon: 78.8 },
  { name: 'Kurnool',                        lat: 15.8, lon: 78.0 },
  { name: 'Nandyal',                        lat: 15.5, lon: 78.5 },
  { name: 'Sri Sathya Sai',                 lat: 14.2, lon: 77.8 },
  { name: 'Ananthapuramu',                  lat: 14.7, lon: 77.6 },
]

function normalise(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function matchDistrict(active: string | null | undefined): DistrictInfo | null {
  if (!active) return null
  const q = normalise(active)
  return DISTRICTS.find((d) => normalise(d.name).includes(q) || q.includes(normalise(d.name))) ?? null
}

interface Props {
  activeDistrict?: string | null
  className?: string
}

export function AndhraPradeshMap({ activeDistrict, className = '' }: Props) {
  const matched = useMemo(() => matchDistrict(activeDistrict), [activeDistrict])
  const pin = matched ? toSVG(matched.lat, matched.lon) : null

  return (
    <div className={`relative ${className}`} aria-label="Andhra Pradesh map">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="100%"
        style={{ maxHeight: 320 }}
      >
        {/* AP state outline (simplified polygon) */}
        <polygon
          points="
            80,2  130,5  160,20  190,45  210,80
            215,120 210,155 200,185 205,210
            195,240 175,265 160,285 140,310
            115,318 90,312  65,295  50,270
            40,245  30,220  20,195  15,170
            10,140  15,110  25,85   40,60
            55,35   70,15   80,2
          "
          fill="#c8e6c9"
          stroke="#4caf50"
          strokeWidth="1.5"
        />

        {/* District dots */}
        {DISTRICTS.map((d) => {
          const pos = toSVG(d.lat, d.lon)
          const isActive = matched?.name === d.name
          return (
            <circle
              key={d.name}
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 0 : 3}
              fill="transparent"
            />
          )
        })}

        {/* Active district highlight circle */}
        {matched && pin && (
          <>
            <circle
              cx={pin.x}
              cy={pin.y}
              r={28}
              fill="#15803d"
              fillOpacity={0.25}
              stroke="#15803d"
              strokeWidth="1"
            />
            <circle
              cx={pin.x}
              cy={pin.y}
              r={18}
              fill="#15803d"
              fillOpacity={0.4}
            />
          </>
        )}

        {/* Pin */}
        {pin && (
          <g transform={`translate(${pin.x - 8}, ${pin.y - 22})`}>
            {/* pin body */}
            <path
              d="M8 0 C3.6 0 0 3.6 0 8 C0 13.6 8 22 8 22 C8 22 16 13.6 16 8 C16 3.6 12.4 0 8 0Z"
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            <circle cx="8" cy="8" r="3.5" fill="white" />
          </g>
        )}

        {/* District label */}
        {matched && pin && (
          <text
            x={pin.x}
            y={pin.y + 28}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#14532d"
          >
            {matched.name.length > 18 ? matched.name.slice(0, 16) + '…' : matched.name}
          </text>
        )}

        {/* Fallback label when no district selected */}
        {!matched && (
          <text
            x={SVG_W / 2}
            y={SVG_H / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            Andhra Pradesh
          </text>
        )}
      </svg>
    </div>
  )
}
