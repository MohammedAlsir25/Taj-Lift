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
    id: 'avatar-1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    label: 'Sarah (Admin)'
  },
  {
    id: 'avatar-2',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    label: 'Alex (Lead Tech)'
  },
  {
    id: 'avatar-3',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    label: 'John (Supervisor)'
  },
  {
    id: 'avatar-4',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    label: 'Elena (Director)'
  },
  {
    id: 'avatar-5',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    label: 'Marcus (Tech II)'
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
