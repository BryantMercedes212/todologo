import { View, Text, Switch, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTaskerBookings, useTaskerStats } from '../../hooks/useTaskerBookings';
import { updateTaskerAvailability } from '../../services/taskers.service';
import BookingRequestCard from '../../components/tasker/BookingRequestCard';
import ConfirmedJobCard from '../../components/tasker/ConfirmedJobCard';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../constants/colors';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function TaskerDashboardScreen() {
  const { user, userProfile }                           = useAuth();
  const { pending, confirmed, loading, acceptBooking, declineBooking, startJob, completeJob } = useTaskerBookings();
  const stats                                           = useTaskerStats();
  const [available, setAvailable]                       = useState(false);

  // Subscribe to the tasker's own doc so the availability toggle reflects
  // server state (e.g. admin toggles, cross-device changes).
  useEffect(() => {
    if (!user?.uid) return;
    return onSnapshot(doc(db, 'taskers', user.uid), (snap) => {
      setAvailable(!!snap.data()?.isAvailableNow);
    });
  }, [user?.uid]);

  const handleToggle = async (v) => {
    setAvailable(v);
    try { await updateTaskerAvailability(user.uid, v); } catch { setAvailable(!v); }
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      data={[]}
      renderItem={null}
      ListHeaderComponent={(
        <View style={{ paddingHorizontal: 20, paddingTop: 56 }}>
          <Text style={s.hi}>Hola, {userProfile?.name?.split(' ')[0] ?? ''}</Text>

          <View style={s.availCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.availTitle}>{available ? 'Disponible' : 'No disponible'}</Text>
              <Text style={s.availSub}>{available ? 'Recibiendo solicitudes' : 'No apareces en búsquedas'}</Text>
            </View>
            <Switch value={available} onValueChange={handleToggle} trackColor={{ false: colors.border, true: colors.primary }} />
          </View>

          <View style={s.stats}>
            <Stat label="Hoy"    value={formatCurrency(stats.todayEarnings)} />
            <Stat label="Semana" value={formatCurrency(stats.weekEarnings)} />
            <Stat label="Mes"    value={formatCurrency(stats.monthEarnings)} />
          </View>

          {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />}

          <Text style={s.sectionTitle}>Solicitudes ({pending.length})</Text>
          {pending.length === 0
            ? <EmptyState title="Sin solicitudes pendientes" sub="Te avisaremos cuando lleguen." />
            : pending.map(b => (
                <BookingRequestCard
                  key={b.id}
                  booking={b}
                  onAccept={acceptBooking}
                  onDecline={(id) => declineBooking(id, 'Rechazada por el técnico')}
                />
              ))
          }

          <Text style={s.sectionTitle}>Trabajos confirmados ({confirmed.length})</Text>
          {confirmed.length === 0
            ? <EmptyState title="Sin trabajos confirmados" />
            : confirmed.map(b => (
                <ConfirmedJobCard
                  key={b.id}
                  booking={b}
                  onStart={startJob}
                  onComplete={completeJob}
                />
              ))
          }
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const Stat = ({ label, value }) => (
  <View style={s.statBox}>
    <Text style={s.statLabel}>{label}</Text>
    <Text style={s.statValue}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  hi:           { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 16 },
  availCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginBottom: 16 },
  availTitle:   { fontSize: 15, fontWeight: '600', color: colors.text },
  availSub:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  stats:        { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox:      { flex: 1, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 12, alignItems: 'center' },
  statLabel:    { fontSize: 11, color: colors.textMuted },
  statValue:    { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 20, marginBottom: 12 },
});
