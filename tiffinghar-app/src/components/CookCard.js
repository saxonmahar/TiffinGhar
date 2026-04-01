import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { useApp } from '../context/AppContext'

const badgeColors = {
  green:   { bg: '#EAF3DE', text: '#3B6D11' },
  blue:    { bg: '#E6F1FB', text: '#185FA5' },
  default: { bg: '#FAECE7', text: '#993C1D' },
}

const getBadgeColor = (badge) => {
  if (badge && typeof badge === 'object' && badge.type) return badgeColors[badge.type] || badgeColors.default
  if (typeof badge === 'string') {
    const lower = badge.toLowerCase()
    if (lower.includes('verified') || lower.includes('organic') || lower.includes('veg')) return badgeColors.green
    if (lower.includes('special') || lower.includes('thakali') || lower.includes('newari')) return badgeColors.blue
  }
  return badgeColors.default
}

const getBadgeLabel = (badge, lang) => {
  if (badge && typeof badge === 'object') return lang === 'ne' ? (badge.labelNe || badge.label) : badge.label
  return badge || ''
}

export default function CookCard({ cook, onPress, onAddToCart }) {
  const { lang, addToCart, toggleSaveCook } = useApp()
  const meals = (lang === 'ne' ? cook.mealsNe : cook.meals) || []
  const badges = cook.badges || []

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(cook)} activeOpacity={0.85}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: cook.avatarBg || '#FAECE7' }]}>
          <Text style={s.avatarText}>{cook.avatar || '👨‍🍳'}</Text>
        </View>
        <View style={s.headerInfo}>
          <View style={s.nameRow}>
            <Text style={s.name} numberOfLines={1}>{lang === 'ne' ? cook.nameNe : cook.name}</Text>
            <TouchableOpacity onPress={() => toggleSaveCook(cook.id || cook._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.heart}>{cook.saved ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.meta} numberOfLines={1}>
            {(() => {
              const loc = cook.location
              const locStr = typeof loc === 'string' ? loc : (loc?.area || loc?.address || loc?.city || 'Kathmandu')
              return `${locStr} · ${cook.distance || '1 km'} · ⭐ ${cook.rating || 4.5} (${cook.reviews || cook.totalReviews || 0})`
            })()}
          </Text>
        </View>
      </View>

      {!cook.available && cook.isOpen === false && (
        <View style={s.unavailableBadge}>
          <Text style={s.unavailableText}>⏸ {lang === 'ne' ? 'अहिले उपलब्ध छैन' : 'Not available now'}</Text>
        </View>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <View style={s.badgeRow}>
          {badges.map((b, i) => {
            const c = getBadgeColor(b)
            return (
              <View key={i} style={[s.badge, { backgroundColor: c.bg }]}>
                <Text style={[s.badgeText, { color: c.text }]}>
                  {getBadgeLabel(b, lang)}
                </Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Meals */}
      {meals.length > 0 && (
        <View style={s.mealRow}>
          {meals.slice(0, 3).map((m, i) => (
            <View key={i} style={s.mealPill}>
              <Text style={s.mealText}>{m}</Text>
            </View>
          ))}
          {meals.length > 3 && (
            <View style={s.mealPill}>
              <Text style={s.mealText}>+{meals.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Price + CTA */}
      <View style={s.priceRow}>
        <Text style={s.price}>Rs. {cook.price || 150} / {lang === 'ne' ? 'खाना' : 'meal'}</Text>
        <TouchableOpacity
          style={[s.orderBtn, (!cook.available && cook.isOpen === false) && s.orderBtnDisabled]}
          onPress={() => (onAddToCart || addToCart)(cook)}
          disabled={!cook.available && cook.isOpen === false}
        >
          <Text style={s.orderBtnText}>{lang === 'ne' ? 'कार्टमा थप्नुस्' : 'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22 },
  headerInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },
  heart: { fontSize: 18, marginLeft: 8 },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  unavailableBadge: { backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  unavailableText: { fontSize: 11, color: '#c2410c', fontWeight: '500' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  mealPill: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  mealText: { fontSize: 12, color: '#6b7280' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '700', color: '#C0392B' },
  orderBtn: { backgroundColor: '#C0392B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  orderBtnDisabled: { backgroundColor: '#d1d5db' },
  orderBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
})
