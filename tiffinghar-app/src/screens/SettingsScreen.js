import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, StyleSheet, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Accordion } from '../components/ui/Accordion'

export default function SettingsScreen({ onClose }) {
  const { lang, setLang } = useApp()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState({ orders: true, promos: true, reminders: false })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const t = (en, ne) => lang === 'ne' ? ne : en

  const notifItems = [
    { key: 'orders', label: t('Order updates', 'अर्डर अपडेट'), sub: t('Preparing, on the way, delivered', 'तयार, बाटोमा, डेलिभर') },
    { key: 'promos', label: t('Offers & Promotions', 'अफर र प्रमोशन'), sub: t('Discounts and special deals', 'छुट र विशेष अफर') },
    { key: 'reminders', label: t('Meal reminders', 'खाना सम्झाउने'), sub: t('Remind me to order lunch', 'दिउँसोको खाना अर्डर गर्न सम्झाउनुस्') },
  ]

  const faqItems = [
    { id: '1', icon: '🚚', title: t('How long does delivery take?', 'डेलिभरी कति समयमा हुन्छ?'), content: t('Usually 30-45 minutes. May take longer during peak hours.', 'सामान्यतया ३०-४५ मिनेट।') },
    { id: '2', icon: '💳', title: t('What payment methods are available?', 'कुन भुक्तानी विधि उपलब्ध छ?'), content: t('eSewa, Khalti, and Cash on Delivery.', 'eSewa, Khalti र नगद भुक्तानी।') },
    { id: '3', icon: '🔄', title: t('Can I cancel my order?', 'अर्डर रद्द गर्न सकिन्छ?'), content: t('Yes, before the cook confirms.', 'हो, पकाउनेले confirm गर्नुअघि।') },
    { id: '4', icon: '👩‍🍳', title: t('How do I become a cook?', 'पकाउने कसरी बन्ने?'), content: t('Go to Cooks tab and tap "Become a Cook".', 'Cooks ट्याबमा जानुस् र "पकाउने बन्नुस्" थिच्नुस्।') },
    { id: '5', icon: '💰', title: t('How do cooks get paid?', 'पकाउनेलाई कसरी भुक्तानी हुन्छ?'), content: t('Weekly payouts via eSewa or bank transfer.', 'साप्ताहिक eSewa वा बैंक ट्रान्सफरमार्फत।') },
  ]

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t('Settings', 'सेटिङ')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('Account', 'खाता')}</Text>
          <View style={s.card}>
            <View style={s.profileRow}>
              <View style={s.avatar}><Text style={{ fontSize: 26 }}>😊</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.profileName}>{user?.name || 'User'}</Text>
                <Text style={s.profilePhone}>{user?.phone || ''}</Text>
              </View>
              <TouchableOpacity style={s.editBtn}><Text style={s.editText}>{t('Edit', 'सम्पादन')}</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('Language', 'भाषा')}</Text>
          <View style={s.card}>
            <View style={s.langRow}>
              {[['en', '🇬🇧 English'], ['ne', '🇳🇵 नेपाली']].map(([code, label]) => (
                <TouchableOpacity
                  key={code}
                  style={[s.langBtn, lang === code && s.langBtnActive]}
                  onPress={() => setLang(code)}
                >
                  <Text style={[s.langBtnText, lang === code && s.langBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('Notifications', 'सूचनाहरू')}</Text>
          <View style={s.card}>
            {notifItems.map((item, i) => (
              <View key={item.key} style={[s.notifRow, i < notifItems.length - 1 && s.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.notifLabel}>{item.label}</Text>
                  <Text style={s.notifSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={notifications[item.key]}
                  onValueChange={v => setNotifications(p => ({ ...p, [item.key]: v }))}
                  trackColor={{ false: '#d1d5db', true: '#C0392B' }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('About', 'बारेमा')}</Text>
          <View style={s.card}>
            {[
              [t('Version', 'संस्करण'), '1.0.0'],
              [t('Terms of Service', 'सेवा सर्तहरू'), '›'],
              [t('Privacy Policy', 'गोपनीयता नीति'), '›'],
              [t('Contact Support', 'सहयोग सम्पर्क'), '›'],
            ].map(([label, val], i, arr) => (
              <TouchableOpacity key={label} style={[s.aboutRow, i < arr.length - 1 && s.rowBorder]}>
                <Text style={s.aboutLabel}>{label}</Text>
                <Text style={s.aboutVal}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('FAQ', 'सामान्य प्रश्न')}</Text>
          <Accordion items={faqItems} allowMultiple />
        </View>

        {/* Danger zone */}
        <View style={s.section}>
          <TouchableOpacity style={s.logoutBtn} onPress={logout}>
            <Text style={s.logoutText}>🚪 {t('Sign Out', 'साइन आउट')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.deleteBtn} onPress={() => setShowDeleteConfirm(true)}>
            <Text style={s.deleteText}>🗑️ {t('Delete Account', 'खाता मेटाउनुस्')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>TiffinGhar v1.0.0 · Made with ❤️ in Nepal</Text>
      </ScrollView>

      {/* Delete confirm modal */}
      <Modal transparent animationType="fade" visible={showDeleteConfirm} onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>⚠️ {t('Delete Account?', 'खाता मेटाउने?')}</Text>
            <Text style={s.modalSub}>{t('This action cannot be undone. All your data will be permanently deleted.', 'यो कार्य पूर्ववत गर्न सकिँदैन।')}</Text>
            <TouchableOpacity style={s.modalDelete} onPress={() => { setShowDeleteConfirm(false); logout() }}>
              <Text style={s.modalDeleteText}>{t('Yes, Delete', 'हो, मेटाउनुस्')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancel} onPress={() => setShowDeleteConfirm(false)}>
              <Text style={s.modalCancelText}>{t('Cancel', 'रद्द गर्नुस्')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#374151', lineHeight: 26 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FAECE7', alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  profilePhone: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  editBtn: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  editText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  langRow: { flexDirection: 'row', gap: 10, padding: 14 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  langBtnActive: { borderColor: '#C0392B', backgroundColor: '#FAECE7' },
  langBtnText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  langBtnTextActive: { color: '#C0392B', fontWeight: '700' },
  notifRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  notifLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  notifSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  aboutLabel: { fontSize: 14, color: '#374151' },
  aboutVal: { fontSize: 14, color: '#9ca3af' },
  logoutBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 10 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  deleteBtn: { backgroundColor: '#fef2f2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#fecaca' },
  deleteText: { fontSize: 15, fontWeight: '600', color: '#dc2626' },
  version: { textAlign: 'center', fontSize: 12, color: '#d1d5db', paddingBottom: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  modalDelete: { backgroundColor: '#dc2626', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 10 },
  modalDeleteText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalCancel: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  modalCancelText: { color: '#374151', fontWeight: '600', fontSize: 15 },
})
