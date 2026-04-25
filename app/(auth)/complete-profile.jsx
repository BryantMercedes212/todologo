import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { useAsync } from '../../hooks/useAsync';
import { colors } from '../../constants/colors';

/**
 * New users land here after OTP. They pick a role and enter a name, then the
 * auth guard auto-routes them to the correct home. For taskers we also seed
 * a /taskers/{uid} doc so they appear (hidden, until they set hourlyRate
 * + isAvailableNow in the profile editor).
 */
export default function CompleteProfileScreen() {
  const { user }         = useAuth();
  const { loading, run } = useAsync();
  const [name, setName]  = useState('');
  const [role, setRole]  = useState(null);

  const handleSubmit = () => run(async () => {
    if (name.trim().length < 2) { Alert.alert('Error', 'Ingresa tu nombre completo'); return; }
    if (!role)                  { Alert.alert('Error', 'Selecciona tu tipo de cuenta'); return; }

    await updateDoc(doc(db, 'users', user.uid), {
      name: name.trim(),
      role,
      profileCompleted: true,
    });

    if (role === 'tasker') {
      await setDoc(doc(db, 'taskers', user.uid), {
        uid:            user.uid,
        displayName:    name.trim(),
        phone:          user.phoneNumber,
        hourlyRate:     0,
        skills:         [],
        categories:     [],
        bio:            '',
        photoUrl:       '',
        rating:         0,
        reviewCount:    0,
        isAvailableNow: false,
        isActive:       true,
        location:       { city: 'Santo Domingo', sector: '', coords: null },
        createdAt:      serverTimestamp(),
      });
    }
    // Guard routes automatically on next render.
  });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={s.title}>Completa tu perfil</Text>
      <Text style={s.sub}>Solo necesitamos algunos datos para comenzar</Text>

      <Text style={s.label}>Tu nombre</Text>
      <TextInput
        style={s.input}
        placeholder="Ej. Carlos Rodríguez"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <Text style={s.label}>¿Cómo usarás la app?</Text>
      <View style={s.roleRow}>
        <TouchableOpacity style={[s.roleCard, role === 'client' && s.roleActive]} onPress={() => setRole('client')}>
          <Text style={[s.roleLabel, role === 'client' && s.roleLabelActive]}>Soy Cliente</Text>
          <Text style={[s.roleSub, role === 'client' && s.roleSubActive]}>Necesito contratar servicios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.roleCard, role === 'tasker' && s.roleActive]} onPress={() => setRole('tasker')}>
          <Text style={[s.roleLabel, role === 'tasker' && s.roleLabelActive]}>Soy Técnico</Text>
          <Text style={[s.roleSub, role === 'tasker' && s.roleSubActive]}>Ofrezco mis servicios</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handleSubmit} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Guardando...' : 'Continuar'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: 'center' },
  title:           { fontSize: 26, fontWeight: '600', color: colors.text, marginBottom: 8 },
  sub:             { fontSize: 15, color: colors.textMuted, marginBottom: 24 },
  label:           { fontSize: 13, fontWeight: '500', color: colors.textMuted, marginBottom: 10, marginTop: 16 },
  input:           { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 16, color: colors.text },
  roleRow:         { flexDirection: 'row', gap: 10 },
  roleCard:        { flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  roleActive:      { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleLabel:       { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  roleLabelActive: { color: colors.primaryDark },
  roleSub:         { fontSize: 12, color: colors.textMuted, lineHeight: 16 },
  roleSubActive:   { color: colors.primaryDark },
  btn:             { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 32 },
  btnOff:          { opacity: 0.6 },
  btnText:         { color: '#fff', fontSize: 16, fontWeight: '600' },
});
