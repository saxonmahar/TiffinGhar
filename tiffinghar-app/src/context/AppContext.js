import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])  // local orders (placed this session)
  const [toastMsg, setToastMsg] = useState(null)
  const toastTimer = useRef(null)

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2500)
  }, [])

  // Cart — normalized to handle both API format (menu[]) and any format
  const addToCart = useCallback((cook, meal = null) => {
    const cookId = cook._id || cook.id
    const cookName = cook.name || 'Cook'
    const cookNameNe = cook.nameNe || cookName

    let mealName, mealNameNe, price

    if (meal && typeof meal === 'string') {
      mealName = meal
      const menuItem = cook.menu?.find(m => m.name === meal)
      mealNameNe = menuItem?.nameNe || meal
      price = menuItem?.price || cook.price || 150
    } else if (cook.menu?.length > 0) {
      const item = cook.menu[0]
      mealName = item.name
      mealNameNe = item.nameNe || item.name
      price = item.price || 150
    } else {
      mealName = cookName
      mealNameNe = cookNameNe
      price = cook.price || 150
    }

    const key = `${cookId}-${mealName}`
    setCart(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { key, cookId, cookName, cookNameNe, meal: mealName, mealNe: mealNameNe, price, qty: 1 }]
    })
    toast(lang === 'ne' ? 'कार्टमा थपियो!' : 'Added to cart!')
  }, [lang, toast])

  const updateCartQty = useCallback((key, delta) => {
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // Place order — calls real API, stores locally for immediate UI update
  const placeOrder = useCallback((address, paymentMethod) => {
    if (cart.length === 0) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const estTime = new Date(now.getTime() + 45 * 60 * 1000)
    const estStr = estTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const newOrders = cart.map((item, idx) => ({
      id: `ORD${Date.now()}${idx}`,
      cookId: item.cookId,
      cookName: item.cookName, cookNameNe: item.cookNameNe,
      item: item.meal, itemNe: item.mealNe,
      qty: item.qty, price: item.price * item.qty,
      status: 'preparing', statusLabel: 'Preparing', statusLabelNe: 'तयार हुँदैछ',
      orderedAt: timeStr, estimatedAt: estStr,
      date: 'Today', dateNe: 'आज',
      progress: 10, address, paymentMethod, rated: false,
    }))

    setOrders(prev => [...newOrders, ...prev])
    clearCart()
    toast(lang === 'ne' ? 'अर्डर सफलतापूर्वक राखियो!' : 'Order placed successfully!')
  }, [cart, lang, toast, clearCart])

  const rateOrder = useCallback((orderId, rating, comment) => {
    setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, rated: true, rating, comment } : o))
    toast(lang === 'ne' ? 'धन्यवाद! समीक्षा सुरक्षित भयो।' : 'Thanks for your review!')
  }, [lang, toast])

  const reorder = useCallback((order) => {
    // Re-add to cart from order history
    const cartItem = {
      key: `${order.cookId}-${order.item}-reorder`,
      cookId: order.cookId,
      cookName: order.cookName,
      cookNameNe: order.cookNameNe,
      meal: order.item,
      mealNe: order.itemNe,
      price: Math.round(order.price / order.qty),
      qty: order.qty,
    }
    setCart(prev => [...prev, cartItem])
    toast(lang === 'ne' ? 'कार्टमा थपियो!' : 'Added to cart!')
  }, [lang, toast])

  const toggleSaveCook = useCallback(() => {
    // Handled via API in CookCard directly
  }, [])

  return (
    <AppContext.Provider value={{
      lang, setLang,
      // No more local cooks/orders — screens fetch from API directly
      cooks: [],   // kept for backward compat, screens use API
      orders,      // local session orders
      cart, addToCart, updateCartQty, clearCart, cartTotal, cartCount,
      placeOrder, rateOrder, reorder, toggleSaveCook,
      toast, toastMsg,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
