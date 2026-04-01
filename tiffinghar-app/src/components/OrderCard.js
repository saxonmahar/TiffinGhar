import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useApp } from '../context/AppContext'
import RatingModal from './RatingModal'

const statusColors = {
  pending:   { bg: '#f3f4f6', text: '#6b7280' },
  confirmed: { bg: '#fef9c3', text: '#854d0e' },
  preparing: { bg: '#FAEEDA', text: '#854F0B' },
  onway:     { bg: '#E6F1FB', text: '#185FA5' },
  delivered: { bg: '#EAF3DE', text: '#3B6D11' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
}

const steps = { en: ['Ordered', 'Preparing', 'On way', 'Delivered'], ne: ['अर्डर', 'तयार', 'बाटोमा', 'डेलिभर'] }

export default function OrderCard({ order }) {
  const { lang, reorder } = useApp()
  const [showRating, setShowRating] = useState(false)
  const isActive = order.status === 'preparing' || order.status === 'onway' || order.status === 'confirmed'
  const sc = statusColors[order.status] || statusColors.pending

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.title} numberOfLines={1}>
              {lang === 'ne' ? order.cookNameNe : order.cookName} · {lang === 'ne' ? order.itemNe : order.item}
            </Text>
            <Text style={styles.time}>
              {lang === 'ne' ? order.dateNe : order.date} · {order.orderedAt}
              {isActive ? ` · Est. ${order.estimatedAt}` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>
              {lang === 'ne' ? order.statusLabelNe : order.statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.detail}>
          {order.qty}x {lang === 'ne' ? order.itemNe : order.item} · Rs. {order.price}
        </Text>

        {isActive && (
          <View style={styles.progressSection}>
            <View style={styles.stepLabels}>
              {steps[lang === 'ne' ? 'ne' : 'en'].map((s, i) => (
                <Text key={i} style={[styles.stepLabel, order.progress >= (i + 1) * 25 && styles.stepLabelActive]}>
                  {s}
                </Text>
              ))}
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${order.progress}%` }]} />
            </View>
          </View>
        )}

        {order.status === 'delivered' && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => reorder(order)}>
              <Text style={styles.actionBtn}>🔄 {lang === 'ne' ? 'फेरि अर्डर' : 'Reorder'}</Text>
            </TouchableOpacity>
            {!order.rated ? (
              <TouchableOpacity onPress={() => setShowRating(true)}>
                <Text style={styles.rateBtn}>⭐ {lang === 'ne' ? 'रेटिङ दिनुस्' : 'Rate meal'}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.ratedText}>{'⭐'.repeat(order.rating)} {lang === 'ne' ? 'रेट गरियो' : 'Rated'}</Text>
            )}
          </View>
        )}
      </View>
      {showRating && <RatingModal order={order} onClose={() => setShowRating(false)} />}
    </>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: '#e5e7eb', padding: 14, marginBottom: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 14, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '500' },
  detail: { fontSize: 12, color: '#6b7280' },
  progressSection: { marginTop: 10 },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  stepLabel: { fontSize: 10, color: '#d1d5db' },
  stepLabelActive: { color: '#C0392B', fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C0392B', borderRadius: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#f3f4f6' },
  actionBtn: { fontSize: 12, color: '#C0392B', fontWeight: '600' },
  rateBtn: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  ratedText: { fontSize: 12, color: '#9ca3af' },
})
