import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import CookCard from '../components/CookCard'
import CookDetailModal from '../components/CookDetailModal'
import { Carousel, PromoBanner } from '../components/ui/Carousel'
import { Tabs } from '../components/ui/Tabs'
import { CookCardSkeleton } from '../components/ui/Skeleton'
import Snackbar from '../components/ui/Snackbar'
import { smartFilter } from '../utils/search'
import { cooksAPI } from '../api'

const CATEGORIES = [
  { id: 'all',     label: 'All',       icon: '🍽️' },
  { id: 'dalbhat', label: 'Dal Bhat',  icon: '🍛' },
  { id: 'newari',  label: 'Newari',    icon: '🥘' },
  { id: 'thakali', label: 'Thakali',   icon: '🫕' },
  { id: 'veg',     label: 'Veg Only',  icon: '🥗' },
  { id: 'momo',    label: 'Momo',      icon: '🥟' },
]

const PROMOS = [
  { title: 'Lunch by 12:30 PM', subtitle: 'Order before 10 AM · Free delivery', tag: '🕐 Today only', gradient: ['#C0392B', '#E74C3C'] },
  { title: '20% off first order', subtitle: 'Use code TIFFIN20 at checkout', tag: '🎉 New user offer', gradient: ['#7c3aed', '#a855f7'] },
  { title: 'Subscribe & Save', subtitle: 'Rs. 130/meal on monthly plan', tag: '📦 Best value', gradient: ['#0369a1', '#0ea5e9'] },
]

const SORT_TABS = [
  { id: 'rating',   label: 'Top Rated', icon: '⭐' },
  { id: 'distance', label: 'Nearest',   icon: '📍' },
  { id: 'price',    label: 'Price',     icon: '💰' },
]

export default function HomeScreen() {
  const { lang, cooks: localCooks, addToCart } = useApp()
  const { user } = useAuth()
  const [allCooks, setAllCooks] = useState([])  // full unfiltered list
  const [cooks, setCooks] = useState([])
  const [searchSuggestion, setSearchSuggestion] = useState(null)
  const [resolvedTerm, setResolvedTerm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [selectedCook, setSelectedCook] = useState(null)
  const [snack, setSnack] = useState({ visible: false, message: '', type: 'success' })

  const showSnack = (message, type = 'success') => setSnack({ visible: true, message, type })

  // Fetch all cooks once
  const fetchCooks = useCallback(async () => {
    try {
      const res = await cooksAPI.list({ sort: sortBy })
      setAllCooks(res.cooks)
    } catch {
      setAllCooks(localCooks)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [sortBy])

  useEffect(() => { fetchCooks() }, [fetchCooks])

  // Apply smart search + category filter client-side
  useEffect(() => {
    let pool = [...allCooks]

    // Category filter
    if (activeCat !== 'all') {
      pool = pool.filter(c => {
        const specs = c.specialties || []
        const badges = (c.badges || []).map(b => typeof b === 'string' ? b : b.label).join(' ').toLowerCase()
        const meals = [...(c.meals || []), ...(c.menu || []).map(m => m.name)].join(' ').toLowerCase()
        const catMap = {
          dalbhat: ['dal', 'bhat', 'rice'],
          newari:  ['newari', 'newar'],
          thakali: ['thakali'],
          veg:     ['veg', 'vegetarian'],
          momo:    ['momo', 'dumpling'],
        }
        const keywords = catMap[activeCat] || [activeCat]
        return keywords.some(k => specs.join(' ').toLowerCase().includes(k) || badges.includes(k) || meals.includes(k))
      })
    }

    // Smart search
    if (search.trim()) {
      const { results, suggestion, resolvedTerm: rt } = smartFilter(pool, search)
      setCooks(results)
      setSearchSuggestion(suggestion)
      setResolvedTerm(rt)
    } else {
      setCooks(pool)
      setSearchSuggestion(null)
      setResolvedTerm(null)
    }
  }, [search, activeCat, allCooks])

  const onRefresh = () => { setRefreshing(true); fetchCooks() }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return lang === 'ne' ? 'शुभ बिहान' : 'Good morning'
    if (h < 17) return lang === 'ne' ? 'शुभ दिउँसो' : 'Good afternoon'
    return lang === 'ne' ? 'शुभ साँझ' : 'Good evening'
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C0392B" />}
      >
        {/* Greeting */}
        <View style={s.greetRow}>
          <View>
            <Text style={s.greet}>{greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={s.greetSub}>{lang === 'ne' ? 'आज के खाने मन छ?' : "What's for lunch today?"}</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Text style={s.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Promo Carousel */}
        <View style={s.carouselWrap}>
          <Carousel
            items={PROMOS}
            itemWidth={320}
            renderItem={(item) => <PromoBanner {...item} />}
          />
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={lang === 'ne' ? 'दाल भात, मोमो, रोटी...' : 'Search dal bhat, momo, roti...'}
              placeholderTextColor="#9ca3af"
              style={s.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color: '#9ca3af', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={s.filterBtn}>
            <Text style={s.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catChip, activeCat === cat.id && s.catChipActive]}
              onPress={() => setActiveCat(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={s.catIcon}>{cat.icon}</Text>
              <Text style={[s.catLabel, activeCat === cat.id && s.catLabelActive]}>
                {lang === 'ne' && cat.ne ? cat.ne : cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort + count row */}
        <View style={s.sortRow}>
          <Text style={s.countText}>
            {loading ? '...' : `${cooks.length} ${lang === 'ne' ? 'पकाउने' : 'cooks'}`}
          </Text>
          <Tabs
            tabs={SORT_TABS}
            defaultTab="rating"
            onChange={setSortBy}
            variant="pill"
          />
        </View>

        {/* Search suggestion banner */}
        {searchSuggestion && (
          <View style={s.suggestionBanner}>
            <Text style={s.suggestionText}>💡 {searchSuggestion}</Text>
          </View>
        )}
        {resolvedTerm && !searchSuggestion && (
          <View style={s.resolvedBanner}>
            <Text style={s.resolvedText}>
              🔍 {lang === 'ne' ? 'देखाइएको:' : 'Showing results for:'} <Text style={{ fontWeight: '700' }}>{resolvedTerm}</Text>
            </Text>
          </View>
        )}

        {/* Cook list */}
        <View style={s.list}>
          {loading ? (
            [1, 2, 3].map(i => <CookCardSkeleton key={i} />)
          ) : cooks.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 40 }}>🍽️</Text>
              <Text style={s.emptyTitle}>{lang === 'ne' ? 'कुनै नतिजा फेला परेन' : 'No cooks found'}</Text>
              <Text style={s.emptySub}>
                {search ? (lang === 'ne' ? `"${search}" को लागि कुनै पकाउने छैन` : `No cooks found for "${search}"`) : (lang === 'ne' ? 'अर्को क्षेत्र खोज्नुस्' : 'Try a different category')}
              </Text>
              {search && (
                <TouchableOpacity style={s.clearSearch} onPress={() => setSearch('')}>
                  <Text style={s.clearSearchText}>{lang === 'ne' ? 'खोज हटाउनुस्' : 'Clear search'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            cooks.map(cook => (
              <CookCard
                key={cook._id || cook.id}
                cook={cook}
                onPress={setSelectedCook}
                onAddToCart={(cook, meal) => {
                  addToCart(cook, meal)
                  showSnack(`${meal || cook.name} ${lang === 'ne' ? 'कार्टमा थपियो!' : 'added to cart!'}`, 'success')
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
        onDismiss={() => setSnack(s => ({ ...s, visible: false }))}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  greet: { fontSize: 20, fontWeight: '700', color: '#111827' },
  greetSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  notifIcon: { fontSize: 18 },
  carouselWrap: { marginTop: 12, marginBottom: 4 },
  searchWrap: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginVertical: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  filterBtn: { width: 46, height: 46, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  filterIcon: { fontSize: 18 },
  catScroll: { marginBottom: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  catChipActive: { backgroundColor: '#C0392B', borderColor: '#C0392B' },
  catIcon: { fontSize: 14 },
  catLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  catLabelActive: { color: '#fff', fontWeight: '700' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  countText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  clearSearch: { marginTop: 8, backgroundColor: '#FAECE7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  clearSearchText: { color: '#C0392B', fontSize: 13, fontWeight: '600' },
  suggestionBanner: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fef9c3', borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: '#ca8a04' },
  suggestionText: { fontSize: 13, color: '#854d0e', lineHeight: 18 },
  resolvedBanner: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#eff6ff', borderRadius: 10, padding: 10 },
  resolvedText: { fontSize: 13, color: '#2563eb' },
})
