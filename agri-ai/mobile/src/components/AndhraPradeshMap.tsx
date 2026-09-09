import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { colors } from '../theme/colors'
import { MapPin, Layers, Crosshair } from 'lucide-react-native'

interface DistrictCoord {
  name: string
  lat: number
  lon: number
  zoom?: number
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

// Fallback to Andhra Pradesh geographic center
const DEFAULT_AP: DistrictCoord = {
  name: 'Andhra Pradesh',
  lat: 15.9129,
  lon: 79.7400,
  zoom: 7,
}

function normalizeKey(str?: string | null): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function resolveCoordinates(
  district?: string | null,
  latProp?: number | null,
  lonProp?: number | null,
  mandalProp?: string | null,
  villageProp?: string | null
): DistrictCoord {
  const norm = normalizeKey(district)
  const vNorm = (villageProp || '').toLowerCase().trim()
  const mNorm = (mandalProp || '').toLowerCase().trim().replace('ll', 'l')

  // Explicit coordinates
  if (latProp && lonProp && latProp > 12 && latProp < 21 && lonProp > 76 && lonProp < 86) {
    const isTekkali =
      (latProp >= 18.17 && latProp <= 18.21 && lonProp >= 83.37 && lonProp <= 83.41) ||
      (latProp >= 17.87 && latProp <= 17.92 && lonProp >= 83.28 && lonProp <= 83.32) ||
      vNorm.includes('tekkali') ||
      mNorm.includes('nelimarla')

    return {
      name: villageProp ? `${villageProp}, ${mandalProp || district}` : (district || 'Farm Location'),
      lat: latProp,
      lon: lonProp,
      zoom: isTekkali ? 15 : 14,
    }
  }

  // Known Tekkali / Centurion University
  if (vNorm.includes('tekkali') || (norm.includes('vizianagaram') && mNorm.includes('nelimarla'))) {
    return {
      name: 'Tekkali, Nellimarla',
      lat: 18.1898,
      lon: 83.3885,
      zoom: 15,
    }
  }

  // Direct match in dictionary
  if (norm && DISTRICT_COORDS[norm]) {
    const base = DISTRICT_COORDS[norm]
    return {
      name: base.name,
      lat: latProp && Math.abs(latProp - base.lat) < 2.0 ? latProp : base.lat,
      lon: lonProp && Math.abs(lonProp - base.lon) < 2.0 ? lonProp : base.lon,
      zoom: base.zoom || 12,
    }
  }

  // Partial match in dictionary
  for (const [key, val] of Object.entries(DISTRICT_COORDS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return {
        name: val.name,
        lat: latProp && Math.abs(latProp - val.lat) < 2.0 ? latProp : val.lat,
        lon: lonProp && Math.abs(lonProp - val.lon) < 2.0 ? lonProp : val.lon,
        zoom: val.zoom || 12,
      }
    }
  }

  return DEFAULT_AP
}

interface AndhraPradeshMapProps {
  activeDistrict?: string | null
  activeState?: string | null
  mandal?: string | null
  village?: string | null
  farmName?: string | null
  latitude?: number | null
  longitude?: number | null
}

export function AndhraPradeshMap({
  activeDistrict,
  activeState,
  mandal,
  village,
  farmName,
  latitude,
  longitude,
}: AndhraPradeshMapProps) {
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets')
  const [loading, setLoading] = useState(true)
  const webViewRef = useRef<WebView>(null)

  const target = useMemo(
    () => resolveCoordinates(activeDistrict, latitude, longitude, mandal, village),
    [activeDistrict, latitude, longitude, mandal, village]
  )

  const displayName = farmName ? `${farmName} (${target.name})` : target.name

  // Build the Leaflet real map HTML
  const mapHtml = useMemo(() => {
    const isSat = mapType === 'satellite'
    const tileUrl = isSat
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const tileAttr = isSat ? '© Esri World Imagery' : '© OpenStreetMap'

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #E8F5E9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .leaflet-control-attribution {
      font-size: 8px !important;
      background: rgba(255, 255, 255, 0.8) !important;
      padding: 1px 4px !important;
    }
    .custom-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      position: relative;
    }
    .pulse-ring {
      position: absolute;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(30, 122, 58, 0.35);
      animation: pulse 2s infinite ease-out;
    }
    .marker-dot {
      position: relative;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #1E7A3A;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: bold;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .farm-popup .leaflet-popup-content-wrapper {
      background: #FFFFFF;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      padding: 4px;
    }
    .farm-popup .leaflet-popup-content {
      margin: 8px 10px;
      font-size: 13px;
      font-weight: 700;
      color: #14532D;
      text-align: center;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var currentLat = ${target.lat};
    var currentLon = ${target.lon};
    var currentZoom = ${target.zoom};
    var targetName = "${target.name}";

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([currentLat, currentLon], currentZoom);

    L.tileLayer('${tileUrl}', {
      maxZoom: 18,
      attribution: '${tileAttr}'
    }).addTo(map);

    // District focus radius circle
    var circle = L.circle([currentLat, currentLon], {
      color: '#1E7A3A',
      fillColor: '#46C05B',
      fillOpacity: 0.15,
      weight: 2,
      radius: 4000
    }).addTo(map);

    // Custom Farm Pin Marker
    var farmIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div class="pulse-ring"></div><div class="marker-dot">🌾</div>',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    var marker = L.marker([currentLat, currentLon], { icon: farmIcon }).addTo(map);
    marker.bindPopup(targetName).openPopup();

    function updateLocation(lat, lon, zoom, name) {
      currentLat = lat;
      currentLon = lon;
      currentZoom = zoom;
      targetName = name;

      map.flyTo([lat, lon], zoom, { duration: 1.2 });
      marker.setLatLng([lat, lon]);
      circle.setLatLng([lat, lon]);
      marker.setPopupContent(name).openPopup();
    }
  </script>
</body>
</html>`
  }, [target.lat, target.lon, target.zoom, target.name, mapType])

  // Smoothly fly to new farm location when props change
  useEffect(() => {
    if (webViewRef.current) {
      const code = `if (typeof updateLocation === 'function') { updateLocation(${target.lat}, ${target.lon}, ${target.zoom}, "${target.name}"); } true;`
      webViewRef.current.injectJavaScript(code)
    }
  }, [target.lat, target.lon, target.zoom, target.name])

  const handleRecenter = () => {
    if (webViewRef.current) {
      const code = `map.flyTo([${target.lat}, ${target.lon}], ${target.zoom}, { duration: 0.8 }); true;`
      webViewRef.current.injectJavaScript(code)
    }
  }

  const toggleLayer = () => {
    setMapType((prev) => (prev === 'streets' ? 'satellite' : 'streets'))
  }

  return (
    <View style={styles.container}>
      {/* Interactive Map Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.titleGroup}>
          <MapPin size={16} color={colors.brand} />
          <Text style={styles.districtHeading} numberOfLines={1}>
            {target.name} District
          </Text>
          <Text style={styles.stateTag}>{activeState || 'Andhra Pradesh'}</Text>
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={[styles.actionBtn, mapType === 'satellite' && styles.actionBtnActive]}
            onPress={toggleLayer}
            activeOpacity={0.7}
          >
            <Layers size={14} color={mapType === 'satellite' ? '#FFFFFF' : colors.brand} />
            <Text
              style={[
                styles.actionText,
                mapType === 'satellite' && styles.actionTextActive,
              ]}
            >
              {mapType === 'satellite' ? 'Satellite' : 'Map'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleRecenter}
            activeOpacity={0.7}
          >
            <Crosshair size={15} color={colors.brand} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Real Map View */}
      <View style={styles.mapWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          originWhitelist={['*']}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.brand} />
            <Text style={styles.loadingText}>Loading {target.name} Map...</Text>
          </View>
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footerBar}>
        <View style={styles.liveIndicator} />
        <Text style={styles.footerText}>
          Real-time GIS · Centered on {displayName}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    overflow: 'hidden',
    marginVertical: 4,
    shadowColor: '#101C17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  districtHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532D',
  },
  stateTag: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  actionBtnActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
  },
  actionTextActive: {
    color: '#FFFFFF',
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E8F5E9',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(240, 253, 244, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFDFB',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  liveIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.brand,
    marginRight: 6,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
})
