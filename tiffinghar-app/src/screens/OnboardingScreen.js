import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function OnboardingScreen() {
  const { login } = useAuth()
  const [step, setStep] = useState('role')   // role | customer | cook
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Customer form
  const [cPhone, setCPhone] = useState('')
  const [cName, setCName] = useState('')

  // Cook form
  const [kPhone, setKPhone] = useState('')
  const [kName, setKName] = useState('')
  const [kArea, setKArea] = useState('')
  const [kSpecialty, setKSpecialty] = useState('')
  const [kBio, setKBio] = useState('')

  const handleCustomerLogin = async () => {
    if (cPhone.length < 10) { setError('Enter a valid 10-digit number'); return }
    setError(''); setLoading(true)
    try {
      await login(`+977${cPhone}`, cName || 'Customer')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const handleCookRegister = async () => {
    if (kPhone.length < 10) { setError('Enter a valid phone number'); return }
    if (!kName) { setError('Name is required'); return }
    if (!kArea) { setError('Area/location is required'); return }
    setError(''); setLoading(true)
    try {
      await login(`+977${kPhone}`, kName, 'cook', { area: kArea, specialty: kSpecialty, bio: kBio })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  if (step === 'role') {
    return (
      <View style={s.root}>
        <View style={s.hero}>
          <Text style={s.emoji}>🍱</Text>
          <Text style={s.title}>TiffinGhar</Text>
          <Text style={s.sub}>घरको खाना, ढोकासम्म{'\n'}Home food, to your door</Text>
        </View>

        <View style={s.roleSection}>
          <Text style={s.roleTitle}>I want to...</Text>

          <TouchableOpacity style={[s.roleCard, s.roleCardCustomer]} onPress={() => { setRole('customer'); setStep('customer') }}>
            <Text style={s.roleEmoji}>🛵</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.roleCardTitle}>Order Food</Text>
              <Text style={s.roleCardSub}>Find home cooks near you and get fresh meals delivered</Text>
            </View>
            <Text style={s.roleArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.roleCard, s.roleCardCook]} onPress={() => { setRole('cook'); setStep('cook') }}>
            <Text style={s.roleEmoji}>👩‍🍳</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.roleCardTitle}>Cook & Earn</Text>
              <Text style={s.roleCardSub}>Register as a home cook and earn Rs. 15,000–25,000/month</Text>
            </View>
            <Text style={s.roleArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.terms}>By continuing you agree to our Terms & Privacy Policy</Text>
      </View>
    )
  }

  if (step === 'customer') {
    return (
      <ScrollView style={s.root} contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setStep('role')} style={s.back}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.formTitle}>🛵 Order Food</Text>
        <Text style={s.formSub}>Enter your details to get started</Text>

        <Text style={s.label}>Phone Number *</Text>
        <View style={s.phoneRow}>
          <View style={s.flag}><Text style={s.flagText}>🇳🇵 +977</Text></View>
          <TextInput style={s.phoneInput} value={cPhone} onChangeText={v => { setCPhone(v); setError('') }}
            placeholder="98XXXXXXXX" placeholderTextColor="#9ca3af" keyboardType="phone-pad" maxLength={10} autoFocus />
        </View>

        <Text style={s.label}>Your Name <Text style={s.optional}>(optional)</Text></Text>
        <TextInput style={s.input} value={cName} onChangeText={setCName}
          placeholder="e.g. Sanjay Shrestha" placeholderTextColor="#9ca3af" autoCapitalize="words" />

        {error ? <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View> : null}

        <TouchableOpacity style={[s.btn, (loading || cPhone.length < 10) && s.btnDisabled]}
          onPress={handleCustomerLogin} disabled={loading || cPhone.length < 10}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Start Ordering →</Text>}
        </TouchableOpacity>
      </ScrollView>
    )
  }

  if (step === 'cook') {
    return (
      <ScrollView style={s.root} contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setStep('role')} style={s.back}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.formTitle}>👩‍🍳 Become a Cook</Text>
        <Text style={s.formSub}>Join TiffinGhar and start earning from home</Text>

        {/* Earnings banner */}
        <View style={s.earningsBanner}>
          {[['Rs. 15K+', 'Monthly earnings'], ['500+', 'Active cooks'], ['4.8⭐', 'Avg rating']].map(([v, l], i) => (
            <View key={i} style={s.earningsStat}>
              <Text style={s.earningsVal}>{v}</Text>
              <Text style={s.earningsLabel}>{l}</Text>
            </View>
          ))}
        </View>

        <Text style={s.label}>Phone Number *</Text>
        <View style={s.phoneRow}>
          <View style={s.flag}><Text style={s.flagText}>🇳🇵 +977</Text></View>
          <TextInput style={s.phoneInput} value={kPhone} onChangeText={v => { setKPhone(v); setError('') }}
            placeholder="98XXXXXXXX" placeholderTextColor="#9ca3af" keyboardType="phone-pad" maxLength={10} autoFocus />
        </View>

        <Text style={s.label}>Full Name *</Text>
        <TextInput style={s.input} value={kName} onChangeText={setKName}
          placeholder="e.g. Maya Shrestha" placeholderTextColor="#9ca3af" autoCapitalize="words" />

        <Text style={s.label}>Your Area / Location *</Text>
        <TextInput style={s.input} value={kArea} onChangeText={setKArea}
          placeholder="e.g. Baneshwor, Kathmandu" placeholderTextColor="#9ca3af" />

        <Text style={s.label}>Specialty <Text style={s.optional}>(e.g. Newari, Dal Bhat, Thakali)</Text></Text>
        <TextInput style={s.input} value={kSpecialty} onChangeText={setKSpecialty}
          placeholder="e.g. Newari, Dal Bhat" placeholderTextColor="#9ca3af" />

        <Text style={s.label}>About You <Text style={s.optional}>(optional)</Text></Text>
        <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={kBio} onChangeText={setKBio}
          placeholder="Tell customers about your cooking..." placeholderTextColor="#9ca3af" multiline />

        {error ? <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View> : null}

        <TouchableOpacity style={[s.btn, s.btnCook, (loading || kPhone.length < 10 || !kName || !kArea) && s.btnDisabled]}
          onPress={handleCookRegister} disabled={loading || kPhone.length < 10 || !kName || !kArea}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Register as Cook →</Text>}
        </TouchableOpacity>

        <Text style={s.cookNote}>✅ Free to join · ✅ We handle delivery · ✅ Weekly payouts</Text>
      </ScrollView>
    )
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  hero: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, backgroundColor: '#C0392B' },
  emoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, textAlign: 'center', lineHeight: 22 },
  roleSection: { padding: 20 },
  roleTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, marginBottom: 12, borderWidth: 1.5 },
  roleCardCustomer: { backgroundColor: '#FAECE7', borderColor: '#C0392B' },
  roleCardCook: { backgroundColor: '#f0fdf4', borderColor: '#16a34a' },
  roleEmoji: { fontSize: 32 },
  roleCardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 3 },
  roleCardSub: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  roleArrow: { fontSize: 26, color: '#9ca3af' },
  terms: { textAlign: 'center', fontSize: 11, color: '#9ca3af', paddingBottom: 24, paddingHorizontal: 20 },
  formScroll: { padding: 20, paddingTop: 16 },
  back: { marginBottom: 16 },
  backText: { color: '#C0392B', fontSize: 15, fontWeight: '600' },
  formTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  formSub: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  earningsBanner: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14, marginBottom: 20, justifyContent: 'space-around' },
  earningsStat: { alignItems: 'center' },
  earningsVal: { fontSize: 18, fontWeight: '800', color: '#16a34a' },
  earningsLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#9ca3af' },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  flag: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center' },
  flagText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#111827', backgroundColor: '#f9fafb' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#111827', backgroundColor: '#f9fafb', marginBottom: 14 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText: { color: '#dc2626', fontSize: 13 },
  btn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnCook: { backgroundColor: '#16a34a' },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cookNote: { textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 14, lineHeight: 20 },
})
