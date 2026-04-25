import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { subscribeClientBooking, cancelBooking } from '../../../services/bookings.service';
import StatusPill from '../../../components/shared/StatusPill';
import Avatar from '../../../components/shared/Avatar';
import { formatCurrency, formatDate } from '../../../utils/format';
import { colors } from '../../../constants/colors';

export default function BookingTrackingScreen() {
  const { id }    = useLocalSearchParams();
  const router    = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeClientBooking(id, (b) => {
      setBooking(b);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const handleCancel = () => {
    Alert.alert('Cancelar reserva', '¿Seguro que quieres cancelar?', [
      { text: 'No' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try { await cancelBooking(id, 'Cancelada por el cliente'); }
          catch (e) { Alert.alert('Error', 'No se pudo cancelar'); }
        },
      },
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;
  if (!booking) return <View style={s.center}><Text style={s.muted}>Reserva no encontrada</Text></View>;

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Atrás</Text></TouchableOpacity>

      <View style={s.statusCard}>
        <StatusPill status={booking.status} />
        <Text style={s.bookingId}>#{booking.id?.slice(-8).toUpperCase()}</Text>
      </View>

      <View style={s.card}>
        <View style={s.row}>
          <Avatar name={booking.taskerName} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Técnico</Text>
            <Text style={s.value}>{booking.taskerName}</Text>
          </View>
        </View>
      </View>

      <View style={s.card}>
        <InfoRow label="Fecha"     value={formatDate(booking.scheduledAt)} />
        <InfoRow label="Dirección" value={`${booking.address?.street}, ${booking.address?.sector}`} />
        <InfoRow label="Servicio"  value={booking.service?.category} />
      </View>

      <View style={s.card}>
        <InfoRow label="Total" value={formatCurrency(booking.pricing?.total)} highlight />
        <InfoRow label="Método de pago" value={booking.payment?.method} />
      </View>

      {canCancel && (
        <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
          <Text style={s.cancelText}>Cancelar reserva</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const InfoRow = ({ label, value, highlight }) => (
  <View style={s.infoRow}>
    <Text style={s.label}>{label}</Text>
    <Text style={[s.value, highlight && { color: colors.primary, fontWeight: '700', fontSize: 16 }]}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  back:       { color: colors.primary, fontSize: 14, marginBottom: 16 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  bookingId:  { fontSize: 14, fontWeight: '700', color: colors.primary },
  card:       { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, padding: 14, marginBottom: 12 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label:      { fontSize: 12, color: colors.textMuted },
  value:      { fontSize: 14, color: colors.text, fontWeight: '500' },
  muted:      { color: colors.textMuted },
  cancelBtn:  { backgroundColor: '#FCE1E1', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  cancelText: { color: colors.danger, fontWeight: '600', fontSize: 14 },
});
