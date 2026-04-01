import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'

// TEST-ONLY eSewa mock — simulates payment flow without real network call
export default function EsewaPayment({ visible, amount, orderId, onSuccess, onFailure, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          {/* eSewa branding */}
          <View style={s.brand}>
            <Text style={s.brandLogo}>💚</Text>
            <Text style={s.brandName}>eSewa</Text>
            <Text style={s.brandTag}>Digital Wallet · TEST MODE</Text>
          </View>

          {/* Amount */}
          <View style={s.amountBox}>
            <Text style={s.amountLabel}>Payment Amount</Text>
            <Text style={s.amount}>Rs. {amount}</Text>
            <Text style={s.orderId}>Order #{orderId}</Text>
          </View>

          {/* Test credentials */}
          <View style={s.credBox}>
            <Text style={s.credTitle}>🧪 Test Credentials</Text>
            {[
              ['Phone',    '9806800001'],
              ['MPIN',     '1122'],
              ['Password', 'Nepal@123'],
              ['Merchant', 'EPAYTEST'],
            ].map(([k, v]) => (
              <View key={k} style={s.credRow}>
                <Text style={s.credKey}>{k}</Text>
                <Text style={s.credVal}>{v}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={s.successBtn}
            onPress={() => onSuccess?.({ orderId, amount, simulated: true })}
          >
            <Text style={s.successBtnText}>✅ Simulate Successful Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.failBtn}
            onPress={() => { onFailure?.(); onClose?.() }}
          >
            <Text style={s.failBtnText}>❌ Simulate Failed Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  brand: { alignItems: 'center', marginBottom: 20 },
  brandLogo: { fontSize: 48, marginBottom: 4 },
  brandName: { fontSize: 24, fontWeight: '800', color: '#166534' },
  brandTag: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  amountBox: { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  amountLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  amount: { fontSize: 36, fontWeight: '800', color: '#15803d' },
  orderId: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  credBox: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginBottom: 20 },
  credTitle: { fontSize: 11, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  credRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb' },
  credKey: { fontSize: 13, color: '#6b7280' },
  credVal: { fontSize: 13, fontWeight: '700', color: '#111827' },
  successBtn: { backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  successBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  failBtn: { backgroundColor: '#fef2f2', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#fecaca' },
  failBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { color: '#9ca3af', fontSize: 14 },
})
