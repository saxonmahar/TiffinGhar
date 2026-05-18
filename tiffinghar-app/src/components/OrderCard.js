import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useApp } from '../context/AppContext'
import RatingModal from './RatingModal'

const STATUS = {
  pending:   { bg: '#fef9c3', text: '#854d0e', label: 'Pending',   dot: '#ca8a04' },
  confirmed: { bg: '#dbeafe', text: '#1d4ed8', label: 'Confirmed', dot: '#2563eb' },
  preparing: { bg: '#fff7ed', text: '#c2410c', label: 'Preparing', dot: '#ea580c' },
  onway:     { bg: '#ede9fe', text: '#6d28d9', label: 'On the way',dot: '#7c3aed' },
  delivered: { bg: '#dcfce7', text: '#15803d', label: 'Delivered', dot: '#16a34a' },
  cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled', dot: '#dc2626' },
}

const STEPS = ['Ordered', 'Preparing', 'On way', 'Delivered']
const STEPS_NE = ['अर्डर', 'तयार', 'बाटोमा', 'डेलिभर']

export default function OrderCard({ order, onUpdate, onTrack }) {
  const { lang, reorder } = useApp()
  const [showRating, setShowRating] = useState(false)

  const isActive = ['pending', 'confirmed', 'preparing', 'onway'].includes(order.status)
  const sc = STATUS[order.status] || STATUS.pending
  const progress = order.progress || 0

  return (
    <>
      <View style={s.card}>
        {/* Status bar at top */}
        <View style={[s.statusBar, { backgroundColor: sc.bg }]}>
          <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
          <Text style={[s.statusText, { color: sc.text }]}>
            {lang === 'ne' ? order.statusLabelNe : order.statusLabel || sc.label}
          </Text>
          <Text style={s.orderTime}>{lang === 'ne' ? order.dateNe : order.date} · {order.orderedAt}</Text>
        </View>

        <View style={s.body}>
          {/* Cook + item */}
          <View style={s.topRow}>
            <View style={s.cookAvatar}>
              <Text style={s.cookAvatarText}>👨‍🍳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cookName} numberOfLines={1}>
                {lang === 'ne' ? order.cookNameNe : order.cookName}
              </Text>
              <Text style={s.itemName} numberOfLines={1}>
                {order.qty}× {lang === 'ne' ? order.itemNe : order.item}
              </Text>
            </View>
            <Text style={s.price}>Rs. {order.price || order.total}</Text>
          </View>

          {/* ETA for active orders */}
          {isActive && order.estimatedAt && (
            <View style={s.etaRow}>
              <Text style={s.etaIcon}>🕐</Text>
              <Text style={s.etaText}>
                {lang === 'ne' ? 'अनुमानित' : 'Estimated delivery'}: <Text style={s.etaTime}>{order.estimatedAt}</Text>
              </Text>
            </View>
          )}

          {/* Progress tracker */}
          {isActive && (
            <View style={s.progressSection}>
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={s.stepsRow}>
                {(lang === 'ne' ? STEPS_NE : STEPS).map((step, i) => (
                  <Text key={i} style={[s.stepLabel, progress >= (i + 1) * 25 && s.stepLabelActive]}>
                    {step}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Address */}
          {order.address && (
            <Text style={s.address} numberOfLines={1}>📍 {order.address}</Text>
          )}

          {/* Actions */}
          <View style={s.actions}>
            {isActive && onTrack && (
              <TouchableOpacity style={s.trackBtn} onPress={onTrack}>
                <Text style={s.trackBtnText}>🗺️ {lang === 'ne' ? 'ट्र्याक' : 'Track Order'}</Text>
              </TouchableOpacity>
            )}
            {order.status === 'delivered' && (
              <>
                <TouchableOpacity style={s.reorderBtn} onPress={() => reorder(order)}>
                  <Text style={s.reorderBtnText}>🔄 {lang === 'ne' ? 'फेरि अर्डर' : 'Reorder'}</Text>
                </TouchableOpacity>
                {!order.rated ? (
                  <TouchableOpacity style={s.rateBtn} onPress={() => setShowRating(true)}>
                    <Text style={s.rateBtnText}>⭐ {lang === 'ne' ? 'रेट गर्नुस्' : 'Rate'}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.ratedBadge}>
                    <Text style={s.ratedText}>{'⭐'.repeat(order.rating || 5)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      {showRating && <RatingModal order={order} onClose={() => setShowRating(false)} />}
    </>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700', flex: 1 },
  orderTime: { fontSize: 11, color: '#9ca3af' },
  body: { padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cookAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FAECE7', alignItems: 'center', justifyContent: 'center' },
  cookAvatarText: { fontSize: 20 },
  cookName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  itemName: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  price: { fontSize: 16, fontWeight: '800', color: '#C0392B' },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', borderRadius: 10, padding: 8, marginBottom: 12 },
  etaIcon: { fontSize: 14 },
  etaText: { fontSize: 12, color: '#374151' },
  etaTime: { fontWeight: '700', color: '#16a34a' },
  progressSection: { marginBottom: 10 },
  progressBg: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#C0392B', borderRadius: 4 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepLabel: { fontSize: 10, color: '#d1d5db', fontWeight: '500' },
  stepLabelActive: { color: '#C0392B', fontWeight: '700' },
  address: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  trackBtn: { flex: 1, backgroundColor: '#eff6ff', borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' },
  trackBtnText: { fontSize: 13, color: '#2563eb', fontWeight: '700' },
  reorderBtn: { flex: 1, backgroundColor: '#FAECE7', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  reorderBtnText: { fontSize: 13, color: '#C0392B', fontWeight: '700' },
  rateBtn: { flex: 1, backgroundColor: '#fef9c3', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  rateBtnText: { fontSize: 13, color: '#854d0e', fontWeight: '700' },
  ratedBadge: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ratedText: { fontSize: 14 },
})
