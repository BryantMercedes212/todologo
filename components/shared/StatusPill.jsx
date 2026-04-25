import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

const STATUS = {
  pending:     { label: 'Pendiente',   bg: '#FFF4D6',          fg: '#A87D00' },
  confirmed:   { label: 'Confirmado',  bg: colors.primaryLight, fg: colors.primaryDark },
  in_progress: { label: 'En progreso', bg: '#DDE8FF',          fg: '#14438B' },
  completed:   { label: 'Completado',  bg: colors.surface,     fg: colors.text },
  cancelled:   { label: 'Cancelado',   bg: '#FCE1E1',          fg: colors.danger },
};

export default function StatusPill({ status = 'pending' }) {
  const { label, bg, fg } = STATUS[status] ?? STATUS.pending;
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
});
