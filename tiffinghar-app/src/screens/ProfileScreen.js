import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Switch, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid'
import { Accordion } from '../components/ui/Accordion'
import { RadioGroup } from '../components/ui/RadioGroup'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import Snackbar from '../components/ui/Snackbar'
import { subscriptionPlans } from '../data/mockData'

const PAYMENT_OPTIONS = [
  { value: 'esewa',  label: 'eSewa',              desc: 'Linked · **** 4521', badge: '💚' },
  { value: 'khalti', label: 'Khalti',             desc: 'Linked · **** 8832', badge: '💜' },
  { value: 'cash',   label: 'Cash on Delivery',   desc: 'Pay when delivered',  badge: '💵' },
]

const PLAN_OPTIONS = subscriptionPlans.map(p => ({
  value: p.id,
  label: p.name,
  desc: p.desc,
  price: `Rs. ${p.price}`,
  badge: p.popular ? 'Popular' : null,
}))

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

  const faqItems = [
    { id: '1', icon: '🚚', title: lang === 'ne' ? 'डेलिभरी कति समयमा हुन्छ?' : 'How long does delivery take?', content: lang === 'ne' ? 'सामान्यतया ३०-४५ मिनेटमा डेलिभरी हुन्छ। व्यस्त समयमा केही ढिलो हुन सक्छ।' : 'Usually 30-45 minutes. May take longer during peak hours.' },
    { id: '2', icon: '💳', title: lang === 'ne' ? 'कुन भुक्तानी विधि उपलब्ध छ?' : 'What payment methods are available?', content: lang === 'ne' ? 'eSewa, Khalti र नगद भुक्तानी उपलब्ध छ।' : 'eSewa, Khalti, and Cash on Delivery are available.' },
    { id: '3', icon: '🔄', title: lang === 'ne' ? 'अर्डर रद्द गर्न सकिन्छ?' : 'Can I cancel my order?', content: lang === 'ne' ? 'अर्डर confirm हुनुअघि रद्द गर्न सकिन्छ।' : 'You can cancel before the cook confirms your order.' },
    { id: '4', icon: '⭐', title: lang === 'ne' ? 'पकाउने कसरी रेट गर्ने?' : 'How do I rate a cook?', content: lang === 'ne' ? 'डेलिभर भएपछि अर्डर कार्डमा "रेटिङ दिनुस्" थिच्नुस्।' : 'After delivery, tap "Rate meal" on the order card.' },
  ]

  return (
    <>
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile hero */}
          <View style={s.hero}>
            <View style={s.avatarWrap}>
              <View style={s.avatar}><Text style={s.avatarText}>😊</Text></View>
              <View style={s.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{user?.name || 'Sanjay Shrestha'}</Text>
              <Text style={s.phone}>{user?.phone || '+977 98XXXXXXXX'}</Text>
              <View style={s.badgeRow}>
                <Badge label={lang === 'ne' ? 'प्रमाणित' : 'Verified'} variant="green" dot />
                <Badge label={lang === 'ne' ? 'नियमित ग्राहक' : 'Regular'} variant="brand" />
              </View>
            </View>
            <TouchableOpacity style={s.editBtn}>
              <Text style={s.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Stats bento */}
          <View style={s.section}>
            <BentoGrid>
              <BentoCard icon="📦" title={lang === 'ne' ? 'कुल अर्डर' : 'Total Orders'} value={String(orders.length)} bg="#FAECE7" color="#C0392B" />
              <BentoCard icon="👨‍🍳" title={lang === 'ne' ? 'पकाउने' : 'Cooks Tried'} value={String(cooksTried)} bg="#f0fdf4" color="#16a34a" />
              <BentoCard icon="💰" title={lang === 'ne' ? 'कुल खर्च' : 'Total Spent'} value={`Rs.${totalSpent.toLocaleString()}`} bg="#eff6ff" color="#2563eb" wide />
            </BentoGrid>
          </View>

          {/* Settings */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{lang === 'ne' ? 'सेटिङ' : 'Settings'}</Text>
            <View style={s.menuCard}>
              {/* Language */}
              <TouchableOpacity style={s.menuItem} onPress={() => setLang(l => l === 'en' ? 'ne' : 'en')}>
                <Text style={s.menuIcon}>🌐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>{lang === 'ne' ? 'भाषा' : 'Language'}</Text>
                  <Text style={s.menuSub}>{lang === 'en' ? 'English' : 'नेपाली'}</Text>
                </View>
                <Badge label={lang === 'en' ? 'EN' : 'NE'} variant="brand" size="sm" />
              </TouchableOpacity>

              <TouchableOpacity style={s.menuItem} onPress={() => setShowPayments(true)}>
                <Text style={s.menuIcon}>💳</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>{lang === 'ne' ? 'भुक्तानी विधि' : 'Payment Methods'}</Text>
                  <Text style={s.menuSub}>eSewa, Khalti, Cash</Text>
                </View>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.menuItem} onPress={() => setShowPlans(true)}>
                <Text style={s.menuIcon}>📦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>{lang === 'ne' ? 'सदस्यता योजना' : 'Subscription Plans'}</Text>
                  <Text style={s.menuSub}>{lang === 'ne' ? 'बचत गर्नुस्' : 'Save on every meal'}</Text>
                </View>
                <Badge label={lang === 'ne' ? 'सक्रिय' : 'Active'} variant="green" size="sm" />
              </TouchableOpacity>

              <View style={s.menuItem}>
                <Text style={s.menuIcon}>🔔</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>{lang === 'ne' ? 'सूचनाहरू' : 'Notifications'}</Text>
                  <Text style={s.menuSub}>{notifications ? (lang === 'ne' ? 'सक्रिय' : 'Enabled') : (lang === 'ne' ? 'बन्द' : 'Disabled')}</Text>
                </View>
                <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#d1d5db', true: '#C0392B' }} thumbColor="#fff" />
              </View>

              <TouchableOpacity style={s.menuItem} onPress={() => showSnack(lang === 'ne' ? 'छिट्टै आउँदैछ!' : 'Coming soon!')}>
                <Text style={s.menuIcon}>🎁</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.menuLabel}>{lang === 'ne' ? 'रेफर र कमाउनुस्' : 'Refer & Earn'}</Text>
                  <Text style={s.menuSub}>{lang === 'ne' ? 'Rs. २०० प्रति रेफर' : 'Rs. 200 per referral'}</Text>
                </View>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Accordion */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{lang === 'ne' ? 'सामान्य प्रश्नहरू' : 'FAQ'}</Text>
            <Accordion items={faqItems} />
          </View>

          {/* Sign out */}
          <View style={s.section}>
            <Button label={lang === 'ne' ? 'साइन आउट' : 'Sign Out'} variant="outline" fullWidth onPress={logout} />
          </View>

          <Text style={s.version}>TiffinGhar v1.0.0 · Made with ❤️ in Nepal</Text>
        </ScrollView>
      </SafeAreaView>

      {/* Payment Modal */}
      <Modal transparent animationType="slide" visible={showPayments} onRequestClose={() => setShowPayments(false)}>
        <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={() => setShowPayments(false)}>
          <TouchableOpacity style={m.sheet} activeOpacity={1}>
            <View style={m.handle} />
            <Text style={m.title}>💳 {lang === 'ne' ? 'भुक्तानी विधि' : 'Payment Methods'}</Text>
            <RadioGroup
              options={PAYMENT_OPTIONS.map(p => ({ ...p, label: `${p.badge} ${p.label}` }))}
              value={activePayment}
              onChange={setActivePayment}
            />
            <Button label={lang === 'ne' ? 'सेभ गर्नुस्' : 'Save'} fullWidth onPress={() => { setShowPayments(false); showSnack(lang === 'ne' ? 'भुक्तानी विधि सेभ भयो!' : 'Payment method saved!') }} style={{ marginTop: 8 }} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Subscription Modal */}
      <Modal transparent animationType="slide" visible={showPlans} onRequestClose={() => setShowPlans(false)}>
        <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={() => setShowPlans(false)}>
          <TouchableOpacity style={m.sheet} activeOpacity={1}>
            <View style={m.handle} />
            <Text style={m.title}>📦 {lang === 'ne' ? 'सदस्यता योजना' : 'Subscription Plans'}</Text>
            <Text style={m.sub}>{lang === 'ne' ? 'सदस्यता लिएर प्रति खानामा बचत गर्नुस्' : 'Subscribe and save on every meal'}</Text>
            <RadioGroup options={PLAN_OPTIONS} value={activePlan} onChange={setActivePlan} />
            <Button label={lang === 'ne' ? 'सदस्यता लिनुस्' : 'Subscribe Now'} fullWidth onPress={() => { setShowPlans(false); showSnack(lang === 'ne' ? 'सदस्यता सक्रिय भयो!' : 'Subscription activated!') }} style={{ marginTop: 8 }} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Snackbar visible={snack.visible} message={snack.message} type={snack.type} onDismiss={() => setSnack(p => ({ ...p, visible: false }))} />
    </>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FAECE7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#16a34a', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  phone: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  editIcon: { fontSize: 16 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  menuIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  menuSub: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  menuArrow: { fontSize: 22, color: '#d1d5db' },
  version: { textAlign: 'center', fontSize: 12, color: '#d1d5db', paddingBottom: 24 },
})

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
})
