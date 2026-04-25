import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useBooking } from '../../context/BookingContext';
import { getNearbyTaskers } from '../../services/taskers.service';
import { logOut } from '../../firebase/auth';
import CategoryGrid from '../../components/client/CategoryGrid';
import TaskerCard from '../../components/client/TaskerCard';
import EmptyState from '../../components/shared/EmptyState';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export default function ClientHomeScreen() {
  const router                 = useRouter();
  const { userProfile }        = useAuth();
  const { location, loading: locLoading } = useLocation();
  const { updateBooking }      = useBooking();

  const [taskers, setTaskers]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [category, setCategory]         = useState(null);

  useEffect(() => {
    if (!location?.latitude) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const list = await getNearbyTaskers(location.latitude, location.longitude, category);
      if (!cancelled) { setTaskers(list); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [location?.latitude, location?.longitude, category]);

  const handleSelectTasker = (tasker) => {
    updateBooking({ tasker });
    router.push(ROUTES.BOOKING_DATETIME);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.hi}>Hola, {userProfile?.name?.split(' ')[0] ?? ''}</Text>
          <Text style={s.loc}>{location?.isDefault ? 'Santo Domingo' : 'Tu ubicación actual'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push(ROUTES.CLIENT_BOOKINGS)} style={{ marginRight: 14 }}>
          <Text style={s.headerLink}>Mis reservas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logOut}><Text style={s.signout}>Salir</Text></TouchableOpacity>
      </View>

      <TextInput style={s.search} placeholder="¿Qué servicio necesitas?" placeholderTextColor={colors.textMuted} />

      <FlatList
        data={taskers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskerCard tasker={item} onPress={handleSelectTasker} />}
        ListHeaderComponent={(
          <View>
            <Text style={s.sectionTitle}>Categorías</Text>
            <CategoryGrid selectedId={category} onPress={(c) => setCategory(c.id === category ? null : c.id)} />
            <Text style={s.sectionTitle}>Técnicos cerca de ti</Text>
            {(loading || locLoading) && <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />}
          </View>
        )}
        ListEmptyComponent={
          !loading && !locLoading
            ? <EmptyState title="Sin técnicos disponibles" sub="No hay técnicos activos en tu zona en este momento." />
            : null
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  hi:           { fontSize: 22, fontWeight: '600', color: colors.text },
  loc:          { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  signout:      { color: colors.primary, fontSize: 13, fontWeight: '600' },
  headerLink:   { color: colors.primary, fontSize: 13, fontWeight: '600' },
  search:       { marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 12, marginBottom: 16, color: colors.text },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 12 },
});
