import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, ActivityIndicator, Modal } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import OrdersScreen from './screens/OrdersScreen'
import CooksScreen from './screens/CooksScreen'
import ProfileScreen from './screens/ProfileScreen'
import MapScreen from './screens/MapScreen'
import SettingsScreen from './screens/SettingsScreen'
import CookDashboardScreen from './screens/CookDashboardScreen'
import OffersScreen from './screens/OffersScreen'
import CartModal from './components/CartModal'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { usePushNotifications } from './hooks/usePushNotifications'

const TABS = [
  { id: 'home',    icon: '🏠', en: 'Home',    ne: 'होम' },
  { id: 'orders',  icon: '📋', en: 'Orders',  ne: 'अर्डर' },
  { id: 'cooks',   icon: '👨‍🍳', en: 'Cooks',   ne: 'पकाउने' },
  { id: 'profile', icon: '👤', en: 'Profile', ne: 'प्रोफाइल' },
]

function Shell() {
  const { lang, setLang, cartCount } = useApp()
  const { user, loading } = useAuth()
  usePushNotifications(user) // register push notifications
  const [activeTab, setActiveTab] = useState('home')
  const [cartOpen, setCartOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [cookDashOpen, setCookDashOpen] = useState(false)
  const [offersOpen, setOffersOpen] = useState(false)

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#C0392B' }}>
        <Text style={{ fontSize: 64, marginBottom: 12 }}>🍱</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 }}>TiffinGhar</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 32 }}>घरको खाना, ढोकासम्म</Text>
        <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
      </View>
    )
  }

  if (!user) return <OnboardingScreen />

  const screens = { home: HomeScreen, orders: OrdersScreen, cooks: CooksScreen, profile: ProfileScreen }
  const Screen = screens[activeTab]

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#C0392B" />
      <View style={s.root}>
        {/* Top bar */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#C0392B' }}>
          <View style={s.topBar}>
            <View style={s.logoWrap}>
              <View style={s.logoBadge}>
                <Text style={s.logoEmoji}>🍱</Text>
              </View>
              <View>
                <Text style={s.logo}>TiffinGhar</Text>
                <Text style={s.logoSub}>{lang === 'ne' ? 'घरको खाना, ढोकासम्म' : 'Home food, to your door'}</Text>
              </View>
            </View>
            <View style={s.topRight}>
              {/* Cook dashboard — only for cooks */}
              {user?.role === 'cook' && (
                <TouchableOpacity style={s.iconBtn} onPress={() => setCookDashOpen(true)}>
                  <Text style={s.iconBtnText}>👩‍🍳</Text>
                </TouchableOpacity>
              )}
              {/* Offers */}
              <TouchableOpacity style={s.iconBtn} onPress={() => setOffersOpen(true)}>
                <Text style={s.iconBtnText}>🏷️</Text>
              </TouchableOpacity>
              {/* Map button */}
              <TouchableOpacity style={s.iconBtn} onPress={() => setMapOpen(true)}>
                <Text style={s.iconBtnText}>🗺️</Text>
              </TouchableOpacity>
              {/* Settings */}
              <TouchableOpacity style={s.iconBtn} onPress={() => setSettingsOpen(true)}>
                <Text style={s.iconBtnText}>⚙️</Text>
              </TouchableOpacity>
              {/* Cart */}
              <TouchableOpacity style={s.cartBtn} onPress={() => setCartOpen(true)}>
                <Text style={s.cartIcon}>🛒</Text>
                {cartCount > 0 && (
                  <View style={s.cartBadge}>
                    <Text style={s.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Language */}
              <TouchableOpacity style={s.langBtn} onPress={() => setLang(l => l === 'en' ? 'ne' : 'en')}>
                <Text style={s.langBtnText}>{lang === 'en' ? 'नेपाली' : 'EN'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.locBar}>
            <View style={s.locDot} />
            <Text style={s.locText}>
              {lang === 'ne' ? 'बानेश्वर, काठमाडौं · अहिले डेलिभरी हुँदैछ' : 'Baneshwor, Kathmandu · Delivering now'}
            </Text>
            <TouchableOpacity onPress={() => setMapOpen(true)}>
              <Text style={s.changeText}>{lang === 'ne' ? 'बदल्नुस्' : 'Change'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={s.screen}><Screen /></View>

        {/* Bottom tabs */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }}>
          <View style={s.tabBar}>
            {TABS.map(tab => {
              const active = activeTab === tab.id
              return (
                <TouchableOpacity key={tab.id} style={s.tabItem} onPress={() => setActiveTab(tab.id)} activeOpacity={0.7}>
                  {active && <View style={s.tabIndicator} />}
                  <Text style={[s.tabIcon, active && s.tabIconActive]}>{tab.icon}</Text>
                  <Text style={[s.tabLabel, active && s.tabLabelActive]}>{lang === 'ne' ? tab.ne : tab.en}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </SafeAreaView>
      </View>

      <CartModal visible={cartOpen} onClose={() => setCartOpen(false)} />
      <Toast />

      {/* Map Modal */}
      <Modal visible={mapOpen} animationType="slide" onRequestClose={() => setMapOpen(false)}>
        <MapScreen onClose={() => setMapOpen(false)} />
      </Modal>

      {/* Settings Modal */}
      <Modal visible={settingsOpen} animationType="slide" onRequestClose={() => setSettingsOpen(false)}>
        <SettingsScreen onClose={() => setSettingsOpen(false)} />
      </Modal>

      {/* Cook Dashboard Modal */}
      <Modal visible={cookDashOpen} animationType="slide" onRequestClose={() => setCookDashOpen(false)}>
        <CookDashboardScreen onClose={() => setCookDashOpen(false)} />
      </Modal>

      {/* Offers Modal */}
      <Modal visible={offersOpen} animationType="slide" onRequestClose={() => setOffersOpen(false)}>
        <OffersScreen onClose={() => setOffersOpen(false)} />
      </Modal>
    </SafeAreaProvider>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Shell />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: '#C0392B',
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 18 },
  logo: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  logoSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16 },
  cartBtn: { position: 'relative', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  cartIcon: { fontSize: 17 },
  cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#facc15', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#C0392B' },
  cartBadgeText: { fontSize: 9, fontWeight: '800', color: '#7c2d12' },
  langBtn: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  langBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  locBar: { backgroundColor: '#A93226', paddingHorizontal: 16, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 8 },
  locDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  locText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: '500' },
  changeText: { fontSize: 11, color: 'rgba(255,255,255,0.65)', textDecorationLine: 'underline' },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 2, position: 'relative' },
  tabIndicator: { position: 'absolute', top: -8, width: 32, height: 3, backgroundColor: '#C0392B', borderRadius: 2 },
  tabIcon: { fontSize: 22, opacity: 0.3 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: '#9ca3af', marginTop: 3, fontWeight: '500' },
  tabLabelActive: { color: '#C0392B', fontWeight: '700' },
})
