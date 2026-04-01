import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function RatingModal({ order, onClose }) {
  const { lang, rateOrder } = useApp()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    if (rating === 0) return
    rateOrder(order.id, rating, comment)
    onClose()
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
  const labelsNe = ['', 'खराब', 'ठीकै', 'राम्रो', 'धेरै राम्रो', 'उत्कृष्ट']

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="text-center mb-4">
          <div className="text-lg font-medium text-gray-900 mb-1">
            {lang === 'ne' ? 'खाना कस्तो थियो?' : 'How was your meal?'}
          </div>
          <div className="text-sm text-gray-500">
            {lang === 'ne' ? order.cookNameNe : order.cookName} · {lang === 'ne' ? order.itemNe : order.item}
          </div>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-3 mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="text-3xl transition-transform hover:scale-110"
            >
              {s <= (hovered || rating) ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        <div className="text-center text-sm text-[#C0392B] font-medium h-5 mb-4">
          {(hovered || rating) > 0 && (lang === 'ne' ? labelsNe[hovered || rating] : labels[hovered || rating])}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C0392B] resize-none mb-4"
          placeholder={lang === 'ne' ? 'टिप्पणी लेख्नुस् (वैकल्पिक)' : 'Write a comment (optional)'}
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
            rating > 0
              ? 'bg-[#C0392B] hover:bg-[#A93226] text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {lang === 'ne' ? 'समीक्षा पठाउनुस्' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}
