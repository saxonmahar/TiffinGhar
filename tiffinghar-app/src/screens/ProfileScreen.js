import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, Switch, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Accordion } from '../components/ui/Accordion'
import { RadioGroup } from '../components/ui/RadioGroup'
import Snackbar from '../components/ui/Snackbar'
import { subscriptionPlans } from '../data/mockData'

const PAYMENT_OPTIONS = [
  { value: 'esewa',  label: '💚 eSewa',           desc: 'Linked · **** 4521' },
  { value: 'khalti', label: '💜 Khalti',           desc: 'Linked · **** 8832' },
  { value: 'cash',   label: '💵 Cash on Delivery', desc: 'Pay when delivered' },
]

const PLAN_OPTIONS = subscriptionPlans.map(p => ({
  value: p.id, label: p.name, desc: p.desc,
  price: `Rs. ${p.price}`, badge: p.popular ? 'Popular' : null,
}))

const MENU_ITEMS = (lang, setLang, setShowPayments, setShowPlans, showSnack, notifications, setNotifications) => [
  { icon: '🌐', label: lang === 'ne' ? 'भाषा' : 'Language', sub: lang === 'en' ? 'English' : 'नेपाली', action: () => setLang(l => l === 'en' ? 'ne' : 'en'), right: 'toggle-lang' },
  { icon: '📍', label: lang === 'ne' ? 'सेभ गरिएका ठेगाना' : 'Saved Addresses', sub: '2 addresses', action: () => showSnack('Coming soon!'), right: 'arrow' },
  { icon: '💳', label: lang === 'ne' ? 'भुक्तानी विधि' : 'Payment Methods', sub: 'eSewa, Khalti, Cash', action: () => setShowPayments(true), right: 'arrow' },
  { icon: '📦', label: lang === 'ne' ? 'सदस्यता योजना' : 'Subscription Plans', sub: lang === 'ne' ? 'बचत गर्नुस्' : 'Save on every meal', action: () => setShowPlans(true), right: 'badge-green' },
  { icon: '🔔', label: lang === 'ne' ? 'सूचनाहरू' : 'Notifications', sub: notifications ? 'Enabled' : 'Disabled', right: 'switch' },
  { icon: '🎁', label: lang === 'ne' ? 'रेफर र कमाउनुस्' : 'Refer & Earn', sub: 'Rs. 200 per referral', action: () => showSnack('Coming soon!'), right: 'arrow' },
  { icon: '⭐', label: lang === 'ne' ? 'रेट गर्नुस्' : 'Rate the App', sub: 'Share your feedback', action: () => showSnack('Thank you! 🙏'), right: 'arrow' },
]

export default function ProfileScreen() {
  const { lang, setLang, orders } = useApp()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [showPlans, setShowPlans] = useState(false)
  const [showPayments, setShowPayments] = useState(false)
  const [activePlan, setActivePlan] = useState('standard')
  const [activePayment, setActivePayment] = useState('esewa')
  const [snack, setSnack] = useState({ visible: false, message: '', type: 'success' })

  const showSnack = (msg, type = 'success') => setSnack({ visible: true, message: msg, type })

  const totalSpent = orders.reduce((s, o) => s + (o.price || o.total || 0), 0)
  const cooksTried = [...new Set(orders.map(o => o.cookId || o.cook))].filter(Boolean).length
  const toRate = orders.filter(o => o.status === 'delivered' && !o.rated).length

  const faqItems = [
    { id: '1', icon: '🚚', title: 'How long does delivery take?', content: 'Usually 30-45 minutes. May take longer during peak hours (12-1 PM).' },
    { id: '2', icon: '💳', title: 'What payment methods are available?', content: 'eSewa, Khalti, and Cash on Delivery are all supported.' },
    { id: '3', icon: '🔄', title: 'Can I cancel my order?', content: 'Yes, you can cancel before the cook confirms your order (usually within 2 minutes).' },
    { id: '4', icon: '👩‍🍳', title: 'How do I become a cook?', content: 'Go to the Cooks tab and tap "Become a Cook". It\'s free to join!' },
    { id: '5', icon: '💰', title: 'How do cooks get paid?', content: 'Weekly payouts via eSewa or bank transfer every Monday.' },
  ]

  const menuItems = MENU_ITEMS(lang, setLang, setShowPayments, setShowPlans, showSnack, notifications, setNotifications)

  return (
    <>
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Hero banner */}
          <View style={s.heroBanner}>
            <View style={s.heroGradient} />
            <View style={s.heroContent}>
              <View style={s.avatarWrap}>
                <View style={s.avatar}>
                  <Text style={s.avatarEmoji}>😊</Text>
                </View>
                <View style={s.onlineDot} />
                <TouchableOpacity style={s.editAvatarBtn}>
                  <Text style={s.editAvatarText}>📷</Text>
                </TouchableOpacity>
              </View>
              <View style={s.heroInfo}>
                <Text style={s.heroName}>{user?.name || 'Sanjay Shrestha'}</Text>
                <Text style={s.heroPhone}>{user?.phone || '+977 98XXXXXXXX'}</Text>
                <View style={s.heroBadges}>
                  <View style={s.verifiedBadge}>
                    <Text style={s.verifiedText}>✓ Verified</Text>
                  </View>
                  <View style={s.memberBadge}>
                    <Text style={s.memberText}>⭐ Regular</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            {[
              { val: String(orders.length), label: 'Orders', icon: '📦', color: '#C0392B', bg: '#FAECE7' },
              { val: String(cooksTried), label: 'Cooks', icon: '👨‍🍳', color: '#16a34a', bg: '#f0fdf4' },
              { val: `Rs.${(totalSpent/1000).toFixed(1)}K`, label: 'Spent', icon: '💰', color: '#2563eb', bg: '#eff6ff' },
              { val: String(toRate), label: 'To Rate', icon: '⭐', color: '#ca8a04', bg: '#fefce8' },
            ].map((stat, i) => (
              <View key={i} style={[s.statCard, { backgroundColor: stat.bg }]}>
                <Text style={s.statIcon}>{stat.icon}</Text>
                <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Menu */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Account</Text>
            <View style={s.menuCard}>
              {menuItems.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.menuItem, i < menuItems.length - 1 && s.menuItemBorder]}
                  onPress={item.action}
                  activeOpacity={item.right === 'switch' ? 1 : 0.7}
                >
                  <View style={s.menuIconWrap}>
                    <Text style={s.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={s.menuInfo}>
                    <Text style={s.menuLabel}>{item.label}</Text>
                    <Text style={s.menuSub}>{item.sub}</Text>
                  </View>
                  {item.right === 'arrow' && <Text style={s.menuArrow}>›</Text>}
                  {item.right === 'switch' && (
                    <Switch value={notifications} onValueChange={setNotifications}
                      trackColor={{ false: '#d1d5db', true: '#C0392B' }} thumbColor="#fff" />
                  )}
                  {item.right === 'badge-green' && (
                    <View style={s.activeBadge}><Text style={s.activeBadgeText}>Active</Text></View>
                  )}
                  {item.right === 'toggle-lang' && (
                    <View style={s.langToggle}>
                      <Text style={s.langToggleText}>{lang === 'en' ? 'नेपाली' : 'EN'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQ */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Help & FAQ</Text>
            <Accordion items={faqItems} allowMultiple />
          </View>

          {/* Sign out */}
          <View style={s.section}>
            <TouchableOpacity style={s.signOutBtn} onPress={logout}>
              <Text style={s.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.version}>TiffinGhar v1.0.0 · Made with ❤️ in Nepal</Text>
        </ScrollView>
      </SafeAreaView>

      {/* Payment Modal */}
      <Modal transparent animationType="slide" visible={showPayments} onRequestClose={() => setShowPayments(false)}>
        <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={() => setShowPayments(false)}>
          <TouchableOpacity style={m.sheet} activeOpacity={1}>
            <View style={m.handle} />
            <Text style={m.title}>💳 Payment Methods</Text>
            <RadioGroup options={PAYMENT_OPTIONS} value={activePayment} onChange={setActivePayment} />
            <TouchableOpacity style={m.btn} onPress={() => { setShowPayments(false); showSnack('Payment method saved!') }}>
              <Text style={m.btnText}>Save</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Subscription Modal */}
      <Modal transparent animationType="slide" visible={showPlans} onRequestClose={() => setShowPlans(false)}>
        <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={() => setShowPlans(false)}>
          <TouchableOpacity style={m.sheet} activeOpacity={1}>
            <View style={m.handle} />
            <Text style={m.title}>📦 Subscription Plans</Text>
            <Text style={m.sub}>Subscribe and save on every meal</Text>
            <RadioGroup options={PLAN_OPTIONS} value={activePlan} onChange={setActivePlan} />
            <TouchableOpacity style={m.btn} onPress={() => { setShowPlans(false); showSnack('Subscription activated! 🎉') }}>
              <Text style={m.btnText}>Subscribe Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Snackbar visible={snack.visible} message={snack.message} type={snack.type} onDismiss={() => setSnack(p => ({ ...p, visible: false }))} />
    </>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  heroBanner: { backgroundColor: '#C0392B', paddingTop: 20, paddingBottom: 28, paddingHorizontal: 16, position: 'relative' },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  heroContent: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarEmoji: { fontSize: 34 },
  onlineDot: { position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#4ade80', borderWidth: 2, borderColor: '#C0392B' },
  editAvatarBtn: { position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  editAvatarText: { fontSize: 12 },
  heroInfo: { flex: 1, paddingBottom: 4 },
  heroName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroPhone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  heroBadges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  verifiedBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  verifiedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  memberBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  memberText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 16, marginTop: -4 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 3 },
  statIcon: { fontSize: 18 },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#6b7280', fontWeight: '500' },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 18 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  menuSub: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  menuArrow: { fontSize: 20, color: '#d1d5db' },
  activeBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeBadgeText: { fontSize: 11, color: '#15803d', fontWeight: '700' },
  langToggle: { backgroundColor: '#FAECE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  langToggleText: { fontSize: 12, color: '#C0392B', fontWeight: '700' },
  signOutBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb' },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  version: { textAlign: 'center', fontSize: 11, color: '#d1d5db', paddingBottom: 32, paddingTop: 8 },
})

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  btn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
