import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import CookCard from '../components/CookCard'
import CookDetailModal from '../components/CookDetailModal'
import { CookCardSkeleton } from '../components/ui/Skeleton'
import Snackbar from '../components/ui/Snackbar'
import { smartFilter } from '../utils/search'
import { cooksAPI } from '../api'

const CATEGORIES = [
  { id: 'all',     label: 'All',      icon: '🍽️', color: '#C0392B' },
  { id: 'dalbhat', label: 'Dal Bhat', icon: '🍛', color: '#ea580c' },
  { id: 'newari',  label: 'Newari',   icon: '🥘', color: '#7c3aed' },
  { id: 'thakali', label: 'Thakali',  icon: '🫕', color: '#0369a1' },
  { id: 'veg',     label: 'Veg',      icon: '🥗', color: '#16a34a' },
  { id: 'momo',    label: 'Momo',     icon: '🥟', color: '#d97706' },
]

const PROMOS = [
  {
    title: 'Lunch by 12:30 PM',
    subtitle: 'Order before 10 AM',
    tag: 'Today only',
    bg: '#C0392B',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=200&fit=crop',
  },
  {
    title: '20% off first order',
    subtitle: 'Use code TIFFIN20',
    tag: 'New user',
    bg: '#7c3aed',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop',
  },
  {
    title: 'Subscribe & Save',
    subtitle: 'Rs. 130/meal on plan',
    tag: 'Best value',
    bg: '#0369a1',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop',
  },
]

export default function HomeScreen() {
  const { lang, cooks: localCooks, addToCart } = useApp()
  const { user } = useAuth()
  const [allCooks, setAllCooks] = useState(localCooks)
  const [cooks, setCooks] = useState(localCooks)
  const [loading, setLoading] = useState(false)
  const [searchSuggestion, setSearchSuggestion] = useState(null)
  const [resolvedTerm, setResolvedTerm] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [selectedCook, setSelectedCook] = useState(null)
  const [snack, setSnack] = useState({ visible: false, message: '', type: 'success' })

  const showSnack = (msg, type = 'success') => setSnack({ visible: true, message: msg, type })

  const fetchCooks = useCallback(async () => {
    try {
      const res = await cooksAPI.list({})
      if (res.cooks?.length > 0) setAllCooks(res.cooks)
    } catch { /* keep mock */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchCooks() }, [fetchCooks])

  useEffect(() => {
    let pool = [...allCooks]
    if (activeCat !== 'all') {
      pool = pool.filter(c => {
        const specs = (c.specialties || []).join(' ').toLowerCase()
        const badges = (c.badges || []).map(b => typeof b === 'string' ? b : b.label).join(' ').toLowerCase()
        const meals = [...(c.meals || []), ...(c.menu || []).map(m => m.name)].join(' ').toLowerCase()
        const catMap = { dalbhat: ['dal','bhat'], newari: ['newari'], thakali: ['thakali'], veg: ['veg','vegetarian'], momo: ['momo'] }
        return (catMap[activeCat] || [activeCat]).some(k => specs.includes(k) || badges.includes(k) || meals.includes(k))
      })
    }
    if (search.trim()) {
      const { results, suggestion, resolvedTerm: rt } = smartFilter(pool, search)
      setCooks(results); setSearchSuggestion(suggestion); setResolvedTerm(rt)
    } else {
      setCooks(pool); setSearchSuggestion(null); setResolvedTerm(null)
    }
  }, [search, activeCat, allCooks])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return lang === 'ne' ? 'शुभ बिहान' : 'Good morning'
    if (h < 17) return lang === 'ne' ? 'शुभ दिउँसो' : 'Good afternoon'
    return lang === 'ne' ? 'शुभ साँझ' : 'Good evening'
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCooks() }} tintColor="#C0392B" />}
      >
        {/* Greeting */}
        <View style={s.greetRow}>
          <View>
            <Text style={s.greet}>{greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={s.greetSub}>{lang === 'ne' ? 'आज के खाने मन छ?' : "What's for lunch today?"}</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Text style={s.notifIcon}>🔔</Text>
            <View style={s.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={lang === 'ne' ? 'दाल भात, मोमो, रोटी...' : 'Search for food or cooks...'}
              placeholderTextColor="#9ca3af"
              style={s.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
                <Text style={s.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Promo banners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.promoScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {PROMOS.map((p, i) => (
            <TouchableOpacity key={i} style={[s.promoCard, { backgroundColor: p.bg }]} activeOpacity={0.9}>
              <View style={s.promoContent}>
                <View style={s.promoTag}>
                  <Text style={s.promoTagText}>{p.tag}</Text>
                </View>
                <Text style={s.promoTitle}>{p.title}</Text>
                <Text style={s.promoSub}>{p.subtitle}</Text>
              </View>
              <Image source={{ uri: p.image }} style={s.promoImg} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{lang === 'ne' ? 'के खाने?' : 'What are you craving?'}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catChip, activeCat === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]}
              onPress={() => setActiveCat(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={s.catIcon}>{cat.icon}</Text>
              <Text style={[s.catLabel, activeCat === cat.id && s.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cook list header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            {lang === 'ne' ? 'नजिकका पकाउने' : 'Cooks Near You'}
          </Text>
          <Text style={s.sectionCount}>{cooks.length} {lang === 'ne' ? 'उपलब्ध' : 'available'}</Text>
        </View>

        {/* Search banners */}
        {searchSuggestion && (
          <View style={s.suggestionBanner}>
            <Text style={s.suggestionText}>💡 {searchSuggestion}</Text>
          </View>
        )}
        {resolvedTerm && !searchSuggestion && (
          <View style={s.resolvedBanner}>
            <Text style={s.resolvedText}>Showing results for <Text style={{ fontWeight: '700' }}>{resolvedTerm}</Text></Text>
          </View>
        )}

        {/* Cook list */}
        <View style={s.list}>
          {loading ? (
            [1, 2, 3].map(i => <CookCardSkeleton key={i} />)
          ) : cooks.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🍽️</Text>
              <Text style={s.emptyTitle}>{lang === 'ne' ? 'कुनै नतिजा फेला परेन' : 'No cooks found'}</Text>
              <Text style={s.emptySub}>{search ? `No results for "${search}"` : 'Try a different category'}</Text>
              {search && (
                <TouchableOpacity style={s.clearSearchBtn} onPress={() => setSearch('')}>
                  <Text style={s.clearSearchText}>Clear search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            cooks.map(cook => (
              <CookCard
                key={cook._id || cook.id}
                cook={cook}
                onPress={setSelectedCook}
                onAddToCart={(c, meal) => {
                  addToCart(c, meal)
                  showSnack(`${meal || c.name} added to cart!`)
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CookDetailModal cook={selectedCook} onClose={() => setSelectedCook(null)} />
      <Snackbar
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={() => setSnack(p => ({ ...p, visible: false }))}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  greet: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  greetSub: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, position: 'relative' },
  notifIcon: { fontSize: 18 },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#C0392B', borderWidth: 1.5, borderColor: '#fff' },
  searchRow: { paddingHorizontal: 16, marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  clearBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 11, color: '#6b7280', fontWeight: '700' },
  promoScroll: { marginBottom: 20 },
  promoCard: { width: 260, height: 110, borderRadius: 16, flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
  promoContent: { flex: 1, padding: 14 },
  promoTag: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginBottom: 6 },
  promoTagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  promoTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 2 },
  promoSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  promoImg: { width: 90, height: '100%' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  sectionCount: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  catScroll: { marginBottom: 20 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 24, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  catIcon: { fontSize: 15 },
  catLabel: { fontSize: 13, color: '#374151', fontWeight: '600' },
  catLabelActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  clearSearchBtn: { marginTop: 8, backgroundColor: '#FAECE7', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  clearSearchText: { color: '#C0392B', fontSize: 13, fontWeight: '700' },
  suggestionBanner: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#fef9c3', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#ca8a04' },
  suggestionText: { fontSize: 13, color: '#854d0e' },
  resolvedBanner: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#eff6ff', borderRadius: 12, padding: 12 },
  resolvedText: { fontSize: 13, color: '#2563eb' },
})
