import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, RefreshControl, StyleSheet, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import OrderCard from '../components/OrderCard'
import { Tabs } from '../components/ui/Tabs'
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid'
import { Skeleton } from '../components/ui/Skeleton'
import LiveTrackingScreen from './LiveTrackingScreen'
import { ordersAPI } from '../api'

export default function OrdersScreen() {
  const { lang } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [trackingOrder, setTrackingOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await ordersAPI.myOrders()
      setOrders(res.orders || [])
    } catch {
      // keep empty — local orders from context shown via AppContext
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const active = orders.filter(o => ['pending', 'confirmed', 'preparing', 'onway'].includes(o.status))
  const past = orders.filter(o => o.status === 'delivered')
  const cancelled = orders.filter(o => o.status === 'cancelled')
  const totalSpent = orders.reduce((s, o) => s + (o.total || o.price || 0), 0)
  const displayed = filter === 'active' ? active : filter === 'past' ? past : filter === 'cancelled' ? cancelled : orders

  const TABS = [
    { id: 'all',       label: lang === 'ne' ? 'सबै' : 'All',         count: orders.length },
    { id: 'active',    label: lang === 'ne' ? 'सक्रिय' : 'Active',    count: active.length },
    { id: 'past',      label: lang === 'ne' ? 'पुराना' : 'Past',      count: past.length },
    { id: 'cancelled', label: lang === 'ne' ? 'रद्द' : 'Cancelled',   count: cancelled.length },
  ]

  return (
    <>
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders() }} tintColor="#C0392B" />}
        >
          <View style={s.header}>
            <Text style={s.title}>{lang === 'ne' ? 'मेरा अर्डरहरू' : 'My Orders'}</Text>
            <Text style={s.sub}>{lang === 'ne' ? 'तपाईंका सबै अर्डर' : 'Track all your orders'}</Text>
          </View>

          {/* Stats */}
          <View style={s.bentoWrap}>
            {loading ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Skeleton width="47.5%" height={100} borderRadius={16} />
                <Skeleton width="47.5%" height={100} borderRadius={16} />
              </View>
            ) : (
              <BentoGrid>
                <BentoCard icon="📦" title={lang === 'ne' ? 'कुल अर्डर' : 'Total Orders'} value={String(orders.length)} bg="#FAECE7" color="#C0392B" />
                <BentoCard icon="💰" title={lang === 'ne' ? 'कुल खर्च' : 'Total Spent'} value={`Rs.${totalSpent.toLocaleString()}`} bg="#f0fdf4" color="#16a34a" />
                <BentoCard icon="🔄" title={lang === 'ne' ? 'सक्रिय' : 'Active'} value={String(active.length)} bg="#eff6ff" color="#2563eb" />
                <BentoCard icon="⭐" title={lang === 'ne' ? 'रेट गर्न बाँकी' : 'To Rate'} value={String(past.filter(o => !o.rated).length)} bg="#fefce8" color="#ca8a04" />
              </BentoGrid>
            )}
          </View>

          {/* Tabs */}
          <View style={s.tabsWrap}>
            <Tabs tabs={TABS} defaultTab="all" onChange={setFilter} variant="pill" />
          </View>

          {/* Orders */}
          <View style={s.list}>
            {loading ? (
              [1, 2, 3].map(i => (
                <View key={i} style={s.skCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Skeleton width="55%" height={14} />
                    <Skeleton width={72} height={22} borderRadius={20} />
                  </View>
                  <Skeleton width="40%" height={11} style={{ marginBottom: 10 }} />
                  <Skeleton width="100%" height={6} borderRadius={4} />
                </View>
              ))
            ) : displayed.length === 0 ? (
              <View style={s.empty}>
                <Text style={{ fontSize: 40 }}>📋</Text>
                <Text style={s.emptyTitle}>{lang === 'ne' ? 'कुनै अर्डर छैन' : 'No orders here'}</Text>
              </View>
            ) : (
              displayed.map(o => (
                <OrderCard
                  key={o._id || o.id}
                  order={o}
                  onUpdate={fetchOrders}
                  onTrack={() => setTrackingOrder(o)}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Live Tracking Modal */}
      <Modal visible={!!trackingOrder} animationType="slide" onRequestClose={() => setTrackingOrder(null)}>
        {trackingOrder && (
          <LiveTrackingScreen order={trackingOrder} onClose={() => setTrackingOrder(null)} />
        )}
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  bentoWrap: { paddingHorizontal: 16, marginBottom: 14 },
  tabsWrap: { paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  skCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
})
