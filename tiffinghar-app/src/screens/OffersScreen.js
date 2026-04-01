import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { api } from '../api/client'

const OFFER_COLORS = [
  { bg: '#FAECE7', accent: '#C0392B', icon: '🎉' },
  { bg: '#f0fdf4', accent: '#16a34a', icon: '💚' },
  { bg: '#eff6ff', accent: '#2563eb', icon: '⚡' },
  { bg: '#fef9c3', accent: '#ca8a04', icon: '🌟' },
]

export default function OffersScreen({ onClose, onApply }) {
  const { lang, toast } = useApp()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    api.get('/offers')
      .then(res => setOffers(res.offers || []))
      .catch(() => {
        // Fallback mock offers
        setOffers([
          { _id: '1', code: 'TIFFIN20', title: '20% off first order', titleNe: 'पहिलो अर्डरमा २०% छुट', type: 'percent', value: 20, minOrder: 150, description: 'Get 20% off on your first order. Max discount Rs. 100' },
          { _id: '2', code: 'FLAT50', title: 'Rs. 50 off', titleNe: 'Rs. ५० छुट', type: 'flat', value: 50, minOrder: 200, description: 'Flat Rs. 50 off on orders above Rs. 200' },
          { _id: '3', code: 'FREEDEL', title: 'Free Delivery', titleNe: 'निःशुल्क डेलिभरी', type: 'free_delivery', value: 0, minOrder: 100, description: 'Free delivery on any order' },
          { _id: '4', code: 'NEWARI10', title: '10% off Newari food', titleNe: 'नेवारी खानामा १०% छुट', type: 'percent', value: 10, minOrder: 180, description: '10% off on Newari cuisine orders' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = (code) => {
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
    toast(lang === 'ne' ? `${code} कपी भयो!` : `${code} copied!`)
  }

  const handleApply = (code) => {
    onApply?.(code)
    onClose?.()
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{lang === 'ne' ? '🎁 अफर र छुट' : '🎁 Offers & Coupons'}</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color="#C0392B" size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          <Text style={s.sectionLabel}>{lang === 'ne' ? 'उपलब्ध अफरहरू' : 'Available Offers'}</Text>

          {offers.map((offer, i) => {
            const c = OFFER_COLORS[i % OFFER_COLORS.length]
            return (
              <View key={offer._id} style={[s.card, { backgroundColor: c.bg }]}>
                {/* Dashed divider */}
                <View style={s.cardLeft}>
                  <Text style={s.cardIcon}>{c.icon}</Text>
                  <View style={[s.codeBadge, { borderColor: c.accent }]}>
                    <Text style={[s.codeText, { color: c.accent }]}>{offer.code}</Text>
                  </View>
                  <Text style={s.discount}>
                    {offer.type === 'percent' ? `${offer.value}% OFF` :
                     offer.type === 'flat' ? `Rs. ${offer.value} OFF` : 'FREE DELIVERY'}
                  </Text>
                </View>

                <View style={s.divider} />

                <View style={s.cardRight}>
                  <Text style={s.offerTitle}>{lang === 'ne' ? (offer.titleNe || offer.title) : offer.title}</Text>
                  <Text style={s.offerDesc}>{offer.description}</Text>
                  {offer.minOrder > 0 && (
                    <Text style={s.minOrder}>Min. order Rs. {offer.minOrder}</Text>
                  )}
                  <View style={s.btnRow}>
                    <TouchableOpacity
                      style={[s.copyBtn, { borderColor: c.accent }]}
                      onPress={() => handleCopy(offer.code)}
                    >
                      <Text style={[s.copyBtnText, { color: c.accent }]}>
                        {copied === offer.code ? '✓ Copied' : 'Copy Code'}
                      </Text>
                    </TouchableOpacity>
                    {onApply && (
                      <TouchableOpacity
                        style={[s.applyBtn, { backgroundColor: c.accent }]}
                        onPress={() => handleApply(offer.code)}
                      >
                        <Text style={s.applyBtnText}>Apply</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#374151', lineHeight: 26 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  card: { flexDirection: 'row', borderRadius: 16, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  cardLeft: { width: 90, alignItems: 'center', justifyContent: 'center', padding: 14, gap: 6 },
  cardIcon: { fontSize: 28 },
  codeBadge: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  codeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  discount: { fontSize: 10, fontWeight: '700', color: '#374151', textAlign: 'center' },
  divider: { width: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 12 },
  cardRight: { flex: 1, padding: 14 },
  offerTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  offerDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 6 },
  minOrder: { fontSize: 11, color: '#9ca3af', marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 8 },
  copyBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  copyBtnText: { fontSize: 12, fontWeight: '700' },
  applyBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  applyBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
})
