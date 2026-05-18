import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Image, Dimensions, Alert,
} from 'react-native'
import * as Location from 'expo-location'
import { useAuth } from '../context/AuthContext'

const { width, height } = Dimensions.get('window')

const FOOD_BG = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=1200&fit=crop'

export default function AuthScreen() {
  const { login, loginWithGoogle, loginWithFacebook } = useAuth()
  const [screen, setScreen] = useState('welcome') // welcome | phone | otp | name | location
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)

  // Request location permission
  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        setLocationGranted(true)
        return loc.coords
      }
    } catch {}
    return null
  }

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { setError('Enter a valid 10-digit number'); return }
    setError(''); setLoading(true)
    try {
      // Direct login — no OTP for now (can add Twilio later)
      const data = await login(`+977${phone}`, name || undefined)
      setIsNewUser(data.isNew)
      if (data.isNew) setScreen('name')
      // else goes to location screen
    } catch (e) {
      setError(e.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleNameSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    setError(''); setLoading(true)
    try {
      await login(`+977${phone}`, name)
      setScreen('location')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const handleLocationAllow = async () => {
    setLoading(true)
    await requestLocation()
    setLoading(false)
    // Auth context will detect user is set and navigate away
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (e) {
      Alert.alert('Google Login', e.message || 'Google login failed. Try phone login.')
    } finally { setLoading(false) }
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    try {
      await loginWithFacebook()
    } catch (e) {
      Alert.alert('Facebook Login', e.message || 'Facebook login failed. Try phone login.')
    } finally { setLoading(false) }
  }

  // ── Welcome screen ──────────────────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <View style={s.root}>
        {/* Background food image */}
        <Image source={{ uri: FOOD_BG }} style={s.bgImage} resizeMode="cover" />
        <View style={s.bgOverlay} />

        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoBadge}>
            <Text style={s.logoEmoji}>🍱</Text>
          </View>
          <Text style={s.logoText}>TiffinGhar</Text>
          <Text style={s.logoTagline}>घरको खाना, ढोकासम्म</Text>
        </View>

        {/* Bottom sheet */}
        <View style={s.bottomSheet}>
          <Text style={s.welcomeTitle}>Get started</Text>
          <Text style={s.welcomeSub}>Order fresh home-cooked meals from verified cooks near you</Text>

          {/* Social login buttons */}
          <TouchableOpacity style={s.socialBtn} onPress={handleGoogleLogin} disabled={loading}>
            <Text style={s.socialIcon}>🔵</Text>
            <Text style={s.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.socialBtn, s.facebookBtn]} onPress={handleFacebookLogin} disabled={loading}>
            <Text style={s.socialIcon}>📘</Text>
            <Text style={[s.socialBtnText, { color: '#fff' }]}>Continue with Facebook</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Phone login */}
          <TouchableOpacity style={s.phoneBtn} onPress={() => setScreen('phone')}>
            <Text style={s.phoneBtnText}>📱 Continue with Phone</Text>
          </TouchableOpacity>

          <Text style={s.terms}>
            By continuing, you agree to our{' '}
            <Text style={s.termsLink}>Terms of Service</Text> and{' '}
            <Text style={s.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {loading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator color="#C0392B" size="large" />
          </View>
        )}
      </View>
    )
  }

  // ── Phone screen ─────────────────────────────────────────────────────────────
  if (screen === 'phone') {
    return (
      <KeyboardAvoidingView style={s.formRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setScreen('welcome')} style={s.backBtn}>
            <Text style={s.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={s.formTitle}>Enter your phone</Text>
          <Text style={s.formSub}>We'll send you a verification code</Text>

          <View style={s.phoneInputRow}>
            <View style={s.countryPicker}>
              <Text style={s.flag}>🇳🇵</Text>
              <Text style={s.countryCode}>+977</Text>
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

          {error ? <Text style={s.errorText}>⚠️ {error}</Text> : null}

          <TouchableOpacity
            style={[s.primaryBtn, (loading || phone.length < 10) && s.primaryBtnDisabled]}
            onPress={handlePhoneSubmit}
            disabled={loading || phone.length < 10}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Continue →</Text>}
          </TouchableOpacity>

          <Text style={s.forgotText}>
            Having trouble?{' '}
            <Text style={s.termsLink} onPress={() => Alert.alert('Support', 'Email: support@tiffinghar.com')}>
              Get help
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ── Name screen (new users) ───────────────────────────────────────────────────
  if (screen === 'name') {
    return (
      <KeyboardAvoidingView style={s.formRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
          <Text style={s.formTitle}>What's your name?</Text>
          <Text style={s.formSub}>Help cooks know who they're cooking for</Text>

          <TextInput
            style={s.textInput}
            value={name}
            onChangeText={v => { setName(v); setError('') }}
            placeholder="Your full name"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
            autoFocus
          />

          <TextInput
            style={s.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Email (optional)"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error ? <Text style={s.errorText}>⚠️ {error}</Text> : null}

          <TouchableOpacity
            style={[s.primaryBtn, (!name.trim() || loading) && s.primaryBtnDisabled]}
            onPress={handleNameSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Continue →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ── Location screen ───────────────────────────────────────────────────────────
  if (screen === 'location') {
    return (
      <View style={s.locationRoot}>
        <View style={s.locationContent}>
          <Text style={s.locationEmoji}>📍</Text>
          <Text style={s.locationTitle}>Allow location access</Text>
          <Text style={s.locationSub}>
            TiffinGhar needs your location to show home cooks near you and deliver your food accurately.
          </Text>

          <View style={s.locationFeatures}>
            {[
              ['🍱', 'Find cooks near you'],
              ['🛵', 'Accurate delivery'],
              ['⏱️', 'Real-time tracking'],
            ].map(([icon, text]) => (
              <View key={text} style={s.locationFeature}>
                <Text style={s.locationFeatureIcon}>{icon}</Text>
                <Text style={s.locationFeatureText}>{text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={handleLocationAllow} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Allow Location Access</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.skipBtn} onPress={() => {}}>
            <Text style={s.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return null
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  logoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  logoBadge: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#C0392B', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#C0392B', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  logoEmoji: { fontSize: 36 },
  logoText: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  logoTagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 6 },
  welcomeSub: { fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 20 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 12, backgroundColor: '#fff' },
  facebookBtn: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  socialIcon: { fontSize: 20 },
  socialBtnText: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  phoneBtn: { borderWidth: 1.5, borderColor: '#C0392B', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  phoneBtnText: { fontSize: 15, fontWeight: '600', color: '#C0392B' },
  terms: { textAlign: 'center', fontSize: 12, color: '#9ca3af', lineHeight: 18 },
  termsLink: { color: '#C0392B', fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  // Form screens
  formRoot: { flex: 1, backgroundColor: '#fff' },
  formScroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  backText: { fontSize: 22, color: '#374151', lineHeight: 26 },
  formTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 6, letterSpacing: -0.5 },
  formSub: { fontSize: 15, color: '#6b7280', marginBottom: 28, lineHeight: 22 },
  phoneInputRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  countryPicker: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14 },
  flag: { fontSize: 20 },
  countryCode: { fontSize: 15, fontWeight: '700', color: '#374151' },
  phoneInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, color: '#111827', fontWeight: '600' },
  textInput: { backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 13, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  forgotText: { textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 },
  // Location screen
  locationRoot: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  locationContent: { padding: 32, alignItems: 'center' },
  locationEmoji: { fontSize: 64, marginBottom: 20 },
  locationTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 10, textAlign: 'center' },
  locationSub: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  locationFeatures: { width: '100%', gap: 14, marginBottom: 32 },
  locationFeature: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f9fafb', borderRadius: 14, padding: 14 },
  locationFeatureIcon: { fontSize: 24 },
  locationFeatureText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  skipBtn: { marginTop: 14, paddingVertical: 10 },
  skipText: { color: '#9ca3af', fontSize: 14, textAlign: 'center' },
})
