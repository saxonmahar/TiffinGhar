import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView
} from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (phone.length < 10) { setError('Enter a valid 10-digit number'); return }
    setError('')
    setLoading(true)
    try {
      await login(`+977${phone}`, name || undefined)
    } catch (e) {
      setError(e.message || 'Login failed. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoWrap}>
          <Text style={s.logoEmoji}>🍱</Text>
          <Text style={s.logoText}>TiffinGhar</Text>
          <Text style={s.logoSub}>घरको खाना, ढोकासम्म</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back 👋</Text>
          <Text style={s.cardSub}>Enter your phone number to continue</Text>

          {/* Phone input */}
          <Text style={s.label}>Phone Number</Text>
          <View style={s.phoneRow}>
            <View style={s.flag}>
              <Text style={s.flagText}>🇳🇵 +977</Text>
            </View>
            <TextInput
              style={s.phoneInput}
              value={phone}
              onChangeText={v => { setPhone(v); setError('') }}
              placeholder="98XXXXXXXX"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>

          {/* Name (optional) */}
          <Text style={s.label}>Your Name <Text style={s.optional}>(optional)</Text></Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sanjay Shrestha"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
          />

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[s.btn, (loading || phone.length < 10) && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading || phone.length < 10}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Continue →</Text>}
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={s.features}>
          {[
            { icon: '🏠', text: 'Home-cooked meals' },
            { icon: '🛵', text: 'Free delivery' },
            { icon: '⭐', text: 'Verified home cooks' },
          ].map((f, i) => (
            <View key={i} style={s.featureItem}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Text style={s.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 64, marginBottom: 8 },
  logoText: { fontSize: 30, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  logoSub: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, elevation: 4, marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#9ca3af' },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  flag: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center' },
  flagText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#111827', backgroundColor: '#f9fafb' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#111827', backgroundColor: '#f9fafb', marginBottom: 16 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText: { color: '#dc2626', fontSize: 13 },
  btn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  features: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  featureItem: { alignItems: 'center', gap: 6 },
  featureIcon: { fontSize: 24 },
  featureText: { fontSize: 11, color: '#6b7280', fontWeight: '500', textAlign: 'center' },
  terms: { textAlign: 'center', fontSize: 11, color: '#9ca3af', lineHeight: 16 },
})
