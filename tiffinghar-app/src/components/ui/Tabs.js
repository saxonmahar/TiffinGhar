import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native'

export function Tabs({ tabs, defaultTab, onChange, variant = 'pill' }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id)

  const handlePress = (id) => {
    setActive(id)
    onChange?.(id)
  }

  if (variant === 'underline') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={u.scroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.id} style={u.tab} onPress={() => handlePress(tab.id)}>
            <View style={u.tabInner}>
              {tab.icon && <Text style={u.icon}>{tab.icon}</Text>}
              <Text style={[u.label, active === tab.id && u.labelActive]}>{tab.label}</Text>
              {tab.count != null && (
                <View style={[u.count, active === tab.id && u.countActive]}>
                  <Text style={[u.countText, active === tab.id && u.countTextActive]}>{tab.count}</Text>
                </View>
              )}
            </View>
            {active === tab.id && <View style={u.indicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  // pill variant
  return (
    <View style={p.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[p.tab, active === tab.id && p.tabActive]}
          onPress={() => handlePress(tab.id)}
          activeOpacity={0.7}
        >
          {tab.icon && <Text style={p.icon}>{tab.icon}</Text>}
          <Text style={[p.label, active === tab.id && p.labelActive]}>{tab.label}</Text>
          {tab.count != null && (
            <View style={[p.badge, active === tab.id && p.badgeActive]}>
              <Text style={[p.badgeText, active === tab.id && p.badgeTextActive]}>{tab.count}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const p = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, gap: 5 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  icon: { fontSize: 14 },
  label: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  labelActive: { color: '#111827', fontWeight: '700' },
  badge: { backgroundColor: '#e5e7eb', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  badgeActive: { backgroundColor: '#FAECE7' },
  badgeText: { fontSize: 10, color: '#6b7280', fontWeight: '600' },
  badgeTextActive: { color: '#C0392B' },
})

const u = StyleSheet.create({
  scroll: { marginBottom: 4 },
  tab: { paddingBottom: 2, marginRight: 4 },
  tabInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 10, gap: 6 },
  icon: { fontSize: 14 },
  label: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  labelActive: { color: '#C0392B', fontWeight: '700' },
  count: { backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  countActive: { backgroundColor: '#FAECE7' },
  countText: { fontSize: 10, color: '#6b7280', fontWeight: '600' },
  countTextActive: { color: '#C0392B' },
  indicator: { height: 2.5, backgroundColor: '#C0392B', borderRadius: 2, marginTop: 2 },
})
