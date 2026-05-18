import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import CookCard from '../components/CookCard'
import CookDetailModal from '../components/CookDetailModal'

const COOK_BENEFITS = [
  { icon: '💰', title: 'Earn Rs. 15K–25K', sub: 'Monthly from home' },
  { icon: '🛵', title: 'We handle delivery', sub: 'You just cook' },
  { icon: '📅', title: 'Weekly payouts', sub: 'Every Monday' },
  { icon: '🆓', title: 'Free to join', sub: 'No upfront cost' },
]

export default function CooksScreen() {
  const { lang, cooks, orders, toast } = useApp()
  const [selectedCook, setSelectedCook] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', area: '', specialty: '' })
  const [submitted, setSubmitted] = useState(false)

  const savedCooks = cooks.filter(c => c.saved)
  const totalSpent = orders.reduce((s, o) => s + (o.price || 0), 0)
  const cooksTried = [...new Set(orders.map(o => o.cookId))].filter(Boolean).length

  const handleSubmit = () => {
    if (!form.name || !form.phone) { toast('Name and phone required'); return }
    setSubmitted(true)
    toast('Application sent! We\'ll contact you soon.')
    setTimeout(() => { setSubmitted(false); setShowForm(false); setForm({ name: '', phone: '', area: '', specialty: '' }) }, 2000)
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{lang === 'ne' ? 'पकाउने' : 'Cooks'}</Text>
          <Text style={s.sub}>{lang === 'ne' ? 'तपाईंका मनपर्ने पकाउने' : 'Your favourite home cooks'}</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: String(orders.length), label: lang === 'ne' ? 'अर्डर' : 'Orders', color: '#C0392B', bg: '#FAECE7' },
            { val: String(cooksTried), label: lang === 'ne' ? 'पकाउने' : 'Tried', color: '#16a34a', bg: '#f0fdf4' },
            { val: `Rs.${(totalSpent/1000).toFixed(1)}K`, label: lang === 'ne' ? 'खर्च' : 'Spent', color: '#2563eb', bg: '#eff6ff' },
            { val: String(savedCooks.length), label: lang === 'ne' ? 'सेभ' : 'Saved', color: '#dc2626', bg: '#fee2e2' },
          ].map((stat, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: stat.bg }]}>
              <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Saved cooks */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{lang === 'ne' ? 'सेभ गरिएका पकाउने' : 'Saved Cooks'}</Text>
          {savedCooks.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>🤍</Text>
              <Text style={s.emptyTitle}>{lang === 'ne' ? 'कुनै सेभ गरिएको छैन' : 'No saved cooks yet'}</Text>
              <Text style={s.emptySub}>{lang === 'ne' ? 'होम पेजमा ❤️ थिच्नुस्' : 'Tap ❤️ on any cook card to save'}</Text>
            </View>
          ) : (
            <View style={s.cookList}>
              {savedCooks.map(cook => (
                <CookCard key={cook.id || cook._id} cook={cook} onPress={setSelectedCook} />
              ))}
            </View>
          )}
        </View>

        {/* Become a cook CTA */}
        <View style={s.section}>
          <TouchableOpacity style={s.becomeCTA} onPress={() => setShowForm(true)} activeOpacity={0.9}>
            {/* Background image */}
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&h=300&fit=crop' }}
              style={s.ctaBg}
              resizeMode="cover"
            />
            <View style={s.ctaOverlay} />
            <View style={s.ctaContent}>
              <View style={s.ctaBadge}>
                <Text style={s.ctaBadgeText}>🆓 Free to join</Text>
              </View>
              <Text style={s.ctaTitle}>Become a Home Cook</Text>
              <Text style={s.ctaSub}>Earn Rs. 15,000–25,000/month cooking from home</Text>
              <View style={s.ctaBtn}>
                <Text style={s.ctaBtnText}>Apply Now →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{lang === 'ne' ? 'फाइदाहरू' : 'Why Cook with Us?'}</Text>
          <View style={s.benefitsGrid}>
            {COOK_BENEFITS.map((b, i) => (
              <View key={i} style={s.benefitCard}>
                <Text style={s.benefitIcon}>{b.icon}</Text>
                <Text style={s.benefitTitle}>{b.title}</Text>
                <Text style={s.benefitSub}>{b.sub}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Become a cook form */}
      {showForm && (
        <View style={s.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowForm(false)} />
          <View style={s.modalSheet}>
            <View style={s.handle} />
            {submitted ? (
              <View style={s.successBox}>
                <Text style={s.successEmoji}>🎉</Text>
                <Text style={s.successTitle}>Application Sent!</Text>
                <Text style={s.successSub}>We'll contact you within 24 hours.</Text>
              </View>
            ) : (
              <>
                <Text style={s.modalTitle}>👩‍🍳 Become a Cook</Text>
                <Text style={s.modalSub}>Cook from home and earn. We handle delivery and payments.</Text>
                {[
                  { key: 'name', ph: 'Your full name *' },
                  { key: 'phone', ph: 'Phone number *', type: 'phone-pad' },
                  { key: 'area', ph: 'Your area (e.g. Baneshwor)' },
                  { key: 'specialty', ph: 'Specialty (e.g. Newari, Dal Bhat)' },
                ].map(f => (
                  <TextInput
                    key={f.key}
                    value={form[f.key]}
                    onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                    placeholder={f.ph}
                    placeholderTextColor="#9ca3af"
                    keyboardType={f.type || 'default'}
                    style={s.input}
                  />
                ))}
                <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
                  <Text style={s.submitBtnText}>Apply Now →</Text>
                </TouchableOpacity>
                <Text style={s.formNote}>✅ Free · ✅ We handle delivery · ✅ Weekly payouts</Text>
              </>
            )}
          </View>
        </View>
      )}

      <CookDetailModal cook={selectedCook} onClose={() => setSelectedCook(null)} />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 3 },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#6b7280', fontWeight: '500' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  cookList: {},
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', gap: 6 },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
  becomeCTA: { borderRadius: 18, overflow: 'hidden', height: 180, position: 'relative' },
  ctaBg: { ...StyleSheet.absoluteFillObject },
  ctaOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  ctaContent: { padding: 20, flex: 1, justifyContent: 'flex-end' },
  ctaBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  ctaBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  ctaBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  ctaBtnText: { color: '#C0392B', fontWeight: '800', fontSize: 13 },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  benefitCard: { width: '47.5%', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  benefitIcon: { fontSize: 24, marginBottom: 4 },
  benefitTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  benefitSub: { fontSize: 11, color: '#6b7280' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827', marginBottom: 10 },
  submitBtn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  formNote: { textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 12 },
  successBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  successSub: { fontSize: 14, color: '#6b7280' },
})
