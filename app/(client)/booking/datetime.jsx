import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useBooking } from '../../../context/BookingContext';
import { getBusySlots } from '../../../services/bookings.service';
import { ROUTES } from '../../../constants/routes';
import { TIME_SLOTS, ESTIMATED_HOURS_OPTIONS } from '../../../constants/data';
import { colors } from '../../../constants/colors';

const getDays = () => {
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const months   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { key: d.toISOString().split('T')[0], dayName: dayNames[d.getDay()], dayNum: d.getDate(), month: months[d.getMonth()], isToday: i === 0 };
  });
};

export default function DateTimeScreen() {
  const router                     = useRouter();
  const { booking, updateBooking } = useBooking();
  const [selectedDay,  setDay]     = useState(booking.date);
  const [selectedTime, setTime]    = useState(booking.time);
  const [unavailable,  setUnavail] = useState([]);
  const [loading,      setLoading] = useState(false);

  // Pull busy slots for the selected day from the Cloud Function.
  // Firestore rules block clients from reading strangers' bookings, so we
  // delegate to a server function that returns just time strings.
  useEffect(() => {
    const taskerId = booking.tasker?.id;
    if (!taskerId || !selectedDay) { setUnavail([]); return; }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const slots = await getBusySlots(taskerId, selectedDay);
      if (!cancelled) {
        setUnavail(slots);
        // If the user had pre-selected a slot that's now busy, clear it.
        if (selectedTime && slots.includes(selectedTime)) setTime(null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [booking.tasker?.id, selectedDay]);

  const handleContinue = () => {
    if (!selectedDay || !selectedTime) return;
    updateBooking({ date: selectedDay, time: selectedTime });
    router.push(ROUTES.BOOKING_ADDRESS);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.heading}>¿Cuándo lo necesitas?</Text>

      <Text style={s.label}>Selecciona el día</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayScroll}>
        {getDays().map(day => (
          <TouchableOpacity key={day.key} style={[s.dayCard, selectedDay===day.key && s.active]} onPress={() => setDay(day.key)}>
            <Text style={[s.dayName,  selectedDay===day.key && s.activeText]}>{day.isToday ? 'Hoy' : day.dayName}</Text>
            <Text style={[s.dayNum,   selectedDay===day.key && s.activeText]}>{day.dayNum}</Text>
            <Text style={[s.dayMonth, selectedDay===day.key && s.activeTextLight]}>{day.month}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.timeLabelRow}>
        <Text style={s.label}>Selecciona la hora</Text>
        {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8, marginTop: 16 }} />}
      </View>
      <View style={s.timeGrid}>
        {TIME_SLOTS.map(slot => {
          const off = unavailable.includes(slot), sel = selectedTime === slot;
          return (
            <TouchableOpacity key={slot} style={[s.timeSlot, sel && s.active, off && s.dim]} onPress={() => !off && setTime(slot)} disabled={off}>
              <Text style={[s.timeText, sel && s.activeText]}>{slot}</Text>
              {off && <Text style={s.offLabel}>Ocupado</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={s.label}>Horas estimadas</Text>
      <View style={s.hoursRow}>
        {ESTIMATED_HOURS_OPTIONS.map(h => (
          <TouchableOpacity key={h} style={[s.hourBtn, booking.estimatedHours===h && s.active]} onPress={() => updateBooking({ estimatedHours: h })}>
            <Text style={[s.hourText, booking.estimatedHours===h && s.activeText]}>{h}h</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[s.btn, (!selectedDay||!selectedTime) && s.btnOff]} onPress={handleContinue} disabled={!selectedDay||!selectedTime}>
        <Text style={s.btnText}>Continuar</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:       { flex:1, backgroundColor:colors.background, padding:20 },
  heading:         { fontSize:22, fontWeight:'600', color:colors.text, marginBottom:20 },
  label:           { fontSize:13, fontWeight:'500', color:colors.textMuted, marginBottom:10, marginTop:16 },
  timeLabelRow:    { flexDirection:'row', alignItems:'center' },
  dayScroll:       { gap:8, paddingBottom:4 },
  dayCard:         { width:62, alignItems:'center', padding:10, borderRadius:14, borderWidth:0.5, borderColor:colors.border, backgroundColor:colors.surface },
  active:          { backgroundColor:colors.primary, borderColor:colors.primary },
  dayName:         { fontSize:11, color:colors.textMuted },
  dayNum:          { fontSize:20, fontWeight:'600', color:colors.text, marginVertical:2 },
  dayMonth:        { fontSize:11, color:colors.textMuted },
  activeText:      { color:'#fff', fontWeight:'600' },
  activeTextLight: { color:'rgba(255,255,255,0.75)' },
  timeGrid:        { flexDirection:'row', flexWrap:'wrap', gap:8 },
  timeSlot:        { width:'30%', padding:10, borderRadius:12, borderWidth:0.5, borderColor:colors.border, backgroundColor:colors.surface, alignItems:'center' },
  timeText:        { fontSize:13, fontWeight:'500', color:colors.text },
  dim:             { opacity:0.4 },
  offLabel:        { fontSize:9, color:colors.textMuted, marginTop:2 },
  hoursRow:        { flexDirection:'row', gap:8 },
  hourBtn:         { flex:1, padding:12, borderRadius:12, alignItems:'center', borderWidth:0.5, borderColor:colors.border, backgroundColor:colors.surface },
  hourText:        { fontSize:15, fontWeight:'600', color:colors.text },
  btn:             { backgroundColor:colors.primary, borderRadius:14, padding:16, alignItems:'center', marginTop:24 },
  btnOff:          { opacity:0.4 },
  btnText:         { color:'#fff', fontSize:16, fontWeight:'600' },
});
