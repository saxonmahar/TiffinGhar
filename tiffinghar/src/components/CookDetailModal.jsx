import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function CookDetailModal({ cook, onClose }) {
  const { lang, addToCart, toggleSaveCook } = useApp()
  const [selectedMeal, setSelectedMeal] = useState(0)

  if (!cook) return null

  const displayMeals = lang === 'ne' ? cook.mealsNe : cook.meals

  const handleAdd = () => {
    addToCart(cook, cook.meals[selectedMeal])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: cook.avatarBg }}
          >
            {cook.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium text-gray-900">
                {lang === 'ne' ? cook.nameNe : cook.name}
              </div>
              <button
                onClick={() => toggleSaveCook(cook.id)}
                className="text-xl hover:scale-110 transition-transform"
              >
                {cook.saved ? '❤️' : '🤍'}
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {lang === 'ne' ? cook.locationNe : cook.location} · {cook.distance}
            </div>
            <div className="text-sm mt-0.5">
              ⭐ {cook.rating} <span className="text-gray-400">({cook.reviews} {lang === 'ne' ? 'समीक्षा' : 'reviews'})</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {lang === 'ne' ? cook.descriptionNe : cook.description}
        </p>

        {/* Meal selector */}
        <div className="mb-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {lang === 'ne' ? 'खाना छान्नुस्' : 'Select a meal'}
          </div>
          <div className="space-y-2">
            {cook.meals.map((meal, i) => (
              <div
                key={i}
                onClick={() => setSelectedMeal(i)}
                className={`flex items-center justify-between border rounded-xl px-3.5 py-2.5 cursor-pointer transition-all ${
                  selectedMeal === i ? 'border-[#C0392B] bg-[#FAECE7]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm text-gray-800">
                  {lang === 'ne' ? cook.mealsNe[i] : meal}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#C0392B]">Rs. {cook.price}</span>
                  {selectedMeal === i && <span className="text-[#C0392B] text-sm">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          disabled={!cook.available}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${
            cook.available
              ? 'bg-[#C0392B] hover:bg-[#A93226] text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!cook.available
            ? (lang === 'ne' ? 'उपलब्ध छैन' : 'Unavailable')
            : (lang === 'ne'
                ? `${displayMeals[selectedMeal]} कार्टमा थप्नुस्`
                : `Add ${cook.meals[selectedMeal]} to Cart`)}
        </button>
      </div>
    </div>
  )
}
