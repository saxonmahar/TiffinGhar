import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native'

const VARIANTS = {
  primary:   { btn: { backgroundColor: '#C0392B' }, text: { color: '#fff' } },
  secondary: { btn: { backgroundColor: '#f3f4f6' }, text: { color: '#374151' } },
  outline:   { btn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#C0392B' }, text: { color: '#C0392B' } },
  ghost:     { btn: { backgroundColor: 'transparent' }, text: { color: '#C0392B' } },
  danger:    { btn: { backgroundColor: '#dc2626' }, text: { color: '#fff' } },
  success:   { btn: { backgroundColor: '#16a34a' }, text: { color: '#fff' } },
}

const SIZES = {
  sm: { btn: { paddingVertical: 8,  paddingHorizontal: 14, borderRadius: 10 }, text: { fontSize: 13 }, icon: { fontSize: 13 } },
  md: { btn: { paddingVertical: 13, paddingHorizontal: 20, borderRadius: 13 }, text: { fontSize: 15 }, icon: { fontSize: 15 } },
  lg: { btn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 15 }, text: { fontSize: 17 }, icon: { fontSize: 17 } },
}

const s = StyleSheet.create({
  btn:      { alignItems: 'center', justifyContent: 'center' },
  full:     { width: '100%' },
  disabled: { opacity: 0.5 },
  inner:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label:    { fontWeight: '700' },
})

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, fullWidth = false, style }) {
  const vs = VARIANTS[variant] || VARIANTS.primary
  const ss = SIZES[size] || SIZES.md

  return (
    <TouchableOpacity
      style={[s.btn, vs.btn, ss.btn, fullWidth && s.full, (disabled || loading) && s.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={vs.text.color} size="small" />
      ) : (
        <View style={s.inner}>
          {icon && <Text style={ss.icon}>{icon}</Text>}
          <Text style={[s.label, vs.text, ss.text]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}
