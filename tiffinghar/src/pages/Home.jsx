import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CookCard from '../components/CookCard'
import CookDetailModal from '../components/CookDetailModal'

const categories = [
  { en: 'All', ne: 'सबै', id: 'all' },
  { en: 'Dal Bhat', ne: 'दाल भात', id: 'dalbhat' },
  { en: 'Newari', ne: 'नेवारी', id: 'newari' },
  { en: 'Thakali', ne: 'थकाली', id: 'thakali' },
  { en: 'Veg Only', ne: 'शाकाहारी', id: 'veg' },
  { en: 'Organic', ne: 'जैविक', id: 'organic' },
]

export default function Home() {
  const { lang, cooks } = useApp()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedCook, setSelectedCook] = useState(null)
  const [sortBy, setSortBy] = useState('rating') // rating | distance | price

  const filtered = cooks
    .filter(c => {
      const q = search.toLowerCase()
      const nameMatch = c.name.toLowerCase().includes(q) || c.nameNe.includes(q)
      const mealMatch = c.meals.some(m => m.toLowerCase().includes(q)) || c.mealsNe.some(m => m.includes(q))
      const matchSearch = !q || nameMatch || mealMatch

      const matchCat =
        activeCategory === 'all' ||
        (activeCategory === 'newari' && c.badges.some(b => b.label.toLowerCase().includes('newari'))) ||
        (activeCategory === 'thakali' && c.badges.some(b => b.label.toLowerCase().includes('thakali'))) ||
        (activeCategory === 'veg' && c.badges.some(b => b.label.toLowerCase().includes('vegetarian'))) ||
        (activeCategory === 'dalbhat' && c.meals.some(m => m.toLowerCase().includes('dal'))) ||
        (activeCategory === 'organic' && c.badges.some(b => b.label.toLowerCase().includes('organic')))

      return matchSearch && matchCat
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
      if (sortBy === 'price') return a.price - b.price
      return 0
    })

  return (
    <>
      {/* Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-[#C0392B] to-[#E74C3C] rounded-xl p-4 text-white">
        <div className="text-base font-medium">
          {lang === 'ne' ? '१२:३० बजेसम्म खाना डेलिभरी' : 'Lunch delivery by 12:30 PM'}
        </div>
        <div className="text-xs opacity-85 mt-1">
          {lang === 'ne' ? 'आजको टिफिनका लागि बिहान १० बजेभित्र अर्डर गर्नुस्' : "Order before 10 AM for today's tiffin"}
        </div>
        <div className="mt-3 flex gap-2">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs">
            🕐 {lang === 'ne' ? 'समय: ११:३०' : 'Closes: 11:30 AM'}
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs">
            🛵 {lang === 'ne' ? 'निःशुल्क डेलिभरी' : 'Free delivery'}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mx-4 mt-3 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
        <span className="text-gray-400 text-base">⌕</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'ne' ? 'दाल भात, मोमो, रोटी खोज्नुस्...' : 'Search dal bhat, momo, roti...'}
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-[#C0392B] text-white border-[#C0392B]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#C0392B]'
            }`}
          >
            {lang === 'ne' ? cat.ne : cat.en}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between px-4 mt-3">
        <div className="text-xs text-gray-400">
          {filtered.length} {lang === 'ne' ? 'पकाउने' : 'cooks'}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white"
        >
          <option value="rating">{lang === 'ne' ? 'रेटिङ' : 'Top Rated'}</option>
          <option value="distance">{lang === 'ne' ? 'नजिक' : 'Nearest'}</option>
          <option value="price">{lang === 'ne' ? 'सस्तो' : 'Lowest Price'}</option>
        </select>
      </div>

      {/* Cook list */}
      <div className="px-4 mt-3 pb-6">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-3xl mb-2">🍽️</div>
            <div className="text-sm">{lang === 'ne' ? 'कुनै नतिजा फेला परेन' : 'No results found'}</div>
          </div>
        ) : (
          filtered.map(cook => (
            <CookCard key={cook.id} cook={cook} onViewDetail={setSelectedCook} />
          ))
        )}
      </div>

      <CookDetailModal cook={selectedCook} onClose={() => setSelectedCook(null)} />
    </>
  )
}
