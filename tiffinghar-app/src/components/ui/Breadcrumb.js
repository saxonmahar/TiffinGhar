import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'

export function Breadcrumb({ items, onPress }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {items.map((item, i) => (
        <View key={i} style={s.item}>
          {i > 0 && <Text style={s.sep}>›</Text>}
          <TouchableOpacity
            onPress={() => item.onPress?.() || onPress?.(item, i)}
            disabled={i === items.length - 1}
          >
            <Text style={[s.label, i === items.length - 1 && s.labelActive]}>
              {item.icon ? `${item.icon} ` : ''}{item.label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sep: { color: '#9ca3af', fontSize: 16, marginHorizontal: 2 },
  label: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  labelActive: { color: '#111827', fontWeight: '700' },
})
