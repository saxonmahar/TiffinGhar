import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { SOCKET_URL } from '../api/client'
import { useApp } from '../context/AppContext'

const STEPS = [
  { key: 'pending',   label: 'Order Placed',    labelNe: 'अर्डर राखियो',    icon: '📋', progress: 10 },
  { key: 'confirmed', label: 'Confirmed',        labelNe: 'स्वीकृत भयो',     icon: '✅', progress: 25 },
  { key: 'preparing', label: 'Preparing',        labelNe: 'तयार हुँदैछ',     icon: '👩‍🍳', progress: 50 },
  { key: 'onway',     label: 'On the Way',       labelNe: 'बाटोमा छ',        icon: '🛵', progress: 80 },
  { key: 'delivered', label: 'Delivered',        labelNe: 'डेलिभर भयो',      icon: '🎉', progress: 100 },
]

const getMapHTML = (cookLat, cookLng, userLat, userLng) => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>* { margin:0; padding:0; } #map { width:100vw; height:100vh; }</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${cookLat || 27.7172}, ${cookLng || 85.3240}], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  var cookIcon = L.divIcon({ className:'', html:'<div style="background:#C0392B;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">👩‍🍳</div>', iconSize:[36,36], iconAnchor:[18,18] });
  var riderIcon = L.divIcon({ className:'', html:'<div style="background:#2563eb;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🛵</div>', iconSize:[36,36], iconAnchor:[18,18] });
  var homeIcon = L.divIcon({ className:'', html:'<div style="background:#16a34a;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏠</div>', iconSize:[36,36], iconAnchor:[18,18] });

  L.marker([${cookLat || 27.7172}, ${cookLng || 85.3240}], {icon: cookIcon}).addTo(map).bindPopup('👩‍🍳 Cook Location');
  ${userLat ? `L.marker([${userLat}, ${userLng}], {icon: homeIcon}).addTo(map).bindPopup('🏠 Your Location');` : ''}

  // Draw route line
  ${cookLat && userLat ? `L.polyline([[${cookLat},${cookLng}],[${userLat},${userLng}]], {color:'#C0392B', weight:3, dashArray:'8,6', opacity:0.7}).addTo(map);
  map.fitBounds([[${cookLat},${cookLng}],[${userLat},${userLng}]], {padding:[40,40]});` : ''}
</script>
</body>
</html>`

export default function LiveTrackingScreen({ order, onClose }) {
  const { lang } = useApp()
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'pending')
  const [progress, setProgress] = useState(order?.progress || 10)
  const progressAnim = useRef(new Animated.Value(order?.progress || 10)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Pulse animation for active step
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start()
  }, [progress])

  // Connect to socket for real-time updates
  useEffect(() => {
    if (!order?._id) return
    try {
      const { io } = require('socket.io-client')
      const socket = io(SOCKET_URL, { transports: ['websocket'] })
      socket.emit('join_order', order._id)
      socket.on('order_update', (data) => {
        if (data.orderId === order._id) {
          setCurrentStatus(data.status)
          setProgress(data.progress || progress)
        }
      })
      return () => socket.disconnect()
    } catch {}
  }, [order?._id])

  const currentStepIdx = STEPS.findIndex(s => s.key === currentStatus)
  const eta = currentStatus === 'onway' ? '10-15 min' : currentStatus === 'preparing' ? '20-30 min' : currentStatus === 'delivered' ? 'Delivered!' : '30-45 min'

  const cookLat = order?.cook?.location?.lat || 27.7172
  const cookLng = order?.cook?.location?.lng || 85.3240

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{lang === 'ne' ? 'लाइभ ट्र्याकिङ' : 'Live Tracking'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={s.mapWrap}>
          <WebView
            source={{ html: getMapHTML(cookLat, cookLng, null, null) }}
            style={s.map}
            javaScriptEnabled
            scrollEnabled={false}
          />
          {/* ETA overlay */}
          <View style={s.etaOverlay}>
            <Text style={s.etaLabel}>{lang === 'ne' ? 'अनुमानित समय' : 'Estimated Time'}</Text>
            <Text style={s.etaValue}>{eta}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={s.progressSection}>
          <View style={s.progressBg}>
            <Animated.View style={[s.progressFill, {
              width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })
            }]} />
          </View>
          <Text style={s.progressText}>{progress}%</Text>
        </View>

        {/* Steps */}
        <View style={s.stepsWrap}>
          {STEPS.map((step, i) => {
            const isDone = i < currentStepIdx
            const isActive = i === currentStepIdx
            const isPending = i > currentStepIdx
            return (
              <View key={step.key} style={s.stepRow}>
                {/* Line */}
                <View style={s.stepLineWrap}>
                  <Animated.View style={[
                    s.stepDot,
                    isDone && s.stepDotDone,
                    isActive && s.stepDotActive,
                    isPending && s.stepDotPending,
                    isActive && { transform: [{ scale: pulseAnim }] },
                  ]}>
                    <Text style={s.stepDotIcon}>{isDone ? '✓' : step.icon}</Text>
                  </Animated.View>
                  {i < STEPS.length - 1 && (
                    <View style={[s.stepLine, isDone && s.stepLineDone]} />
                  )}
                </View>
                {/* Content */}
                <View style={s.stepContent}>
                  <Text style={[s.stepLabel, isActive && s.stepLabelActive, isPending && s.stepLabelPending]}>
                    {lang === 'ne' ? step.labelNe : step.label}
                  </Text>
                  {isActive && (
                    <Text style={s.stepSub}>
                      {lang === 'ne' ? 'अहिले यो चरणमा छ' : 'Currently at this stage'}
                    </Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>

        {/* Order details */}
        <View style={s.orderDetails}>
          <Text style={s.detailsTitle}>{lang === 'ne' ? 'अर्डर विवरण' : 'Order Details'}</Text>
          <View style={s.detailRow}>
            <Text style={s.detailKey}>{lang === 'ne' ? 'पकाउने' : 'Cook'}</Text>
            <Text style={s.detailVal}>{order?.cookName || 'Cook'}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailKey}>{lang === 'ne' ? 'खाना' : 'Items'}</Text>
            <Text style={s.detailVal}>{order?.item || order?.items?.map(i => i.name).join(', ')}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailKey}>{lang === 'ne' ? 'जम्मा' : 'Total'}</Text>
            <Text style={[s.detailVal, { color: '#C0392B', fontWeight: '700' }]}>Rs. {order?.price || order?.total}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailKey}>{lang === 'ne' ? 'भुक्तानी' : 'Payment'}</Text>
            <Text style={s.detailVal}>{order?.paymentMethod || 'Cash'}</Text>
          </View>
        </View>

        {/* Help */}
        <TouchableOpacity style={s.helpBtn}>
          <Text style={s.helpBtnText}>💬 {lang === 'ne' ? 'सहयोग चाहिन्छ?' : 'Need help?'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#374151', lineHeight: 26 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  mapWrap: { height: 220, position: 'relative' },
  map: { flex: 1 },
  etaOverlay: { position: 'absolute', bottom: 12, left: 12, backgroundColor: '#fff', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  etaLabel: { fontSize: 10, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' },
  etaValue: { fontSize: 18, fontWeight: '800', color: '#C0392B' },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  progressBg: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C0392B', borderRadius: 4 },
  progressText: { fontSize: 13, fontWeight: '700', color: '#C0392B', width: 36 },
  stepsWrap: { padding: 20, backgroundColor: '#fff', marginTop: 8 },
  stepRow: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  stepLineWrap: { alignItems: 'center', width: 36 },
  stepDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepDotDone: { backgroundColor: '#16a34a' },
  stepDotActive: { backgroundColor: '#C0392B', shadowColor: '#C0392B', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  stepDotPending: { backgroundColor: '#f3f4f6' },
  stepDotIcon: { fontSize: 16 },
  stepLine: { width: 2, flex: 1, backgroundColor: '#f3f4f6', marginVertical: 2, minHeight: 24 },
  stepLineDone: { backgroundColor: '#16a34a' },
  stepContent: { flex: 1, paddingTop: 8, paddingBottom: 16 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  stepLabelActive: { color: '#C0392B', fontSize: 15, fontWeight: '700' },
  stepLabelPending: { color: '#9ca3af' },
  stepSub: { fontSize: 12, color: '#C0392B', marginTop: 2 },
  orderDetails: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  detailsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f9fafb' },
  detailKey: { fontSize: 13, color: '#6b7280' },
  detailVal: { fontSize: 13, color: '#111827', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  helpBtn: { margin: 16, backgroundColor: '#f9fafb', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 32 },
  helpBtnText: { fontSize: 14, color: '#374151', fontWeight: '600' },
})
