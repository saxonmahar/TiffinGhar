export default function TopBar({ lang, setLang, cartCount, onCartClick }) {
  return (
    <div>
      <div className="bg-[#C0392B] px-5 pt-4 pb-3 text-white flex justify-between items-start">
        <div>
          <div className="text-[22px] font-medium tracking-tight">🍱 TiffinGhar</div>
          <div className="text-xs opacity-85 mt-0.5">
            {lang === 'ne' ? 'घरको खाना, ढोकासम्म' : 'Home food, to your door'}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {/* Cart button */}
          <button
            onClick={onCartClick}
            className="relative p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Open cart"
          >
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-[#C0392B] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'ne' : 'en')}
            className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full font-medium transition-colors"
          >
            {lang === 'en' ? 'नेपाली' : 'English'}
          </button>
        </div>
      </div>
      <div className="bg-[#A93226] px-5 py-2 text-xs text-white/90 flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full inline-block" />
        {lang === 'ne'
          ? 'बानेश्वर, काठमाडौं · अहिले डेलिभरी हुँदैछ'
          : 'Baneshwor, Kathmandu · Delivering now'}
      </div>
    </div>
  )
}
