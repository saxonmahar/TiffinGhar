import { useEffect, useRef } from 'react'
import { Animated, View, StyleSheet } from 'react-native'

export function Skeleton({ width, height, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#e5e7eb', opacity }, style]}
    />
  )
}

export function CookCardSkeleton() {
  return (
    <View style={sk.card}>
      <View style={sk.header}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="80%" height={11} />
        </View>
      </View>
      <View style={sk.badgeRow}>
        <Skeleton width={64} height={22} borderRadius={20} />
        <Skeleton width={80} height={22} borderRadius={20} />
        <Skeleton width={56} height={22} borderRadius={20} />
      </View>
      <View style={sk.mealRow}>
        <Skeleton width={72} height={28} borderRadius={20} />
        <Skeleton width={60} height={28} borderRadius={20} />
        <Skeleton width={48} height={28} borderRadius={20} />
      </View>
      <View style={sk.footer}>
        <Skeleton width={80} height={18} />
        <Skeleton width={96} height={34} borderRadius={10} />
      </View>
    </View>
  )
}

const sk = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  header: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  mealRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
