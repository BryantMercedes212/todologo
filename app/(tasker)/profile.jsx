import { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../../hooks/useAuth';
import { useAsync } from '../../hooks/useAsync';
import { getTaskerProfile, updateTaskerProfile, updateTaskerAvailability, updateTaskerCoords } from '../../services/taskers.service';
import { logOut } from '../../firebase/auth';
import { CATEGORIES } from '../../constants/data';
import { colors } from '../../constants/colors';

const STALE_AFTER_DAYS = 14;
const MS_PER_DAY       = 24 * 60 * 60 * 1000;

// Basic editor for the three fields that matter most: name, hourly rate,
// and categories. Availability toggle + logout at the bottom.
// TODO: photo upload, bio, weekly schedule.
export default function TaskerProfileScreen() {
  const { user }         = useAuth();
  const { loading, run } = useAsync();

  const [displayName,      setDisplayName]      = useState('');
  const [hourlyRate,       setHourlyRate]       = useState('');
  const [categories,       setCategories]       = useState([]);
  const [available,        setAvailable]        = useState(false);
  const [coords,           setCoords]           = useState(null);
  const [coordsUpdatedAt,  setCoordsUpdatedAt]  = useState(null);
  const [locLoading,       setLocLoading]       = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const p = await getTaskerProfile(user.uid);
      setDisplayName(p.displayName ?? '');
      setHourlyRate(String(p.hourlyRate ?? ''));
      setCategories(p.categories ?? []);
      setAvailable(!!p.isAvailableNow);
      setCoords(p.location?.coords ?? null);
      const ts = p.location?.coordsUpdatedAt;
      setCoordsUpdatedAt(ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null));
    })();
  }, [user?.uid]);

  // Stale = pinned more than 14 days ago. If we have coords but no timestamp,
  // we treat it as stale so legacy taskers also get nudged once.
  const isLocationStale = useMemo(() => {
    if (!coords) return false;
    if (!coordsUpdatedAt) return true;
    return (Date.now() - coordsUpdatedAt.getTime()) > STALE_AFTER_DAYS * MS_PER_DAY;
  }, [coords, coordsUpdatedAt]);

  const captureLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso denegado', 'Activa el permiso de ubicación en ajustes para aparecer en búsquedas'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(next);
      setCoordsUpdatedAt(new Date());
      await updateTaskerCoords(user.uid, next);
      Alert.alert('Listo', 'Ubicación actualizada');
    } catch (err) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
    } finally {
      setLocLoading(false);
    }
  };

  const toggleCategory = (id) =>
    setCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAvailability = async (v) => {
    setAvailable(v);
    try { await updateTaskerAvailability(user.uid, v); } catch { setAvailable(!v); }
  };

  const handleSave = () => run(async () => {
    const rate = Number(hourlyRate);
    if (!displayName.trim()) { Alert.alert('Error', 'Ingresa tu nombre'); return; }
    if (!rate || rate <= 0)  { Alert.alert('Error', 'Ingresa una tarifa por hora válida'); return; }
    if (categories.length === 0) { Alert.alert('Error', 'Selecciona al menos una categoría'); return; }

    await updateTaskerProfile(user.uid, {
      displayName: displayName.trim(),
      hourlyRate:  rate,
      categories,
      skills:      categories.map(id => CATEGORIES.find(c => c.id === id)?.label).filter(Boolean),
    });
    Alert.alert('Guardado', 'Perfil actualizado');
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <Text style={s.heading}>Mi perfil</Text>

      <View style={s.availRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.availLabel}>Disponible ahora</Text>
          <Text style={s.availSub}>{available ? 'Recibiendo solicitudes' : 'No apareces en búsquedas'}</Text>
        </View>
        <Switch value={available} onValueChange={handleAvailability} trackColor={{ false: colors.border, true: colors.primary }} />
      </View>

      {isLocationStale && (
        <View style={s.staleBanner}>
          <Text style={s.staleTitle}>Ubicación desactualizada</Text>
          <Text style={s.staleSub}>
            Hace más de {STALE_AFTER_DAYS} días que no actualizas tu ubicación. Refréscala para que los clientes cerca puedan encontrarte.
          </Text>
        </View>
      )}

      <View style={s.availRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.availLabel}>Mi ubicación</Text>
          <Text style={s.availSub}>
            {coords ? `Fijada (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` : 'Sin fijar — no aparecerás en búsquedas'}
          </Text>
        </View>
        <TouchableOpacity style={s.locBtn} onPress={captureLocation} disabled={locLoading}>
          {locLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.locBtnText}>{coords ? 'Actualizar' : 'Fijar'}</Text>}
        </TouchableOpacity>
      </View>

      <Text style={s.label}>Nombre</Text>
      <TextInput style={s.input} value={displayName} onChangeText={setDisplayName} placeholderTextColor={colors.textMuted} />

      <Text style={s.label}>Tarifa por hora (RD$)</Text>
      <TextInput style={s.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="number-pad" placeholder="Ej. 800" placeholderTextColor={colors.textMuted} />

      <Text style={s.label}>Categorías</Text>
      <View style={s.catGrid}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c.id} style={[s.cat, categories.includes(c.id) && s.catActive]} onPress={() => toggleCategory(c.id)}>
            <Text style={[s.catText, categories.includes(c.id) && s.catTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handleSave} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.logout} onPress={logOut}>
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  heading:      { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 16 },
  availRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, padding: 14, marginBottom: 16 },
  availLabel:   { fontSize: 14, fontWeight: '600', color: colors.text },
  availSub:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  label:        { fontSize: 13, fontWeight: '500', color: colors.textMuted, marginBottom: 8, marginTop: 14 },
  input:        { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 15, color: colors.text },
  catGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cat:          { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface },
  catActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  catText:      { fontSize: 13, color: colors.text },
  catTextActive:{ color: '#fff', fontWeight: '600' },
  btn:          { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  btnOff:       { opacity: 0.6 },
  btnText:      { color: '#fff', fontSize: 15, fontWeight: '600' },
  logout:       { alignItems: 'center', padding: 14, marginTop: 12 },
  logoutText:   { color: colors.danger, fontWeight: '600', fontSize: 14 },
  locBtn:       { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, minWidth: 90, alignItems: 'center' },
  locBtnText:   { color: '#fff', fontWeight: '600', fontSize: 13 },
  staleBanner:  { backgroundColor: '#FFF6E5', borderWidth: 1, borderColor: colors.accent, borderRadius: 12, padding: 12, marginBottom: 12 },
  staleTitle:   { fontSize: 13, fontWeight: '700', color: colors.accent, marginBottom: 4 },
  staleSub:     { fontSize: 12, color: colors.text, lineHeight: 16 },
});
