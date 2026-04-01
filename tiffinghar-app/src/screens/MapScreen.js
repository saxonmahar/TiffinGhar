import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { WebView } from 'react-native-webview'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'

const getMapHTML = (cooks, userLat, userLng) => {
  const markers = cooks.map(c => {
    const lat = c.location?.lat || 27.7172
    const lng = c.location?.lng || 85.3240
    const name = c.name || 'Cook'
    const price = c.price || 150
    const rating = c.rating || 4.5
    return `L.marker([${lat}, ${lng}], {icon: cookIcon})
      .addTo(map)
      .bindPopup('<b>${name}</b><br>⭐ ${rating} · Rs. ${price}/meal<br><small>${c.location?.area || 'Kathmandu'}</small>')`
  }).join(';\n')

  const userMarker = userLat ? `L.marker([${userLat}, ${userLng}], {icon: userIcon}).addTo(map).bindPopup('📍 You are here')` : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    #map { width: 100vw; height: 100vh; }
    .cook-marker { background: #C0392B; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .user-marker { background: #2563eb; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .leaflet-popup-content { font-family: -apple-system, sans-serif; font-size: 13px; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${userLat || 27.7172}, ${userLng || 85.3240}], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(map);

  var cookIcon = L.divIcon({ className: '', html: '<div class="cook-marker">🍱</div>', iconSize: [32,32], iconAnchor: [16,16] });
  var userIcon = L.divIcon({ className: '', html: '<div class="user-marker">📍</div>', iconSize: [28,28], iconAnchor: [14,14] });

  ${markers}
  ${userMarker}

  map.on('click', function(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
  });
</script>
</body>
</html>`
}

export default function MapScreen({ onClose, onSelectLocation }) {
  const { lang, cooks } = useApp()
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPin, setSelectedPin] = useState(null)
  const webviewRef = useRef(null)

  useEffect(() => {
    // Try to get location via expo-location
    import('expo-location').then(async (Location) => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })
        }
      } catch {}
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredCooks = cooks.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name?.toLowerCase().includes(q) || c.location?.area?.toLowerCase().includes(q) || c.specialties?.some(s => s.toLowerCase().includes(q))
  })

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      setSelectedPin(data)
      onSelectLocation?.(data)
    } catch {}
  }

  const mapHTML = getMapHTML(filteredCooks, userLocation?.lat, userLocation?.lng)

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Text style={s.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={s.title}>{lang === 'ne' ? 'नजिकका पकाउने' : 'Cooks Near You'}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={lang === 'ne' ? 'ठाउँ वा खाना खोज्नुस्...' : 'Search area or food...'}
          placeholderTextColor="#9ca3af"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: '#9ca3af' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map */}
      <View style={s.mapWrap}>
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color="#C0392B" size="large" />
            <Text style={s.loadingText}>{lang === 'ne' ? 'नक्सा लोड हुँदैछ...' : 'Loading map...'}</Text>
          </View>
        ) : (
          <WebView
            ref={webviewRef}
            source={{ html: mapHTML }}
            style={s.webview}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={s.loadingBox}>
                <ActivityIndicator color="#C0392B" />
              </View>
            )}
          />
        )}
      </View>

      {/* Cook count */}
      <View style={s.footer}>
        <Text style={s.footerText}>
          🍱 {filteredCooks.length} {lang === 'ne' ? 'पकाउने नजिकमा' : 'cooks nearby'}
        </Text>
        {selectedPin && (
          <Text style={s.pinText}>📍 {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)}</Text>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, color: '#374151' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  mapWrap: { flex: 1 },
  webview: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6b7280' },
  footer: { padding: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  pinText: { fontSize: 11, color: '#9ca3af' },
})
