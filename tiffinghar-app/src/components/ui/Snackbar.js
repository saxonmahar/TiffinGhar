import { useEffect, useRef } from 'react'
import { Animated, Text, TouchableOpacity, StyleSheet, View } from 'react-native'

const ICONS =  { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
const COLORS = { success: '#16a34a', error: '#dc2626', info: '#2563eb', warning: '#d97706' }

export default function Snackbar({ visible, message, type = 'success', action, actionLabel, onDismiss, duration = 3000 }) {
  const translateY = useRef(new Animated.Value(100)).current
  const opacity    = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
      const timer = setTimeout(hide, duration)
      return () => clearTimeout(timer)
    }
  }, [visible])

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,   duration: 250, useNativeDriver: true }),
    ]).start(() => onDismiss?.())
  }

  if (!visible) return null

  const color = COLORS[type] || COLORS.success

  return (
    <Animated.View style={[s.container, { transform: [{ translateY }], opacity }]}>
      <View style={[s.bar, { borderLeftColor: color }]}>
        <Text style={s.icon}>{ICONS[type] || ICONS.success}</Text>
        <Text style={s.msg} numberOfLines={2}>{message}</Text>
        {action && (
          <TouchableOpacity onPress={() => { action(); hide() }}>
            <Text style={[s.action, { color }]}>{actionLabel || 'Action'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={hide} style={s.close}>
          <Text style={s.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  container: { position: 'absolute', bottom: 90, left: 16, right: 16, zIndex: 999 },
  bar: { backgroundColor: '#1f2937', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  icon: { fontSize: 16 },
  msg: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '500' },
  action: { fontSize: 13, fontWeight: '700' },
  close: { padding: 2 },
  closeText: { color: '#9ca3af', fontSize: 14 },
})
