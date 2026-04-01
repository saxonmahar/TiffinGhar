import { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useApp } from '../context/AppContext'

const labels = { en: ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'], ne: ['', 'खराब', 'ठीकै', 'राम्रो', 'धेरै राम्रो', 'उत्कृष्ट'] }

export default function RatingModal({ order, onClose }) {
  const { lang, rateOrder } = useApp()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const submit = () => {
    if (!rating) return
    rateOrder(order.id, rating, comment)
    onClose()
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1}>
          <View style={styles.handle} />
          <Text style={styles.title}>{lang === 'ne' ? 'खाना कस्तो थियो?' : 'How was your meal?'}</Text>
          <Text style={styles.sub}>{lang === 'ne' ? order.cookNameNe : order.cookName} · {lang === 'ne' ? order.itemNe : order.item}</Text>

          <View style={styles.stars}>
            {[1,2,3,4,5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={styles.star}>{s <= rating ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{labels[lang === 'ne' ? 'ne' : 'en'][rating]}</Text>
          )}

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder={lang === 'ne' ? 'टिप्पणी (वैकल्पिक)' : 'Comment (optional)'}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.btn, !rating && styles.btnDisabled]}
            onPress={submit}
            disabled={!rating}
          >
            <Text style={styles.btnText}>{lang === 'ne' ? 'समीक्षा पठाउनुस्' : 'Submit Review'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 8 },
  star: { fontSize: 32 },
  ratingLabel: { textAlign: 'center', color: '#C0392B', fontWeight: '600', fontSize: 14, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827', marginBottom: 16, minHeight: 80, textAlignVertical: 'top' },
  btn: { backgroundColor: '#C0392B', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#e5e7eb' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
