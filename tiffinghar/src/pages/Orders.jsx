import { useState } from 'react'
import { useApp } from '../context/AppContext'
import OrderCard from '../components/OrderCard'

export default function Orders({ setActivePage }) {
  const { lang, orders } = useApp()
  const [filter, setFilter] = useState('all') // all | active | past

  const active = orders.filter(o => o.status === 'preparing' || o.status === 'onway')
  const past = orders.filter(o => o.status === 'delivered')

  const totalSpent = orders.reduce((s, o) => s + o.price, 0)

  return (
    <div className="px-4 py-4">
      {/* Summary strip */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#FAECE7] rounded-xl p-3">
          <div className="text-xs text-gray-500">{lang === 'ne' ? 'कुल अर्डर' : 'Total orders'}</div>
          <div className="text-xl font-medium text-gray-900">{orders.length}</div>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500">{lang === 'ne' ? 'कुल खर्च' : 'Total spent'}</div>
          <div className="text-xl font-medium text-gray-900">Rs. {totalSpent.toLocaleString()}</div>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500">{lang === 'ne' ? 'सक्रिय' : 'Active'}</div>
          <div className="text-xl font-medium text-[#C0392B]">{active.length}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {[
          { id: 'all', en: 'All', ne: 'सबै' },
          { id: 'active', en: 'Active', ne: 'सक्रिय' },
          { id: 'past', en: 'Past', ne: 'पुराना' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
              filter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {lang === 'ne' ? f.ne : f.en}
          </button>
        ))}
      </div>

      {/* Active orders */}
      {(filter === 'all' || filter === 'active') && (
        <>
          {filter === 'all' && (
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              {lang === 'ne' ? 'सक्रिय अर्डर' : 'Active Orders'}
            </div>
          )}
          {active.length === 0 ? (
            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl mb-4">
              <div className="text-2xl mb-1">🍱</div>
              <div className="text-sm">{lang === 'ne' ? 'कुनै सक्रिय अर्डर छैन' : 'No active orders'}</div>
              <button
                onClick={() => setActivePage('home')}
                className="mt-2 text-xs text-[#C0392B] font-medium hover:underline"
              >
                {lang === 'ne' ? 'अर्डर गर्नुस्' : 'Order now'}
              </button>
            </div>
          ) : (
            active.map(o => <OrderCard key={o.id} order={o} />)
          )}
        </>
      )}

      {/* Past orders */}
      {(filter === 'all' || filter === 'past') && past.length > 0 && (
        <>
          {filter === 'all' && (
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 mt-2">
              {lang === 'ne' ? 'पुराना अर्डर' : 'Past Orders'}
            </div>
          )}
          {past.map(o => <OrderCard key={o.id} order={o} />)}
        </>
      )}

      {filter === 'past' && past.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-sm">{lang === 'ne' ? 'कुनै पुराना अर्डर छैन' : 'No past orders'}</div>
        </div>
      )}
    </div>
  )
}
