import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, Animated, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native'

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true)

export function Accordion({ items, allowMultiple = false }) {
  const [open, setOpen] = useState([])

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    if (allowMultiple) {
      setOpen(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setOpen(prev => prev.includes(id) ? [] : [id])
    }
  }

  return (
    <View style={s.container}>
      {items.map((item, i) => {
        const isOpen = open.includes(item.id)
        return (
          <View key={item.id} style={[s.item, i < items.length - 1 && s.itemBorder]}>
            <TouchableOpacity style={s.header} onPress={() => toggle(item.id)} activeOpacity={0.7}>
              <View style={s.headerLeft}>
                {item.icon && <Text style={s.icon}>{item.icon}</Text>}
                <Text style={[s.title, isOpen && s.titleActive]}>{item.title}</Text>
              </View>
              <Text style={[s.chevron, isOpen && s.chevronOpen]}>›</Text>
            </TouchableOpacity>
            {isOpen && (
              <View style={s.body}>
                {typeof item.content === 'string'
                  ? <Text style={s.bodyText}>{item.content}</Text>
                  : item.content}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', backgroundColor: '#fff' },
  item: {},
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  icon: { fontSize: 18 },
  title: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1 },
  titleActive: { color: '#C0392B' },
  chevron: { fontSize: 22, color: '#9ca3af', transform: [{ rotate: '0deg' }] },
  chevronOpen: { transform: [{ rotate: '90deg' }], color: '#C0392B' },
  body: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
  bodyText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
})
