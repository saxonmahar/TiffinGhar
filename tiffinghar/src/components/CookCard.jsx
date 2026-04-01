import { useApp } from '../context/AppContext'

const badgeClass = {
  green: 'bg-[#EAF3DE] text-[#3B6D11]',
  blue: 'bg-[#E6F1FB] text-[#185FA5]',
  default: 'bg-[#FAECE7] text-[#993C1D]',
}

export default function CookCard({ cook, onViewDetail }) {
  const { lang, addToCart, toggleSaveCook } = useApp()
  const displayMeals = lang === 'ne' ? cook.mealsNe : cook.meals

  return (
    <div
      className="border border-gray-200 rounded-xl p-3.5 mb-2.5 cursor-pointer hover:border-[#C0392B] transition-colors duration-200 bg-white"
      onClick={() => onViewDetail(cook)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2.5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: cook.avatarBg }}
        >
          {cook.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-medium text-gray-900 truncate">
              {lang === 'ne' ? cook.nameNe : cook.name}
            </div>
            <button
              onClick={e => { e.stopPropagation(); toggleSaveCook(cook.id) }}
              className="text-lg ml-2 flex-shrink-0 hover:scale-110 transition-transform"
              aria-label={cook.saved ? 'Unsave cook' : 'Save cook'}
            >
              {cook.saved ? '❤️' : '🤍'}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {lang === 'ne' ? cook.locationNe : cook.location} · {cook.distance} · ⭐ {cook.rating} ({cook.reviews})
          </div>
        </div>
      </div>

      {!cook.available && (
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg mb-2 inline-block">
          {lang === 'ne' ? '⏸ अहिले उपलब्ध छैन' : '⏸ Not available now'}
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {cook.badges.map((b, i) => (
          <span key={i} className={`text-[11px] px-2 py-0.5 rounded-full ${badgeClass[b.type]}`}>
            {lang === 'ne' ? b.labelNe : b.label}
          </span>
        ))}
      </div>

      {/* Meals */}
      <div className="flex gap-2 flex-wrap mb-2.5">
        {displayMeals.slice(0, 3).map((m, i) => (
          <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{m}</span>
        ))}
        {displayMeals.length > 3 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            +{displayMeals.length - 3}
          </span>
        )}
      </div>

      {/* Price & Order */}
      <div className="flex justify-between items-center" onClick={e => e.stopPropagation()}>
        <div className="text-base font-medium text-[#C0392B]">
          Rs. {cook.price} / {lang === 'ne' ? 'खाना' : 'meal'}
        </div>
        <button
          onClick={() => addToCart(cook)}
          disabled={!cook.available}
          className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
            !cook.available
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#C0392B] hover:bg-[#A93226] text-white active:scale-95'
          }`}
        >
          {lang === 'ne' ? 'कार्टमा थप्नुस्' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
