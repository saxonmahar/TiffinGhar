import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, ActivityIndicator, Image, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'

const { width } = Dimensions.get('window')

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop',
]

export default function OnboardingScreen() {
  const { login } = useAuth()
  const [step, setStep] = useState('role')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cName, setCName] = useState('')
  const [kPhone, setKPhone] = useState('')
  const [kName, setKName] = useState('')
  const [kArea, setKArea] = useState('')
  const [kSpecialty, setKSpecialty] = useState('')
  const [kBio, setKBio] = useState('')

  const handleCustomerLogin = async () => {
    if (cPhone.length < 10) { setError('Enter a valid 10-digit number'); return }
    setError(''); setLoading(true)
    try { await login(`+977${cPhone}`, cName || 'Customer') }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleCookRegister = async () => {
    if (kPhone.length < 10) { setError('Enter a valid phone number'); return }
    if (!kName) { setError('Name is required'); return }
    if (!kArea) { setError('Area/location is required'); return }
    setError(''); setLoading(true)
    try { await login(`+977${kPhone}`, kName, 'cook', { area: kArea, specialty: kSpecialty, bio: kBio }) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (step === 'role') {
    return (
      <View style={s.root}>
        {/* Hero with food collage */}
        <View style={s.hero}>
          <View style={s.foodGrid}>
            {FOOD_IMAGES.map((uri, i) => (
              <Image key={i} source={{ uri }} style={[s.foodImg, i === 0 && s.foodImgLarge]} resizeMode="cover" />
            ))}
          </View>
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <View style={s.logoBadge}>
              <Text style={s.logoEmoji}>🍱</Text>
            </View>
            <Text style={s.heroTitle}>TiffinGhar</Text>
            <Text style={s.heroSub}>घरको खाना, ढोकासम्म</Text>
            <Text style={s.heroSubEn}>Fresh home-cooked meals delivered</Text>
          </View>
        </View>

        {/* Role selection */}
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Get started</Text>
          <Text style={s.sheetSub}>Choose how you want to use TiffinGhar</Text>

          <TouchableOpacity
            style={s.roleCard}
            onPress={() => setStep('customer')}
            activeOpacity={0.88}
          >
            <View style={[s.roleIconWrap, { backgroundColor: '#FAECE7' }]}>
              <Text style={s.roleIcon}>🛵</Text>
            </View>
            <View style={s.roleInfo}>
              <Text style={s.roleTitle}>Order Food</Text>
              <Text style={s.roleSub}>Fresh home-cooked meals near you</Text>
            </View>
            <View style={s.roleArrow}>
              <Text style={s.roleArrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.roleCard, s.roleCardCook]}
            onPress={() => setStep('cook')}
            activeOpacity={0.88}
          >
            <View style={[s.roleIconWrap, { backgroundColor: '#f0fdf4' }]}>
              <Text style={s.roleIcon}>👩‍🍳</Text>
            </View>
            <View style={s.roleInfo}>
              <Text style={s.roleTitle}>Cook & Earn</Text>
              <Text style={s.roleSub}>Earn Rs. 15,000–25,000/month from home</Text>
            </View>
            <View style={s.roleArrow}>
              <Text style={s.roleArrowText}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Trust indicators */}
          <View style={s.trustRow}>
            {[['500+', 'Home Cooks'], ['10K+', 'Orders'], ['4.8★', 'Rating']].map(([v, l]) => (
              <View key={l} style={s.trustItem}>
                <Text style={s.trustVal}>{v}</Text>
                <Text style={s.trustLabel}>{l}</Text>
              </View>
            ))}
          </View>

          <Text style={s.terms}>By continuing you agree to our Terms & Privacy Policy</Text>
        </View>
      </View>
    )
  }

  if (step === 'customer') {
    return (
      <SafeAreaView style={s.formRoot} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setStep('role')} style={s.backBtn}>
            <Text style={s.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={s.formTitle}>Welcome back 👋</Text>
          <Text style={s.formSub}>Enter your phone number to order fresh home-cooked meals</Text>

          <Text style={s.inputLabel}>Phone Number</Text>
          <View style={s.phoneRow}>
            <View style={s.countryBox}>
              <Text style={s.countryFlag}>🇳🇵</Text>
              <Text style={s.countryCode}>+977</Text>
            </View>
            <TextInput
              style={s.phoneInput}
              value={cPhone}
              onChangeText={v => { setCPhone(v); setError('') }}
              placeholder="98XXXXXXXX"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>

          <Text style={s.inputLabel}>Your Name <Text style={s.optional}>(optional)</Text></Text>
          <TextInput
            style={s.input}
            value={cName}
            onChangeText={setCName}
            placeholder="e.g. Sanjay Shrestha"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
          />

          {error ? <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View> : null}

          <TouchableOpacity
            style={[s.primaryBtn, (loading || cPhone.length < 10) && s.primaryBtnDisabled]}
            onPress={handleCustomerLogin}
            disabled={loading || cPhone.length < 10}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Continue →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (step === 'cook') {
    return (
      <SafeAreaView style={s.formRoot} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setStep('role')} style={s.backBtn}>
            <Text style={s.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={s.formTitle}>Become a Cook 👩‍🍳</Text>
          <Text style={s.formSub}>Join 500+ home cooks earning from their kitchen</Text>

          <View style={s.earningsRow}>
            {[['Rs. 15K+', 'Monthly'], ['500+', 'Cooks'], ['Free', 'To Join']].map(([v, l]) => (
              <View key={l} style={s.earningCard}>
                <Text style={s.earningVal}>{v}</Text>
                <Text style={s.earningLabel}>{l}</Text>
              </View>
            ))}
          </View>

          {[
            { label: 'Phone Number *', value: kPhone, setter: setKPhone, placeholder: '98XXXXXXXX', type: 'phone-pad', isPhone: true },
            { label: 'Full Name *', value: kName, setter: setKName, placeholder: 'e.g. Maya Shrestha', caps: 'words' },
            { label: 'Your Area *', value: kArea, setter: setKArea, placeholder: 'e.g. Baneshwor, Kathmandu' },
            { label: 'Specialty', value: kSpecialty, setter: setKSpecialty, placeholder: 'e.g. Newari, Dal Bhat, Thakali' },
          ].map(f => (
            <View key={f.label}>
              <Text style={s.inputLabel}>{f.label}</Text>
              {f.isPhone ? (
                <View style={s.phoneRow}>
                  <View style={s.countryBox}>
                    <Text style={s.countryFlag}>🇳🇵</Text>
                    <Text style={s.countryCode}>+977</Text>
                  </View>
                  <TextInput style={s.phoneInput} value={f.value} onChangeText={v => { f.setter(v); setError('') }}
                    placeholder={f.placeholder} placeholderTextColor="#9ca3af" keyboardType="phone-pad" maxLength={10} />
                </View>
              ) : (
                <TextInput style={s.input} value={f.value} onChangeText={f.setter}
                  placeholder={f.placeholder} placeholderTextColor="#9ca3af" autoCapitalize={f.caps || 'sentences'} />
              )}
            </View>
          ))}

          <Text style={s.inputLabel}>About You <Text style={s.optional}>(optional)</Text></Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top' }]}
            value={kBio} onChangeText={setKBio}
            placeholder="Tell customers about your cooking style..."
            placeholderTextColor="#9ca3af" multiline
          />

          {error ? <View style={s.errorBox}><Text style={s.errorText}>⚠️ {error}</Text></View> : null}

          <TouchableOpacity
            style={[s.primaryBtn, s.primaryBtnGreen, (loading || kPhone.length < 10 || !kName || !kArea) && s.primaryBtnDisabled]}
            onPress={handleCookRegister}
            disabled={loading || kPhone.length < 10 || !kName || !kArea}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Register as Cook →</Text>}
          </TouchableOpacity>

          <Text style={s.cookNote}>✅ Free to join · ✅ We handle delivery · ✅ Weekly payouts</Text>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 340, position: 'relative' },
  foodGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  foodImg: { width: width / 2, height: 170 },
  foodImgLarge: { width: width, height: 170 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroContent: { position: 'absolute', bottom: 28, left: 24, right: 24 },
  logoBadge: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#C0392B', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoEmoji: { fontSize: 26 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  heroSubEn: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sheet: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, padding: 24, paddingBottom: 32 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sheetSub: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 12, backgroundColor: '#fff' },
  roleCardCook: { borderColor: '#bbf7d0' },
  roleIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roleIcon: { fontSize: 24 },
  roleInfo: { flex: 1 },
  roleTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  roleSub: { fontSize: 12, color: '#6b7280' },
  roleArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  roleArrowText: { fontSize: 18, color: '#374151', lineHeight: 22 },
  trustRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 8 },
  trustItem: { alignItems: 'center' },
  trustVal: { fontSize: 18, fontWeight: '800', color: '#C0392B' },
  trustLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  terms: { textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 },
  formRoot: { flex: 1, backgroundColor: '#fff' },
  formScroll: { padding: 24, paddingTop: 16 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#C0392B', fontSize: 15, fontWeight: '600' },
  formTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6 },
  formSub: { fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#9ca3af' },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  countryBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12 },
  countryFlag: { fontSize: 18 },
  countryCode: { fontSize: 14, fontWeight: '700', color: '#374151' },
  phoneInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#111827' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#111827', marginBottom: 16 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#dc2626' },
  errorText: { color: '#dc2626', fontSize: 13 },
  primaryBtn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  primaryBtnGreen: { backgroundColor: '#16a34a' },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  earningsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  earningCard: { flex: 1, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, alignItems: 'center' },
  earningVal: { fontSize: 18, fontWeight: '800', color: '#16a34a' },
  earningLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cookNote: { textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 16, lineHeight: 20 },
})
