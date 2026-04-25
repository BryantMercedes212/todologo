import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export default function EmptyState({ title = 'Nada por aquí', sub }) {
  return (
    <View style={s.container}>
      <Text style={s.title}>{title}</Text>
      {sub && <Text style={s.sub}>{sub}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 32, alignItems: 'center' },
  title:     { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 },
  sub:       { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
