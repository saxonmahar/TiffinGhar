import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { subscriptionPlans } from '../data/mockData'

const PAYMENTS = [
  { id: 'esewa', label: 'eSewa', icon: '💚', detail: '**** 4521' },
  { id: 'khalti', label: 'Khalti', icon: '💜', detail: '**** 8832' },
  { id: 'cash', label: 'Cash on Delivery', labelNe: 'नगद भुक्तानी', icon: '💵', detail: '' },
]

export default function Profile() {
  const { lang, orders, toast } = useApp()
  const [notifications, setNotifications] = useState(true)
  const [showPlans, setShowPlans] = useState(false)
  const [showAddresses, setShowAddresses] = useState(false)
  const [showPayments, setShowPayments] = useState(false)
  const [showRefer, setShowRefer] = useState(false)
  const [activePlan, setActivePlan] = useState('standard')
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', labelNe: 'घर', detail: 'Baneshwor-10, Kathmandu', default: true },
    { id: 2, label: 'Office', labelNe: 'कार्यालय', detail: 'New Baneshwor, Kathmandu', default: false },
  ])
  const [newAddress, setNewAddress] = useState('')
  const [newAddressLabel, setNewAddressLabel] = useState('')
  const [referCopied, setReferCopied] = useState(false)

  const totalSpent = orders.reduce((s, o) => s + o.price, 0)
  const referCode = 'SANJAY200'

  const menuItems = [
    { label: lang === 'ne' ? 'सेभ गरिएका ठेगाना' : 'Saved Addresses', icon: '📍', action: () => setShowAddresses(true) },
    { label: lang === 'ne' ? 'भुक्तानी विधि' : 'Payment Methods', icon: '💳', action: () => setShowPayments(true) },
    { label: lang === 'ne' ? 'सदस्यता योजना' : 'Subscription Plans', icon: '📦', action: () => setShowPlans(true) },
    { label: lang === 'ne' ? 'सूचनाहरू' : 'Notifications', icon: '🔔', toggle: true },
    { label: lang === 'ne' ? 'रेफर र कमाउनुस्' : 'Refer & Earn', icon: '🎁', action: () => setShowRefer(true) },
    { label: lang === 'ne' ? 'मद्दत र सहयोग' : 'Help & Support', icon: '💬', action: () => toast(lang === 'ne' ? 'छिट्टै आउँदैछ!' : 'Coming soon!') },
  ]

  const addAddress = () => {
    if (!newAddress || !newAddressLabel) return
    setAddresses(prev => [...prev, {
      id: Date.now(), label: newAddressLabel, labelNe: newAddressLabel,
      detail: newAddress, default: false,
    }])
    setNewAddress('')
    setNewAddressLabel('')
    toast(lang === 'ne' ? 'ठेगाना थपियो!' : 'Address added!')
  }

  const setDefaultAddress = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })))
    toast(lang === 'ne' ? 'डिफल्ट ठेगाना सेट भयो!' : 'Default address updated!')
  }

  const copyReferCode = () => {
    navigator.clipboard.writeText(referCode).catch(() => {})
    setReferCopied(true)
    setTimeout(() => setReferCopied(false), 2000)
    toast(lang === 'ne' ? 'कोड कपी भयो!' : 'Code copied!')
  }

  return (
    <>
      <div className="px-4 py-5">
        {/* Profile header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#FAECE7] flex items-center justify-center text-2xl">😊</div>
          <div className="flex-1">
            <div className="text-lg font-medium text-gray-900">Sanjay Shrestha</div>
            <div className="text-sm text-gray-500">{lang === 'ne' ? 'बानेश्वर, काठमाडौं' : 'Baneshwor, Kathmandu'}</div>
            <div className="text-xs text-[#C0392B] mt-0.5">
              {orders.length} {lang === 'ne' ? 'अर्डर' : 'orders'} · Rs. {totalSpent.toLocaleString()} {lang === 'ne' ? 'खर्च' : 'spent'}
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
                  onClick={e => { e.stopPropagation(); setNotifications(n => !n) }}
                  className={`w-10 rounded-full relative transition-colors duration-200 flex-shrink-0 ${notifications ? 'bg-[#C0392B]' : 'bg-gray-300'}`}
                  style={{ height: '22px' }}
                  aria-label="Toggle notifications"
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${notifications ? 'right-0.5' : 'left-0.5'}`} />
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

        <div className="text-center text-xs text-gray-300 mt-4">TiffinGhar v1.0.0</div>
      </div>

      {/* ── Addresses Modal ── */}
      {showAddresses && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowAddresses(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="text-base font-medium text-gray-900 mb-4">
              📍 {lang === 'ne' ? 'सेभ गरिएका ठेगाना' : 'Saved Addresses'}
            </div>
            <div className="space-y-2 mb-4">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`border rounded-xl p-3.5 flex items-center justify-between ${addr.default ? 'border-[#C0392B] bg-[#FAECE7]' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        {lang === 'ne' ? addr.labelNe : addr.label}
                        {addr.default && (
                          <span className="text-[10px] bg-[#C0392B] text-white px-1.5 py-0.5 rounded-full">
                            {lang === 'ne' ? 'डिफल्ट' : 'Default'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{addr.detail}</div>
                    </div>
                  </div>
                  {!addr.default && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs text-[#C0392B] font-medium hover:underline flex-shrink-0 ml-2"
                    >
                      {lang === 'ne' ? 'डिफल्ट' : 'Set default'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input
                value={newAddressLabel}
                onChange={e => setNewAddressLabel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#C0392B]"
                placeholder={lang === 'ne' ? 'लेबल (जस्तै: घर, कार्यालय)' : 'Label (e.g. Home, Office)'}
              />
              <input
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#C0392B]"
                placeholder={lang === 'ne' ? 'पूरा ठेगाना' : 'Full address'}
              />
              <button
                onClick={addAddress}
                className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                + {lang === 'ne' ? 'ठेगाना थप्नुस्' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Methods Modal ── */}
      {showPayments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowPayments(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="text-base font-medium text-gray-900 mb-4">
              💳 {lang === 'ne' ? 'भुक्तानी विधि' : 'Payment Methods'}
            </div>
            <div className="space-y-2 mb-4">
              {PAYMENTS.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-xl p-3.5 flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {lang === 'ne' && p.labelNe ? p.labelNe : p.label}
                    </div>
                    {p.detail && <div className="text-xs text-gray-400">{p.detail}</div>}
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    {lang === 'ne' ? 'जोडिएको' : 'Linked'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => toast(lang === 'ne' ? 'छिट्टै आउँदैछ!' : 'Coming soon!')}
              className="w-full border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-[#C0392B] hover:text-[#C0392B] transition-colors"
            >
              + {lang === 'ne' ? 'नयाँ भुक्तानी विधि थप्नुस्' : 'Add payment method'}
            </button>
          </div>
        </div>
      )}

      {/* ── Subscription Plans Modal ── */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowPlans(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="text-base font-medium text-gray-900 mb-1">
              📦 {lang === 'ne' ? 'सदस्यता योजना' : 'Subscription Plans'}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {lang === 'ne' ? 'सदस्यता लिएर प्रति खानामा बचत गर्नुस्' : 'Subscribe and save on every meal'}
            </p>
            <div className="space-y-3">
              {subscriptionPlans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setActivePlan(plan.id)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all ${activePlan === plan.id ? 'border-[#C0392B] bg-[#FAECE7]' : 'border-gray-200 hover:border-gray-300'}`}
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
              <button
                onClick={() => { toast(lang === 'ne' ? 'सदस्यता सक्रिय भयो!' : 'Subscription activated!'); setShowPlans(false) }}
                className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {lang === 'ne' ? 'सदस्यता लिनुस्' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Refer & Earn Modal ── */}
      {showRefer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowRefer(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-t-2xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎁</div>
              <div className="text-base font-medium text-gray-900">
                {lang === 'ne' ? 'रेफर गर्नुस् र कमाउनुस्' : 'Refer & Earn'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {lang === 'ne'
                  ? 'साथीलाई रेफर गर्नुस् र दुवैले Rs. २०० पाउनुस्'
                  : 'Refer a friend and both get Rs. 200 off'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">{lang === 'ne' ? 'तपाईंको रेफर कोड' : 'Your referral code'}</div>
                <div className="text-xl font-medium text-gray-900 tracking-widest">{referCode}</div>
              </div>
              <button
                onClick={copyReferCode}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${referCopied ? 'bg-green-600 text-white' : 'bg-[#C0392B] text-white hover:bg-[#A93226]'}`}
              >
                {referCopied ? '✓' : (lang === 'ne' ? 'कपी' : 'Copy')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: '👥', label: lang === 'ne' ? 'रेफर गरिएका' : 'Referred', val: '3' },
                { icon: '✅', label: lang === 'ne' ? 'सफल' : 'Successful', val: '2' },
                { icon: '💰', label: lang === 'ne' ? 'कमाइ' : 'Earned', val: 'Rs. 400' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{s.val}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
