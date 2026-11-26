import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

export interface RegisterInput {
  nama: string;
  email: string;
  password: string;
  kecamatanPantauan: string;
  noHp?: string;
}

export const registerUser = async (data: RegisterInput): Promise<UserProfile> => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    data.email.trim(),
    data.password
  );

  await updateProfile(credential.user, {
    displayName: data.nama.trim(),
  });

  const newProfile: UserProfile = {
    uid: credential.user.uid,
    nama: data.nama.trim(),
    email: data.email.trim().toLowerCase(),
    role: 'masyarakat',
    kecamatanPantauan: data.kecamatanPantauan.trim() || 'Pekalongan Barat',
    noHp: data.noHp?.trim() || '',
  };

  await setDoc(doc(db, 'users', credential.user.uid), {
    ...newProfile,
    createdAt: serverTimestamp(),
  });

  return newProfile;
};

export const loginUser = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  return credential.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfileData = async (
  uid: string,
  updates: Partial<Pick<UserProfile, 'nama' | 'kecamatanPantauan' | 'noHp'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), updates);
};