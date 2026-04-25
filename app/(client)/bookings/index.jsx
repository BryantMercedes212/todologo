import { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { subscribeClientBookings } from '../../../services/bookings.service';
import StatusPill from '../../../components/shared/StatusPill';
import Avatar from '../../../components/shared/Avatar';
import EmptyState from '../../../components/shared/EmptyState';
import { formatCurrency, formatDateShort } from '../../../utils/format';
import { colors } from '../../../constants/colors';

const TABS = [
  { id: 'active',  label: 'Activas'  },
  { id: 'history', label: 'Historial' },
];

export default function ClientBookingsScreen() {
  const router        = useRouter();
  const { user }      = useAuth();
  const [tab, setTab] = useState('active');
  const [data, setData] = useState({ active: [], history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeClientBookings(user.uid, (next) => {
      setData(next);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  const list = useMemo(() => data[tab] ?? [], [tab, data]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>‹ Atrás</Text></TouchableOpacity>
        <Text style={s.heading}>Mis reservas</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[s.tab, tab === t.id && s.tabActive]} onPress={() => setTab(t.id)}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookingRow booking={item} onPress={() => router.push(`/(client)/bookings/${item.id}`)} />
            )}
            ListEmptyComponent={
              <EmptyState
                title={tab === 'active' ? 'Sin reservas activas' : 'Sin historial'}
                sub={tab === 'active' ? 'Cuando reserves un técnico aparecerá aquí.' : 'Tus reservas pasadas se mostrarán aquí.'}
              />
            }
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          />
        )}
    </View>
  );
}

const BookingRow = ({ booking, onPress }) => (
  <TouchableOpacity style={rs.card} onPress={onPress}>
    <View style={rs.head}>
      <Avatar name={booking.taskerName} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={rs.name}>{booking.taskerName}</Text>
        <Text style={rs.sub}>{booking.service?.category ?? 'Servicio'}</Text>
      </View>
      <StatusPill status={booking.status} />
    </View>
    <View style={rs.row}>
      <Text style={rs.label}>{formatDateShort(booking.scheduledAt)} · {booking.scheduledSlot ?? ''}</Text>
      <Text style={rs.amount}>{formatCurrency(booking.pricing?.total)}</Text>
    </View>
    <Text style={rs.sector}>{booking.address?.sector}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  back:          { color: colors.primary, fontSize: 14, width: 60 },
  heading:       { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center' },
  tabs:          { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  tab:           { flex: 1, padding: 10, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  tabActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText:       { fontSize: 13, fontWeight: '500', color: colors.text },
  tabTextActive: { color: '#fff', fontWeight: '600' },
});

const rs = StyleSheet.create({
  card:    { padding: 14, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 10 },
  head:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  name:    { fontSize: 15, fontWeight: '600', color: colors.text },
  sub:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  row:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label:   { fontSize: 12, color: colors.textMuted },
  amount:  { fontSize: 14, fontWeight: '700', color: colors.primary },
  sector:  { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
