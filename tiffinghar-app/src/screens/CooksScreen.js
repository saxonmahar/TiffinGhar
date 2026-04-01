import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import CookCard from '../components/CookCard'
import CookDetailModal from '../components/CookDetailModal'

export default function CooksScreen() {
  const { lang, cooks, orders, toast } = useApp()
  const [selectedCook, setSelectedCook] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', area: '', specialty: '' })
  const [submitted, setSubmitted] = useState(false)

  const savedCooks = cooks.filter(c => c.saved)
  const totalSpent = orders.reduce((s, o) => s + o.price, 0)
  const cooksTried = [...new Set(orders.map(o => o.cookId))].length

  const stats = [
    { label: lang === 'ne' ? 'कुल अर्डर' : 'Total orders', val: String(orders.length) },
    { label: lang === 'ne' ? 'पकाउने' : 'Cooks tried', val: String(cooksTried) },
    { label: lang === 'ne' ? 'कुल खर्च' : 'Total spent', val: `Rs. ${totalSpent.toLocaleString()}` },
    { label: lang === 'ne' ? 'सेभ गरिएका' : 'Saved', val: String(savedCooks.length) },
  ]

  const handleSubmit = () => {
    if (!form.name || !form.phone) { toast(lang === 'ne' ? 'नाम र फोन आवश्यक छ' : 'Name and phone required'); return }
    setSubmitted(true)
    toast(lang === 'ne' ? 'आवेदन पठाइयो!' : 'Application sent!')
    setTimeout(() => { setSubmitted(false); setShowForm(false); setForm({ name: '', phone: '', area: '', specialty: '' }) }, 2000)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statVal}>{s.val}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>
          {lang === 'ne' ? 'सेभ गरिएका पकाउने' : 'Your Saved Cooks'}
        </Text>

        {savedCooks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 28 }}>🤍</Text>
            <Text style={styles.emptyText}>{lang === 'ne' ? 'कुनै सेभ गरिएको छैन' : 'No saved cooks yet'}</Text>
            <Text style={styles.emptyHint}>{lang === 'ne' ? 'होम पेजमा ❤️ थिच्नुस्' : 'Tap ❤️ on any cook to save'}</Text>
          </View>
        ) : (
          savedCooks.map(cook => <CookCard key={cook.id} cook={cook} onPress={setSelectedCook} />)
        )}

        {/* Become a cook */}
        <TouchableOpacity style={styles.becomeCTA} onPress={() => setShowForm(true)}>
          <View style={styles.becomeLeft}>
            <View style={styles.becomeIcon}><Text style={{ fontSize: 22 }}>+</Text></View>
            <View>
              <Text style={styles.becomeName}>{lang === 'ne' ? 'पकाउने बन्नुस्' : 'Become a Cook'}</Text>
              <Text style={styles.becomeSub}>{lang === 'ne' ? 'घरबाटै Rs. १५,०००–२५,०००/महिना' : 'Earn Rs. 15,000–25,000/month'}</Text>
            </View>
          </View>
          <View style={styles.becomeBadges}>
            <View style={styles.greenBadge}><Text style={styles.greenBadgeText}>{lang === 'ne' ? 'खुला छ' : 'Open'}</Text></View>
            <View style={styles.blueBadge}><Text style={styles.blueBadgeText}>{lang === 'ne' ? 'निःशुल्क' : 'Free'}</Text></View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Become a cook modal */}
      {showForm && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowForm(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            {submitted ? (
              <View style={styles.successBox}>
                <Text style={{ fontSize: 40 }}>🎉</Text>
                <Text style={styles.successTitle}>{lang === 'ne' ? 'आवेदन पठाइयो!' : 'Application Sent!'}</Text>
                <Text style={styles.successSub}>{lang === 'ne' ? 'हामी छिट्टै सम्पर्क गर्नेछौं।' : "We'll contact you soon."}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>🍳 {lang === 'ne' ? 'पकाउने बन्नुस्' : 'Become a Cook'}</Text>
                <Text style={styles.modalSub}>{lang === 'ne' ? 'आफ्नो घरबाटै खाना पकाएर कमाउनुस्।' : 'Cook from home and earn.'}</Text>
                {[
                  { key: 'name', ph: lang === 'ne' ? 'तपाईंको नाम *' : 'Your name *' },
                  { key: 'phone', ph: lang === 'ne' ? 'फोन नम्बर *' : 'Phone number *', type: 'phone-pad' },
                  { key: 'area', ph: lang === 'ne' ? 'ठेगाना / क्षेत्र' : 'Address / Area' },
                  { key: 'specialty', ph: lang === 'ne' ? 'विशेषता (नेवारी, थकाली...)' : 'Specialty (Newari, Thakali...)' },
                ].map(f => (
                  <TextInput
                    key={f.key}
                    value={form[f.key]}
                    onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                    placeholder={f.ph}
                    placeholderTextColor="#9ca3af"
                    keyboardType={f.type || 'default'}
                    style={styles.input}
                  />
                ))}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>{lang === 'ne' ? 'आवेदन दिनुस्' : 'Apply Now'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      <CookDetailModal cook={selectedCook} onClose={() => setSelectedCook(null)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12 },
  statLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: '600', color: '#111827' },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#fff', borderRadius: 14, gap: 6, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  emptyHint: { fontSize: 12, color: '#d1d5db' },
  becomeCTA: { borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 14, padding: 14, marginTop: 4 },
  becomeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  becomeIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EAF3DE', alignItems: 'center', justifyContent: 'center' },
  becomeName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  becomeSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  becomeBadges: { flexDirection: 'row', gap: 8 },
  greenBadge: { backgroundColor: '#EAF3DE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  greenBadgeText: { fontSize: 11, color: '#3B6D11', fontWeight: '500' },
  blueBadge: { backgroundColor: '#E6F1FB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  blueBadgeText: { fontSize: 11, color: '#185FA5', fontWeight: '500' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827', marginBottom: 10 },
  submitBtn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  successBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  successTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  successSub: { fontSize: 14, color: '#6b7280' },
})
