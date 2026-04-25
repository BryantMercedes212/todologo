import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTaskerBookings } from '../../hooks/useTaskerBookings';
import ConfirmedJobCard from '../../components/tasker/ConfirmedJobCard';
import StatusPill from '../../components/shared/StatusPill';
import Avatar from '../../components/shared/Avatar';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency, formatDateShort } from '../../utils/format';
import { colors } from '../../constants/colors';

// TODO: the subscribeTaskerBookings now returns 'cancelled' — wire it in.
const TABS = [
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'completed', label: 'Completados' },
  { id: 'cancelled', label: 'Cancelados' },
];

export default function JobsScreen() {
  const [tab, setTab] = useState('confirmed');
  const { confirmed, completed, startJob, completeJob } = useTaskerBookings();

  const data = useMemo(() => {
    if (tab === 'confirmed') return confirmed;
    if (tab === 'completed') return completed;
    return []; // cancelled not yet tracked in hook — TODO
  }, [tab, confirmed, completed]);

  return (
    <View style={s.container}>
      <Text style={s.heading}>Mis trabajos</Text>

      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[s.tab, tab === t.id && s.tabActive]} onPress={() => setTab(t.id)}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          tab === 'confirmed'
            ? <ConfirmedJobCard booking={item} onStart={startJob} onComplete={completeJob} />
            : <HistoryCard booking={item} />
        }
        ListEmptyComponent={<EmptyState title="Sin trabajos aquí" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      />
    </View>
  );
}

const HistoryCard = ({ booking }) => (
  <View style={hs.card}>
    <View style={hs.head}>
      <Avatar name={booking.clientName} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={hs.name}>{booking.clientName}</Text>
        <Text style={hs.date}>{formatDateShort(booking.completedAt ?? booking.cancelledAt ?? booking.scheduledAt)}</Text>
      </View>
      <StatusPill status={booking.status} />
    </View>
    <View style={hs.row}>
      <Text style={hs.sector}>{booking.address?.sector}</Text>
      <Text style={hs.amount}>{formatCurrency(booking.pricing?.total)}</Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  heading:       { fontSize: 22, fontWeight: '600', color: colors.text, paddingHorizontal: 20, marginBottom: 16 },
  tabs:          { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  tab:           { flex: 1, padding: 10, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  tabActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText:       { fontSize: 13, fontWeight: '500', color: colors.text },
  tabTextActive: { color: '#fff', fontWeight: '600' },
});

const hs = StyleSheet.create({
  card:   { padding: 14, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 10 },
  head:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  name:   { fontSize: 14, fontWeight: '600', color: colors.text },
  date:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  row:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sector: { fontSize: 12, color: colors.textMuted },
  amount: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
