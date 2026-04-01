import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export function RadioGroup({ options, value, onChange, label }) {
  return (
    <View>
      {label && <Text style={s.groupLabel}>{label}</Text>}
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[s.option, value === opt.value && s.optionActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}
        >
          <View style={[s.radio, value === opt.value && s.radioActive]}>
            {value === opt.value && <View style={s.radioDot} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.label, value === opt.value && s.labelActive]}>{opt.label}</Text>
            {opt.desc && <Text style={s.desc}>{opt.desc}</Text>}
          </View>
          {opt.badge && (
            <View style={s.badge}><Text style={s.badgeText}>{opt.badge}</Text></View>
          )}
          {opt.price && (
            <Text style={s.price}>{opt.price}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  groupLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 8, backgroundColor: '#fff' },
  optionActive: { borderColor: '#C0392B', backgroundColor: '#FAECE7' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#C0392B' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C0392B' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151' },
  labelActive: { color: '#C0392B', fontWeight: '600' },
  desc: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  badge: { backgroundColor: '#C0392B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  price: { fontSize: 14, fontWeight: '700', color: '#C0392B' },
})
