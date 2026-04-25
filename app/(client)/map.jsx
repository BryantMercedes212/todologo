import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

// TODO: render react-native-maps <MapView> with markers for nearby taskers.
export default function MapScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>Mapa</Text>
      <Text style={s.sub}>Próximamente: técnicos cercanos en el mapa.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title:     { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 8 },
  sub:       { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
