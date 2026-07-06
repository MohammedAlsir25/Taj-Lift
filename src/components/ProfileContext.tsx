import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type AppTheme = 'dark' | 'light';

export interface AvatarPreset {
  id: string;
  url: string;
  label: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'male',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="50" fill="%23bae6fd"/><circle cx="50" cy="40" r="18" fill="%230284c7"/><path d="M50 64c-16 0-30 8-34 20a50 50 0 0068 0c-4-12-18-20-34-20z" fill="%230284c7"/></svg>',
    label: 'Male'
  },
  {
    id: 'female',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="50" fill="%23fbcfe8"/><circle cx="50" cy="42" r="16" fill="%23db2777"/><path d="M50 64c-16 0-30 8-34 20a50 50 0 0068 0c-4-12-18-20-34-20z" fill="%23db2777"/><path d="M50 22c-10 0-18 6-18 16 0 4 1 8 3 10 2-4 5-8 15-8s13 4 15 8c2-2 3-6 3-10 0-10-8-16-18-16z" fill="%23db2777"/></svg>',
    label: 'Female'
  }
];

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  region: string;
  profilePic: string;
  createdAt: string;
  fcmToken?: string;
}

interface ProfileContextType {
  currentUser: UserAccount | null;
  authLoading: boolean;
  profilePic: string;
  setProfilePic: (url: string) => void;
  name: string;
  setName: (name: string) => void;
  role: string;
  setRole: (role: string) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isAvailable: boolean;
  setIsAvailable: (status: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  phone: string;
  setPhone: (phone: string) => void;
  region: string;
  setRegion: (region: string) => void;
  isBiometricallyVerified: boolean;
  setIsBiometricallyVerified: (status: boolean) => void;
  lockSession: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: string, phone: string, region: string, profilePic: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function getFirebaseErrorMessage(error: any): string {
  const code = error?.code || '';
  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
  };
  return map[code] || error?.message || 'An unexpected error occurred.';
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profilePic, setProfilePic] = useState<string>(AVATAR_PRESETS[0].url);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('taj_theme') as AppTheme) || 'light';
  });
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [phone, setPhone] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [isBiometricallyVerified, setIsBiometricallyVerified] = useState<boolean>(false);

  const lockSession = () => {
    setIsBiometricallyVerified(false);
  };

  // Listen to Firebase Auth state
  const firestoreUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = null;
      }

      if (firebaseUser) {
        const unsubUser = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            const userData = snap.data() as UserAccount;
            setCurrentUser(userData);
            setProfilePic(userData.profilePic);
            setName(userData.name);
            setRole(userData.role);
            setPhone(userData.phone);
            setRegion(userData.region);
          }
        });
        firestoreUnsubscribeRef.current = unsubUser;
      } else {
        setCurrentUser(null);
        setProfilePic(AVATAR_PRESETS[0].url);
        setName('');
        setRole('');
        setPhone('');
        setRegion('');
      }
      setAuthLoading(false);
    });

    return () => {
      unsubAuth();
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
    };
  }, []);

  // Sync profile changes back to Firestore
  useEffect(() => {
    if (currentUser) {
      const updatedUser = { ...currentUser, name, role, phone, region, profilePic };
      if (
        currentUser.name !== name ||
        currentUser.role !== role ||
        currentUser.phone !== phone ||
        currentUser.region !== region ||
        currentUser.profilePic !== profilePic
      ) {
        setCurrentUser(updatedUser);
        setDoc(doc(db, "users", currentUser.id), updatedUser).catch(console.error);
      }
    }
  }, [name, role, phone, region, profilePic]);

  // Persist theme preference
  useEffect(() => { localStorage.setItem('taj_theme', theme); }, [theme]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getFirebaseErrorMessage(error) };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string,
    phone: string,
    region: string,
    profilePic: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: UserAccount = {
        id: cred.user.uid,
        name,
        email,
        role,
        phone,
        region,
        profilePic,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", cred.user.uid), newUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getFirebaseErrorMessage(error) };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsBiometricallyVerified(false);
  };

  return (
    <ProfileContext.Provider
      value={{
        currentUser,
        authLoading,
        profilePic,
        setProfilePic,
        name,
        setName,
        role,
        setRole,
        theme,
        setTheme,
        isAvailable,
        setIsAvailable,
        isSettingsOpen,
        setIsSettingsOpen,
        phone,
        setPhone,
        region,
        setRegion,
        isBiometricallyVerified,
        setIsBiometricallyVerified,
        lockSession,
        login,
        signup,
        logout
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
