import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTaskerStats, useTaskerBookings } from '../../hooks/useTaskerBookings';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency, formatDateShort, getInitials } from '../../utils/format';
import { colors } from '../../constants/colors';

export default function EarningsScreen() {
  const stats         = useTaskerStats();
  const { completed } = useTaskerBookings();

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      data={completed.slice(0, 50)}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={s.txRow}>
          <View style={s.txLeft}>
            <View style={s.txIcon}><Text style={s.txIconText}>{getInitials(item.clientName)}</Text></View>
            <View>
              <Text style={s.txClient}>{item.clientName}</Text>
              <Text style={s.txDate}>{formatDateShort(item.completedAt)}</Text>
            </View>
          </View>
          <View style={s.txRight}>
            <Text style={s.txAmt}>+{formatCurrency(item.pricing?.total)}</Text>
            <Text style={s.txMethod}>{item.payment?.method}</Text>
          </View>
        </View>
      )}
      ListHeaderComponent={(
        <View>
          <Text style={s.heading}>Mis ganancias</Text>
          <View style={s.mainCard}>
            <Text style={s.mainLabel}>Este mes</Text>
            <Text style={s.mainValue}>{formatCurrency(stats.monthEarnings)}</Text>
            <Text style={s.mainSub}>{stats.totalJobs} trabajos completados</Text>
          </View>
          <View style={s.breakdown}>
            {[['Hoy', stats.todayEarnings], ['Semana', stats.weekEarnings], ['Mes', stats.monthEarnings]].map(([l, v]) => (
              <View key={l} style={s.bRow}>
                <Text style={s.bLabel}>{l}</Text>
                <Text style={s.bValue}>{formatCurrency(v)}</Text>
              </View>
            ))}
          </View>
          <Text style={s.secTitle}>Últimos pagos</Text>
        </View>
      )}
      ListEmptyComponent={<EmptyState title="Aún no hay pagos" sub="Los trabajos completados aparecen aquí." />}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const s = StyleSheet.create({
  heading:    { fontSize: 22, fontWeight: '600', color: colors.text, padding: 20, paddingTop: 56 },
  mainCard:   { backgroundColor: colors.primary, borderRadius: 20, marginHorizontal: 20, padding: 24, marginBottom: 16, alignItems: 'center' },
  mainLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  mainValue:  { fontSize: 36, fontWeight: '700', color: '#fff' },
  mainSub:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  breakdown:  { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, marginHorizontal: 20, padding: 16, marginBottom: 24 },
  bRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  bLabel:     { fontSize: 14, color: colors.textMuted },
  bValue:     { fontSize: 14, fontWeight: '600', color: colors.text },
  secTitle:   { fontSize: 16, fontWeight: '600', color: colors.text, paddingHorizontal: 20, marginBottom: 12 },
  txRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  txLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txIcon:     { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  txIconText: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  txClient:   { fontSize: 14, fontWeight: '500', color: colors.text },
  txDate:     { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txRight:    { alignItems: 'flex-end' },
  txAmt:      { fontSize: 15, fontWeight: '600', color: colors.primary },
  txMethod:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
