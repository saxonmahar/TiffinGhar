import { useRef, useState } from 'react'
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'

const { width: SCREEN_W } = Dimensions.get('window')

export function Carousel({ items, renderItem, itemWidth = SCREEN_W - 48, gap = 12, showDots = true }) {
  const [active, setActive] = useState(0)
  const scrollRef = useRef(null)

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (itemWidth + gap))
    setActive(idx)
  }

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + gap}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16, gap }}
      >
        {items.map((item, i) => (
          <View key={i} style={{ width: itemWidth }}>
            {renderItem(item, i)}
          </View>
        ))}
      </ScrollView>
      {showDots && items.length > 1 && (
        <View style={s.dots}>
          {items.map((_, i) => (
            <View key={i} style={[s.dot, i === active && s.dotActive]} />
          ))}
        </View>
      )}
    </View>
  )
}

// Promo banner carousel item
export function PromoBanner({ title, subtitle, tag, gradient = ['#C0392B', '#E74C3C'] }) {
  return (
    <View style={[b.card, { backgroundColor: gradient[0] }]}>
      <View style={b.inner}>
        {tag && <View style={b.tag}><Text style={b.tagText}>{tag}</Text></View>}
        <Text style={b.title}>{title}</Text>
        <Text style={b.sub}>{subtitle}</Text>
      </View>
      <Text style={b.emoji}>🍱</Text>
    </View>
  )
}

const s = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  dotActive: { width: 18, backgroundColor: '#C0392B' },
})

const b = StyleSheet.create({
  card: { borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 110 },
  inner: { flex: 1 },
  tag: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  emoji: { fontSize: 48, marginLeft: 8 },
})
