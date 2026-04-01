import { useState } from 'react'
import { useApp } from '../context/AppContext'
import RatingModal from './RatingModal'

const statusStyle = {
  preparing: 'bg-[#FAEEDA] text-[#854F0B]',
  delivered: 'bg-[#EAF3DE] text-[#3B6D11]',
  onway: 'bg-[#E6F1FB] text-[#185FA5]',
}

const stepLabels = {
  en: ['Ordered', 'Preparing', 'On way', 'Delivered'],
  ne: ['अर्डर', 'तयार', 'बाटोमा', 'डेलिभर'],
}

export default function OrderCard({ order }) {
  const { lang, reorder } = useApp()
  const [showRating, setShowRating] = useState(false)
  const isActive = order.status === 'preparing' || order.status === 'onway'

  return (
    <>
      <div className="border border-gray-200 rounded-xl p-3.5 mb-2.5 bg-white">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <div className="text-sm font-medium text-gray-900 truncate">
              {lang === 'ne' ? order.cookNameNe : order.cookName} · {lang === 'ne' ? order.itemNe : order.item}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {lang === 'ne' ? order.dateNe : order.date} · {order.orderedAt}
              {isActive && ` · ${lang === 'ne' ? 'अनुमानित' : 'Est.'} ${order.estimatedAt}`}
            </div>
          </div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusStyle[order.status]}`}>
            {lang === 'ne' ? order.statusLabelNe : order.statusLabel}
          </span>
        </div>

        <div className="text-xs text-gray-500 mb-2">
          {order.qty}x {lang === 'ne' ? order.itemNe : order.item} · Rs. {order.price}
          {order.address && (
            <span className="ml-2 text-gray-400">· 📍 {order.address}</span>
          )}
        </div>

        {/* Progress bar for active orders */}
        {isActive && (
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              {stepLabels[lang === 'ne' ? 'ne' : 'en'].map((s, i) => (
                <span key={i} className={`text-[10px] ${order.progress >= (i + 1) * 25 ? 'text-[#C0392B] font-medium' : 'text-gray-300'}`}>
                  {s}
                </span>
              ))}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C0392B] rounded-full transition-all duration-1000"
                style={{ width: `${order.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions for delivered orders */}
        {order.status === 'delivered' && (
          <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-gray-50">
            <button
              onClick={() => reorder(order)}
              className="text-xs text-[#C0392B] font-medium hover:underline"
            >
              🔄 {lang === 'ne' ? 'फेरि अर्डर' : 'Reorder'}
            </button>
            {!order.rated ? (
              <button
                onClick={() => setShowRating(true)}
                className="text-xs text-gray-500 hover:text-[#C0392B] font-medium ml-auto"
              >
                ⭐ {lang === 'ne' ? 'रेटिङ दिनुस्' : 'Rate meal'}
              </button>
            ) : (
              <span className="text-xs text-gray-400 ml-auto">
                {'⭐'.repeat(order.rating)} {lang === 'ne' ? 'रेट गरियो' : 'Rated'}
              </span>
            )}
          </div>
        )}
      </div>

      {showRating && (
        <RatingModal order={order} onClose={() => setShowRating(false)} />
      )}
    </>
  )
}
