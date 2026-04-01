import { useState } from 'react'
import { useApp } from '../context/AppContext'

const ADDRESSES = [
  { id: 1, label: 'Home', labelNe: 'घर', detail: 'Baneshwor-10, Kathmandu' },
  { id: 2, label: 'Office', labelNe: 'कार्यालय', detail: 'New Baneshwor, Kathmandu' },
]

const PAYMENTS = [
  { id: 'esewa', label: 'eSewa', icon: '💚' },
  { id: 'khalti', label: 'Khalti', icon: '💜' },
  { id: 'cash', label: 'Cash on Delivery', labelNe: 'नगद भुक्तानी', icon: '💵' },
]

export default function CartDrawer({ open, onClose }) {
  const { lang, cart, updateCartQty, cartTotal, placeOrder } = useApp()
  const [step, setStep] = useState('cart') // cart | address | payment | confirm
  const [selectedAddress, setSelectedAddress] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('esewa')
  const [placed, setPlaced] = useState(false)

  if (!open) return null

  const handlePlaceOrder = () => {
    const addr = ADDRESSES.find(a => a.id === selectedAddress)
    placeOrder(addr.detail, selectedPayment)
    setPlaced(true)
    setTimeout(() => {
      setPlaced(false)
      setStep('cart')
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[420px] rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {step !== 'cart' && (
              <button onClick={() => setStep('cart')} className="text-gray-400 hover:text-gray-600 mr-1">‹</button>
            )}
            <span className="text-base font-medium text-gray-900">
              {step === 'cart' && (lang === 'ne' ? '🛒 कार्ट' : '🛒 Your Cart')}
              {step === 'address' && (lang === 'ne' ? '📍 ठेगाना' : '📍 Delivery Address')}
              {step === 'payment' && (lang === 'ne' ? '💳 भुक्तानी' : '💳 Payment')}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Success state */}
          {placed && (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-lg font-medium text-gray-900">
                {lang === 'ne' ? 'अर्डर राखियो!' : 'Order Placed!'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {lang === 'ne' ? 'तपाईंको खाना तयार हुँदैछ' : 'Your food is being prepared'}
              </div>
            </div>
          )}

          {/* Cart step */}
          {!placed && step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-2">🍱</div>
                  <div className="text-sm">{lang === 'ne' ? 'कार्ट खाली छ' : 'Your cart is empty'}</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {lang === 'ne' ? item.mealNe : item.meal}
                        </div>
                        <div className="text-xs text-gray-400">
                          {lang === 'ne' ? item.cookNameNe : item.cookName} · Rs. {item.price}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={() => updateCartQty(item.key, -1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#C0392B] hover:text-[#C0392B] text-base leading-none"
                        >−</button>
                        <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.key, 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#C0392B] hover:text-[#C0392B] text-base leading-none"
                        >+</button>
                        <span className="text-sm font-medium text-gray-900 w-14 text-right">
                          Rs. {item.price * item.qty}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Promo */}
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C0392B]"
                      placeholder={lang === 'ne' ? 'प्रोमो कोड' : 'Promo code'}
                    />
                    <button className="px-4 py-2 border border-[#C0392B] text-[#C0392B] rounded-xl text-sm font-medium hover:bg-[#FAECE7]">
                      {lang === 'ne' ? 'लागू' : 'Apply'}
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mt-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{lang === 'ne' ? 'उप-जम्मा' : 'Subtotal'}</span>
                      <span>Rs. {cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{lang === 'ne' ? 'डेलिभरी' : 'Delivery'}</span>
                      <span className="text-green-600">{lang === 'ne' ? 'निःशुल्क' : 'Free'}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-900 pt-1 border-t border-gray-200">
                      <span>{lang === 'ne' ? 'जम्मा' : 'Total'}</span>
                      <span>Rs. {cartTotal}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Address step */}
          {!placed && step === 'address' && (
            <div className="space-y-3">
              {ADDRESSES.map(addr => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                    selectedAddress === addr.id ? 'border-[#C0392B] bg-[#FAECE7]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lang === 'ne' ? addr.labelNe : addr.label}
                      </div>
                      <div className="text-xs text-gray-500">{addr.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-[#C0392B] hover:text-[#C0392B] transition-colors">
                + {lang === 'ne' ? 'नयाँ ठेगाना थप्नुस्' : 'Add new address'}
              </button>
            </div>
          )}

          {/* Payment step */}
          {!placed && step === 'payment' && (
            <div className="space-y-3">
              {PAYMENTS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPayment(p.id)}
                  className={`border rounded-xl p-3.5 cursor-pointer transition-all flex items-center gap-3 ${
                    selectedPayment === p.id ? 'border-[#C0392B] bg-[#FAECE7]' : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {lang === 'ne' && p.labelNe ? p.labelNe : p.label}
                  </span>
                  {selectedPayment === p.id && <span className="ml-auto text-[#C0392B]">✓</span>}
                </div>
              ))}

              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-3 mt-2">
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  {lang === 'ne' ? 'अर्डर सारांश' : 'Order Summary'}
                </div>
                {cart.map(item => (
                  <div key={item.key} className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{lang === 'ne' ? item.mealNe : item.meal} ×{item.qty}</span>
                    <span>Rs. {item.price * item.qty}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium text-gray-900 pt-2 border-t border-gray-200 mt-1">
                  <span>{lang === 'ne' ? 'जम्मा' : 'Total'}</span>
                  <span>Rs. {cartTotal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!placed && cart.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            {step === 'cart' && (
              <button
                onClick={() => setStep('address')}
                className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white py-3 rounded-xl text-sm font-medium transition-colors flex justify-between items-center px-4"
              >
                <span>{lang === 'ne' ? 'अगाडि बढ्नुस्' : 'Proceed to Checkout'}</span>
                <span>Rs. {cartTotal} →</span>
              </button>
            )}
            {step === 'address' && (
              <button
                onClick={() => setStep('payment')}
                className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {lang === 'ne' ? 'भुक्तानीमा जानुस्' : 'Continue to Payment'}
              </button>
            )}
            {step === 'payment' && (
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {lang === 'ne' ? `Rs. ${cartTotal} तिर्नुस्` : `Pay Rs. ${cartTotal}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
