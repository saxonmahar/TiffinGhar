import { createContext, useContext, useState, useCallback } from 'react'
import { cooks as initialCooks, orders as initialOrders } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [cooks, setCooks] = useState(initialCooks)
  const [orders, setOrders] = useState(initialOrders)
  const [cart, setCart] = useState([])
  const [toasts, setToasts] = useState([])

  // Toast system
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  // Cart
  const addToCart = useCallback((cook, meal = null) => {
    setCart(prev => {
      const key = meal ? `${cook.id}-${meal}` : `${cook.id}`
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, {
        key,
        cookId: cook.id,
        cookName: cook.name,
        cookNameNe: cook.nameNe,
        meal: meal || (cook.meals[0]),
        mealNe: meal ? cook.mealsNe[cook.meals.indexOf(meal)] : cook.mealsNe[0],
        price: cook.price,
        qty: 1,
      }]
    })
    toast(lang === 'ne' ? 'कार्टमा थपियो!' : 'Added to cart!')
  }, [lang, toast])

  const updateCartQty = useCallback((key, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.key === key ? { ...i, qty: i.qty + delta } : i)
      return updated.filter(i => i.qty > 0)
    })
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // Place order
  const placeOrder = useCallback((address, paymentMethod) => {
    if (cart.length === 0) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const estTime = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    const estStr = estTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const newOrders = cart.map((item, idx) => ({
      id: `ORD${Date.now()}${idx}`,
      cookId: item.cookId,
      cookName: item.cookName,
      cookNameNe: item.cookNameNe,
      item: item.meal,
      itemNe: item.mealNe,
      qty: item.qty,
      price: item.price * item.qty,
      status: 'preparing',
      statusLabel: 'Preparing',
      statusLabelNe: 'तयार हुँदैछ',
      orderedAt: timeStr,
      estimatedAt: estStr,
      date: 'Today',
      dateNe: 'आज',
      progress: 10,
      address,
      paymentMethod,
      rated: false,
    }))

    setOrders(prev => [...newOrders, ...prev])
    clearCart()
    toast(lang === 'ne' ? 'अर्डर सफलतापूर्वक राखियो!' : 'Order placed successfully!')

    // Simulate progress
    newOrders.forEach(order => {
      simulateProgress(order.id)
    })
  }, [cart, lang, toast, clearCart])

  const simulateProgress = useCallback((orderId) => {
    const steps = [
      { progress: 25, delay: 8000 },
      { progress: 50, delay: 20000 },
      { progress: 75, status: 'onway', statusLabel: 'On the way', statusLabelNe: 'बाटोमा छ', delay: 40000 },
      { progress: 100, status: 'delivered', statusLabel: 'Delivered', statusLabelNe: 'डेलिभर भयो', delay: 70000 },
    ]
    steps.forEach(({ progress, status, statusLabel, statusLabelNe, delay }) => {
      setTimeout(() => {
        setOrders(prev => prev.map(o =>
          o.id === orderId
            ? { ...o, progress, ...(status ? { status, statusLabel, statusLabelNe } : {}) }
            : o
        ))
      }, delay)
    })
  }, [])

  // Rate order
  const rateOrder = useCallback((orderId, rating, comment) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rated: true, rating, comment } : o))
    toast(lang === 'ne' ? 'धन्यवाद! तपाईंको समीक्षा सुरक्षित भयो।' : 'Thanks for your review!')
  }, [lang, toast])

  // Reorder
  const reorder = useCallback((order) => {
    const cook = cooks.find(c => c.id === order.cookId)
    if (!cook) return
    addToCart(cook, order.item)
  }, [cooks, addToCart])

  // Toggle save cook
  const toggleSaveCook = useCallback((cookId) => {
    setCooks(prev => prev.map(c => c.id === cookId ? { ...c, saved: !c.saved } : c))
  }, [])

  return (
    <AppContext.Provider value={{
      lang, setLang,
      cooks, setCooks,
      orders, setOrders,
      cart, addToCart, updateCartQty, clearCart, cartTotal, cartCount,
      placeOrder,
      rateOrder,
      reorder,
      toggleSaveCook,
      toast, toasts,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
