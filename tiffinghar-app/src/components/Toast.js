import { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toastMsg } = useApp()
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (toastMsg) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start()
    }
  }, [toastMsg])

  if (!toastMsg) return null

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{toastMsg}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 90, alignSelf: 'center',
    backgroundColor: '#1a1a1a', paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 24, zIndex: 999, maxWidth: 300,
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'center' },
})
