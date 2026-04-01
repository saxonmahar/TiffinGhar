import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import TopBar from './components/TopBar'
import TabBar from './components/TabBar'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Cooks from './pages/Cooks'
import Profile from './pages/Profile'

function AppShell() {
  const { lang, setLang, cartCount } = useApp()
  const [activePage, setActivePage] = useState('home')
  const [cartOpen, setCartOpen] = useState(false)

  const pages = { home: Home, orders: Orders, cooks: Cooks, profile: Profile }
  const PageComponent = pages[activePage]

  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg min-h-[700px] flex flex-col">
      <TopBar
        lang={lang}
        setLang={setLang}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
      />
      <TabBar activePage={activePage} setActivePage={setActivePage} lang={lang} />
      <div className="flex-1 overflow-y-auto">
        <PageComponent lang={lang} setActivePage={setActivePage} />
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
