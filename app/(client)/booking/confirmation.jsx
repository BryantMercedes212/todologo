import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ROUTES } from '../../../constants/routes';
import { colors } from '../../../constants/colors';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={s.container}>
      <View style={s.icon}><Text style={s.iconText}>✓</Text></View>
      <Text style={s.title}>¡Reserva confirmada!</Text>
      <Text style={s.sub}>Tu solicitud fue enviada al técnico. Recibirás confirmación por WhatsApp en breve.</Text>
      <View style={s.idCard}>
        <Text style={s.idLabel}>Número de reserva</Text>
        <Text style={s.idVal}>#{id?.slice(-8).toUpperCase()}</Text>
      </View>
      <View style={s.steps}>
        {[
          { n:'1', t:'El técnico recibe tu solicitud por WhatsApp', done:true },
          { n:'2', t:'Confirma o propone otro horario' },
          { n:'3', t:'Se presenta en tu dirección a la hora acordada' },
          { n:'4', t:'Pagas al finalizar el servicio' },
        ].map(({ n, t, done }) => (
          <View key={n} style={s.step}>
            <View style={[s.stepN, done && s.stepNDone]}><Text style={[s.stepNT, done && s.stepNTDone]}>{n}</Text></View>
            <Text style={s.stepT}>{t}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={() => router.replace(ROUTES.CLIENT_HOME)}>
        <Text style={s.btnText}>Ir al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex:1, backgroundColor:colors.background, padding:24, alignItems:'center', justifyContent:'center' },
  icon:       { width:80, height:80, borderRadius:40, backgroundColor:colors.primaryLight, justifyContent:'center', alignItems:'center', marginBottom:20 },
  iconText:   { fontSize:36, color:colors.primary },
  title:      { fontSize:24, fontWeight:'700', color:colors.text, marginBottom:10 },
  sub:        { fontSize:14, color:colors.textMuted, textAlign:'center', lineHeight:22, marginBottom:24 },
  idCard:     { backgroundColor:colors.surface, borderRadius:14, borderWidth:0.5, borderColor:colors.border, padding:16, alignItems:'center', width:'100%', marginBottom:24 },
  idLabel:    { fontSize:12, color:colors.textMuted, marginBottom:4 },
  idVal:      { fontSize:22, fontWeight:'700', color:colors.primary },
  steps:      { width:'100%', gap:12, marginBottom:28 },
  step:       { flexDirection:'row', alignItems:'flex-start', gap:12 },
  stepN:      { width:28, height:28, borderRadius:14, backgroundColor:colors.surface, borderWidth:0.5, borderColor:colors.border, justifyContent:'center', alignItems:'center' },
  stepNDone:  { backgroundColor:colors.primary, borderColor:colors.primary },
  stepNT:     { fontSize:13, fontWeight:'600', color:colors.textMuted },
  stepNTDone: { color:'#fff' },
  stepT:      { flex:1, fontSize:13, color:colors.text, lineHeight:20, paddingTop:4 },
  btn:        { backgroundColor:colors.primary, borderRadius:14, padding:16, alignItems:'center', width:'100%' },
  btnText:    { color:'#fff', fontSize:16, fontWeight:'600' },
});
