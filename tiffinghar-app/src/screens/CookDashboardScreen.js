import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, RefreshControl, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { ordersAPI, cooksAPI } from '../api'
import { BentoGrid, BentoCard } from '../components/ui/BentoGrid'
import { Tabs } from '../components/ui/Tabs'
import { Skeleton } from '../components/ui/Skeleton'

const STATUS_ACTIONS = {
  pending:   { next: 'confirmed',  label: 'Accept Order',   color: '#16a34a' },
  confirmed: { next: 'preparing',  label: 'Start Cooking',  color: '#2563eb' },
  preparing: { next: 'onway',      label: 'Out for Delivery', color: '#7c3aed' },
  onway:     { next: 'delivered',  label: 'Mark Delivered', color: '#C0392B' },
}

export default function CookDashboardScreen({ onClose }) {
  const { user } = useAuth()
  const { lang, toast } = useApp()
  const [orders, setOrders] = useState([])
  const [cookProfile, setCookProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('active')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, profileRes] = await Promise.all([
        ordersAPI.incoming(),
        cooksAPI.myProfile(),
      ])
      setOrders(ordersRes.orders || [])
      setCookProfile(profileRes.cook)
    } catch {
      // use empty state
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: newStatus } : o
      ))
      toast(lang === 'ne' ? 'अर्डर अपडेट भयो!' : 'Order updated!')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleOpen = async () => {
    try {
      const res = await cooksAPI.toggleOpen()
      setCookProfile(p => ({ ...p, isOpen: res.isOpen }))
      toast(res.isOpen ? 'You are now accepting orders' : 'You are now closed')
    } catch {}
  }

  const active = orders.filter(o => ['pending', 'confirmed', 'preparing', 'onway'].includes(o.status))
  const completed = orders.filter(o => o.status === 'delivered')
  const todayEarnings = completed.reduce((s, o) => s + (o.total || 0), 0)

  const TABS = [
    { id: 'active',    label: lang === 'ne' ? 'सक्रिय' : 'Active',    count: active.length },
    { id: 'completed', label: lang === 'ne' ? 'सम्पन्न' : 'Completed', count: completed.length },
  ]

  const displayed = filter === 'active' ? active : completed

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>{lang === 'ne' ? 'कुक ड्यासबोर्ड' : 'Cook Dashboard'}</Text>
          <Text style={s.sub}>{user?.name}</Text>
        </View>
        {/* Open/Close toggle */}
        <View style={s.toggleWrap}>
          <Text style={[s.toggleLabel, { color: cookProfile?.isOpen ? '#16a34a' : '#9ca3af' }]}>
            {cookProfile?.isOpen ? (lang === 'ne' ? 'खुला' : 'Open') : (lang === 'ne' ? 'बन्द' : 'Closed')}
          </Text>
          <Switch
            value={cookProfile?.isOpen || false}
            onValueChange={handleToggleOpen}
            trackColor={{ false: '#d1d5db', true: '#16a34a' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData() }} tintColor="#C0392B" />}
      >
        {/* Stats */}
        <View style={s.statsWrap}>
          {loading ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Skeleton width="47%" height={90} borderRadius={14} />
              <Skeleton width="47%" height={90} borderRadius={14} />
            </View>
          ) : (
            <BentoGrid>
              <BentoCard icon="📦" title={lang === 'ne' ? 'आजका अर्डर' : "Today's Orders"} value={String(orders.length)} bg="#FAECE7" color="#C0392B" />
              <BentoCard icon="💰" title={lang === 'ne' ? 'आजको कमाइ' : "Today's Earnings"} value={`Rs.${todayEarnings}`} bg="#f0fdf4" color="#16a34a" />
              <BentoCard icon="⏳" title={lang === 'ne' ? 'पेन्डिङ' : 'Pending'} value={String(active.filter(o => o.status === 'pending').length)} bg="#eff6ff" color="#2563eb" />
              <BentoCard icon="✅" title={lang === 'ne' ? 'सम्पन्न' : 'Completed'} value={String(completed.length)} bg="#f0fdf4" color="#16a34a" />
            </BentoGrid>
          )}
        </View>

        {/* Tabs */}
        <View style={s.tabsWrap}>
          <Tabs tabs={TABS} defaultTab="active" onChange={setFilter} variant="pill" />
        </View>

        {/* Orders */}
        <View style={s.list}>
          {loading ? (
            [1, 2].map(i => <Skeleton key={i} width="100%" height={120} borderRadius={14} style={{ marginBottom: 10 }} />)
          ) : displayed.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 36 }}>🍱</Text>
              <Text style={s.emptyText}>
                {filter === 'active'
                  ? (lang === 'ne' ? 'कुनै सक्रिय अर्डर छैन' : 'No active orders')
                  : (lang === 'ne' ? 'कुनै सम्पन्न अर्डर छैन' : 'No completed orders')}
              </Text>
            </View>
          ) : (
            displayed.map(order => (
              <View key={order._id} style={s.orderCard}>
                {/* Order header */}
                <View style={s.orderHeader}>
                  <View>
                    <Text style={s.orderCustomer}>👤 {order.user?.name || 'Customer'}</Text>
                    <Text style={s.orderTime}>{order.orderedAt} · Rs. {order.total}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[order.status]?.bg || '#f3f4f6' }]}>
                    <Text style={[s.statusText, { color: STATUS_COLORS[order.status]?.text || '#374151' }]}>
                      {order.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Items */}
                <View style={s.itemsList}>
                  {(order.items || []).map((item, i) => (
                    <Text key={i} style={s.itemText}>• {item.name} ×{item.qty} — Rs. {item.price * item.qty}</Text>
                  ))}
                </View>

                {/* Address */}
                {order.deliveryAddress && (
                  <Text style={s.addressText}>📍 {typeof order.deliveryAddress === 'string' ? order.deliveryAddress : order.deliveryAddress.detail}</Text>
                )}

                {/* Action button */}
                {STATUS_ACTIONS[order.status] && (
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: STATUS_ACTIONS[order.status].color }, updatingId === order._id && s.actionBtnLoading]}
                    onPress={() => handleStatusUpdate(order._id, STATUS_ACTIONS[order.status].next)}
                    disabled={updatingId === order._id}
                  >
                    <Text style={s.actionBtnText}>
                      {updatingId === order._id ? '...' : STATUS_ACTIONS[order.status].label}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Cancel option for pending */}
                {order.status === 'pending' && (
                  <TouchableOpacity
                    style={s.rejectBtn}
                    onPress={() => Alert.alert(
                      'Reject Order?',
                      'This will cancel the order.',
                      [{ text: 'Cancel' }, { text: 'Reject', style: 'destructive', onPress: () => handleStatusUpdate(order._id, 'cancelled') }]
                    )}
                  >
                    <Text style={s.rejectBtnText}>✕ Reject Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', text: '#854d0e' },
  confirmed: { bg: '#dbeafe', text: '#1d4ed8' },
  preparing: { bg: '#FAEEDA', text: '#854F0B' },
  onway:     { bg: '#E6F1FB', text: '#185FA5' },
  delivered: { bg: '#EAF3DE', text: '#3B6D11' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#374151', lineHeight: 26 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280' },
  toggleWrap: { marginLeft: 'auto', alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 11, fontWeight: '700' },
  statsWrap: { padding: 16 },
  tabsWrap: { paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderCustomer: { fontSize: 15, fontWeight: '700', color: '#111827' },
  orderTime: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  itemsList: { marginBottom: 8 },
  itemText: { fontSize: 13, color: '#374151', marginBottom: 2 },
  addressText: { fontSize: 12, color: '#6b7280', marginBottom: 10 },
  actionBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 6 },
  actionBtnLoading: { opacity: 0.6 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { alignItems: 'center', paddingVertical: 8 },
  rejectBtnText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
})
