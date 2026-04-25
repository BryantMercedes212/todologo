import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useBooking } from '../../../context/BookingContext';
import { SECTORS_SANTO_DOMINGO } from '../../../constants/data';
import { ROUTES } from '../../../constants/routes';
import { colors } from '../../../constants/colors';

// TODO: add draggable map pin via react-native-maps.
export default function AddressScreen() {
  const router           = useRouter();
  const { booking, updateBooking } = useBooking();

  const [street, setStreet] = useState(booking.address?.street ?? '');
  const [sector, setSector] = useState(booking.address?.sector ?? '');
  const [notes,  setNotes]  = useState(booking.address?.notes ?? '');

  const handleContinue = () => {
    if (!street.trim() || !sector) {
      Alert.alert('Error', 'Completa la dirección y el sector');
      return;
    }
    updateBooking({
      address: { street: street.trim(), sector, city: 'Santo Domingo', coords: null, notes: notes.trim() },
    });
    router.push(ROUTES.BOOKING_PAYMENT);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={s.heading}>¿Dónde está el servicio?</Text>

      <Text style={s.label}>Dirección (calle y número)</Text>
      <TextInput
        style={s.input}
        placeholder="Ej. C/ Paseo de los Locutores #12, apt 3B"
        value={street}
        onChangeText={setStreet}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={s.label}>Sector</Text>
      <View style={s.sectorGrid}>
        {SECTORS_SANTO_DOMINGO.map(sec => (
          <TouchableOpacity key={sec} style={[s.sector, sector === sec && s.sectorActive]} onPress={() => setSector(sec)}>
            <Text style={[s.sectorText, sector === sec && s.sectorTextActive]}>{sec}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Notas para el técnico (opcional)</Text>
      <TextInput
        style={[s.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Ej. Tocar el timbre 2 veces, cuidado con el perro"
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity style={s.btn} onPress={handleContinue}>
        <Text style={s.btnText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background },
  heading:          { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 20 },
  label:            { fontSize: 13, fontWeight: '500', color: colors.textMuted, marginBottom: 10, marginTop: 16 },
  input:            { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 15, color: colors.text },
  sectorGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sector:           { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface },
  sectorActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  sectorText:       { fontSize: 13, color: colors.text },
  sectorTextActive: { color: '#fff', fontWeight: '600' },
  btn:              { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText:          { color: '#fff', fontSize: 16, fontWeight: '600' },
});
