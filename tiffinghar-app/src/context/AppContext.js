import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { cooks as initialCooks, orders as initialOrders } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [cooks, setCooks] = useState(initialCooks)
  const [orders, setOrders] = useState(initialOrders)
  const [cart, setCart] = useState([])
  const [toastMsg, setToastMsg] = useState(null)
  const toastTimer = useRef(null)

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2500)
  }, [])

  const addToCart = useCallback((cook, meal = null) => {
    // Normalize: API cooks have cook.menu[], mock cooks have cook.meals[]
    const cookId = cook._id || cook.id
    const cookName = cook.name || 'Cook'
    const cookNameNe = cook.nameNe || cookName

    let mealName, mealNameNe, price

    if (meal && typeof meal === 'string') {
      // meal passed as string name
      mealName = meal
      // Try to find in menu (API format)
      const menuItem = cook.menu?.find(m => m.name === meal)
      mealNameNe = menuItem?.nameNe || (cook.mealsNe?.[cook.meals?.indexOf(meal)]) || meal
      price = menuItem?.price || cook.price || 150
    } else if (cook.menu && cook.menu.length > 0) {
      // API format: use first menu item
      const item = cook.menu[0]
      mealName = item.name
      mealNameNe = item.nameNe || item.name
      price = item.price || cook.price || 150
    } else if (cook.meals && cook.meals.length > 0) {
      // Mock format
      mealName = cook.meals[0]
      mealNameNe = cook.mealsNe?.[0] || mealName
      price = cook.price || 150
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

  const placeOrder = useCallback((address, paymentMethod) => {
    if (cart.length === 0) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const estTime = new Date(now.getTime() + 3 * 60 * 60 * 1000)
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

    newOrders.forEach(order => {
      const steps = [
        { progress: 30, delay: 5000 },
        { progress: 60, delay: 15000 },
        { progress: 80, status: 'onway', statusLabel: 'On the way', statusLabelNe: 'बाटोमा', delay: 30000 },
        { progress: 100, status: 'delivered', statusLabel: 'Delivered', statusLabelNe: 'डेलिभर भयो', delay: 60000 },
      ]
      steps.forEach(({ progress, status, statusLabel, statusLabelNe, delay }) => {
        setTimeout(() => {
          setOrders(prev => prev.map(o =>
            o.id === order.id
              ? { ...o, progress, ...(status ? { status, statusLabel, statusLabelNe } : {}) }
              : o
          ))
        }, delay)
      })
    })
  }, [cart, lang, toast, clearCart])

  const rateOrder = useCallback((orderId, rating, comment) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rated: true, rating, comment } : o))
    toast(lang === 'ne' ? 'धन्यवाद! समीक्षा सुरक्षित भयो।' : 'Thanks for your review!')
  }, [lang, toast])

  const reorder = useCallback((order) => {
    const cook = cooks.find(c => (c._id || c.id) === order.cookId)
    if (cook) addToCart(cook, order.item)
  }, [cooks, addToCart])

  const toggleSaveCook = useCallback((cookId) => {
    setCooks(prev => prev.map(c => (c._id || c.id) === cookId ? { ...c, saved: !c.saved } : c))
  }, [])

  return (
    <AppContext.Provider value={{
      lang, setLang,
      cooks, orders,
      cart, addToCart, updateCartQty, clearCart, cartTotal, cartCount,
      placeOrder, rateOrder, reorder, toggleSaveCook,
      toast, toastMsg,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
