import { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useApp } from '../context/AppContext'

// Normalize cook data — handles both mock (meals array) and API (menu array) formats
const getMeals = (cook) => {
  if (cook.menu && cook.menu.length > 0) {
    return cook.menu.map(m => ({ name: m.name, nameNe: m.nameNe || m.name, price: m.price || cook.price || 150 }))
  }
  if (cook.meals && cook.meals.length > 0) {
    return cook.meals.map((name, i) => ({
      name,
      nameNe: (cook.mealsNe && cook.mealsNe[i]) || name,
      price: cook.price || 150,
    }))
  }
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

  if (!cook) return null

  const meals = getMeals(cook)

  const handleAdd = () => {
    if (meals.length > 0) {
      addToCart(cook, meals[selectedMeal].name)
    } else {
      addToCart(cook)
    }
    onClose()
  }

  const isAvailable = cook.available !== false && cook.isOpen !== false

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.sheet} activeOpacity={1}>
          <View style={s.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={s.header}>
              <View style={[s.avatar, { backgroundColor: cook.avatarBg || '#FAECE7' }]}>
                <Text style={s.avatarText}>{cook.avatar || '👨‍🍳'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{lang === 'ne' ? (cook.nameNe || cook.name) : cook.name}</Text>
                  <TouchableOpacity onPress={() => toggleSaveCook(cook.id || cook._id)}>
                    <Text style={{ fontSize: 22 }}>{cook.saved ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.location}>{getLocation(cook)} · {cook.distance || '1 km'}</Text>
                <Text style={s.rating}>
                  ⭐ {cook.rating || 4.5}{' '}
                  <Text style={s.reviews}>({cook.reviews || cook.totalReviews || 0} {lang === 'ne' ? 'समीक्षा' : 'reviews'})</Text>
                </Text>
              </View>
            </View>

            {/* Description */}
            {(cook.description || cook.bio) ? (
              <Text style={s.desc}>
                {lang === 'ne' ? (cook.descriptionNe || cook.bioNe || cook.description || cook.bio) : (cook.description || cook.bio)}
              </Text>
            ) : null}

            {/* Meal selector */}
            {meals.length > 0 && (
              <>
                <Text style={s.sectionLabel}>{lang === 'ne' ? 'खाना छान्नुस्' : 'Select a meal'}</Text>
                {meals.map((meal, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[s.mealOption, selectedMeal === i && s.mealOptionActive]}
                    onPress={() => setSelectedMeal(i)}
                  >
                    <Text style={s.mealName}>{lang === 'ne' ? meal.nameNe : meal.name}</Text>
                    <View style={s.mealRight}>
                      <Text style={s.mealPrice}>Rs. {meal.price}</Text>
                      {selectedMeal === i && <Text style={{ color: '#C0392B', marginLeft: 6 }}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* CTA */}
            <TouchableOpacity
              style={[s.addBtn, !isAvailable && s.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!isAvailable}
            >
              <Text style={s.addBtnText}>
                {!isAvailable
                  ? (lang === 'ne' ? 'उपलब्ध छैन' : 'Unavailable')
                  : meals.length > 0
                    ? (lang === 'ne'
                        ? `${meals[selectedMeal].nameNe} कार्टमा थप्नुस्`
                        : `Add ${meals[selectedMeal].name} to Cart`)
                    : (lang === 'ne' ? 'कार्टमा थप्नुस्' : 'Add to Cart')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  location: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  rating: { fontSize: 14, marginTop: 2, color: '#111827' },
  reviews: { color: '#9ca3af' },
  desc: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  mealOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 13, marginBottom: 8 },
  mealOptionActive: { borderColor: '#C0392B', backgroundColor: '#FAECE7' },
  mealName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  mealRight: { flexDirection: 'row', alignItems: 'center' },
  mealPrice: { fontSize: 14, fontWeight: '700', color: '#C0392B' },
  addBtn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  addBtnDisabled: { backgroundColor: '#e5e7eb' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
