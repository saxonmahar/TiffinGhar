import { useState } from 'react'
import { subscriptionPlans } from '../data/mockData'

export default function Profile({ lang }) {
  const [notifications, setNotifications] = useState(true)
  const [showPlans, setShowPlans] = useState(false)
  const [activePlan, setActivePlan] = useState('standard')

  const menuItems = [
    {
      label: lang === 'ne' ? 'सेभ गरिएका ठेगाना' : 'Saved Addresses',
      icon: '📍',
      action: null,
    },
    {
      label: lang === 'ne' ? 'भुक्तानी विधि' : 'Payment Methods',
      icon: '💳',
      action: null,
    },
    {
      label: lang === 'ne' ? 'सदस्यता योजना' : 'Subscription Plans',
      icon: '📦',
      action: () => setShowPlans(true),
    },
    {
      label: lang === 'ne' ? 'सूचनाहरू' : 'Notifications',
      icon: '🔔',
      toggle: true,
    },
    {
      label: lang === 'ne' ? 'रेफर र कमाउनुस्' : 'Refer & Earn',
      icon: '🎁',
      action: null,
    },
  ]

  return (
    <>
      <div className="px-4 py-5">
        {/* Profile header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-full bg-[#FAECE7] flex items-center justify-center text-2xl">
            😊
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900">Sanjay Shrestha</div>
            <div className="text-sm text-gray-500">
              {lang === 'ne' ? 'बानेश्वर, काठमाडौं' : 'Baneshwor, Kathmandu'}
            </div>
            <div className="text-xs text-[#C0392B] mt-0.5">
              {lang === 'ne' ? '२४ अर्डर · ५ पकाउने' : '24 orders · 5 cooks'}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="divide-y divide-gray-100">
          {menuItems.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3.5 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-colors"
              onClick={item.action}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm text-gray-800">{item.label}</span>
              </div>
              {item.toggle ? (
                <button
                  onClick={() => setNotifications(n => !n)}
                  className={`w-10 h-5.5 rounded-full relative transition-colors duration-200 ${
                    notifications ? 'bg-[#C0392B]' : 'bg-gray-300'
                  }`}
                  style={{ height: '22px' }}
                  aria-label="Toggle notifications"
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      notifications ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              ) : (
                <span className="text-gray-300 text-lg">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button className="w-full mt-4 py-3 text-sm text-[#C0392B] font-medium border border-[#C0392B]/30 rounded-xl hover:bg-[#FAECE7] transition-colors">
          {lang === 'ne' ? 'साइन आउट' : 'Sign Out'}
        </button>

        {/* App version */}
        <div className="text-center text-xs text-gray-300 mt-4">
          TiffinGhar v1.0.0
        </div>
      </div>

      {/* Subscription plans modal */}
      {showPlans && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowPlans(false)}
        >
          <div
            className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-1">
              {lang === 'ne' ? '📦 सदस्यता योजना' : '📦 Subscription Plans'}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {lang === 'ne'
                ? 'सदस्यता लिएर प्रति खानामा बचत गर्नुस्'
                : 'Subscribe and save on every meal'}
            </p>
            <div className="space-y-3">
              {subscriptionPlans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setActivePlan(plan.id)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                    activePlan === plan.id
                      ? 'border-[#C0392B] bg-[#FAECE7]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {lang === 'ne' ? plan.nameNe : plan.name}
                        </span>
                        {plan.popular && (
                          <span className="text-[10px] bg-[#C0392B] text-white px-2 py-0.5 rounded-full">
                            {lang === 'ne' ? 'लोकप्रिय' : 'Popular'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {lang === 'ne' ? plan.descNe : plan.desc}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-medium text-[#C0392B]">Rs. {plan.price}</div>
                      <div className="text-xs text-gray-400">Rs. {plan.perMeal}/{lang === 'ne' ? 'खाना' : 'meal'}</div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white py-2.5 rounded-xl text-sm font-medium transition-colors mt-1">
                {lang === 'ne' ? 'सदस्यता लिनुस्' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
