import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

// Bento grid — used for stats, quick actions, featured sections
export function BentoGrid({ children }) {
  return <View style={s.grid}>{children}</View>
}

export function BentoCard({ title, value, subtitle, icon, color = '#C0392B', bg = '#FAECE7', wide = false, tall = false, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View
  return (
    <Wrapper
      style={[s.card, wide && s.wide, tall && s.tall, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={s.cardTop}>
        <View style={[s.iconBox, { backgroundColor: color + '22' }]}>
          <Text style={s.iconText}>{icon}</Text>
        </View>
        {onPress && <Text style={[s.arrow, { color }]}>›</Text>}
      </View>
      <Text style={[s.value, { color }]}>{value}</Text>
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    </Wrapper>
  )
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47.5%', borderRadius: 16, padding: 14, minHeight: 100 },
  wide: { width: '100%' },
  tall: { minHeight: 140 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 18 },
  arrow: { fontSize: 22, fontWeight: '300' },
  value: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  title: { fontSize: 12, fontWeight: '600', color: '#374151' },
  subtitle: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
})
