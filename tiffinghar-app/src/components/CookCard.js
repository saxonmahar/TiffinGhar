import { useState } from 'react'
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native'
import { useApp } from '../context/AppContext'

const badgeColors = {
  green:   { bg: '#dcfce7', text: '#15803d' },
  blue:    { bg: '#dbeafe', text: '#1d4ed8' },
  default: { bg: '#fff7ed', text: '#c2410c' },
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

const getLocation = (cook) => {
  const loc = cook.location
  if (!loc) return 'Kathmandu'
  if (typeof loc === 'string') return loc
  return loc.area || loc.address || loc.city || 'Kathmandu'
}

export default function CookCard({ cook, onPress, onAddToCart }) {
  const { lang, addToCart, toggleSaveCook } = useApp()
  const [imgError, setImgError] = useState(false)
  const meals = (lang === 'ne' ? cook.mealsNe : cook.meals) || []
  const badges = cook.badges || []
  const isAvailable = cook.available !== false && cook.isOpen !== false

  const handleAdd = () => {
    const fn = onAddToCart || addToCart
    fn(cook)
  }

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(cook)} activeOpacity={0.92}>
      {/* Cover image */}
      {cook.coverImage && (
        <View style={s.coverWrap}>
          <Image
            source={{ uri: cook.coverImage }}
            style={s.cover}
            resizeMode="cover"
          />
          {/* Overlay gradient effect */}
          <View style={s.coverOverlay} />
          {/* Delivery time badge */}
          {cook.deliveryTime && (
            <View style={s.deliveryBadge}>
              <Text style={s.deliveryText}>🕐 {cook.deliveryTime}</Text>
            </View>
          )}
          {/* Unavailable overlay */}
          {!isAvailable && (
            <View style={s.unavailableOverlay}>
              <Text style={s.unavailableText}>Currently Closed</Text>
            </View>
          )}
        </View>
      )}

      <View style={s.body}>
        {/* Header row */}
        <View style={s.header}>
          {/* Avatar */}
          <View style={s.avatarWrap}>
            {cook.avatar && !imgError && typeof cook.avatar === 'string' && cook.avatar.startsWith('http') ? (
              <Image
                source={{ uri: cook.avatar }}
                style={s.avatarImg}
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={[s.avatarFallback, { backgroundColor: cook.avatarBg || '#FAECE7' }]}>
                <Text style={s.avatarEmoji}>
                  {typeof cook.avatar === 'string' && !cook.avatar.startsWith('http') ? cook.avatar : '👨‍🍳'}
                </Text>
              </View>
            )}
            {/* Online indicator */}
            {isAvailable && <View style={s.onlineDot} />}
          </View>

          <View style={s.headerInfo}>
            <View style={s.nameRow}>
              <Text style={s.name} numberOfLines={1}>{lang === 'ne' ? cook.nameNe : cook.name}</Text>
              <TouchableOpacity
                onPress={() => toggleSaveCook(cook.id || cook._id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={s.heart}>{cook.saved ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.location} numberOfLines={1}>
              📍 {getLocation(cook)} · {cook.distance || '1 km'}
            </Text>
            <View style={s.ratingRow}>
              <View style={s.ratingBadge}>
                <Text style={s.ratingText}>⭐ {cook.rating || 4.5}</Text>
              </View>
              <Text style={s.reviewCount}>({cook.reviews || cook.totalReviews || 0} reviews)</Text>
              {cook.totalOrders > 0 && (
                <Text style={s.orders}>· {cook.totalOrders}+ orders</Text>
              )}
            </View>
          </View>
        </View>

        {/* Badges */}
        {badges.length > 0 && (
          <View style={s.badgeRow}>
            {badges.slice(0, 3).map((b, i) => {
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
                <Text style={s.mealText}>+{meals.length - 3} more</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <View>
            <Text style={s.price}>Rs. {cook.price}</Text>
            <Text style={s.priceLabel}>{lang === 'ne' ? 'प्रति खाना' : 'per meal'}</Text>
          </View>
          <TouchableOpacity
            style={[s.addBtn, !isAvailable && s.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!isAvailable}
            activeOpacity={0.8}
          >
            <Text style={s.addBtnText}>
              {isAvailable ? (lang === 'ne' ? '+ कार्टमा थप्नुस्' : '+ Add to Cart') : (lang === 'ne' ? 'बन्द छ' : 'Closed')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  coverWrap: { height: 140, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)' },
  deliveryBadge: { position: 'absolute', bottom: 10, left: 12, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  deliveryText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  unavailableOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  unavailableText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  body: { padding: 14 },
  header: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#fff' },
  avatarFallback: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarEmoji: { fontSize: 24 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: '#16a34a', borderWidth: 2, borderColor: '#fff' },
  headerInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  heart: { fontSize: 18, marginLeft: 8 },
  location: { fontSize: 12, color: '#6b7280', marginBottom: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingBadge: { backgroundColor: '#fef9c3', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#854d0e' },
  reviewCount: { fontSize: 11, color: '#9ca3af' },
  orders: { fontSize: 11, color: '#9ca3af' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  mealPill: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  mealText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f9fafb' },
  price: { fontSize: 18, fontWeight: '800', color: '#C0392B' },
  priceLabel: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  addBtn: { backgroundColor: '#C0392B', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  addBtnDisabled: { backgroundColor: '#e5e7eb' },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
})
