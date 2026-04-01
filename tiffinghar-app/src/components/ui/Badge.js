import { View, Text, StyleSheet } from 'react-native'

const VARIANTS = {
  green:   { bg: '#dcfce7', text: '#16a34a', dot: '#16a34a' },
  red:     { bg: '#fee2e2', text: '#dc2626', dot: '#dc2626' },
  blue:    { bg: '#dbeafe', text: '#2563eb', dot: '#2563eb' },
  orange:  { bg: '#ffedd5', text: '#ea580c', dot: '#ea580c' },
  purple:  { bg: '#f3e8ff', text: '#9333ea', dot: '#9333ea' },
  gray:    { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
  brand:   { bg: '#FAECE7', text: '#C0392B', dot: '#C0392B' },
}

export function Badge({ label, variant = 'gray', dot = false, size = 'md' }) {
  const c = VARIANTS[variant] || VARIANTS.gray
  const isSmall = size === 'sm'
  return (
    <View style={[s.badge, { backgroundColor: c.bg }, isSmall && s.badgeSm]}>
      {dot && <View style={[s.dot, { backgroundColor: c.dot }]} />}
      <Text style={[s.text, { color: c.text }, isSmall && s.textSm]}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
  textSm: { fontSize: 10 },
})
