import { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useApp } from '../context/AppContext'
import EsewaPayment from './EsewaPayment'

const ADDRESSES = [
  { id: 1, label: 'Home', labelNe: 'घर', detail: 'Baneshwor-10, Kathmandu' },
  { id: 2, label: 'Office', labelNe: 'कार्यालय', detail: 'New Baneshwor, Kathmandu' },
]
const PAYMENTS = [
  { id: 'esewa', label: 'eSewa', icon: '💚' },
  { id: 'khalti', label: 'Khalti', icon: '💜' },
  { id: 'cash', label: 'Cash on Delivery', labelNe: 'नगद भुक्तानी', icon: '💵' },
]

export default function CartModal({ visible, onClose }) {
  const { lang, cart, updateCartQty, cartTotal, placeOrder } = useApp()
  const [step, setStep] = useState('cart')
  const [selectedAddress, setSelectedAddress] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('esewa')
  const [placed, setPlaced] = useState(false)
  const [showEsewa, setShowEsewa] = useState(false)

  const handlePlace = () => {
    if (selectedPayment === 'esewa') {
      setShowEsewa(true)
      return
    }
    confirmOrder()
  }

  const confirmOrder = () => {
    const addr = ADDRESSES.find(a => a.id === selectedAddress)
    placeOrder(addr.detail, selectedPayment)
    setPlaced(true)
    setTimeout(() => { setPlaced(false); setStep('cart'); onClose() }, 2200)
  }

  const stepTitle = { cart: lang === 'ne' ? '🛒 कार्ट' : '🛒 Your Cart', address: lang === 'ne' ? '📍 ठेगाना' : '📍 Delivery Address', payment: lang === 'ne' ? '💳 भुक्तानी' : '💳 Payment' }

  return (
    <>
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity style={[styles.sheet, { flex: 1 }]} activeOpacity={1}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {step !== 'cart' && (
                <TouchableOpacity onPress={() => setStep('cart')}>
                  <Text style={styles.back}>‹</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle}>{stepTitle[step]}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={true} bounces={true}>
            {placed && (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>{lang === 'ne' ? 'अर्डर राखियो!' : 'Order Placed!'}</Text>
                <Text style={styles.successSub}>{lang === 'ne' ? 'तपाईंको खाना तयार हुँदैछ' : 'Your food is being prepared'}</Text>
              </View>
            )}

            {!placed && step === 'cart' && (
              cart.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>🍱</Text>
                  <Text style={styles.emptyText}>{lang === 'ne' ? 'कार्ट खाली छ' : 'Your cart is empty'}</Text>
                </View>
              ) : (
                <>
                  {cart.map(item => (
                    <View key={item.key} style={styles.cartItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cartItemName}>{lang === 'ne' ? item.mealNe : item.meal}</Text>
                        <Text style={styles.cartItemSub}>{lang === 'ne' ? item.cookNameNe : item.cookName} · Rs. {item.price}</Text>
                      </View>
                      <View style={styles.qtyRow}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.key, -1)}>
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qty}>{item.qty}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.key, 1)}>
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                        <Text style={styles.itemTotal}>Rs. {item.price * item.qty}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>{lang === 'ne' ? 'उप-जम्मा' : 'Subtotal'}</Text>
                      <Text style={styles.summaryVal}>Rs. {cartTotal}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>{lang === 'ne' ? 'डेलिभरी' : 'Delivery'}</Text>
                      <Text style={[styles.summaryVal, { color: '#16a34a' }]}>{lang === 'ne' ? 'निःशुल्क' : 'Free'}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                      <Text style={styles.totalLabel}>{lang === 'ne' ? 'जम्मा' : 'Total'}</Text>
                      <Text style={styles.totalVal}>Rs. {cartTotal}</Text>
                    </View>
                  </View>
                </>
              )
            )}

            {!placed && step === 'address' && ADDRESSES.map(addr => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.optionCard, selectedAddress === addr.id && styles.optionCardActive]}
                onPress={() => setSelectedAddress(addr.id)}
              >
                <Text style={styles.optionIcon}>📍</Text>
                <View>
                  <Text style={styles.optionLabel}>{lang === 'ne' ? addr.labelNe : addr.label}</Text>
                  <Text style={styles.optionDetail}>{addr.detail}</Text>
                </View>
                {selectedAddress === addr.id && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}

            {!placed && step === 'payment' && (
              <>
                {PAYMENTS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.optionCard, selectedPayment === p.id && styles.optionCardActive]}
                    onPress={() => setSelectedPayment(p.id)}
                  >
                    <Text style={styles.optionIcon}>{p.icon}</Text>
                    <Text style={styles.optionLabel}>{lang === 'ne' && p.labelNe ? p.labelNe : p.label}</Text>
                    {selectedPayment === p.id && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                ))}
                <View style={styles.summary}>
                  {cart.map(item => (
                    <View key={item.key} style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>{lang === 'ne' ? item.mealNe : item.meal} ×{item.qty}</Text>
                      <Text style={styles.summaryVal}>Rs. {item.price * item.qty}</Text>
                    </View>
                  ))}
                  <View style={[styles.summaryRow, styles.summaryTotal]}>
                    <Text style={styles.totalLabel}>{lang === 'ne' ? 'जम्मा' : 'Total'}</Text>
                    <Text style={styles.totalVal}>Rs. {cartTotal}</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          {!placed && cart.length > 0 && (
            <View style={styles.footer}>
              {step === 'cart' && (
                <TouchableOpacity style={styles.ctaBtn} onPress={() => setStep('address')}>
                  <Text style={styles.ctaBtnText}>{lang === 'ne' ? 'अगाडि बढ्नुस्' : 'Proceed to Checkout'}</Text>
                  <Text style={styles.ctaBtnText}>Rs. {cartTotal} →</Text>
                </TouchableOpacity>
              )}
              {step === 'address' && (
                <TouchableOpacity style={styles.ctaBtn} onPress={() => setStep('payment')}>
                  <Text style={styles.ctaBtnText}>{lang === 'ne' ? 'भुक्तानीमा जानुस्' : 'Continue to Payment'}</Text>
                </TouchableOpacity>
              )}
              {step === 'payment' && (
                <TouchableOpacity style={styles.ctaBtn} onPress={handlePlace}>
                  <Text style={styles.ctaBtnText}>{lang === 'ne' ? `Rs. ${cartTotal} तिर्नुस्` : `Pay Rs. ${cartTotal}`}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>

    {/* eSewa Payment WebView */}
    <EsewaPayment
      visible={showEsewa}
      amount={cartTotal}
      orderId={`TG${Date.now()}`}
      onSuccess={() => { setShowEsewa(false); confirmOrder() }}
      onFailure={() => { setShowEsewa(false) }}
      onClose={() => setShowEsewa(false)}
    />
  </>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '88%', flexDirection: 'column' },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  back: { fontSize: 24, color: '#9ca3af', lineHeight: 28 },
  close: { fontSize: 18, color: '#9ca3af' },
  successBox: { alignItems: 'center', paddingVertical: 40 },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  successSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: '#f9fafb' },
  cartItemName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  cartItemSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, color: '#374151', lineHeight: 20 },
  qty: { fontSize: 14, fontWeight: '600', color: '#111827', minWidth: 16, textAlign: 'center' },
  itemTotal: { fontSize: 13, fontWeight: '600', color: '#111827', minWidth: 56, textAlign: 'right' },
  summary: { margin: 20, backgroundColor: '#f9fafb', borderRadius: 12, padding: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: '#6b7280' },
  summaryVal: { fontSize: 13, color: '#6b7280' },
  summaryTotal: { borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 8, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  totalVal: { fontSize: 14, fontWeight: '600', color: '#111827' },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 10 },
  optionCardActive: { borderColor: '#C0392B', backgroundColor: '#FAECE7' },
  optionIcon: { fontSize: 22 },
  optionLabel: { fontSize: 14, fontWeight: '500', color: '#111827' },
  optionDetail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  check: { marginLeft: 'auto', color: '#C0392B', fontWeight: '700', fontSize: 16 },
  footer: { padding: 16, borderTopWidth: 0.5, borderTopColor: '#f3f4f6' },
  ctaBtn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ctaBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
