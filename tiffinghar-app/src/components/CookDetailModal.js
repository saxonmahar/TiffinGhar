import { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native'
import { useApp } from '../context/AppContext'

const getMeals = (cook) => {
  if (cook.menu?.length > 0) return cook.menu.map(m => ({ name: m.name, nameNe: m.nameNe || m.name, price: m.price || cook.price || 150 }))
  if (cook.meals?.length > 0) return cook.meals.map((name, i) => ({ name, nameNe: cook.mealsNe?.[i] || name, price: cook.price || 150 }))
  return []
}

const getLocation = (cook) => {
  const loc = cook.location
  if (!loc) return 'Kathmandu'
  if (typeof loc === 'string') return loc
  return loc.area || loc.address || loc.city || 'Kathmandu'
}

export default function CookDetailModal({ cook, onClose }) {
  const { lang, addToCart, toggleSaveCook } = useApp()
  const [selectedMeal, setSelectedMeal] = useState(0)
  const [coverError, setCoverError] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  if (!cook) return null

  const meals = getMeals(cook)
  const isAvailable = cook.available !== false && cook.isOpen !== false

  const handleAdd = () => {
    addToCart(cook, meals[selectedMeal]?.name || cook.meals?.[0])
    onClose()
  }

  const hasRealAvatar = cook.avatar?.startsWith?.('http') && !avatarError
  const hasRealCover = cook.coverImage && !coverError

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.sheet} activeOpacity={1}>
          {/* Cover image */}
          <View style={s.coverWrap}>
            {hasRealCover ? (
              <Image source={{ uri: cook.coverImage }} style={s.cover} resizeMode="cover" onError={() => setCoverError(true)} />
            ) : (
              <View style={[s.cover, s.coverFallback]} />
            )}
            <View style={s.coverOverlay} />
            {/* Handle */}
            <View style={s.handle} />
            {/* Close button */}
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>
            {/* Cook info */}
            <View style={s.infoRow}>
              <View style={s.avatarWrap}>
                {hasRealAvatar ? (
                  <Image source={{ uri: cook.avatar }} style={s.avatar} onError={() => setAvatarError(true)} />
                ) : (
                  <View style={[s.avatar, s.avatarFallback, { backgroundColor: cook.avatarBg || '#FAECE7' }]}>
                    <Text style={s.avatarEmoji}>{typeof cook.avatar === 'string' && !cook.avatar.startsWith('http') ? cook.avatar : '👨‍🍳'}</Text>
                  </View>
                )}
                {isAvailable && <View style={s.onlineDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{lang === 'ne' ? cook.nameNe : cook.name}</Text>
                  <TouchableOpacity onPress={() => toggleSaveCook(cook.id || cook._id)}>
                    <Text style={{ fontSize: 22 }}>{cook.saved ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.location}>📍 {getLocation(cook)} · {cook.distance || '1 km'}</Text>
                <View style={s.statsRow}>
                  <View style={s.statBadge}>
                    <Text style={s.statText}>⭐ {cook.rating || 4.5}</Text>
                  </View>
                  <Text style={s.statSep}>·</Text>
                  <Text style={s.statInfo}>{cook.reviews || cook.totalReviews || 0} reviews</Text>
                  {cook.totalOrders > 0 && <>
                    <Text style={s.statSep}>·</Text>
                    <Text style={s.statInfo}>{cook.totalOrders}+ orders</Text>
                  </>}
                  {cook.deliveryTime && <>
                    <Text style={s.statSep}>·</Text>
                    <Text style={s.statInfo}>🕐 {cook.deliveryTime}</Text>
                  </>}
                </View>
              </View>
            </View>

            {/* Description */}
            {(cook.description || cook.bio) && (
              <Text style={s.desc}>
                {lang === 'ne' ? (cook.descriptionNe || cook.bioNe || cook.description || cook.bio) : (cook.description || cook.bio)}
              </Text>
            )}

            {/* Badges */}
            {cook.badges?.length > 0 && (
              <View style={s.badgeRow}>
                {cook.badges.map((b, i) => (
                  <View key={i} style={s.badge}>
                    <Text style={s.badgeText}>{typeof b === 'string' ? b : (lang === 'ne' ? b.labelNe : b.label)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Meal selector */}
            {meals.length > 0 && (
              <>
                <Text style={s.sectionLabel}>{lang === 'ne' ? 'खाना छान्नुस्' : 'Select a meal'}</Text>
                {meals.map((meal, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[s.mealOption, selectedMeal === i && s.mealOptionActive]}
                    onPress={() => setSelectedMeal(i)}
                    activeOpacity={0.8}
                  >
                    <View style={s.mealLeft}>
                      {cook.mealImages?.[i] ? (
                        <Image source={{ uri: cook.mealImages[i] }} style={s.mealImg} resizeMode="cover" />
                      ) : (
                        <View style={[s.mealImg, s.mealImgFallback]}>
                          <Text style={{ fontSize: 20 }}>🍽️</Text>
                        </View>
                      )}
                      <Text style={[s.mealName, selectedMeal === i && s.mealNameActive]}>
                        {lang === 'ne' ? meal.nameNe : meal.name}
                      </Text>
                    </View>
                    <View style={s.mealRight}>
                      <Text style={s.mealPrice}>Rs. {meal.price}</Text>
                      {selectedMeal === i && <Text style={s.mealCheck}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Sticky CTA */}
          <View style={s.cta}>
            <View style={s.ctaPrice}>
              <Text style={s.ctaPriceLabel}>Total</Text>
              <Text style={s.ctaPriceVal}>Rs. {meals[selectedMeal]?.price || cook.price || 150}</Text>
            </View>
            <TouchableOpacity
              style={[s.ctaBtn, !isAvailable && s.ctaBtnDisabled]}
              onPress={handleAdd}
              disabled={!isAvailable}
              activeOpacity={0.85}
            >
              <Text style={s.ctaBtnText}>
                {!isAvailable ? 'Currently Closed' : (lang === 'ne' ? 'कार्टमा थप्नुस्' : 'Add to Cart')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  coverWrap: { height: 180, position: 'relative', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  coverFallback: { backgroundColor: '#C0392B' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  handle: { position: 'absolute', top: 10, alignSelf: 'center', width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4, left: '50%', marginLeft: -20 },
  closeBtn: { position: 'absolute', top: 12, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll: { flex: 1 },
  infoRow: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 12 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#fff' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 28 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#16a34a', borderWidth: 2, borderColor: '#fff' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 19, fontWeight: '800', color: '#111827', flex: 1 },
  location: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  statsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  statBadge: { backgroundColor: '#fef9c3', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statText: { fontSize: 12, fontWeight: '700', color: '#854d0e' },
  statSep: { color: '#d1d5db', fontSize: 12 },
  statInfo: { fontSize: 12, color: '#6b7280' },
  desc: { fontSize: 14, color: '#4b5563', lineHeight: 22, paddingHorizontal: 16, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, marginBottom: 16 },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 10 },
  mealOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', padding: 10, backgroundColor: '#fff' },
  mealOptionActive: { borderColor: '#C0392B', backgroundColor: '#FAECE7' },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  mealImg: { width: 48, height: 48, borderRadius: 10 },
  mealImgFallback: { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  mealName: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1 },
  mealNameActive: { color: '#C0392B' },
  mealRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealPrice: { fontSize: 15, fontWeight: '800', color: '#C0392B' },
  mealCheck: { color: '#C0392B', fontWeight: '800', fontSize: 16 },
  cta: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  ctaPrice: { alignItems: 'center' },
  ctaPriceLabel: { fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' },
  ctaPriceVal: { fontSize: 18, fontWeight: '800', color: '#111827' },
  ctaBtn: { flex: 1, backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  ctaBtnDisabled: { backgroundColor: '#e5e7eb' },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
})
