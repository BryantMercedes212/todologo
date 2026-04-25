import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useRouter } from 'expo-router';
import { firebaseConfig } from '../../firebase/config';
import { sendOTP, verifyOTP } from '../../firebase/auth';
import { useAsync } from '../../hooks/useAsync';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export default function LoginScreen() {
  const router            = useRouter();
  const { loading, run }  = useAsync();
  const recaptchaVerifier = useRef(null);
  const [step,           setStep]           = useState('phone');
  const [phone,          setPhone]          = useState('');
  const [otp,            setOtp]            = useState('');
  const [verificationId, setVerificationId] = useState(null);

  const handleSendOTP = () => run(async () => {
    if (phone.length < 7) { Alert.alert('Error', 'Ingresa un número válido'); return; }
    const r = await sendOTP(phone, recaptchaVerifier.current);
    if (r.success) { setVerificationId(r.verificationId); setStep('otp'); }
    else Alert.alert('Error', 'No se pudo enviar el código.');
  });

  const handleVerifyOTP = () => run(async () => {
    if (otp.length !== 6) { Alert.alert('Error', 'El código debe tener 6 dígitos'); return; }
    const r = await verifyOTP(verificationId, otp);
    if (!r.success) { Alert.alert('Error', 'Código incorrecto.'); return; }

    // Route based on real profile state. Guard will re-verify on render.
    if (r.isNewUser || !r.profile?.profileCompleted) {
      router.replace(ROUTES.COMPLETE_PROFILE);
    } else if (r.profile.role === 'tasker') {
      router.replace(ROUTES.TASKER_HOME);
    } else {
      router.replace(ROUTES.CLIENT_HOME);
    }
  });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig} attemptInvisibleVerification />
      <Text style={s.title}>{step === 'phone' ? 'Ingresa tu número' : 'Código de verificación'}</Text>
      <Text style={s.subtitle}>{step === 'phone' ? 'Te enviaremos un código por SMS' : `Enviamos un código al ${phone}`}</Text>

      {step === 'phone' ? (
        <View style={s.phoneRow}>
          <View style={s.cc}><Text style={s.ccText}>🇩🇴 +1</Text></View>
          <TextInput style={s.phoneInput} placeholder="809-555-1234" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={12} placeholderTextColor={colors.textMuted} />
        </View>
      ) : (
        <TextInput style={s.otpInput} placeholder="------" keyboardType="number-pad" value={otp} onChangeText={setOtp} maxLength={6} textAlign="center" placeholderTextColor={colors.textMuted} />
      )}

      <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Cargando...' : step === 'phone' ? 'Enviar código' : 'Verificar'}</Text>
      </TouchableOpacity>
      {step === 'otp' && <TouchableOpacity onPress={() => setStep('phone')}><Text style={s.back}>Cambiar número</Text></TouchableOpacity>}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flex:1, padding:24, backgroundColor:colors.background, justifyContent:'center' },
  title:      { fontSize:26, fontWeight:'600', color:colors.text, marginBottom:8 },
  subtitle:   { fontSize:15, color:colors.textMuted, marginBottom:32 },
  phoneRow:   { flexDirection:'row', gap:10, marginBottom:20 },
  cc:         { backgroundColor:colors.surface, borderRadius:12, borderWidth:1, borderColor:colors.border, paddingHorizontal:14, justifyContent:'center' },
  ccText:     { fontSize:15, color:colors.text },
  phoneInput: { flex:1, backgroundColor:colors.surface, borderRadius:12, borderWidth:1, borderColor:colors.border, padding:14, fontSize:16, color:colors.text },
  otpInput:   { backgroundColor:colors.surface, borderRadius:12, borderWidth:1, borderColor:colors.border, padding:16, fontSize:28, color:colors.text, marginBottom:20 },
  btn:        { backgroundColor:colors.primary, borderRadius:14, padding:16, alignItems:'center', marginBottom:16 },
  btnOff:     { opacity:0.6 },
  btnText:    { color:'#fff', fontSize:16, fontWeight:'600' },
  back:       { textAlign:'center', color:colors.primary, fontSize:14 },
});
