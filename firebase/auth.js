import { auth, db } from './config';
import { PhoneAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { formatDRPhone } from '../utils/format';
import { DEFAULT_LOCATION } from '../constants/data';

export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    const provider       = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(
      formatDRPhone(phoneNumber), recaptchaVerifier
    );
    return { success: true, verificationId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Returns { success, isNewUser, user, profile } so the caller can route
// based on the real profile state (role + profileCompleted).
export const verifyOTP = async (verificationId, otpCode) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otpCode);
    const result     = await signInWithCredential(auth, credential);
    const user       = result.user;
    const userDoc    = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      await createUserProfile(user);
      return { success: true, isNewUser: true, user, profile: null };
    }
    return { success: true, isNewUser: false, user, profile: userDoc.data() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// New users start with role:null + profileCompleted:false so the auth guard
// keeps them on /complete-profile until they pick a role and enter a name.
const createUserProfile = async (user) => {
  await setDoc(doc(db, 'users', user.uid), {
    uid:              user.uid,
    phone:            user.phoneNumber,
    name:             '',
    email:            '',
    role:             null,
    profileCompleted: false,
    location:         { city: DEFAULT_LOCATION.city, sector: '', coords: null },
    isVerified:       false,
    isActive:         true,
    fcmToken:         null,
    createdAt:        serverTimestamp(),
  });
};

export const logOut = async () => {
  try { await signOut(auth); return { success: true }; }
  catch (error) { return { success: false, error: error.message }; }
};
