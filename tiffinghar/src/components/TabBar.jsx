const tabs = [
  { id: 'home',    en: 'Home',      ne: 'होम' },
  { id: 'orders',  en: 'My Orders', ne: 'अर्डर' },
  { id: 'cooks',   en: 'Cooks',     ne: 'पकाउने' },
  { id: 'profile', en: 'Profile',   ne: 'प्रोफाइल' },
]

export default function TabBar({ activePage, setActivePage, lang }) {
  return (
    <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActivePage(tab.id)}
          className={`flex-1 py-3 text-[13px] border-b-2 transition-all duration-200 ${
            activePage === tab.id
              ? 'text-[#C0392B] border-[#C0392B] font-medium'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          {lang === 'ne' ? tab.ne : tab.en}
        </button>
      ))}
    </div>
  )
}
